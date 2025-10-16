import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Cloud Function callable references
const listUsersFunction = httpsCallable(functions, 'listUsers');
const createUserFunction = httpsCallable(functions, 'createUser');
const updateUserRoleFunction = httpsCallable(functions, 'updateUserRole');
const updateUserStatusFunction = httpsCallable(functions, 'updateUserStatus');
const deleteUserFunction = httpsCallable(functions, 'deleteUser');
const syncUsersFunction = httpsCallable(functions, 'syncUsersToFirestore');

export interface CloudFunctionUser {
  uid: string;
  email?: string;
  displayName?: string;
  emailVerified: boolean;
  disabled: boolean;
  customClaims?: Record<string, any>;
  creationTime: string;
  lastSignInTime?: string;
  photoURL?: string;
  providerData: any[];
}

export interface CreateUserData {
  email: string;
  password: string;
  displayName?: string;
  role?: 'admin' | 'user';
}

/**
 * Admin Service for managing users via Firebase Cloud Functions
 */
export class AdminService {
  
  /**
   * List all Firebase Auth users
   */
  static async listUsers(maxResults = 100): Promise<CloudFunctionUser[]> {
    try {
      const result = await listUsersFunction({ maxResults });
      const data = result.data as any;
      
      if (!data.success) {
        throw new Error('Failed to list users');
      }
      
      return data.users;
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  }

  /**
   * Create new Firebase Auth user
   */
  static async createUser(userData: CreateUserData): Promise<any> {
    try {
      const result = await createUserFunction(userData);
      const data = result.data as any;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create user');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user role and custom claims
   */
  static async updateUserRole(uid: string, role: 'admin' | 'user'): Promise<any> {
    try {
      const result = await updateUserRoleFunction({ uid, role });
      const data = result.data as any;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update user role');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Enable or disable Firebase Auth user
   */
  static async updateUserStatus(uid: string, disabled: boolean): Promise<any> {
    try {
      const result = await updateUserStatusFunction({ uid, disabled });
      const data = result.data as any;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to update user status');
      }
      
      return data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Delete Firebase Auth user
   */
  static async deleteUser(uid: string): Promise<any> {
    try {
      const result = await deleteUserFunction({ uid });
      const data = result.data as any;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete user');
      }
      
      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Sync Firebase Auth users to Firestore
   */
  static async syncUsersToFirestore(): Promise<any> {
    try {
      const result = await syncUsersFunction({});
      const data = result.data as any;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to sync users');
      }
      
      return data;
    } catch (error) {
      console.error('Error syncing users:', error);
      throw error;
    }
  }
}