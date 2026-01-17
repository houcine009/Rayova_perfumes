import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, type User, type Profile } from '@/services/authService';
import { api } from '@/lib/api';

type AppRole = 'super_admin' | 'admin' | 'user';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: AppRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
      setProfile(response.profile);
      setRole(response.role as AppRole);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Clear auth if token is invalid
      authService.clearAuth();
      setUser(null);
      setProfile(null);
      setRole(null);
    }
  };

  const refreshProfile = async () => {
    if (authService.isAuthenticated()) {
      await fetchUserData();
    }
  };

  useEffect(() => {
    // Check for existing token on mount
    if (authService.isAuthenticated()) {
      fetchUserData().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      setProfile(response.user.profile || null);
      setRole(response.role as AppRole);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await authService.register({
        email,
        password,
        password_confirmation: password,
        first_name: firstName,
        last_name: lastName,
      });
      setUser(response.user);
      setProfile(response.user.profile || null);
      setRole('user');
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setProfile(null);
      setRole(null);
    }
  };

  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isSuperAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
