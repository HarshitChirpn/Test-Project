import { api } from '@/lib/api';

// Phase Substep Definitions
export interface PhaseSubsteps {
  discovery: {
    substeps: string[];
  };
  design: {
    substeps: string[];
  };
  development: {
    substeps: string[];
  };
  testing: {
    substeps: string[];
  };
  launch: {
    substeps: string[];
  };
  support: {
    substeps: string[];
  };
}

export interface ProjectData {
  id: string;
  userId: string;
  projectName: string;
  projectDescription: string;
  industry: string;
  timeline: string;
  budget: number;
  services: string[];
  primaryGoal: string;
  currentPhase: string;
  currentSubstep: string;
  phaseProgress: number;
  substepProgress: number;
  overallProgress: number;
  milestonesCompleted: number;
  totalMilestones: number;
  createdAt: Date;
  updatedAt: Date;
  lastUpdated: Date;
  updatedBy?: string;
  notes?: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  overall: number;
  phases: {
    discovery: number;
    design: number;
    development: number;
    testing: number;
    launch: number;
    support: number;
  };
  milestonesCompleted: number;
  totalMilestones: number;
  lastUpdated?: Date;
  currentStatus?: {
    currentPhase: string;
    currentSubstep: string;
    phaseProgress: number;
    substepProgress: number;
    updatedAt: Date;
    updatedBy?: string;
    notes?: string;
  };
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  phase: string;
  substep: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dueDate?: Date;
  completedDate?: Date;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDeliverable {
  id: string;
  projectId: string;
  milestoneId?: string;
  title: string;
  description: string;
  type: 'document' | 'design' | 'code' | 'test' | 'deployment';
  status: 'pending' | 'in-progress' | 'completed' | 'review';
  fileUrl?: string;
  fileSize?: number;
  uploadedBy?: string;
  uploadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectTimeline {
  id: string;
  projectId: string;
  phase: string;
  substep: string;
  startDate: Date;
  endDate?: Date;
  estimatedDuration: number; // in days
  actualDuration?: number; // in days
  status: 'planned' | 'in-progress' | 'completed' | 'delayed';
  dependencies?: string[];
  blockers?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  responsibilities: string[];
  hourlyRate?: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectBudget {
  id: string;
  projectId: string;
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  currency: string;
  breakdown: {
    development: number;
    design: number;
    testing: number;
    deployment: number;
    maintenance: number;
    other: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCommunication {
  id: string;
  projectId: string;
  type: 'meeting' | 'email' | 'message' | 'call' | 'note';
  subject: string;
  content: string;
  fromUserId: string;
  toUserId?: string;
  isInternal: boolean;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Phase and substep definitions
export const PHASE_SUBSTEPS: PhaseSubsteps = {
  discovery: {
    substeps: [
      'Project Requirements Analysis',
      'Market Research',
      'Competitor Analysis',
      'User Persona Development',
      'Technical Feasibility Study',
      'Project Scope Definition'
    ]
  },
  design: {
    substeps: [
      'Information Architecture',
      'Wireframing',
      'UI/UX Design',
      'Design System Creation',
      'Prototype Development',
      'Design Review & Approval'
    ]
  },
  development: {
    substeps: [
      'Environment Setup',
      'Database Design',
      'Backend Development',
      'Frontend Development',
      'API Integration',
      'Third-party Integrations'
    ]
  },
  testing: {
    substeps: [
      'Unit Testing',
      'Integration Testing',
      'User Acceptance Testing',
      'Performance Testing',
      'Security Testing',
      'Bug Fixes & Optimization'
    ]
  },
  launch: {
    substeps: [
      'Production Environment Setup',
      'Deployment',
      'Domain Configuration',
      'SSL Certificate Setup',
      'Performance Monitoring',
      'Launch Announcement'
    ]
  },
  support: {
    substeps: [
      'User Training',
      'Documentation',
      'Maintenance Plan',
      'Support System Setup',
      'Monitoring & Analytics',
      'Post-launch Optimization'
    ]
  }
};

export const progressService = {
  // Get phase substeps
  getPhaseSubsteps(): PhaseSubsteps {
    return PHASE_SUBSTEPS;
  },

  // Get user progress
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const result = await api.get(`/progress/${userId}`);

      if (result.success && result.data?.progress) {
        const progress = result.data.progress;
        return {
          id: progress._id,
          userId: progress.userId,
          overall: progress.overall,
          phases: progress.phases,
          milestonesCompleted: progress.milestonesCompleted,
          totalMilestones: progress.totalMilestones,
          lastUpdated: progress.lastUpdated,
          currentStatus: progress.currentStatus
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  },

  // Create or update user progress
  async updateUserProgress(userId: string, progressData: Partial<UserProgress>): Promise<{ success: boolean; error?: any }> {
    try {
      const result = await api.put(`/progress/${userId}`, {
        overall: progressData.overall,
        phases: progressData.phases,
        milestonesCompleted: progressData.milestonesCompleted,
        totalMilestones: progressData.totalMilestones,
        currentStatus: progressData.currentStatus
      });

      return { success: result.success };
    } catch (error) {
      console.error('Error updating user progress:', error);
      return { success: false, error };
    }
  },

};