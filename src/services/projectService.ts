import { api } from '@/lib/api';

export interface Project {
  _id: string;
  name: string;
  description: string;
  userId: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  type: string;
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: Date;
  targetDate?: Date;
  actualEndDate?: Date;
  budget: number;
  currency: string;
  team: TeamMember[];
  milestones: Milestone[];
  tags: string[];
  technologies: string[];
  services: string[];
  attachments: Attachment[];
  notes: ProjectNote[];
  settings: ProjectSettings;
  metrics: ProjectMetrics;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TeamMember {
  userId: string;
  role: string;
  permissions: string[];
  joinedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completedDate?: Date;
  assignedTo: string;
  progress: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface ProjectNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
}

export interface ProjectSettings {
  notifications: {
    email: boolean;
    push: boolean;
    milestoneUpdates: boolean;
    teamUpdates: boolean;
  };
  visibility: 'private' | 'team' | 'public';
  allowTeamInvites: boolean;
  autoArchive: boolean;
}

export interface ProjectMetrics {
  timeSpent: number;
  tasksCompleted: number;
  totalTasks: number;
  teamSize: number;
  lastActivity: Date;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  planningProjects: number;
  onHoldProjects: number;
  averageProgress: number;
  totalBudget: number;
}

export interface CreateProjectData {
  name: string;
  description: string;
  type: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date;
  targetDate?: Date;
  budget?: number;
  currency?: string;
  tags?: string[];
  technologies?: string[];
  services?: string[];
  settings?: Partial<ProjectSettings>;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  progress?: number;
  actualEndDate?: Date;
}

export interface CreateMilestoneData {
  title: string;
  description: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  tags?: string[];
}

export interface UpdateMilestoneData extends Partial<CreateMilestoneData> {
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  progress?: number;
  completedDate?: Date;
}

export const projectService = {
  // Get all projects for a user
  async getUserProjects(userId: string, params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ projects: Project[]; pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      // Use projectWorkflow API to ensure consistency with Project Workflow
      const url = `/project-workflow/user/${userId}${queryString ? `?${queryString}` : ''}`;
      
      const result = await api.get(url);
      
      // Map projectWorkflow projects to Project interface
      const mappedProjects = result.data.projects.map((workflowProject: any) => ({
        _id: workflowProject._id,
        name: workflowProject.projectName,
        description: workflowProject.projectDescription,
        userId: workflowProject.userId,
        status: workflowProject.status,
        type: workflowProject.projectType || 'mvp-development',
        category: workflowProject.category || 'development',
        priority: workflowProject.priority || 'medium',
        progress: workflowProject.progress?.overall || 0,
        startDate: new Date(workflowProject.timeline?.startDate || new Date()),
        targetDate: workflowProject.timeline?.estimatedCompletion ? new Date(workflowProject.timeline.estimatedCompletion) : undefined,
        actualEndDate: workflowProject.timeline?.endDate ? new Date(workflowProject.timeline.endDate) : undefined,
        budget: workflowProject.budget?.total || 0,
        currency: 'USD',
        team: [],
        milestones: (workflowProject.milestones || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          status: m.status === 'completed' ? 'completed' : 'pending',
          priority: 'medium',
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
          completedDate: m.completedDate ? new Date(m.completedDate) : undefined,
          assignedTo: '',
          progress: m.progress || 0,
          tags: [],
          createdAt: new Date(m.createdAt || new Date()),
          updatedAt: new Date(m.updatedAt || new Date())
        })),
        tags: workflowProject.tags || [],
        technologies: workflowProject.technologies || [],
        services: [],
        attachments: [],
        notes: [],
        settings: {
          notifications: true,
          public: false,
          allowComments: true
        },
        metrics: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0
        },
        createdAt: new Date(workflowProject.createdAt),
        updatedAt: new Date(workflowProject.updatedAt),
        createdBy: workflowProject.userId
      }));
      
      return {
        projects: mappedProjects,
        pagination: result.data.pagination
      };
    } catch (error) {
      console.error('Error fetching user projects:', error);
      throw error;
    }
  },

  // Get project by ID
  async getProjectById(projectId: string): Promise<Project> {
    try {
      // Use projectWorkflow API to ensure consistency with Project Workflow
      const result = await api.get(`/project-workflow/${projectId}`);
      
      // Map projectWorkflow response to Project interface
      const workflowProject = result.data.project;
      const mappedProject: Project = {
        _id: workflowProject._id,
        name: workflowProject.projectName,
        description: workflowProject.projectDescription,
        userId: workflowProject.userId,
        status: workflowProject.status,
        type: workflowProject.projectType || 'mvp-development',
        category: workflowProject.category || 'development',
        priority: workflowProject.priority || 'medium',
        progress: workflowProject.progress?.overall || 0,
        startDate: new Date(workflowProject.timeline?.startDate || new Date()),
        targetDate: workflowProject.timeline?.estimatedCompletion ? new Date(workflowProject.timeline.estimatedCompletion) : undefined,
        actualEndDate: workflowProject.timeline?.endDate ? new Date(workflowProject.timeline.endDate) : undefined,
        budget: workflowProject.budget?.total || 0,
        currency: 'USD',
        team: [],
        milestones: (workflowProject.milestones || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          status: m.status === 'completed' ? 'completed' : 'pending',
          priority: 'medium',
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
          completedDate: m.completedDate ? new Date(m.completedDate) : undefined,
          assignedTo: '',
          progress: m.progress || 0,
          tags: [],
          createdAt: new Date(m.createdAt || new Date()),
          updatedAt: new Date(m.updatedAt || new Date())
        })),
        tags: workflowProject.tags || [],
        technologies: workflowProject.technologies || [],
        services: [],
        attachments: [],
        notes: [],
        settings: {
          notifications: true,
          public: false,
          allowComments: true
        },
        metrics: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0
        },
        createdAt: new Date(workflowProject.createdAt),
        updatedAt: new Date(workflowProject.updatedAt),
        createdBy: workflowProject.userId
      };
      
      return mappedProject;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  },

  // Create new project
  async createProject(projectData: CreateProjectData): Promise<Project> {
    try {
      // Use projectWorkflow API to ensure projects appear in Project Workflow
      const result = await api.post('/project-workflow', {
        projectName: projectData.name,
        projectDescription: projectData.description || '',
        status: projectData.status || 'planning',
        currentPhase: 'discovery',
        currentSubstep: 'first-call',
        projectType: projectData.type || 'mvp-development',
        category: projectData.category || 'development',
        tags: projectData.tags || [],
        technologies: projectData.technologies || [],
        priority: projectData.priority || 'medium'
      });
      
      // Map projectWorkflow response to Project interface
      const workflowProject = result.data.project;
      const mappedProject: Project = {
        _id: workflowProject._id,
        name: workflowProject.projectName,
        description: workflowProject.projectDescription,
        userId: workflowProject.userId,
        status: workflowProject.status,
        type: workflowProject.projectType || 'mvp-development',
        category: workflowProject.category || 'development',
        priority: workflowProject.priority || 'medium',
        progress: workflowProject.progress?.overall || 0,
        startDate: new Date(workflowProject.timeline?.startDate || new Date()),
        targetDate: workflowProject.timeline?.estimatedCompletion ? new Date(workflowProject.timeline.estimatedCompletion) : undefined,
        actualEndDate: workflowProject.timeline?.endDate ? new Date(workflowProject.timeline.endDate) : undefined,
        budget: workflowProject.budget?.total || 0,
        currency: 'USD',
        team: [],
        milestones: (workflowProject.milestones || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          status: m.status === 'completed' ? 'completed' : 'pending',
          priority: 'medium',
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
          completedDate: m.completedDate ? new Date(m.completedDate) : undefined,
          assignedTo: '',
          progress: m.progress || 0,
          tags: [],
          createdAt: new Date(m.createdAt || new Date()),
          updatedAt: new Date(m.updatedAt || new Date())
        })),
        tags: workflowProject.tags || [],
        technologies: workflowProject.technologies || [],
        services: [],
        attachments: [],
        notes: [],
        settings: {
          notifications: true,
          public: false,
          allowComments: true
        },
        metrics: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0
        },
        createdAt: new Date(workflowProject.createdAt),
        updatedAt: new Date(workflowProject.updatedAt),
        createdBy: workflowProject.userId
      };
      
      return mappedProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Update project
  async updateProject(projectId: string, updateData: UpdateProjectData): Promise<Project> {
    try {
      // Map Project interface to projectWorkflow format
      const workflowUpdateData = {
        projectName: updateData.name,
        projectDescription: updateData.description,
        status: updateData.status,
        currentPhase: updateData.currentPhase,
        currentSubstep: updateData.currentSubstep,
        projectType: updateData.type,
        category: updateData.category,
        tags: updateData.tags,
        technologies: updateData.technologies,
        priority: updateData.priority,
        progress: updateData.progress ? {
          overall: updateData.progress,
          phases: {
            discovery: 0,
            design: 0,
            development: 0,
            testing: 0,
            launch: 0,
            support: 0
          }
        } : undefined,
        timeline: updateData.startDate || updateData.targetDate ? {
          startDate: updateData.startDate,
          estimatedCompletion: updateData.targetDate
        } : undefined,
        budget: updateData.budget ? {
          total: updateData.budget,
          allocated: 0,
          spent: 0,
          remaining: updateData.budget
        } : undefined
      };

      const result = await api.put(`/project-workflow/${projectId}`, workflowUpdateData);
      
      // Map the response back to Project interface
      const workflowProject = result.data.project;
      const mappedProject: Project = {
        _id: workflowProject._id,
        name: workflowProject.projectName,
        description: workflowProject.projectDescription,
        userId: workflowProject.userId,
        status: workflowProject.status,
        type: workflowProject.projectType || 'mvp-development',
        category: workflowProject.category || 'development',
        priority: workflowProject.priority || 'medium',
        progress: workflowProject.progress?.overall || 0,
        startDate: new Date(workflowProject.timeline?.startDate || new Date()),
        targetDate: workflowProject.timeline?.estimatedCompletion ? new Date(workflowProject.timeline.estimatedCompletion) : undefined,
        actualEndDate: workflowProject.timeline?.endDate ? new Date(workflowProject.timeline.endDate) : undefined,
        budget: workflowProject.budget?.total || 0,
        currency: 'USD',
        team: [],
        milestones: (workflowProject.milestones || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          status: m.status === 'completed' ? 'completed' : 'pending',
          priority: 'medium',
          dueDate: m.dueDate ? new Date(m.dueDate) : undefined,
          completedDate: m.completedDate ? new Date(m.completedDate) : undefined,
          assignedTo: '',
          progress: m.progress || 0,
          tags: [],
          createdAt: new Date(m.createdAt || new Date()),
          updatedAt: new Date(m.updatedAt || new Date())
        })),
        tags: workflowProject.tags || [],
        technologies: workflowProject.technologies || [],
        services: [],
        attachments: [],
        notes: [],
        settings: {
          notifications: true,
          public: false,
          allowComments: true
        },
        metrics: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0
        },
        createdAt: new Date(workflowProject.createdAt),
        updatedAt: new Date(workflowProject.updatedAt),
        createdBy: workflowProject.userId
      };
      
      return mappedProject;
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

  // Add milestone to project
  async addMilestone(projectId: string, milestoneData: CreateMilestoneData): Promise<Project> {
    try {
      const result = await api.post(`/projects/${projectId}/milestones`, milestoneData);
      return result.data.project;
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  },

  // Update milestone
  async updateMilestone(projectId: string, milestoneId: string, updateData: UpdateMilestoneData): Promise<Project> {
    try {
      const result = await api.put(`/projects/${projectId}/milestones/${milestoneId}`, updateData);
      return result.data.project;
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  },

  // Get project statistics
  async getProjectStats(userId: string): Promise<ProjectStats> {
    try {
      // Get user projects and calculate stats from them
      const result = await this.getUserProjects(userId);
      const projects = result.projects;
      
      const totalProjects = projects.length;
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      const onHoldProjects = projects.filter(p => p.status === 'on-hold').length;
      const planningProjects = projects.filter(p => p.status === 'planning').length;
      
      const averageProgress = projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
        : 0;
      
      const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
      const spentBudget = projects.reduce((sum, p) => sum + (p.budget * p.progress / 100), 0);
      
      const stats: ProjectStats = {
        totalProjects,
        activeProjects,
        completedProjects,
        onHoldProjects,
        planningProjects,
        averageProgress,
        totalBudget,
        spentBudget,
        remainingBudget: totalBudget - spentBudget
      };
      
      console.log('Project Stats calculated:', stats);
      return stats;
    } catch (error) {
      console.error('Error fetching project stats:', error);
      throw error;
    }
  },

  // Get all projects (Admin only)
  async getAllProjects(params?: {
    status?: string;
    type?: string;
    userId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ projects: Project[]; pagination: any }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.userId) queryParams.append('userId', params.userId);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);

      const queryString = queryParams.toString();
      const url = `/projects${queryString ? `?${queryString}` : ''}`;
      
      const result = await api.get(url);
      return result.data;
    } catch (error) {
      console.error('Error fetching all projects:', error);
      throw error;
    }
  }
};
