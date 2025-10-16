import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { projectTrackingService, ProjectTracking } from "@/services/projectTrackingService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar,
  Flag,
  MessageCircle
} from "lucide-react";

interface ProjectTrackingProps {
  projectId: string;
}

export default function ProjectTrackingDisplay({ projectId }: ProjectTrackingProps) {
  const { user } = useAuth();
  const [projectTracking, setProjectTracking] = useState<ProjectTracking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid && projectId) {
      loadProjectTracking();
    }
  }, [user?.uid, projectId]);

  const loadProjectTracking = async () => {
    try {
      const tracking = await projectTrackingService.getProjectTracking(projectId, user!.uid);
      setProjectTracking(tracking);
    } catch (error) {
      console.error("Error loading project tracking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!projectTracking) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Project Tracking Not Available</h3>
          <p className="text-muted-foreground">
            Tracking information for this project is not yet available. Check back later.
          </p>
        </CardContent>
      </Card>
    );
  }

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

  const getMilestoneStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in-progress": return <Clock className="h-5 w-5 text-blue-500" />;
      case "delayed": return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in-progress": return "text-blue-600";
      case "delayed": return "text-red-600";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{projectTracking.projectName}</CardTitle>
              <CardDescription>Project tracking and progress</CardDescription>
            </div>
            <Badge className={getStatusColor(projectTracking.status)}>
              {projectTracking.status.charAt(0).toUpperCase() + projectTracking.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Overall Progress</span>
              <span>{projectTracking.progress}%</span>
            </div>
            <Progress value={projectTracking.progress} className="h-3" />
          </div>

          {projectTracking.adminNotes && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <MessageCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">Admin Note</h4>
                  <p className="text-blue-700 mt-1">{projectTracking.adminNotes}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-3">Milestones</h3>
            <div className="space-y-4">
              {projectTracking.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <div className="mt-0.5">
                    {getMilestoneStatusIcon(milestone.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className={`font-medium ${getMilestoneStatusColor(milestone.status)}`}>
                        {milestone.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {milestone.phase}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {milestone.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {milestone.dueDate && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          Due: {milestone.dueDate.toLocaleDateString()}
                        </div>
                      )}
                      {milestone.completedDate && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                          Completed: {milestone.completedDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {milestone.adminNotes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-muted-foreground">
                        <span className="font-medium">Admin:</span> {milestone.adminNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}