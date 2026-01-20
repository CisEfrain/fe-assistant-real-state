import { TokenValidationResponse, CookieConfig } from '../types';
import { env } from '../env';

// Environment variables (to be configured)
const OAUTH_BACKEND_URL = env.OAUTH_BACKEND_URL;

/**
 * Validates JWT token against OAuth backend
 */
export async function validateToken(token: string): Promise<TokenValidationResponse> {
  try {
    const response = await fetch(`${OAUTH_BACKEND_URL}/refresh_token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any additional headers required by OAuth backend
      },
      body: JSON.stringify({
        token,
        fingerprint: null // Currently null as specified in requirements
      })
    });

    if (!response.ok) {
      throw new Error(`Token validation failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if user has required contract features
    const contractFeatures = data.contractFeatures || [];
    /* const hasRequiredFeature = contractFeatures.includes('SHOW_REWARDS_MENU_ITEM');
    
    if (!hasRequiredFeature) {
      return {
        valid: false,
        user_id: data.user_id || '',
        contractFeatures,
        error: 'CONTRACT_FEATURES'
      };
    }  */
    
    return {
      valid: data.valid || true,
      contractFeatures,
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return {
      valid: false,
      contractFeatures: [],
      error: 'DEFAULT'
    };
  }
}

/**
 * Cookie configuration for different environments
 */
export function getCookieConfig(): CookieConfig {
  const envValue = import.meta.env.VITE_NODE_ENV;
  const isProduction = envValue === 'production';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : undefined;

  return {
    secure: isProduction,
    sameSite: 'lax',
    domain: isProduction
      ? '.iadmexico.mx'
      : hostname && hostname.includes('.')
        ? hostname
        : undefined,
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  };
}

/**
 * Creates secure cookie string
 */
export function createSecureCookie(name: string, value: string, httpOnly: boolean = false): string {
  const config = getCookieConfig();
  const httpOnlyFlag = httpOnly ? '; HttpOnly' : '';
  
  return `${name}=${value}; Max-Age=${config.maxAge}; Path=${config.path}; Domain=${config.domain}; SameSite=${config.sameSite}${config.secure ? '; Secure' : ''}${httpOnlyFlag}`;
}

/**
 * Creates cookie deletion string
 */
export function deleteCookie(name: string): string {
  const config = getCookieConfig();
  return `${name}=; Max-Age=-1; Path=${config.path}; Domain=${config.domain}`;
}

/**
 * Extracts JWT from query parameters
 */
export function extractJWTFromQuery(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('jwt');
  } catch {
    return null;
  }
}

/**
 * Removes JWT from URL
 */
export function removeJWTFromURL(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete('jwt');
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Extracts cookie value from cookie string
 */
export function extractCookieValue(cookieString: string, cookieName: string): string | null {
  if (!cookieString) return null;
  
  const cookies = cookieString.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return value || null;
    }
  }
  return null;
}
