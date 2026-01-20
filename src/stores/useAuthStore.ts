import { create } from 'zustand';
import { AuthState, AuthError } from '../types';
import { validateToken, deleteCookie } from '../services/auth';

interface AuthStore extends AuthState {
  // Actions
  login: (jwt: string) => Promise<boolean>;
  logout: () => void;
  verifyAuth: () => Promise<boolean>;
  clearAuth: () => void;
  setError: (error: AuthError | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  jwt: null,
  loading: false,
  error: null,

  // Actions
  login: async (jwt: string): Promise<boolean> => {
    set({ loading: true, error: null });
    
    try {
      const validation = await validateToken(jwt);
      
      if (validation.valid) {
        set({
          isAuthenticated: true,
          jwt,
          loading: false,
          error: null
        });
        return true;
      } else {
        const errorType = validation.error === 'CONTRACT_FEATURES' ? 'CONTRACT_FEATURES' : 'DEFAULT';
        const errorMessage = validation.error === 'CONTRACT_FEATURES' 
          ? 'Usuario sin permisos para acceder a esta funcionalidad'
          : 'Token inválido o expirado';
        
        set({
          isAuthenticated: false,
          jwt: null,
          loading: false,
          error: { type: errorType, message: errorMessage }
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      set({
        isAuthenticated: false,
        jwt: null,
        loading: false,
        error: { type: 'DEFAULT', message: 'Error de conexión durante la autenticación' }
      });
      return false;
    }
  },

  verifyAuth: async (): Promise<boolean> => {
    // Check if we have stored credentials (client-side only)
    if (typeof window === 'undefined') return false;
    
    const jwt = localStorage.getItem('jwt');
    
    if (!jwt) {
      set({ isAuthenticated: false, jwt: null });
      return false;
    }
    
    // Validate the token
    set({ loading: true });
    const validation = await validateToken(jwt);
    
    if (validation.valid) {
      set({
        isAuthenticated: true,
        jwt,
        loading: false,
        error: null
      });
      return true;
    } else {
      // Clear invalid stored credentials
      get().clearAuth();
      return false;
    }
  },

  logout: () => {
    // Clear cookies by setting them to expire
    if (typeof document !== 'undefined') {
      document.cookie = deleteCookie('jwt');
      
      // Clear localStorage
      localStorage.clear();
    }
    
    // Clear store state
    set({
      isAuthenticated: false,
      jwt: null,
      loading: false,
      error: null
    });
  },

  clearAuth: () => {
    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie = deleteCookie('jwt');
    }
    
    // Clear store state
    set({
      isAuthenticated: false,
      user_id: null,
      jwt: null,
      loading: false,
      error: null
    });
  },

  setError: (error: AuthError | null) => set({ error }),
  
  setLoading: (loading: boolean) => set({ loading })
}));
