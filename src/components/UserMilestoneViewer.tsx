import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { projectWorkflowService, ProjectWorkflow } from '@/services/projectWorkflowService';
import { 
  Target, 
  Flag, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Filter,
  Trophy,
  Lightbulb,
  Palette,
  Code,
  TestTube,
  Rocket,
  LifeBuoy
} from 'lucide-react';

interface PhaseMilestone {
  phase: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  progress: number;
  substeps: string[];
  completedSubsteps: number;
  totalSubsteps: number;
  isCompleted: boolean;
  completedDate?: Date;
  color: string;
}

const UserMilestoneViewer = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWorkflow[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [phaseMilestones, setPhaseMilestones] = useState<PhaseMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      generatePhaseMilestones(selectedProject);
    }
  }, [selectedProject]);

  const fetchUserProjects = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    try {
      const userProjects = await projectWorkflowService.getUserProjects(user._id);
      setProjects(userProjects);
      
      // Auto-select first project if available
      if (userProjects.length > 0) {
        setSelectedProject(userProjects[0]._id);
      }
    } catch (error) {
      console.error('Error fetching user projects:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePhaseMilestones = async (projectId: string) => {
    setRefreshing(true);
    try {
      const project = await projectWorkflowService.getProject(projectId);
      
      const phases = [
        { key: 'discovery', title: 'Discovery Phase', description: 'Market research, requirements analysis, and project planning', icon: Lightbulb, color: 'bg-blue-100 text-blue-800' },
        { key: 'design', title: 'Design Phase', description: 'UI/UX design, wireframing, and prototype development', icon: Palette, color: 'bg-purple-100 text-purple-800' },
        { key: 'development', title: 'Development Phase', description: 'Backend and frontend development, API integration', icon: Code, color: 'bg-green-100 text-green-800' },
        { key: 'testing', title: 'Testing Phase', description: 'Quality assurance, testing, and bug fixes', icon: TestTube, color: 'bg-yellow-100 text-yellow-800' },
        { key: 'launch', title: 'Launch Phase', description: 'Deployment, go-live, and initial user onboarding', icon: Rocket, color: 'bg-orange-100 text-orange-800' },
        { key: 'support', title: 'Support Phase', description: 'Maintenance, updates, and ongoing support', icon: LifeBuoy, color: 'bg-gray-100 text-gray-800' }
      ];

      const milestones: PhaseMilestone[] = phases.map(phase => {
        const phaseProgress = project.progress?.phases?.[phase.key as keyof typeof project.progress.phases] || 0;
        const projectSubsteps = project.substeps?.[phase.key as keyof typeof project.substeps] || [];
        
        // Use only the substeps from the project workflow
        const substeps = projectSubsteps.map((substep: any) => substep.title || substep.name || 'Untitled Substep');
        
        // Calculate completed substeps
        const completedSubsteps = projectSubsteps.filter((substep: any) => substep.completed).length;
        const totalSubsteps = projectSubsteps.length;
        
        // A milestone is completed when phase is 100% AND all substeps are completed
        const isCompleted = phaseProgress >= 100 && completedSubsteps === totalSubsteps;
        
        return {
          phase: phase.key,
          title: phase.title,
          description: phase.description,
          icon: phase.icon,
          progress: phaseProgress,
          substeps: substeps,
          completedSubsteps,
          totalSubsteps,
          isCompleted,
          completedDate: isCompleted ? project.updatedAt : undefined,
          color: phase.color
        };
      });

      setPhaseMilestones(milestones);
    } catch (error) {
      console.error('Error generating phase milestones:', error);
      toast({
        title: "Error",
        description: "Failed to generate phase milestones. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (selectedProject) {
      await generatePhaseMilestones(selectedProject);
    }
  };

  const getMilestoneStatus = (milestone: PhaseMilestone) => {
    if (milestone.isCompleted) return 'completed';
    if (milestone.progress > 0) return 'in-progress';
    return 'pending';
  };

  const getStatusIcon = (milestone: PhaseMilestone) => {
    const status = getMilestoneStatus(milestone);
    switch (status) {
      case 'completed':
        return <Trophy className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Target className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (milestone: PhaseMilestone) => {
    const status = getMilestoneStatus(milestone);
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMilestones = phaseMilestones.filter(milestone => {
    if (statusFilter === 'all') return true;
    return getMilestoneStatus(milestone) === statusFilter;
  });

  const selectedProjectData = projects.find(p => p._id === selectedProject);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Project Milestones</h2>
          <p className="text-gray-600">Track your project milestones and phase completion progress</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Project Selection and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Project Selection & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Your Project
              </label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project._id} value={project._id}>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span>{project.projectName}</span>
                        <Badge variant="outline" className="ml-2">
                          {project.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter milestones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Milestones</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Overview */}
      {selectedProjectData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Flag className="h-5 w-5 mr-2" />
              Project Overview: {selectedProjectData.projectName}
            </CardTitle>
            <CardDescription>
              {selectedProjectData.projectDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedProjectData.progress?.overall || 0}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {phaseMilestones.filter(m => m.isCompleted).length}
                </div>
                <div className="text-sm text-gray-600">Completed Milestones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {phaseMilestones.filter(m => m.progress > 0 && !m.isCompleted).length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {phaseMilestones.filter(m => m.progress === 0).length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Milestones List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              My Milestones ({filteredMilestones.length})
            </div>
            {selectedProjectData && (
              <Badge variant="outline">
                {selectedProjectData.currentPhase} Phase
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMilestones.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Milestones Found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'This project has no phase milestones yet.'
                  : `No milestones with status "${statusFilter}" found.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMilestones.map((milestone) => {
                const IconComponent = milestone.icon;
                const status = getMilestoneStatus(milestone);
                
                return (
                  <div
                    key={milestone.phase}
                    className={`border rounded-lg p-6 hover:bg-gray-50 transition-colors ${
                      milestone.isCompleted ? 'border-green-200 bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${milestone.color}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">{milestone.title}</h4>
                          <p className="text-gray-600 text-sm">{milestone.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(milestone)}
                        <Badge className={getStatusColor(milestone)}>
                          {status}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Phase Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Phase Progress</span>
                        <span className="text-gray-900 font-medium">{milestone.progress}%</span>
                      </div>
                      <Progress value={milestone.progress} className="h-3" />
                    </div>
                    
                    {/* Substeps Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Substeps Completed</span>
                        <span className="text-gray-900 font-medium">
                          {milestone.completedSubsteps} / {milestone.totalSubsteps}
                        </span>
                      </div>
                      <Progress 
                        value={(milestone.completedSubsteps / milestone.totalSubsteps) * 100} 
                        className="h-2" 
                      />
                    </div>
                    
                    {/* Substeps List */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Project Workflow Substeps:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {milestone.substeps.map((substep, index) => {
                          const isCompleted = index < milestone.completedSubsteps;
                          return (
                            <div
                              key={index}
                              className={`flex items-center space-x-2 text-sm p-2 rounded ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Clock className="h-4 w-4 text-gray-400" />
                              )}
                              <span>{substep}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Milestone Status */}
                    {milestone.isCompleted ? (
                      <div className="flex items-center space-x-2 text-green-600 bg-green-100 p-3 rounded-lg">
                        <Trophy className="h-5 w-5" />
                        <span className="font-medium">
                          🎉 Milestone Achieved! Phase completed with all substeps finished.
                        </span>
                        {milestone.completedDate && (
                          <span className="text-sm">
                            Completed on {new Date(milestone.completedDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : milestone.progress > 0 ? (
                      <div className="flex items-center space-x-2 text-blue-600 bg-blue-100 p-3 rounded-lg">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">
                          Phase in progress - {milestone.completedSubsteps} of {milestone.totalSubsteps} substeps completed
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-600 bg-gray-100 p-3 rounded-lg">
                        <Target className="h-5 w-5" />
                        <span className="font-medium">
                          Phase not started yet
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserMilestoneViewer;
