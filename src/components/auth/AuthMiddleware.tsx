import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { extractJWTFromQuery, removeJWTFromURL } from '../../services/auth';

interface AuthMiddlewareProps {
  children: React.ReactNode;
}

export function AuthMiddleware({ children }: AuthMiddlewareProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { login, verifyAuth, setError, setLoading } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Check for JWT in URL query parameters (new session)
        const currentUrl = window.location.href;
        const jwtFromQuery = extractJWTFromQuery(currentUrl);
        
        if (jwtFromQuery) {
          // Process JWT from query params
          const loginSuccess = await login(jwtFromQuery);
          
          if (loginSuccess) {
            // Persist JWT and user in localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('jwt', jwtFromQuery);
              const currentUserId = useAuthStore.getState().user_id || '';
              localStorage.setItem('user_id', currentUserId);
            }
            
            // Clean URL by removing JWT parameter
            const cleanUrl = removeJWTFromURL(currentUrl);
            window.history.replaceState({}, document.title, cleanUrl);
          } else {
            // Redirect to error page if login failed
            redirectToError(useAuthStore.getState().error?.type || 'DEFAULT');
            return;
          }
        } else {
          // Check existing session from cookies
          const authValid = await verifyAuth();
          
          if (!authValid) {
            // No valid session, redirect to error
            redirectToError('DEFAULT');
            return;
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError({ type: 'DEFAULT', message: 'Error durante la inicialización de autenticación' });
        redirectToError('DEFAULT');
        return;
      }
      
      setLoading(false);
      setIsInitialized(true);
    };

    // Skip auth for error page to prevent infinite loops
    if (window.location.pathname === '/error') {
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    // Skip auth for static assets
    const staticPaths = ['/_next/', '/favicon.ico', '/assets/', '/vite.svg'];
    const isStaticPath = staticPaths.some(path => window.location.pathname.startsWith(path));
    
    if (isStaticPath) {
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    // Skip auth for playground
    const publicPaths = ['/playground'];
    const isPublicPath = publicPaths.some(path => window.location.pathname.startsWith(path));

    if (isPublicPath) {
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    initializeAuth();
  }, [login, verifyAuth, setError, setLoading]);

  const redirectToError = (errorType: string) => {
    const errorUrl = `/error?type=${errorType}`;
    window.location.href = errorUrl;
  };

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default AuthMiddleware;
