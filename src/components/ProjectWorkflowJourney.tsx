import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Save,
  X,
  Loader2,
  MessageSquare,
  FileText,
  TrendingUp,
  Target,
  BarChart3
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import {
  projectWorkflowService,
  ProjectWorkflow,
  ProjectMilestone
} from '@/services/projectWorkflowService';
import { progressService, PhaseSubsteps } from '@/services/progressService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PhaseKey = 'discovery' | 'design' | 'development' | 'testing' | 'launch' | 'support';

export default function ProjectWorkflowJourney() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWorkflow[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [milestoneForm, setMilestoneForm] = useState<Partial<ProjectMilestone>>({});
  const [phaseSubsteps] = useState<PhaseSubsteps>(progressService.getPhaseSubsteps());
  const [isAddMilestoneOpen, setIsAddMilestoneOpen] = useState(false);
  const [newMilestoneForm, setNewMilestoneForm] = useState<Partial<ProjectMilestone>>({
    title: '',
    description: '',
    phase: 'discovery',
    substep: '',
    status: 'pending',
    weight: 1,
    dependencies: []
  });
  const [isCommunicationOpen, setIsCommunicationOpen] = useState(false);
  const [communicationForm, setCommunicationForm] = useState({
    type: 'note' as 'meeting' | 'email' | 'message' | 'call' | 'note',
    subject: '',
    content: '',
    isInternal: true
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProjects();
    }
  }, [user]);

  const fetchUserProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userProjects = await projectWorkflowService.getUserProjects(user._id);
      setProjects(userProjects);

      // Set first project as selected by default
      if (userProjects.length > 0 && !selectedProject) {
        setSelectedProject(userProjects[0]);
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

  const getPhaseColor = (phase: string) => {
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

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'blocked': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleMilestoneToggle = async (milestoneId: string, currentStatus: string) => {
    if (!selectedProject) return;

    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

    const result = await projectWorkflowService.updateMilestone(
      selectedProject._id,
      milestoneId,
      { status: newStatus }
    );

    if (result.success) {
      await fetchUserProjects();
      toast({
        title: "Success",
        description: "Milestone updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update milestone",
        variant: "destructive",
      });
    }
  };

  const startEditingMilestone = (milestone: ProjectMilestone) => {
    setEditingMilestone(milestone.id);
    setMilestoneForm({
      title: milestone.title,
      description: milestone.description,
      phase: milestone.phase,
      substep: milestone.substep,
      status: milestone.status,
      weight: milestone.weight,
      dueDate: milestone.dueDate
    });
  };

  const cancelEditingMilestone = () => {
    setEditingMilestone(null);
    setMilestoneForm({});
  };

  const saveMilestone = async () => {
    if (!editingMilestone || !selectedProject) return;

    const result = await projectWorkflowService.updateMilestone(
      selectedProject._id,
      editingMilestone,
      milestoneForm
    );

    if (result.success) {
      await fetchUserProjects();
      setEditingMilestone(null);
      setMilestoneForm({});
      toast({
        title: "Success",
        description: "Milestone updated successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update milestone",
        variant: "destructive",
      });
    }
  };

  const handleAddMilestone = async () => {
    if (!selectedProject) return;

    if (!newMilestoneForm.title || !newMilestoneForm.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and description",
        variant: "destructive",
      });
      return;
    }

    const result = await projectWorkflowService.addMilestone(
      selectedProject._id,
      newMilestoneForm
    );

    if (result.success) {
      await fetchUserProjects();
      setIsAddMilestoneOpen(false);
      setNewMilestoneForm({
        title: '',
        description: '',
        phase: 'discovery',
        substep: '',
        status: 'pending',
        weight: 1,
        dependencies: []
      });
      toast({
        title: "Success",
        description: "Milestone added successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add milestone",
        variant: "destructive",
      });
    }
  };

  const handleAddCommunication = async () => {
    if (!selectedProject) return;

    if (!communicationForm.subject || !communicationForm.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in subject and content",
        variant: "destructive",
      });
      return;
    }

    const result = await projectWorkflowService.addCommunication(
      selectedProject._id,
      communicationForm
    );

    if (result.success) {
      await fetchUserProjects();
      setIsCommunicationOpen(false);
      setCommunicationForm({
        type: 'note',
        subject: '',
        content: '',
        isInternal: true
      });
      toast({
        title: "Success",
        description: "Communication added successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to add communication",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Flag className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="text-muted-foreground mt-1">
                Your project journey will appear here once you get started
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your MVP Journey</h2>
          <p className="text-muted-foreground">
            Track your progress through the 6-step MVP development process
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Project Overview */}
          {selectedProject && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedProject.projectName}</CardTitle>
                    <CardDescription>
                      {selectedProject.projectDescription || 'No description provided'}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(selectedProject.status)}>
                    {selectedProject.status.charAt(0).toUpperCase() + selectedProject.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Phase */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Flag className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Current Phase:</span>
                      <Badge className={getPhaseColor(selectedProject.currentPhase)}>
                        {selectedProject.currentPhase}
                      </Badge>
                    </div>
                    <div className="text-xs text-blue-600">
                      {selectedProject.progress.phases[selectedProject.currentPhase as PhaseKey]}% complete
                    </div>
                  </div>
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Current Step:</span>{" "}
                    {selectedProject.currentSubstep || 'Not specified'}
                  </div>
                </div>

                {/* Overall Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Overall Progress</span>
                    <span className="font-medium">{selectedProject.progress.overall}%</span>
                  </div>
                  <Progress value={selectedProject.progress.overall} className="h-3" />
                </div>

                {/* Phase Progress Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(selectedProject.progress.phases).map(([phase, progress]) => (
                    <div key={phase} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium capitalize">{phase}</span>
                        <span className="text-xs text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {selectedProject.milestones.filter(m => m.status === 'completed').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedProject.milestones.filter(m => m.status === 'in-progress').length}
                    </div>
                    <div className="text-xs text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {selectedProject.milestones.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milestones */}
          {selectedProject && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Project Milestones</CardTitle>
                    <CardDescription>
                      Key deliverables and checkpoints
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsAddMilestoneOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedProject.milestones.length > 0 ? (
                  selectedProject.milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMilestoneToggle(milestone.id, milestone.status)}
                        className="p-0 h-auto mt-1"
                      >
                        {getMilestoneStatusIcon(milestone.status)}
                      </Button>
                      <div className="flex-1">
                        {editingMilestone === milestone.id ? (
                          <div className="space-y-2">
                            <Input
                              value={milestoneForm.title || ''}
                              onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                              placeholder="Milestone title"
                            />
                            <Textarea
                              value={milestoneForm.description || ''}
                              onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                              placeholder="Milestone description"
                              rows={2}
                            />
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
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className={`font-medium ${milestone.status === 'completed' ? "line-through text-muted-foreground" : ""}`}>
                                  {milestone.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {milestone.description}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Badge className={getPhaseColor(milestone.phase)}>
                                  {milestone.phase}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {milestone.status}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditingMilestone(milestone)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            {milestone.dueDate && (
                              <div className="flex items-center text-sm text-muted-foreground mt-2">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {milestone.progress > 0 && (
                              <div className="mt-2">
                                <Progress value={milestone.progress} className="h-1" />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No milestones yet. Add your first milestone to track progress.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Timeline Card */}
          {selectedProject && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-medium">
                    {new Date(selectedProject.timeline.startDate).toLocaleDateString()}
                  </span>
                </div>
                {selectedProject.timeline.estimatedCompletion && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Completion:</span>
                    <span className="font-medium">
                      {new Date(selectedProject.timeline.estimatedCompletion).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {selectedProject.timeline.endDate && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="font-medium text-green-600">
                      {new Date(selectedProject.timeline.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Communications */}
          {selectedProject && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Notes & Updates
                  </CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setIsCommunicationOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedProject.communications && selectedProject.communications.length > 0 ? (
                  <div className="space-y-3">
                    {selectedProject.communications.slice(0, 5).map((comm) => (
                      <div key={comm.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <span className="font-medium text-sm">{comm.subject}</span>
                          <Badge variant="outline" className="text-xs">{comm.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{comm.content}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(comm.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No communications yet
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          {selectedProject && selectedProject.deliverables && selectedProject.deliverables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Deliverables
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedProject.deliverables.slice(0, 5).map((deliverable) => (
                    <div key={deliverable.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{deliverable.title}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {deliverable.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Milestone Dialog */}
      <Dialog open={isAddMilestoneOpen} onOpenChange={setIsAddMilestoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
            <DialogDescription>
              Create a new milestone to track your project progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newMilestoneForm.title}
                onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, title: e.target.value })}
                placeholder="Milestone title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newMilestoneForm.description}
                onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, description: e.target.value })}
                placeholder="Describe this milestone"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phase</label>
                <Select
                  value={newMilestoneForm.phase}
                  onValueChange={(value) => setNewMilestoneForm({ ...newMilestoneForm, phase: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              </div>
              <div>
                <label className="text-sm font-medium">Weight</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={newMilestoneForm.weight}
                  onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, weight: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMilestoneOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMilestone}>
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Communication Dialog */}
      <Dialog open={isCommunicationOpen} onOpenChange={setIsCommunicationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note or Update</DialogTitle>
            <DialogDescription>
              Document important information about your project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={communicationForm.type}
                onValueChange={(value: any) => setCommunicationForm({ ...communicationForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={communicationForm.subject}
                onChange={(e) => setCommunicationForm({ ...communicationForm, subject: e.target.value })}
                placeholder="Brief title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={communicationForm.content}
                onChange={(e) => setCommunicationForm({ ...communicationForm, content: e.target.value })}
                placeholder="Details..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCommunicationOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCommunication}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
