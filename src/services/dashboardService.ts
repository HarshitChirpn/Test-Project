import { api } from '@/lib/api';
import { userService } from './userService';
import { progressService, UserProgress } from './progressService';

export interface DashboardStats {
  totalUsers: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  monthlyRevenue: number;
  userGrowth: number;
  projectCompletionRate: number;
  averageProjectDuration: number;
}

export interface ActivityItem {
  id: string;
  type: 'user_registration' | 'project_start' | 'project_complete' | 'purchase' | 'milestone';
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  databaseStatus: 'healthy' | 'warning' | 'error';
  apiStatus: 'healthy' | 'warning' | 'error';
  storageStatus: 'healthy' | 'warning' | 'error';
  lastChecked: Date;
  uptime: number;
}

export interface UserDashboardData {
  user: {
    id: string;
    email: string;
    displayName?: string;
    role: string;
    createdAt: Date;
  };
  progress?: UserProgress;
  allProjects?: any[]; // Add allProjects field
  stats: Array<{
    title: string;
    value: number;
    icon: string;
    change: string;
    trend: string;
  }>;
  recentActivity: ActivityItem[];
}

export const dashboardService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const usersResult = await api.get('/users');
      const purchasesResult = await api.get('/purchases');

      const users = usersResult.data?.users || [];
      const purchases = purchasesResult.data?.purchases || [];

      const totalUsers = users.length;
      const activeProjects = users.length;
      const completedProjects = 0; // This would need to be calculated based on project status

      const totalRevenue = purchases.reduce((sum: number, purchase: any) => {
        return sum + (purchase.paymentStatus === 'paid' ? purchase.totalAmount : 0);
      }, 0);

      const monthlyRevenue = 0; // This would need to be calculated based on date ranges
      const userGrowth = 0; // This would need to be calculated based on user creation dates
      const projectCompletionRate = activeProjects > 0 ? (completedProjects / activeProjects) * 100 : 0;
      const averageProjectDuration = 0; // This would need to be calculated based on project timelines

      return {
        totalUsers,
        activeProjects,
        completedProjects,
        totalRevenue,
        monthlyRevenue,
        userGrowth,
        projectCompletionRate,
        averageProjectDuration
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    try {
      // For now, we'll create mock activity items
      // In a real implementation, you'd have an activities collection
      const activities: ActivityItem[] = [];

      const usersResult = await api.get('/users');
      const purchasesResult = await api.get('/purchases');

      const users = usersResult.data?.users || [];
      const purchases = purchasesResult.data?.purchases || [];

      // Add user registrations
      users.slice(0, 5).forEach((user: any) => {
        activities.push({
          id: `user_${user._id}`,
          type: 'user_registration',
          title: 'New User Registration',
          description: `${user.displayName || user.email} joined the platform`,
          userId: user._id,
          userName: user.displayName || user.email,
          timestamp: user.createdAt,
          metadata: { email: user.email }
        });
      });

      // Add purchases
      purchases.slice(0, 5).forEach((purchase: any) => {
        activities.push({
          id: `purchase_${purchase._id}`,
          type: 'purchase',
          title: 'New Purchase',
          description: `${purchase.userEmail} purchased ${purchase.productName}`,
          userId: purchase.userId,
          userName: purchase.userEmail,
          timestamp: purchase.purchasedAt,
          metadata: {
            productName: purchase.productName,
            amount: purchase.totalAmount,
            currency: purchase.currency
          }
        });
      });

      // Sort by timestamp and limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  },

  // Get system health
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Check backend health endpoint
      const healthResult = await api.get('/../health'); // /health is not under /api

      return {
        databaseStatus: 'healthy',
        apiStatus: 'healthy',
        storageStatus: 'healthy',
        lastChecked: new Date(),
        uptime: healthResult.data?.uptime || 0
      };
    } catch (error) {
      console.error('Error checking system health:', error);
      return {
        databaseStatus: 'error',
        apiStatus: 'error',
        storageStatus: 'error',
        lastChecked: new Date(),
        uptime: 0
      };
    }
  },

  // Get user dashboard data
  async getUserDashboardData(userId: string, currentUser?: any): Promise<UserDashboardData> {
    try {
      // Use current user data if provided, otherwise create a basic user object
      const user = currentUser || {
        _id: userId,
        email: 'user@example.com',
        displayName: 'User',
        role: 'user',
        createdAt: new Date()
      };


      // Get progress data (may be null if not started)
      let progress = null;
      try {
        progress = await progressService.getUserProgress(userId);
      } catch (error) {
        console.log('No progress data found for user:', userId);
      }

      // Get purchases data
      let totalSpent = 0;
      try {
        const purchasesResult = await api.get(`/purchases/user/${userId}`);
        const purchases = purchasesResult.data?.purchases || [];
        totalSpent = purchases.reduce((sum: number, purchase: any) => {
          return sum + (purchase.paymentStatus === 'paid' ? purchase.totalAmount : 0);
        }, 0);
      } catch (error) {
        console.log('No purchases data found for user:', userId);
      }

      // Get user projects for real stats
      let userProjects = [];
      let totalProjects = 0;
      let activeProjects = 0;
      let completedProjects = 0;
      let avgProgress = 0;
      
      try {
        const projectsResult = await api.get(`/project-workflow/user/${userId}`);
        userProjects = projectsResult.data?.projects || [];
        totalProjects = userProjects.length;
        activeProjects = userProjects.filter(p => p.status === 'active').length;
        completedProjects = userProjects.filter(p => p.status === 'completed').length;
        avgProgress = userProjects.length > 0 
          ? Math.round(userProjects.reduce((sum, p) => sum + (p.progress?.overall || 0), 0) / userProjects.length)
          : 0;
        
        console.log('Dashboard Service - Fetched projects:', {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          avgProgress: avgProgress
        });
      } catch (error) {
        console.log('No projects data found for user:', userId, error);
      }

      // Get recent activity
      let recentActivity: ActivityItem[] = [];
      try {
        recentActivity = await this.getRecentActivity(5);
      } catch (error) {
        console.log('No recent activity found');
      }

      return {
        user: {
          id: user._id || user.uid,
          email: user.email,
          displayName: user.displayName || user.name,
          role: user.role || 'user',
          createdAt: user.createdAt || new Date()
        },
        progress,
        allProjects: userProjects, // Add the missing allProjects field
        stats: [
          {
            title: "Total Projects",
            value: totalProjects,
            icon: "Rocket",
            change: "+0%",
            trend: "neutral"
          },
          {
            title: "Active Projects",
            value: activeProjects,
            icon: "Target",
            change: "+0%",
            trend: "neutral"
          },
          {
            title: "Completed",
            value: completedProjects,
            icon: "CheckCircle",
            change: "+0%",
            trend: "neutral"
          },
          {
            title: "Avg Progress",
            value: avgProgress,
            icon: "TrendingUp",
            change: "+0%",
            trend: "up"
          }
        ],
        recentActivity: recentActivity.filter(activity => activity.userId === userId)
      };
    } catch (error) {
      console.error('Error fetching user dashboard data:', error);
      throw error;
    }
  }
};