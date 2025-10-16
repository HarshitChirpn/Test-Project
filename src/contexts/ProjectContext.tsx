import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { projectService, Project, ProjectStats, CreateProjectData, UpdateProjectData } from '@/services/projectService';
import { projectWorkflowService, ProjectWorkflow } from '@/services/projectWorkflowService';
import { useToast } from '@/components/ui/use-toast';

interface ProjectContextType {
  projects: Project[];
  workflowProjects: ProjectWorkflow[];
  currentProject: Project | null;
  stats: ProjectStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  createProject: (projectData: CreateProjectData) => Promise<Project | null>;
  updateProject: (projectId: string, updateData: UpdateProjectData) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  
  // State setters
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [workflowProjects, setWorkflowProjects] = useState<ProjectWorkflow[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<number>(0);

  // Fetch all projects for the current user
  const fetchProjects = async () => {
    if (!user?._id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both regular projects and workflow projects
      const [projectsResult, workflowResult] = await Promise.all([
        projectService.getUserProjects(user._id),
        projectWorkflowService.getUserProjects(user._id)
      ]);
      
      setProjects(projectsResult.projects);
      setWorkflowProjects(workflowResult);
      
      // Update timestamp when data is successfully fetched
      if (workflowResult && workflowResult.length > 0) {
        const latestProject = workflowResult.reduce((latest: any, current: any) => {
          const latestTime = new Date(latest.updatedAt || latest.createdAt).getTime();
          const currentTime = new Date(current.updatedAt || current.createdAt).getTime();
          return currentTime > latestTime ? current : latest;
        });
        setLastUpdatedTimestamp(new Date(latestProject.updatedAt || latestProject.createdAt).getTime());
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch projects';
      setError(errorMessage);
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific project
  const fetchProject = async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const project = await projectService.getProjectById(projectId);
      setCurrentProject(project);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch project';
      setError(errorMessage);
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new project
  const createProject = async (projectData: CreateProjectData): Promise<Project | null> => {
    if (!user?._id) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const newProject = await projectService.createProject(projectData);
      
      // Add the new project to the list
      setProjects(prev => [newProject, ...prev]);
      
      // Update stats
      await fetchStats();
      
      toast({
        title: "Project created! 🎉",
        description: `"${newProject.name}" has been created successfully.`,
      });
      
      return newProject;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create project';
      setError(errorMessage);
      console.error('Error creating project:', err);
      
      toast({
        title: "Creation failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing project
  const updateProject = async (projectId: string, updateData: UpdateProjectData): Promise<Project | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedProject = await projectService.updateProject(projectId, updateData);
      
      // Update the project in the list
      setProjects(prev => 
        prev.map(project => 
          project._id === projectId ? updatedProject : project
        )
      );
      
      // Update current project if it's the one being updated
      if (currentProject?._id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      // Update stats
      await fetchStats();
      
      toast({
        title: "Project updated! ✅",
        description: `"${updatedProject.name}" has been updated successfully.`,
      });
      
      return updatedProject;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update project';
      setError(errorMessage);
      console.error('Error updating project:', err);
      
      toast({
        title: "Update failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await projectService.deleteProject(projectId);
      
      // Remove the project from the list
      setProjects(prev => prev.filter(project => project._id !== projectId));
      
      // Clear current project if it's the one being deleted
      if (currentProject?._id === projectId) {
        setCurrentProject(null);
      }
      
      // Update stats
      await fetchStats();
      
      toast({
        title: "Project deleted! 🗑️",
        description: "The project has been deleted successfully.",
      });
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete project';
      setError(errorMessage);
      console.error('Error deleting project:', err);
      
      toast({
        title: "Deletion failed ❌",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch project statistics
  const fetchStats = async () => {
    if (!user?._id) return;
    
    try {
      const projectStats = await projectService.getProjectStats(user._id);
      setStats(projectStats);
    } catch (err: any) {
      console.error('Error fetching project stats:', err);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Fetch projects when user changes
  useEffect(() => {
    if (user?._id) {
      fetchProjects();
      fetchStats();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setStats(null);
    }
  }, [user?._id]);

  // Smart polling: Check for changes every 30 seconds, only refresh if data changed
  useEffect(() => {
    if (!user?._id) return;

    console.log('[ProjectContext] Setting up smart polling for project updates');
    
    const checkForUpdates = async () => {
      try {
        // Check if there are any project updates by checking the latest workflow project timestamp
        const workflowResult = await projectWorkflowService.getUserProjects(user._id);
        if (workflowResult && workflowResult.length > 0) {
          const latestProject = workflowResult.reduce((latest: any, current: any) => {
            const latestTime = new Date(latest.updatedAt || latest.createdAt).getTime();
            const currentTime = new Date(current.updatedAt || current.createdAt).getTime();
            return currentTime > latestTime ? current : latest;
          });
          
          const latestTimestamp = new Date(latestProject.updatedAt || latestProject.createdAt).getTime();
          
          // Only refresh if we have newer data
          if (latestTimestamp > lastUpdatedTimestamp) {
            console.log('[ProjectContext] Changes detected, refreshing projects...');
            await fetchProjects();
            await fetchStats();
            setLastUpdatedTimestamp(latestTimestamp);
          }
        }
      } catch (error) {
        console.error('[ProjectContext] Error checking for updates:', error);
        // Fallback to regular polling if change detection fails
        fetchProjects();
        fetchStats();
      }
    };

    // Check for updates every 30 seconds
    const pollInterval = setInterval(checkForUpdates, 30000);

    // Cleanup on unmount
    return () => {
      console.log('[ProjectContext] Stopping smart polling');
      clearInterval(pollInterval);
    };
  }, [user?._id, lastUpdatedTimestamp]);

  const value: ProjectContextType = {
    projects,
    workflowProjects,
    currentProject,
    stats,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchStats,
    setCurrentProject,
    clearError
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
