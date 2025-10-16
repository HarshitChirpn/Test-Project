import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";

export interface UserRole {
  uid: string;
  email: string;
  role: "admin" | "user";
  displayName?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  userType?: string;
}

interface AdminContextType {
  isAdmin: boolean;
  adminLoading: boolean;
  users: UserRole[];
  usersLoading: boolean;
  setUserRole: (uid: string, role: "admin" | "user") => Promise<void>;
  updateUserStatus: (uid: string, isActive: boolean) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  refreshUsers: () => Promise<void>;
  createNewUser: (
    email: string,
    password: string,
    displayName?: string,
    role?: "admin" | "user"
  ) => Promise<{ success: boolean; error?: string }>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<number>(0);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) {
        return;
      }

      if (!user) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        // Check if user has admin role
        const isUserAdmin = user.role === "admin";
        setIsAdmin(isUserAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

  // Load users when admin status is confirmed
  useEffect(() => {
    if (isAdmin && !usersLoading) {
      refreshUsers();
    }
  }, [isAdmin]);

  // Smart polling: Check for changes every 3 seconds, only refresh if data changed
  useEffect(() => {
    if (!isAdmin) return;

    console.log('[AdminContext] Setting up smart polling for change detection');

    const checkForUpdates = async () => {
      try {
        const result = await api.get('/users/last-updated');
        if (result.success && result.data?.timestamp) {
          const serverTimestamp = result.data.timestamp;

          // Only refresh if server data is newer than our local data
          if (serverTimestamp > lastUpdatedTimestamp) {
            console.log('[AdminContext] Changes detected, refreshing users...');
            await refreshUsers();
            setLastUpdatedTimestamp(serverTimestamp);
          }
        }
      } catch (error) {
        console.error('[AdminContext] Error checking for updates:', error);
      }
    };

    // Check for updates every 3 seconds
    const pollInterval = setInterval(checkForUpdates, 3000);

    // Cleanup on unmount
    return () => {
      console.log('[AdminContext] Stopping smart polling');
      clearInterval(pollInterval);
    };
  }, [isAdmin, lastUpdatedTimestamp]);

  const refreshUsers = async () => {
    if (!isAdmin) return;

    setUsersLoading(true);
    try {
      // Request a higher limit to get more users, or all users
      const result = await api.get('/users?limit=100');

      if (result.success && result.data?.users) {
        const userRoles: UserRole[] = result.data.users.map((user: any) => ({
          uid: user._id,
          email: user.email,
          role: user.role,
          displayName: user.displayName || user.name,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          isActive: user.isActive,
          userType: user.userType
        }));

        setUsers(userRoles);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const setUserRole = async (uid: string, role: "admin" | "user") => {
    if (!isAdmin) return;

    // Optimistic update - update UI immediately
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.uid === uid ? { ...user, role } : user
      )
    );

    // Update timestamp to prevent immediate polling override
    setLastUpdatedTimestamp(Date.now());

    try {
      const result = await api.put(`/users/${uid}`, { role });
      // After successful update, get the server timestamp
      if (result.success && result.data?.user?.updatedAt) {
        setLastUpdatedTimestamp(new Date(result.data.user.updatedAt).getTime());
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      // Revert on error
      await refreshUsers();
      throw error;
    }
  };

  const updateUserStatus = async (uid: string, isActive: boolean) => {
    if (!isAdmin) return;

    // Optimistic update - update UI immediately
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.uid === uid ? { ...user, isActive } : user
      )
    );

    // Update timestamp to prevent immediate polling override
    setLastUpdatedTimestamp(Date.now());

    try {
      const result = await api.put(`/users/${uid}`, { isActive });
      // After successful update, get the server timestamp
      if (result.success && result.data?.user?.updatedAt) {
        setLastUpdatedTimestamp(new Date(result.data.user.updatedAt).getTime());
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      // Revert on error
      await refreshUsers();
      throw error;
    }
  };

  const deleteUser = async (uid: string) => {
    if (!isAdmin) return;

    console.log("AdminContext: Deleting user with ID:", uid);

    // Optimistic update - remove from UI immediately
    setUsers((prevUsers) => prevUsers.filter((user) => user.uid !== uid));

    // Update timestamp to prevent immediate polling override
    setLastUpdatedTimestamp(Date.now());

    try {
      const result = await api.delete(`/users/${uid}`);
      console.log("Delete user API response:", result);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete user");
      }
      // Polling will detect the change from other admins
    } catch (error) {
      console.error("Error deleting user:", error);
      // Revert on error
      await refreshUsers();
      throw error;
    }
  };

  const createNewUser = async (
    email: string,
    password: string,
    displayName?: string,
    role: "admin" | "user" = "user"
  ) => {
    if (!isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    try {
      const userData = {
        email,
        password,
        name: displayName || email,
        displayName: displayName || email,
        role
      };
      
      console.log("AdminContext: Creating user with data:", { ...userData, password: "[HIDDEN]" });
      
      const result = await api.post('/auth/register', userData);
      console.log("Create user API response:", result);

      if (result.success) {
        await refreshUsers();
        return { success: true };
      } else {
        return { success: false, error: result.message || "Failed to create user" };
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      return { success: false, error: error.message || "Failed to create user" };
    }
  };

  const value: AdminContextType = {
    isAdmin,
    adminLoading,
    users,
    usersLoading,
    setUserRole,
    updateUserStatus,
    deleteUser,
    refreshUsers,
    createNewUser,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};