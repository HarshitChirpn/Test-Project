import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar,
  Flag,
  Plus,
  Edit,
  Eye,
  Loader2,
  Save,
  X,
  Zap,
  CheckSquare,
  Square,
  RefreshCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AdminService } from '@/services/adminService';
import { progressService, ProjectData, PhaseSubsteps, UserProgress } from '@/services/progressService';
import { userService, UserProfile } from '@/services/userService';
import { mongodbUserService } from '@/services/mongodbUserService';
import { projectWorkflowService, Substep } from '@/services/projectWorkflowService';

// Phase substeps definitions
const PHASE_SUBSTEPS = {
  discovery: [
    'First Call',
    'Requirements Gathering Session PRD',
    'Project Kickoff Session'
  ],
  design: [
    'Wireframes & User Flow',
    'UI Design & Prototypes',
    'Design Review & Approval'
  ],
  development: [
    'Environment Setup',
    'Database Design',
    'Backend Development',
    'Frontend Development',
    'API Integration',
    'Third-party Integrations'
  ],
  testing: [
    'Unit Testing',
    'Integration Testing',
    'User Acceptance Testing',
    'Bug Fixes & Optimization'
  ],
  launch: [
    'Production Deployment',
    'Monitoring Setup',
    'Go Live',
    'Launch Support'
  ],
  support: [
    'Documentation & Handover',
    'User Training',
    'Ongoing Maintenance',
    'Performance Optimization'
  ]
};

interface Project {
  id: string;
  userId: string;
  name: string;
  owner: string;
  ownerEmail: string;
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled";
  progress: number;
  startDate: Date;
  targetDate: Date;
  milestones: Milestone[];
  currentPhase?: string;
  currentSubstep?: string;
  phaseProgress?: number;
  substepProgress?: number;
  projectType?: string;
  category?: string;
  tags?: string[];
  technologies?: string[];
  priority?: string;
  substeps?: {
    discovery: Substep[];
    design: Substep[];
    development: Substep[];
    testing: Substep[];
    launch: Substep[];
    support: Substep[];
  };
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  phase: string;
  completed: boolean;
  dueDate?: Date;
  weight: number;
}

export default function ProjectWorkflow() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [milestoneForm, setMilestoneForm] = useState<Partial<Milestone>>({});
  const [phaseSubsteps] = useState<PhaseSubsteps>(progressService.getPhaseSubsteps());
  const [updatingPhaseSubstep, setUpdatingPhaseSubstep] = useState(false);
  const [togglingSubstep, setTogglingSubstep] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllProjects();
    
    // Auto-refresh every 30 seconds to catch new projects
    const interval = setInterval(() => {
      fetchAllProjects();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAllProjects();
      toast({
        title: "Projects Refreshed",
        description: "All projects have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      
      // Get all users first
      const usersData: Record<string, UserProfile> = {};
      try {
        const users = await mongodbUserService.getAllUsers();
        users.forEach(user => {
          // Store user by both _id and uid for compatibility
          usersData[user._id] = {
            uid: user._id, // Use _id as uid for MongoDB
            email: user.email,
            displayName: user.displayName || (user as any).name,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          } as UserProfile;
        });
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      
      setUsers(usersData);
      
      // Get all projects using the projectWorkflowService
      const projectsData: Project[] = [];
      
      try {
        // Fetch all projects with a high limit to get all projects
        const allProjectsResult = await projectWorkflowService.getAllProjects({
          limit: 1000, // High limit to get all projects
          sortBy: 'updatedAt',
          sortOrder: 'desc'
        });
      
        if (allProjectsResult.projects) {
          for (const projectData of allProjectsResult.projects) {
            const user = usersData[projectData.userId];
            
            // Create project even if user data is missing
            const project: Project = {
              id: projectData._id,
              userId: projectData.userId,
              name: projectData.projectName || 'Untitled Project',
              owner: user?.displayName || user?.email || projectData.owner || 'Unknown User',
              ownerEmail: user?.email || projectData.ownerEmail || 'Unknown',
                status: projectData.status || 'planning',
                progress: projectData.progress?.overall || 0,
                startDate: projectData.timeline?.startDate ? new Date(projectData.timeline.startDate) : new Date(),
                targetDate: projectData.timeline?.estimatedCompletion ? new Date(projectData.timeline.estimatedCompletion) : new Date(),
                currentPhase: typeof projectData.currentPhase === 'string' ? projectData.currentPhase : String(projectData.currentPhase || ''),
                currentSubstep: typeof projectData.currentSubstep === 'string' ? projectData.currentSubstep : String(projectData.currentSubstep || ''),
                phaseProgress: projectData.progress?.phases?.[projectData.currentPhase] || 0,
                substepProgress: 0, // This would need to be calculated from substeps
                projectType: projectData.projectType || 'mvp-development',
                category: projectData.category || 'development',
                tags: projectData.tags || [],
                technologies: projectData.technologies || [],
                priority: projectData.priority || 'medium',
                substeps: projectData.substeps,
                milestones: (projectData.milestones || []).map((m: any) => ({
                  id: m.id,
                  title: m.title,
                  description: m.description,
                  phase: m.phase,
                  completed: m.status === 'completed',
                  dueDate: m.dueDate ? new Date(m.dueDate) : new Date(),
                  weight: m.weight || 5,
                })),
              };
              
              
              projectsData.push(project);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to fetch projects. Please check your connection and try again.",
          variant: "destructive",
        });
      }
      
      // Check for new projects
      const previousCount = projects.length;
      const newCount = projectsData.length;
      
      setProjects(projectsData);
      
      // Show notification if new projects were added
      if (previousCount > 0 && newCount > previousCount) {
        const newProjectsCount = newCount - previousCount;
        toast({
          title: "New Projects Detected! 🎉",
          description: `${newProjectsCount} new project${newProjectsCount > 1 ? 's' : ''} created.`,
        });
      }
      
      // Set first project as selected by default, or refresh selected project if it exists
      if (projectsData.length > 0) {
        if (!selectedProject) {
          setSelectedProject(projectsData[0]);
        } else {
          // Update the selected project with fresh data
          const updatedSelectedProject = projectsData.find(p => p.id === selectedProject.id);
          if (updatedSelectedProject) {
            setSelectedProject(updatedSelectedProject);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planning": return "bg-blue-100 text-blue-800";
      case "active": return "bg-green-100 text-green-800";
      case "on-hold": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-purple-100 text-purple-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPhaseColor = (phase: string | undefined | null) => {
    if (!phase || typeof phase !== 'string') {
      return "bg-gray-100 text-gray-800";
    }
    
    switch (phase.toLowerCase()) {
      case "discovery": return "bg-blue-100 text-blue-800";
      case "design": return "bg-purple-100 text-purple-800";
      case "development": return "bg-green-100 text-green-800";
      case "testing": return "bg-yellow-100 text-yellow-800";
      case "launch": return "bg-orange-100 text-orange-800";
      case "support": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleProjectStatusChange = async (projectId: string, newStatus: Project['status']) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      // Update using projectWorkflowService
      const result = await projectWorkflowService.updateProject(projectId, { status: newStatus });
      
      // Update local state
      const updatedProjects = projects.map(p => 
        p.id === projectId ? { ...p, status: newStatus } : p
      );
      setProjects(updatedProjects);
      
      if (selectedProject?.id === projectId) {
        setSelectedProject({ ...selectedProject, status: newStatus });
      }
      
      toast({
        title: "Project Status Updated",
        description: `Project status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const handleMilestoneToggle = async (projectId: string, milestoneId: string, completed: boolean) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      // Update using projectWorkflowService
      const result = await projectWorkflowService.updateMilestone(projectId, milestoneId, { 
        status: completed ? 'completed' : 'pending',
        completedDate: completed ? new Date() : undefined
      });
      
      // Update local state
      const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
          const updatedMilestones = p.milestones.map(m => 
            m.id === milestoneId ? { ...m, completed, completedDate: completed ? new Date() : undefined } : m
          );
          return { ...p, milestones: updatedMilestones };
        }
        return p;
      });
      
      setProjects(updatedProjects);
      
      if (selectedProject?.id === projectId) {
        const updatedMilestones = selectedProject.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed, completedDate: completed ? new Date() : undefined } : m
        );
        setSelectedProject({ ...selectedProject, milestones: updatedMilestones });
      }
      
      toast({
        title: "Milestone Updated",
        description: `Milestone ${completed ? 'completed' : 'unchecked'}`,
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const startEditingProject = (project: Project) => {
    setEditingProject({ ...project });
  };

  const cancelEditingProject = () => {
    setEditingProject(null);
  };

  const saveProject = async () => {
    if (!editingProject) return;
    
    try {
      // Update using projectWorkflowService
      const result = await projectWorkflowService.updateProject(editingProject.id, {
        projectName: editingProject.name,
        status: editingProject.status
      });
      
      // Update local state
      const updatedProjects = projects.map(p => 
        p.id === editingProject.id ? editingProject : p
      );
      setProjects(updatedProjects);
      
      if (selectedProject?.id === editingProject.id) {
        setSelectedProject(editingProject);
      }
      
      setEditingProject(null);
      
      toast({
        title: "Project Updated",
        description: "Project details have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const startEditingMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone.id);
    setMilestoneForm({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      phase: milestone.phase,
      completed: milestone.completed,
      weight: milestone.weight,
      dueDate: milestone.dueDate
    });
  };

  const cancelEditingMilestone = () => {
    setEditingMilestone(null);
    setMilestoneForm({});
  };

  const saveMilestone = async () => {
    if (!editingMilestone || !selectedProject || !milestoneForm.id) return;
    
    try {
      // Update using projectWorkflowService
      const result = await projectWorkflowService.updateMilestone(selectedProject.id, editingMilestone, {
        title: milestoneForm.title,
        description: milestoneForm.description,
        phase: milestoneForm.phase,
        weight: milestoneForm.weight
      });
      
      // Update local state
      const updatedMilestones = selectedProject.milestones.map(m => 
        m.id === editingMilestone 
          ? { ...m, ...milestoneForm } 
          : m
      );
      
      const updatedProjects = projects.map(p => 
        p.id === selectedProject.id 
          ? { ...p, milestones: updatedMilestones } 
          : p
      );
      setProjects(updatedProjects);
      
      setSelectedProject({ ...selectedProject, milestones: updatedMilestones });
      setEditingMilestone(null);
      setMilestoneForm({});
      
      toast({
        title: "Milestone Updated",
        description: "Milestone has been successfully updated.",
      });
    } catch (error) {
      console.error('Error saving milestone:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateProjectPhaseSubstep = async (
    phase: string, 
    substep: string, 
    phaseProgress: number, 
    substepProgress: number,
    notes?: string
  ) => {
    if (!selectedProject) return;
    
    setUpdatingPhaseSubstep(true);
    try {
      // Update using projectWorkflowService
      const result = await projectWorkflowService.updateProjectPhase(selectedProject.id, {
        currentPhase: phase,
        currentSubstep: substep,
        phaseProgress,
        notes
      });
      
      // Refresh projects to show updated status
      await fetchAllProjects();
      
      toast({
        title: "Project Status Updated",
        description: `Project moved to ${phase} phase - ${substep}`,
      });
    } catch (error) {
      console.error('Error updating phase/substep:', error);
      toast({
        title: "Error",
        description: "Failed to update project phase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPhaseSubstep(false);
    }
  };

  const initializeProjectStatus = async () => {
    if (!selectedProject) return;
    
    setUpdatingPhaseSubstep(true);
    try {
      // Initialize with Discovery phase, first substep
      const result = await projectWorkflowService.updateProjectPhase(selectedProject.id, {
        currentPhase: 'discovery',
        currentSubstep: 'first-call',
        phaseProgress: 25, // Start with some progress since they've onboarded
        notes: 'Project status initialized by admin'
      });
      
      // Refresh projects to show updated status
      await fetchAllProjects();
      
      toast({
        title: "Project Initialized",
        description: "MVP process status has been initialized for this project.",
      });
    } catch (error) {
      console.error('Error initializing project status:', error);
      toast({
        title: "Error",
        description: "Failed to initialize project status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPhaseSubstep(false);
    }
  };

  const initializeAllProjects = async () => {
    const projectsToInitialize = projects.filter(p => !p.currentPhase);
    
    if (projectsToInitialize.length === 0) {
      toast({
        title: "No Projects to Initialize",
        description: "All projects already have MVP process status.",
      });
      return;
    }

    setUpdatingPhaseSubstep(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const project of projectsToInitialize) {
        try {
          const result = await projectWorkflowService.updateProjectPhase(project.id, {
            currentPhase: 'discovery',
            currentSubstep: 'first-call',
            phaseProgress: 25, // Start with some progress since they've onboarded
            notes: 'Project status initialized by admin (bulk operation)'
          });
          
          successCount++;
        } catch (error) {
          console.error(`Error initializing project ${project.id}:`, error);
          errorCount++;
        }
      }
      
      // Refresh projects to show updated status
      await fetchAllProjects();
      
      if (errorCount === 0) {
        toast({
          title: "All Projects Initialized",
          description: `Successfully initialized ${successCount} projects with MVP process status.`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Initialized ${successCount} projects successfully. ${errorCount} projects failed.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in bulk initialization:', error);
      toast({
        title: "Error",
        description: "Failed to initialize projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPhaseSubstep(false);
    }
  };

  const handleToggleSubstep = async (phase: string, substepName: string) => {
    if (!selectedProject) return;

    setTogglingSubstep(true);
    try {
      const result = await projectWorkflowService.toggleProjectSubstep(
        selectedProject.id,
        phase,
        substepName
      );

      // Refresh projects to show updated substeps
      await fetchAllProjects();
      
      toast({
        title: "Substep Updated",
        description: `${substepName} has been toggled successfully.`,
      });
    } catch (error) {
      console.error('Error toggling substep:', error);
      toast({
        title: "Error",
        description: "Failed to update substep. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTogglingSubstep(false);
    }
  };

  const initializeProjectSubsteps = async () => {
    if (!selectedProject) return;

    setTogglingSubstep(true);
    try {
      // Initialize substeps by toggling the first substep of the first phase
      const firstPhase = 'discovery';
      const firstSubstep = PHASE_SUBSTEPS[firstPhase][0];
      
      const result = await projectWorkflowService.toggleProjectSubstep(
        selectedProject.id,
        firstPhase,
        firstSubstep
      );

      // Refresh projects to show updated substeps
      await fetchAllProjects();
      
      toast({
        title: "Substeps Initialized",
        description: "Substeps have been initialized for this project.",
      });
    } catch (error) {
      console.error('Error initializing substeps:', error);
      toast({
        title: "Error",
        description: "Failed to initialize substeps. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTogglingSubstep(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Workflow</h2>
          <p className="text-muted-foreground">
            Track all projects and milestones across the platform
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={initializeAllProjects}
            variant="outline"
            disabled={updatingPhaseSubstep}
          >
            {updatingPhaseSubstep ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Initialize All Projects
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Projects ({projects.length})</CardTitle>
                  <CardDescription>
                    All projects in the system from all users
                  </CardDescription>
                </div>
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {projects.length > 0 ? (
                projects.map((project) => (
                  <div 
                    key={project.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedProject?.id === project.id 
                        ? "ring-2 ring-primary bg-primary/5" 
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{project.name}</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center mt-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-1" />
                      <span className="mr-4">{project.owner}</span>
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{project.targetDate instanceof Date ? project.targetDate.toLocaleDateString() : new Date(project.targetDate).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <span>Phase: {typeof project.currentPhase === 'string' ? project.currentPhase : 'Not set'}</span>
                      <span className="ml-4">Progress: {project.progress}%</span>
                      <span className="ml-4">ID: {project.id.substring(0, 8)}...</span>
                    </div>
                    {project.currentPhase && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">Current Phase:</span>
                          <Badge className={getPhaseColor(project.currentPhase)}>
                            {typeof project.currentPhase === 'string' ? project.currentPhase : 'Not Set'}
                          </Badge>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          Substep: {typeof project.currentSubstep === 'string' ? project.currentSubstep : 'Unknown'}
                        </div>
                      </div>
                    )}
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No projects found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <div className="space-y-4">
          {selectedProject ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>
                      {editingProject ? (
                        <Input
                          value={editingProject.name}
                          onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        selectedProject.name
                      )}
                    </CardTitle>
                    <div className="flex space-x-2">
                      {editingProject ? (
                        <>
                          <Button variant="outline" size="sm" onClick={cancelEditingProject}>
                            <X className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={saveProject}>
                            <Save className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="outline" size="sm" onClick={() => startEditingProject(selectedProject)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    Project details and current status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Owner</span>
                    <span className="font-medium">{selectedProject.owner}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{selectedProject.ownerEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {editingProject ? (
                      <Select
                        value={editingProject.status}
                        onValueChange={(value: any) => setEditingProject({ ...editingProject, status: value })}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(selectedProject.status)}>
                        {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Project Type</span>
                    <span className="font-medium">{selectedProject.projectType || 'mvp-development'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{selectedProject.category || 'development'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <Badge variant={selectedProject.priority === 'high' ? 'destructive' : selectedProject.priority === 'medium' ? 'default' : 'secondary'}>
                      {selectedProject.priority || 'medium'}
                    </Badge>
                  </div>
                  {selectedProject.tags && selectedProject.tags.length > 0 && (
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">Tags</span>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {selectedProject.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">Technologies</span>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {selectedProject.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">
                      {selectedProject.startDate instanceof Date ? selectedProject.startDate.toLocaleDateString() : new Date(selectedProject.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Target Date</span>
                    <span className="font-medium">
                      {selectedProject.targetDate instanceof Date ? selectedProject.targetDate.toLocaleDateString() : new Date(selectedProject.targetDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span>{selectedProject.progress}%</span>
                    </div>
                    <Progress value={selectedProject.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Phase and Substep Management */}
              <Card>
                <CardHeader>
                  <CardTitle>6-Step MVP Process Status</CardTitle>
                  <CardDescription>
                    Update which step of the MVP process this project is currently on
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {selectedProject.currentPhase && typeof selectedProject.currentPhase === 'string' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">MVP Process Step</label>
                          <Select
                            value={typeof selectedProject.currentPhase === 'string' ? selectedProject.currentPhase : ''}
                            onValueChange={(newPhase: string) => {
                              const firstSubstep = PHASE_SUBSTEPS[newPhase as keyof typeof PHASE_SUBSTEPS]?.[0] || 'first-call';
                              // When moving to a new phase, set progress to indicate the phase is started
                              const newPhaseProgress = newPhase === 'discovery' ? 25 : 
                                                     newPhase === 'design' ? 10 : 
                                                     newPhase === 'development' ? 5 : 0;
                              updateProjectPhaseSubstep(newPhase, firstSubstep, newPhaseProgress, 0, 
                                `Admin moved project to ${newPhase} phase`);
                            }}
                            disabled={updatingPhaseSubstep}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="discovery">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span>1. Discovery</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="design">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                  <span>2. Design</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="development">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <span>3. Development</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="testing">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  <span>4. Testing</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="launch">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span>5. Launch</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="support">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  <span>6. Support</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Current Substep</label>
                          <Select
                            value={typeof selectedProject.currentSubstep === 'string' ? selectedProject.currentSubstep : ''}
                            onValueChange={(newSubstep) => {
                              updateProjectPhaseSubstep(
                                typeof selectedProject.currentPhase === 'string' ? selectedProject.currentPhase : 'discovery',
                                newSubstep,
                                selectedProject.phaseProgress || 0,
                                0,
                                `Admin changed substep to ${newSubstep}`
                              );
                            }}
                            disabled={updatingPhaseSubstep}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PHASE_SUBSTEPS[typeof selectedProject.currentPhase === 'string' ? selectedProject.currentPhase : 'discovery' as keyof typeof PHASE_SUBSTEPS]?.map((substepName) => (
                                <SelectItem key={substepName} value={substepName}>
                                  {substepName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Phase Progress: {selectedProject.phaseProgress || 0}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedProject.phaseProgress || 0}
                          onChange={(e) => {
                            const newProgress = parseInt(e.target.value);
                            updateProjectPhaseSubstep(
                              typeof selectedProject.currentPhase === 'string' ? selectedProject.currentPhase : 'discovery',
                              selectedProject.currentSubstep!,
                              newProgress,
                              selectedProject.substepProgress || 0,
                              `Admin updated phase progress to ${newProgress}%`
                            );
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          disabled={updatingPhaseSubstep}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Substep Progress: {selectedProject.substepProgress || 0}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={selectedProject.substepProgress || 0}
                          onChange={(e) => {
                            const newProgress = parseInt(e.target.value);
                            updateProjectPhaseSubstep(
                              typeof selectedProject.currentPhase === 'string' ? selectedProject.currentPhase : 'discovery',
                              selectedProject.currentSubstep!,
                              selectedProject.phaseProgress || 0,
                              newProgress,
                              `Admin updated substep progress to ${newProgress}%`
                            );
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          disabled={updatingPhaseSubstep}
                        />
                      </div>
                      
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground mb-4">
                        No current status available. Project needs initialization.
                      </div>
                      <Button
                        onClick={() => initializeProjectStatus()}
                        disabled={updatingPhaseSubstep}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {updatingPhaseSubstep ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Initializing...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Initialize MVP Process Status
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                  
                  {updatingPhaseSubstep && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Updating project status...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Substeps Management */}
              <Card>
                <CardHeader>
                  <CardTitle>6-Step MVP Process Substeps</CardTitle>
                  <CardDescription>
                    Track detailed substeps for each phase of the MVP process
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Show initialization notice if no substeps data */}
                  {selectedProject && !selectedProject.substeps && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">Substeps Not Initialized</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            This project doesn't have substeps data yet. Click "Initialize Substeps" to start tracking progress.
                          </p>
                        </div>
                        <Button
                          onClick={() => initializeProjectSubsteps()}
                          disabled={togglingSubstep}
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          {togglingSubstep ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Initializing...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Initialize Substeps
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {!selectedProject ? (
                    <div className="space-y-4">
                      <div className="text-center py-4 text-muted-foreground">
                        <p>Please select a project to view substeps</p>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 mb-4">
                          <strong>Demo Mode:</strong> The substeps UI is ready! Here's a preview of how it will look:
                        </p>
                        {/* Demo substeps preview */}
                        <div className="space-y-4">
                          {Object.entries(PHASE_SUBSTEPS).slice(0, 2).map(([phase, substeps]) => (
                            <div key={phase} className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <Badge className={getPhaseColor(phase)}>
                                  {phase.charAt(0).toUpperCase() + phase.slice(1)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  0/{substeps.length} completed
                                </span>
                              </div>
                              <Progress value={0} className="h-2" />
                              <div className="space-y-1">
                                {substeps.slice(0, 2).map((substepName) => (
                                  <div key={substepName} className="flex items-center space-x-3 p-2 rounded-lg border bg-gray-50">
                                    <Square className="h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-900">{substepName}</span>
                                  </div>
                                ))}
                                {substeps.length > 2 && (
                                  <div className="text-xs text-gray-500 pl-8">
                                    +{substeps.length - 2} more substeps...
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <div className="text-xs text-gray-500 text-center">
                            +4 more phases (Design, Development, Testing, Launch, Support)
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    Object.entries(PHASE_SUBSTEPS).map(([phase, substeps]) => {
                    // Initialize substeps if they don't exist
                    const phaseSubsteps = selectedProject.substeps?.[phase] || substeps.map(name => ({
                      name,
                      completed: false,
                      completedDate: null,
                      notes: ''
                    }));
                    const completedCount = phaseSubsteps.filter(s => s.completed).length;
                    const totalCount = substeps.length;
                    const phaseProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                    return (
                      <div key={phase} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getPhaseColor(phase)}>
                              {phase.charAt(0).toUpperCase() + phase.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {completedCount}/{totalCount} completed
                            </span>
                          </div>
                          <div className="text-sm font-medium">{phaseProgress}%</div>
                        </div>
                        
                        <Progress value={phaseProgress} className="h-2" />
                        
                        <div className="grid grid-cols-1 gap-2">
                          {substeps.map((substepName) => {
                            const substep = phaseSubsteps.find(s => s.name === substepName);
                            const isCompleted = substep?.completed || false;
                            
                            return (
                              <div
                                key={substepName}
                                className={`flex items-center space-x-3 p-2 rounded-lg border transition-colors ${
                                  isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleSubstep(phase, substepName)}
                                  disabled={togglingSubstep}
                                  className="p-0 h-auto"
                                >
                                  {isCompleted ? (
                                    <CheckSquare className="h-5 w-5 text-green-600" />
                                  ) : (
                                    <Square className="h-5 w-5 text-gray-400" />
                                  )}
                                </Button>
                                <span
                                  className={`flex-1 text-sm ${
                                    isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                                  }`}
                                >
                                  {substepName}
                                </span>
                                {substep?.completedDate && (
                                  <span className="text-xs text-gray-500">
                                    {new Date(substep.completedDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                  )}
                  
                  {togglingSubstep && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Updating substep...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Milestones</CardTitle>
                  <CardDescription>
                    Key project milestones and deliverables
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedProject.milestones.length > 0 ? (
                    selectedProject.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-start space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMilestoneToggle(selectedProject.id, milestone.id, !milestone.completed)}
                          className="p-0 h-auto"
                        >
                          {milestone.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                        <div className="flex-1">
                          {editingMilestone === milestone.id ? (
                            <div className="space-y-2">
                              <Input
                                value={milestoneForm.title || ''}
                                onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                                placeholder="Milestone title"
                              />
                              <Input
                                value={milestoneForm.description || ''}
                                onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                                placeholder="Milestone description"
                              />
                              <div className="flex space-x-2">
                                <Select
                                  value={milestoneForm.phase || ''}
                                  onValueChange={(value) => setMilestoneForm({ ...milestoneForm, phase: value })}
                                >
                                  <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Phase" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="discovery">Discovery</SelectItem>
                                    <SelectItem value="design">Design</SelectItem>
                                    <SelectItem value="development">Development</SelectItem>
                                    <SelectItem value="testing">Testing</SelectItem>
                                    <SelectItem value="launch">Launch</SelectItem>
                                    <SelectItem value="support">Support</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  type="number"
                                  value={milestoneForm.weight || 5}
                                  onChange={(e) => setMilestoneForm({ ...milestoneForm, weight: parseInt(e.target.value) || 5 })}
                                  placeholder="Weight"
                                  className="w-[80px]"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={cancelEditingMilestone}>
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button size="sm" onClick={saveMilestone}>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <h4 className={`font-medium ${milestone.completed ? "line-through text-muted-foreground" : ""}`}>
                                  {milestone.title}
                                </h4>
                                <div className="flex space-x-1">
                                  <Badge className={getPhaseColor(milestone.phase)}>
                                    {milestone.phase}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditingMilestone(milestone)}
                                    className="h-5 w-5 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {milestone.description}
                              </p>
                              {milestone.dueDate && (
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>Due: {milestone.dueDate instanceof Date ? milestone.dueDate.toLocaleDateString() : new Date(milestone.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No milestones defined for this project
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
                <p className="text-muted-foreground">
                  Choose a project from the list to view details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}