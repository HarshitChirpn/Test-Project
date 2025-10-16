// Project tracking utilities and types
import { api } from '@/lib/api';

// Project tracking interfaces
export interface ProjectTracking {
  projectId: string;
  userId: string;
  projectName: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  currentPhase: string;
  progress: number;
  milestones: MilestoneTracking[];
  teamMembers: string[];
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  timeline: {
    startDate: Date;
    endDate?: Date;
    estimatedCompletion: Date;
  };
  lastUpdated: Date;
  createdAt: Date;
}

export interface MilestoneTracking {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dueDate: Date;
  completedDate?: Date;
  assignedTo?: string;
  dependencies: string[];
  progress: number;
  notes?: string;
}

export const projectTrackingService = {
  // Get project tracking data
  async getProjectTracking(projectId: string): Promise<ProjectTracking | null> {
    try {
      // For now, we'll create a mock project tracking object
      // In a real implementation, you'd have a projectTracking collection
      const mockProject: ProjectTracking = {
        projectId,
        userId: 'mock-user-id',
        projectName: 'Sample Project',
        status: 'in-progress',
        currentPhase: 'development',
        progress: 45,
        milestones: [
          {
            id: 'milestone-1',
            title: 'Project Setup',
            description: 'Initial project setup and configuration',
            phase: 'planning',
            status: 'completed',
            dueDate: new Date('2024-01-15'),
            completedDate: new Date('2024-01-14'),
            dependencies: [],
            progress: 100
          },
          {
            id: 'milestone-2',
            title: 'Design Phase',
            description: 'UI/UX design and wireframing',
            phase: 'design',
            status: 'completed',
            dueDate: new Date('2024-02-01'),
            completedDate: new Date('2024-01-30'),
            dependencies: ['milestone-1'],
            progress: 100
          },
          {
            id: 'milestone-3',
            title: 'Development',
            description: 'Core development work',
            phase: 'development',
            status: 'in-progress',
            dueDate: new Date('2024-03-15'),
            dependencies: ['milestone-2'],
            progress: 45
          }
        ],
        teamMembers: ['user1', 'user2'],
        budget: {
          allocated: 50000,
          spent: 22500,
          remaining: 27500
        },
        timeline: {
          startDate: new Date('2024-01-01'),
          estimatedCompletion: new Date('2024-04-01')
        },
        lastUpdated: new Date(),
        createdAt: new Date('2024-01-01')
      };
      
      return mockProject;
    } catch (error) {
      console.error('Error getting project tracking:', error);
      return null;
    }
  },

  // Update project tracking
  async updateProjectTracking(projectId: string, updates: Partial<ProjectTracking>): Promise<{ success: boolean; error?: any }> {
    try {
      // For now, we'll just log the update
      // In a real implementation, you'd update the projectTracking collection
      console.log('Updating project tracking:', projectId, updates);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating project tracking:', error);
      return { success: false, error };
    }
  },

  // Update milestone
  async updateMilestone(projectId: string, milestoneId: string, updates: Partial<MilestoneTracking>): Promise<{ success: boolean; error?: any }> {
    try {
      // For now, we'll just log the update
      // In a real implementation, you'd update the milestone in the projectTracking collection
      console.log('Updating milestone:', projectId, milestoneId, updates);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating milestone:', error);
      return { success: false, error };
    }
  },

  // Get all projects for admin
  async getAllProjects(): Promise<ProjectTracking[]> {
    try {
      const usersResult = await api.get('/users');
      const users = usersResult.data?.users || [];

      // Create mock projects for all users
      const projects: ProjectTracking[] = users
        .map((user: any, index: number) => ({
          projectId: `project-${user._id}`,
          userId: user._id,
          projectName: `Project ${index + 1}`,
          status: 'in-progress' as const,
          currentPhase: 'development',
          progress: Math.floor(Math.random() * 100),
          milestones: [],
          teamMembers: [user._id],
          budget: {
            allocated: 50000,
            spent: Math.floor(Math.random() * 50000),
            remaining: 0
          },
          timeline: {
            startDate: new Date('2024-01-01'),
            estimatedCompletion: new Date('2024-04-01')
          },
          lastUpdated: new Date(),
          createdAt: user.createdAt
        }));

      return projects;
    } catch (error) {
      console.error('Error getting all projects:', error);
      return [];
    }
  }
};