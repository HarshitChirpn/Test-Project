import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Flag,
  MessageSquare,
  FileText,
  TrendingUp,
  Target,
  BarChart3,
  Eye,
  ArrowRight,
  Rocket,
  Code,
  Palette,
  TestTube,
  Zap,
  LifeBuoy,
  Plus,
  RefreshCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import {
  projectWorkflowService,
  ProjectWorkflow,
  ProjectMilestone
} from '@/services/projectWorkflowService';

type PhaseKey = 'discovery' | 'design' | 'development' | 'testing' | 'launch' | 'support';

const phaseIcons = {
  discovery: Target,
  design: Palette,
  development: Code,
  testing: TestTube,
  launch: Zap,
  support: LifeBuoy
};

const phaseColors = {
  discovery: 'bg-blue-100 text-blue-800',
  design: 'bg-purple-100 text-purple-800',
  development: 'bg-green-100 text-green-800',
  testing: 'bg-yellow-100 text-yellow-800',
  launch: 'bg-orange-100 text-orange-800',
  support: 'bg-gray-100 text-gray-800'
};

export default function UserProjectJourney() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWorkflow[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  // Removed togglingSubstep state - users cannot toggle substeps
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProjects();
    }
  }, [user]);

  // Set up real-time updates (polling every 30 seconds)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('🔄 Refreshing user projects...');
      fetchUserProjects();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const fetchUserProjects = async () => {
    if (!user) {
      console.log('❌ No user found, cannot fetch projects');
      return;
    }

    console.log('🔄 Fetching projects for user:', user._id);
    try {
      setLoading(true);
      const userProjects = await projectWorkflowService.getUserProjects(user._id);
      console.log('✅ Fetched projects:', userProjects);
      setProjects(userProjects);

      // Set first project as selected by default
      if (userProjects.length > 0 && !selectedProject) {
        setSelectedProject(userProjects[0]);
        console.log('✅ Set selected project:', userProjects[0].projectName);
        console.log('📋 Project substeps:', userProjects[0].substeps);
      } else if (userProjects.length === 0) {
        console.log('ℹ️ No projects found for user');
      }
    } catch (error) {
      console.error('❌ Error fetching projects:', error);
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
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Removed handleToggleSubstep function - users cannot toggle substeps

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your project journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600 mb-4">
                You don't have any projects in your journey yet. Start by creating your first MVP project!
              </p>
              <Button onClick={() => window.location.href = '/dashboard?tab=projects'}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Your MVP Journey</span>
              </CardTitle>
              <CardDescription>
                Track the progress of your projects through our structured MVP development process
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUserProjects}
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <h3 className="text-lg font-medium text-gray-700">No Projects Found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  You don't have any projects yet. Create a project to start your MVP journey!
                </p>
              </div>
              <Button 
                onClick={() => window.location.href = '/dashboard?tab=projects'}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => (
                <Button
                  key={project._id}
                  variant={selectedProject?._id === project._id ? "default" : "outline"}
                  onClick={() => setSelectedProject(project)}
                  className="flex items-center space-x-2"
                >
                  <span>{project.projectName}</span>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProject && (
        <>
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="h-5 w-5" />
                    <span>{selectedProject.projectName}</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {selectedProject.projectDescription}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(selectedProject.status)}>
                  {selectedProject.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedProject.progress.overall}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedProject.milestones.filter(m => m.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Completed Milestones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedProject.deliverables.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Deliverables</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{selectedProject.progress.overall}%</span>
                </div>
                <Progress value={selectedProject.progress.overall} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* MVP Phases Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>MVP Development Phases</span>
              </CardTitle>
              <CardDescription>
                Track your progress through each phase of the MVP development process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(selectedProject.progress.phases).map(([phase, progress]) => {
                  const PhaseIcon = phaseIcons[phase as PhaseKey];
                  const isCurrentPhase = selectedProject.currentPhase === phase;
                  const isCompleted = progress === 100;
                  
                  return (
                    <div key={phase} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <PhaseIcon className="h-4 w-4" />
                          <span className="font-medium capitalize">{phase}</span>
                          {isCurrentPhase && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Current
                            </Badge>
                          )}
                          {isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Current Phase Substeps */}
          {selectedProject.substeps && selectedProject.substeps[selectedProject.currentPhase] && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Flag className="h-5 w-5" />
                  <span>Current Phase: {selectedProject.currentPhase.charAt(0).toUpperCase() + selectedProject.currentPhase.slice(1)}</span>
                </CardTitle>
                <CardDescription>
                  Current substep: {selectedProject.currentSubstep} (Read-only view)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedProject.substeps[selectedProject.currentPhase].map((substep, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center space-x-3 p-3 border rounded-lg ${
                        substep.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="p-0 h-auto">
                        {substep.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{substep.name}</div>
                        {substep.notes && (
                          <div className="text-sm text-gray-600 mt-1">{substep.notes}</div>
                        )}
                        {substep.completedDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Completed: {formatDate(substep.completedDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Milestones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Project Milestones</span>
              </CardTitle>
              <CardDescription>
                Key milestones and their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedProject.milestones.map((milestone) => (
                  <div key={milestone._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getMilestoneStatusIcon(milestone.status)}
                        <h4 className="font-medium">{milestone.title}</h4>
                        <Badge className={getMilestoneStatusColor(milestone.status)}>
                          {milestone.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Weight: {milestone.weight}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{milestone.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Phase:</span> {milestone.phase}
                      </div>
                      <div>
                        <span className="font-medium">Due Date:</span> {formatDate(milestone.dueDate)}
                      </div>
                      {milestone.completedDate && (
                        <div>
                          <span className="font-medium">Completed:</span> {formatDate(milestone.completedDate)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Project Deliverables</span>
              </CardTitle>
              <CardDescription>
                Documents and outputs from your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedProject.deliverables.map((deliverable) => (
                  <div key={deliverable._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{deliverable.name}</div>
                        <div className="text-sm text-gray-600">{deliverable.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getMilestoneStatusColor(deliverable.status)}>
                        {deliverable.status}
                      </Badge>
                      {deliverable.url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={deliverable.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Project Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Start Date</div>
                  <div className="font-medium">{formatDate(selectedProject.timeline.startDate)}</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Estimated Completion</div>
                  <div className="font-medium">
                    {selectedProject.timeline.estimatedCompletion 
                      ? formatDate(selectedProject.timeline.estimatedCompletion)
                      : 'Not set'
                    }
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">End Date</div>
                  <div className="font-medium">
                    {selectedProject.timeline.endDate 
                      ? formatDate(selectedProject.timeline.endDate)
                      : 'Ongoing'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
