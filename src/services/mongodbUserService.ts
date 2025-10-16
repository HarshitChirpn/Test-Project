import { getMongoDBService, User } from '@/lib/mongodb';

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

export const mongodbUserService = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const mongoService = await getMongoDBService();
      const user = await mongoService.getUserById(userId);
      
      if (user) {
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          bio: user.bio,
          linkedin: user.linkedin,
          website: user.website,
          role: user.role,
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
      const mongoService = await getMongoDBService();
      
      // Remove uid and email from updates as they shouldn't be changed
      const { uid, email, createdAt, ...updateData } = updates;
      
      await mongoService.updateUser(userId, {
        ...updateData,
        updatedAt: new Date()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error };
    }
  },


  // Create an account deletion request
  async createAccountDeletionRequest(userId: string, requestData: any): Promise<{ success: boolean; error?: any }> {
    try {
      const mongoService = await getMongoDBService();
      const collections = await mongoService.getCollections();
      
      await collections.accountDeletionRequests.insertOne({
        _id: userId,
        ...requestData,
        status: 'pending',
        createdAt: new Date(),
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error creating account deletion request:', error);
      return { success: false, error };
    }
  },

  // Admin functions
  async getAllUsers(): Promise<User[]> {
    try {
      const mongoService = await getMongoDBService();
      return await mongoService.getAllUsers();
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  },

  async getUsersByRole(role: 'admin' | 'user'): Promise<User[]> {
    try {
      const mongoService = await getMongoDBService();
      return await mongoService.getUsersByRole(role);
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  },

  async createUser(userData: Omit<User, '_id'>): Promise<{ success: boolean; user?: User; error?: any }> {
    try {
      const mongoService = await getMongoDBService();
      const user = await mongoService.createUser(userData);
      
      return { success: true, user };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error };
    }
  },

  async updateUserRole(userId: string, role: 'admin' | 'user'): Promise<{ success: boolean; error?: any }> {
    try {
      const mongoService = await getMongoDBService();
      await mongoService.updateUser(userId, { role });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user role:', error);
      return { success: false, error };
    }
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; error?: any }> {
    try {
      const mongoService = await getMongoDBService();
      await mongoService.updateUser(userId, { isActive });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error };
    }
  },

  async deleteUser(userId: string): Promise<{ success: boolean; error?: any }> {
    try {
      const mongoService = await getMongoDBService();
      const collections = await mongoService.getCollections();
      
      // Delete user from users collection
      await collections.users.deleteOne({ uid: userId });
      
      // Delete related data
      await collections.userProgress.deleteOne({ userId });
      await collections.serviceConsumption.deleteMany({ userId });
      await collections.purchases.updateMany({ userId }, { $unset: { userId: 1 } });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error };
    }
  }
};

