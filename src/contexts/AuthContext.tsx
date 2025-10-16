import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthUser, loginUser, registerUser, getCurrentUser, logoutUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: () => Promise<void>;
  isAdmin: boolean;
  // Legacy method names for compatibility
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      getCurrentUser(token)
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Invalid token, remove it
          localStorage.removeItem('token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for logout events from API interceptor
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const authUser = await loginUser({ email, password });

      // Store access token
      localStorage.setItem('token', authUser.token);
      localStorage.setItem('authToken', authUser.token); // Keep both for compatibility

      // Set user (without token)
      const { token, ...userData } = authUser;
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      const authUser = await registerUser({ email, password, displayName });

      // Store access token
      localStorage.setItem('token', authUser.token);
      localStorage.setItem('authToken', authUser.token); // Keep both for compatibility

      // Set user (without token)
      const { token, ...userData } = authUser;
      setUser(userData);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateUser = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    console.log('🔄 updateUser called, token exists:', !!token);
    if (token) {
      try {
        console.log('🔄 Fetching updated user data...');
        const userData = await getCurrentUser(token);
        console.log('✅ Updated user data:', userData);
        setUser(userData);
        console.log('✅ User state updated');
      } catch (error) {
        console.error('❌ Error updating user data:', error);
      }
    }
  };

  // Legacy method names for compatibility with existing components
  const signIn = login;
  const signUp = register;
  const signOut = logout;

  const signInWithGoogle = async () => {
    // Google OAuth is not implemented yet - return error
    return { success: false, error: "Google sign-in is not available yet. Please use email and password." };
  };

  const resetPassword = async (email: string) => {
    // Password reset is not implemented yet - return error
    return { success: false, error: "Password reset is not available yet. Please contact support." };
  };

  const isAdmin = user?.role === 'admin';

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};