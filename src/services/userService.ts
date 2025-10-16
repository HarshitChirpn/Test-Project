import { api } from '@/lib/api';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  linkedin?: string;
  website?: string;
  role?: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
  // Notification preferences
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  projectUpdates?: boolean;
  securityAlerts?: boolean;
  // Appearance preferences
  darkMode?: boolean;
}

export const userService = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const result = await api.get(`/users/${userId}`);

      if (result.success && result.data?.user) {
        const user = result.data.user;
        return {
          uid: user._id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          bio: user.bio,
          role: user.role || 'user',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          // Notification preferences with defaults
          emailNotifications: user.emailNotifications !== undefined ? user.emailNotifications : true,
          marketingEmails: user.marketingEmails || false,
          projectUpdates: user.projectUpdates !== undefined ? user.projectUpdates : true,
          securityAlerts: user.securityAlerts !== undefined ? user.securityAlerts : true,
          // Appearance preferences
          darkMode: user.darkMode || false
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },


  // Update user profile information
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: any }> {
    try {
      const updateData = { ...updates };

      // Remove uid and email from updates as they shouldn't be changed
      delete updateData.uid;
      delete updateData.createdAt; // Don't update creation date

      // Use the user's own profile endpoint instead of admin endpoint
      const result = await api.put(`/auth/profile`, updateData);

      return { success: result.success };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error };
    }
  },


  // Create an account deletion request
  async createAccountDeletionRequest(userId: string, requestData: any): Promise<{ success: boolean; error?: any }> {
    try {
      const result = await api.post('/contact/submissions', {
        name: requestData.name || 'User',
        email: requestData.email || '',
        subject: 'Account Deletion Request',
        message: requestData.reason || 'User requested account deletion',
        type: 'general',
        priority: 'high',
        status: 'new',
        userId: userId,
        source: 'dashboard'
      });

      return { success: result.success };
    } catch (error) {
      console.error('Error creating account deletion request:', error);
      return { success: false, error };
    }
  }
};
