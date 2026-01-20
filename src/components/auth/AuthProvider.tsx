import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { AuthState } from '../../types';

interface AuthContextType extends AuthState {
  logout: () => void;
  verifyAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authStore = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    // Only verify auth if not already authenticated and not loading
    if (!authStore.isAuthenticated && !authStore.loading) {
      authStore.verifyAuth();
    }
  }, [authStore]);

  const contextValue: AuthContextType = {
    isAuthenticated: authStore.isAuthenticated,
    jwt: authStore.jwt,
    loading: authStore.loading,
    error: authStore.error,
    logout: authStore.logout,
    verifyAuth: authStore.verifyAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
