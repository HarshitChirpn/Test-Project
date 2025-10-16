import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { progressService, ProjectMilestone } from "@/services/progressService";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  User, 
  Flag,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";

export default function Milestones() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    phase: "discovery" as keyof typeof progressService.calculateProgressFromMilestones,
    dueDate: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadMilestones();
    }
  }, [user?.uid]);

  const loadMilestones = async () => {
    try {
      const projectData = await progressService.getUserProjectData(user!.uid);
      if (projectData?.milestones) {
        setMilestones(projectData.milestones);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load milestones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMilestone = async (milestoneId: string, completed: boolean) => {
    try {
      await progressService.updateMilestone(user!.uid, milestoneId, !completed);
      setMilestones(milestones.map(m => 
        m.id === milestoneId ? { ...m, completed: !completed } : m
      ));
      toast({
        title: "Success",
        description: `Milestone ${!completed ? "completed" : "marked as pending"}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update milestone",
        variant: "destructive",
      });
    }
  };

  const addMilestone = async () => {
    if (!newMilestone.title.trim()) return;

    try {
      // In a real implementation, we would add this to the project data
      // For now, we'll just add it to the local state
      const milestone: ProjectMilestone = {
        id: `milestone-${Date.now()}`,
        title: newMilestone.title,
        description: newMilestone.description,
        phase: newMilestone.phase,
        completed: false,
        dueDate: newMilestone.dueDate ? new Date(newMilestone.dueDate) : undefined,
        deliverables: [],
        weight: 5
      };

      setMilestones([...milestones, milestone]);
      setNewMilestone({ title: "", description: "", phase: "discovery", dueDate: "" });
      setShowAddForm(false);
      
      toast({
        title: "Success",
        description: "Milestone added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add milestone",
        variant: "destructive",
      });
    }
  };

  const deleteMilestone = (milestoneId: string) => {
    setMilestones(milestones.filter(m => m.id !== milestoneId));
    toast({
      title: "Success",
      description: "Milestone deleted",
    });
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "discovery": return "bg-blue-100 text-blue-800";
      case "design": return "bg-purple-100 text-purple-800";
      case "development": return "bg-green-100 text-green-800";
      case "testing": return "bg-yellow-100 text-yellow-800";
      case "launch": return "bg-orange-100 text-orange-800";
      case "support": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Milestones</h1>
          <p className="text-muted-foreground">
            Track your progress through key project phases
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Milestone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded mt-1"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                placeholder="Milestone title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full p-2 border rounded mt-1"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                placeholder="Milestone description"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phase</label>
                <select
                  className="w-full p-2 border rounded mt-1"
                  value={newMilestone.phase}
                  onChange={(e) => setNewMilestone({...newMilestone, phase: e.target.value as any})}
                >
                  <option value="discovery">Discovery</option>
                  <option value="design">Design</option>
                  <option value="development">Development</option>
                  <option value="testing">Testing</option>
                  <option value="launch">Launch</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded mt-1"
                  value={newMilestone.dueDate}
                  onChange={(e) => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={addMilestone}>
                Add Milestone
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {milestones.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Flag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No milestones yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first milestone to start tracking progress
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Milestone
              </Button>
            </CardContent>
          </Card>
        ) : (
          milestones.map((milestone) => (
            <Card key={milestone.id} className={milestone.completed ? "opacity-75" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    checked={milestone.completed}
                    onCheckedChange={(checked) => toggleMilestone(milestone.id, !!checked)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold ${milestone.completed ? "line-through" : ""}`}>
                          {milestone.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {milestone.description}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteMilestone(milestone.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <Badge className={getPhaseColor(milestone.phase)}>
                        {milestone.phase.charAt(0).toUpperCase() + milestone.phase.slice(1)}
                      </Badge>
                      
                      {milestone.dueDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(milestone.dueDate), "MMM dd, yyyy")}
                        </div>
                      )}
                      
                      {milestone.completed && milestone.completedDate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          Completed on {format(new Date(milestone.completedDate), "MMM dd, yyyy")}
                        </div>
                      )}
                      
                      {!milestone.completed && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          Pending
                        </div>
                      )}
                      
                      {milestone.assignedTo && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          {milestone.assignedTo}
                        </div>
                      )}
                    </div>
                    
                    {milestone.deliverables && milestone.deliverables.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium mb-2">Deliverables:</h4>
                        <div className="flex flex-wrap gap-2">
                          {milestone.deliverables.map((deliverable, index) => (
                            <Badge key={index} variant="outline">
                              {deliverable}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}