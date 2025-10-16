// Authentication service using backend API
import { api } from './api';

export interface User {
  _id: string;
  email: string;
  name?: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  // Firebase-migrated user properties (optional)
  providerData?: Array<{
    providerId: string;
    photoURL?: string;
  }>;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface AuthUser extends User {
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
}

// Register new user
export const registerUser = async (data: RegisterData): Promise<AuthUser> => {
  try {
    // Map displayName to name for backend compatibility
    const requestData = {
      email: data.email,
      password: data.password,
      name: data.displayName || data.email.split('@')[0]
    };

    const result = await api.post('/auth/register', requestData);

    if (result.success && result.data) {
      const user = result.data.user;

      // Store both tokens
      if (result.data.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }

      return {
        ...user,
        displayName: user.name, // Map name to displayName for compatibility
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        token: result.data.accessToken
      };
    }

    throw new Error('Registration failed');
  } catch (error: any) {
    throw new Error(error.message || 'Failed to register user');
  }
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<AuthUser> => {
  try {
    const result = await api.post('/auth/login', credentials);

    if (result.success && result.data) {
      const user = result.data.user;

      // Store both tokens
      if (result.data.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }

      return {
        ...user,
        displayName: user.name, // Map name to displayName for compatibility
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
        token: result.data.accessToken
      };
    }

    throw new Error('Login failed');
  } catch (error: any) {
    throw new Error(error.message || 'Failed to login');
  }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken');

    if (token) {
      // Call backend logout to invalidate refresh token
      await api.post('/auth/logout', {});
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear tokens from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const result = await api.get(`/users/${userId}`);

    if (result.success && result.data) {
      const user = result.data.user;
      return {
        ...user,
        displayName: user.name, // Map name to displayName for compatibility
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  try {
    const result = await api.put(`/users/${userId}`, updates);

    if (result.success && result.data) {
      const user = result.data.user;
      return {
        ...user,
        displayName: user.name, // Map name to displayName for compatibility
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      };
    }

    throw new Error('Failed to update user profile');
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update user');
  }
};

// Check if user is admin
export const isAdmin = async (userId: string): Promise<boolean> => {
  const user = await getUserById(userId);
  return user?.role === 'admin';
};

// Get current user from token
export const getCurrentUser = async (token: string): Promise<User | null> => {
  try {
    // Make API call with token directly in headers
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const url = `${API_BASE_URL}/api/auth/profile`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success && data.data) {
      const user = data.data.user;
      return {
        ...user,
        displayName: user.name, // Map name to displayName for compatibility
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
