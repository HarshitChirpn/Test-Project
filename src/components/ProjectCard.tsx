import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  MoreHorizontal,
  Calendar,
  DollarSign,
  Users,
  Flag,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Project } from '@/services/projectService';
import { useProjects } from '@/contexts/ProjectContext';
import { useToast } from '@/components/ui/use-toast';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onView?: (project: Project) => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'planning':
      return <Clock className="h-3.5 w-3.5" />;
    case 'active':
      return <Play className="h-3.5 w-3.5" />;
    case 'on-hold':
      return <Pause className="h-3.5 w-3.5" />;
    case 'completed':
      return <CheckCircle className="h-3.5 w-3.5" />;
    case 'cancelled':
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return <AlertCircle className="h-3.5 w-3.5" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planning':
      return 'bg-blue-50 text-blue-700 border-blue-200/50';
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
    case 'on-hold':
      return 'bg-amber-50 text-amber-700 border-amber-200/50';
    case 'completed':
      return 'bg-purple-50 text-purple-700 border-purple-200/50';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border-red-200/50';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200/50';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'high':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'low':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export default function ProjectCard({ project, onEdit, onView }: ProjectCardProps) {
  const { updateProject, deleteProject } = useProjects();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateProject(project._id, { status: newStatus as any });
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteProject(project._id);
      if (success) {
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const completedMilestones = (project.milestones || []).filter(m => m.status === 'completed').length;
  const totalMilestones = (project.milestones || []).length;

  return (
    <>
      <Card className="card-hover card-glow border-border/50 group overflow-hidden">
        <CardHeader className="pb-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1 group-hover:text-brand-yellow transition-colors duration-300 font-semibold">
                {project.name}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                {project.description}
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 opacity-60 group-hover:opacity-100 transition-all duration-200 hover:bg-muted hover:scale-105 focus:opacity-100 focus:bg-muted bg-background/50 backdrop-blur-sm border border-border/20 hover:border-border/40"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(project)} className="cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(project)} className="cursor-pointer">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Project
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Project actions</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Status and Priority Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${getStatusColor(project.status || 'planning')} flex items-center gap-1.5 px-2.5 py-1 badge-animated border`}>
              {getStatusIcon(project.status || 'planning')}
              <span className="text-xs font-medium tracking-wide">
                {(project.status || 'planning').charAt(0).toUpperCase() + (project.status || 'planning').slice(1).replace('-', ' ')}
              </span>
            </Badge>
            <Badge variant="outline" className={`${getPriorityColor(project.priority || 'medium')} px-2.5 py-1 badge-animated`}>
              <span className="text-xs font-medium">
                {(project.priority || 'medium').charAt(0).toUpperCase() + (project.priority || 'medium').slice(1)}
              </span>
            </Badge>
            {project.type && (
              <Badge variant="secondary" className="px-2.5 py-1 badge-animated bg-muted/50 hover:bg-muted">
                <span className="text-xs">{project.type}</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Progress Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Overall Progress</span>
              <span className="font-semibold text-foreground tabular-nums">{project.progress || 0}%</span>
            </div>
            <div className="relative">
              <Progress value={project.progress || 0} className="h-2.5 bg-secondary" />
            </div>
          </div>

          {/* Milestones Progress */}
          {totalMilestones > 0 && (
            <div className="pt-1 border-t border-border/50">
              <div className="flex items-center justify-between text-sm mt-3 mb-2">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5" />
                  Milestones
                </span>
                <span className="font-semibold text-foreground tabular-nums">
                  {completedMilestones}/{totalMilestones}
                </span>
              </div>
              <Progress
                value={totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0}
                className="h-2 bg-secondary"
              />
            </div>
          )}

          {/* Project Meta Information */}
          <div className="grid grid-cols-2 gap-3 text-sm pt-1">
            {project.startDate && (
              <div className="flex items-center gap-2 text-muted-foreground group/item hover:text-foreground transition-colors">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs">Start {formatDate(project.startDate)}</span>
              </div>
            )}
            {project.targetDate && (
              <div className="flex items-center gap-2 text-muted-foreground group/item hover:text-foreground transition-colors">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs">Due {formatDate(project.targetDate)}</span>
              </div>
            )}
            {(project.budget || 0) > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground group/item hover:text-foreground transition-colors">
                <DollarSign className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs font-medium">{formatCurrency(project.budget || 0, project.currency || 'USD')}</span>
              </div>
            )}
            {(project.team || []).length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground group/item hover:text-foreground transition-colors">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="truncate text-xs">{(project.team || []).length} member{(project.team || []).length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Technologies */}
          {(project.technologies || []).length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="text-xs text-muted-foreground font-medium">Tech Stack</div>
              <div className="flex flex-wrap gap-1.5">
                {(project.technologies || []).slice(0, 4).map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs px-2 py-0.5 bg-background hover:bg-muted transition-colors">
                    {tech}
                  </Badge>
                ))}
                {(project.technologies || []).length > 4 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5 bg-muted">
                    +{(project.technologies || []).length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {(project.tags || []).length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {(project.tags || []).slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/50 hover:bg-secondary transition-colors">
                    {tag}
                  </Badge>
                ))}
                {(project.tags || []).length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    +{(project.tags || []).length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Footer - Last Updated */}
          <div className="text-xs text-muted-foreground pt-2 border-t border-border/50 flex items-center justify-between">
            <span>Updated {formatDate(project.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
              All project data, milestones, and team information will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
