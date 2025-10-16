import { api } from '@/lib/api';

// Substep interface
export interface Substep {
  name: string;
  completed: boolean;
  completedDate: Date | null;
  notes: string;
}

// Project Workflow Types
export interface ProjectWorkflow {
  _id: string;
  userId: string;
  projectName: string;
  projectDescription: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  currentPhase: 'discovery' | 'design' | 'development' | 'testing' | 'launch' | 'support';
  currentSubstep: string;
  projectType?: string;
  category?: string;
  tags?: string[];
  technologies?: string[];
  priority?: string;
  progress: {
    overall: number;
    phases: {
      discovery: number;
      design: number;
      development: number;
      testing: number;
      launch: number;
      support: number;
    };
  };
  substeps?: {
    discovery: Substep[];
    design: Substep[];
    development: Substep[];
    testing: Substep[];
    launch: Substep[];
    support: Substep[];
  };
  milestones: ProjectMilestone[];
  deliverables: ProjectDeliverable[];
  timeline: {
    startDate: Date;
    endDate?: Date;
    estimatedCompletion?: Date;
  };
  teamMembers: TeamMember[];
  budget: {
    total: number;
    allocated: number;
    spent: number;
    remaining: number;
  };
  communications: Communication[];
  adminNotes: string;
  createdAt: Date;
  updatedAt: Date;
  lastUpdatedBy: string;
}

export interface ProjectMilestone {
  _id: string;
  title: string;
  description: string;
  phase: string;
  substep: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dueDate: Date;
  completedDate?: Date;
  assignedTo?: string;
  dependencies: string[];
  progress: number;
  notes: string;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDeliverable {
  _id: string;
  name: string;
  description: string;
  phase: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dueDate: Date;
  completedDate?: Date;
  assignedTo?: string;
  url?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  version?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  responsibilities: string[];
  hourlyRate?: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Communication {
  id: string;
  type: 'meeting' | 'email' | 'message' | 'call' | 'note';
  subject: string;
  content: string;
  fromUserId: string;
  fromUserName: string;
  toUserId?: string;
  toUserName?: string;
  isInternal: boolean;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectStatistics {
  statusCounts: { _id: string; count: number }[];
  phaseCounts: { _id: string; count: number }[];
  averageProgress: { _id: null; avg: number }[];
  totalProjects: { count: number }[];
}

export const projectWorkflowService = {
  // Get projects for a user (from projectWorkflow collection)
  async getUserProjects(userId: string): Promise<ProjectWorkflow[]> {
    try {
      console.log('🔄 Fetching user projects for userId:', userId);
      
      // Get projects directly from projectWorkflow collection
      const response = await api.get(`/project-workflow/user/${userId}`);
      
      if (response.success && response.data?.projects) {
        console.log('✅ Found projects:', response.data.projects.length);
        return response.data.projects.map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          timeline: {
            ...project.timeline,
            startDate: new Date(project.timeline?.startDate || project.createdAt),
            endDate: project.timeline?.endDate ? new Date(project.timeline.endDate) : undefined,
            estimatedCompletion: project.timeline?.estimatedCompletion ? new Date(project.timeline.estimatedCompletion) : undefined,
          },
          milestones: project.milestones?.map((milestone: any) => ({
            ...milestone,
            dueDate: new Date(milestone.dueDate),
            completedDate: milestone.completedDate ? new Date(milestone.completedDate) : undefined,
          })) || [],
          deliverables: project.deliverables?.map((deliverable: any) => ({
            ...deliverable,
            dueDate: new Date(deliverable.dueDate),
            completedDate: deliverable.completedDate ? new Date(deliverable.completedDate) : undefined,
          })) || [],
        }));
      } else {
        console.log('ℹ️ No projects found for user');
        return [];
      }
    } catch (error) {
      console.error('❌ Error fetching user projects:', error);
      throw error;
    }
  },

  // Get all projects (admin only)
  async getAllProjects(filters: any = {}): Promise<{ projects: ProjectWorkflow[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString());
        }
      });

      const response = await api.get(`/project-workflow?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all projects:', error);
      throw error;
    }
  },

  // Get project by ID
  async getProject(projectId: string): Promise<ProjectWorkflow> {
    try {
      const response = await api.get(`/project-workflow/${projectId}`);
      return response.data.project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Create new project
  async createProject(projectData: Partial<ProjectWorkflow>): Promise<ProjectWorkflow> {
    try {
      const response = await api.post('/project-workflow', projectData);
      return response.data.project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update project
  async updateProject(projectId: string, updates: Partial<ProjectWorkflow>): Promise<ProjectWorkflow> {
    try {
      const response = await api.put(`/project-workflow/${projectId}`, updates);
      return response.data.project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  // Delete project
  async deleteProject(projectId: string): Promise<void> {
    try {
      await api.delete(`/project-workflow/${projectId}`);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },

  // Update project phase
  async updateProjectPhase(projectId: string, phase: string, substep: string): Promise<ProjectWorkflow> {
    try {
      const response = await api.put(`/project-workflow/${projectId}/phase`, {
        currentPhase: phase,
        currentSubstep: substep
      });
      return response.data.project;
    } catch (error) {
      console.error('Error updating project phase:', error);
      throw error;
    }
  },

  // Add milestone
  async addMilestone(projectId: string, milestone: Partial<ProjectMilestone>): Promise<ProjectWorkflow> {
    try {
      const response = await api.post(`/project-workflow/${projectId}/milestones`, milestone);
      return response.data.project;
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  },

  // Update milestone
  async updateMilestone(projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>): Promise<ProjectWorkflow> {
    try {
      const response = await api.put(`/project-workflow/${projectId}/milestones/${milestoneId}`, updates);
      return response.data.project;
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  },

  // Delete milestone
  async deleteMilestone(projectId: string, milestoneId: string): Promise<ProjectWorkflow> {
    try {
      const response = await api.delete(`/project-workflow/${projectId}/milestones/${milestoneId}`);
      return response.data.project;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }
  },

  // Add deliverable
  async addDeliverable(projectId: string, deliverable: Partial<ProjectDeliverable>): Promise<ProjectWorkflow> {
    try {
      const response = await api.post(`/project-workflow/${projectId}/deliverables`, deliverable);
      return response.data.project;
    } catch (error) {
      console.error('Error adding deliverable:', error);
      throw error;
    }
  },

  // Add communication
  async addCommunication(projectId: string, communication: Partial<Communication>): Promise<ProjectWorkflow> {
    try {
      const response = await api.post(`/project-workflow/${projectId}/communications`, communication);
      return response.data.project;
    } catch (error) {
      console.error('Error adding communication:', error);
      throw error;
    }
  },

  // Get project statistics
  async getProjectStatistics(): Promise<ProjectStatistics> {
    try {
      const response = await api.get('/project-workflow/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching project statistics:', error);
      throw error;
    }
  },

  // Toggle project substep
  async toggleProjectSubstep(projectId: string, phase: string, substepIndex: number): Promise<ProjectWorkflow> {
    try {
      const response = await api.put(`/project-workflow/${projectId}/substeps`, {
        phase,
        substepIndex
      });
      return response.data.project;
    } catch (error) {
      console.error('Error toggling project substep:', error);
      throw error;
    }
  }
};
