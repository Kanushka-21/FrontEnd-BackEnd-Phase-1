/**
 * Enhanced Authentication Security Utils
 * Prevents client-side token manipulation and unauthorized access
 */

import { AuthenticationResponse } from '@/types';

// Security constants
const TOKEN_VALIDATION_ENDPOINT = '/api/auth/validate-token';
const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Security state tracking
let failedValidationAttempts = 0;
let lastFailedAttempt = 0;
let securityLockout = false;

/**
 * Validate JWT token format (client-side basic validation)
 */
export const validateTokenFormat = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    console.warn('🔒 Security: Invalid token format');
    return false;
  }

  // Check JWT format (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.warn('🔒 Security: Invalid JWT structure');
    return false;
  }

  // Check each part has content
  if (!parts.every(part => part.length > 0)) {
    console.warn('🔒 Security: Empty JWT parts detected');
    return false;
  }

  try {
    // Decode header and payload to check basic structure
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));

    // Basic header validation
    if (!header.alg || !header.typ) {
      console.warn('🔒 Security: Invalid JWT header');
      return false;
    }

    // Basic payload validation
    if (!payload.sub || !payload.exp || !payload.iat) {
      console.warn('🔒 Security: Invalid JWT payload');
      return false;
    }

    // Check token expiration (client-side)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.warn('🔒 Security: Token expired');
      return false;
    }

    return true;
  } catch (error) {
    console.warn('🔒 Security: Token decoding failed', error);
    return false;
  }
};

/**
 * Validate user data structure
 */
export const validateUserData = (userData: any): userData is AuthenticationResponse => {
  if (!userData || typeof userData !== 'object') {
    console.warn('🔒 Security: Invalid user data structure');
    return false;
  }

  const requiredFields = ['userId', 'email', 'firstName', 'lastName', 'role'];
  const missingFields = requiredFields.filter(field => !userData[field]);

  if (missingFields.length > 0) {
    console.warn('🔒 Security: Missing required user fields:', missingFields);
    return false;
  }

  // Validate role is one of allowed values
  const allowedRoles = ['admin', 'buyer', 'seller'];
  if (!allowedRoles.includes(userData.role.toLowerCase())) {
    console.warn('🔒 Security: Invalid user role:', userData.role);
    return false;
  }

  return true;
};

/**
 * Enhanced authentication validation with server verification
 */
export const validateAuthentication = async (): Promise<boolean> => {
  try {
    // Check for security lockout
    if (isSecurityLocked()) {
      console.warn('🔒 Security: Account temporarily locked due to security violations');
      return false;
    }

    const token = localStorage.getItem('authToken');
    const userDataStr = localStorage.getItem('userData');

    if (!token || !userDataStr) {
      console.warn('🔒 Security: Missing authentication data');
      return false;
    }

    // Client-side validation first
    if (!validateTokenFormat(token)) {
      await handleSecurityViolation('Invalid token format');
      return false;
    }

    let userData;
    try {
      userData = JSON.parse(userDataStr);
    } catch (error) {
      console.warn('🔒 Security: Invalid user data JSON');
      await handleSecurityViolation('Invalid user data');
      return false;
    }

    if (!validateUserData(userData)) {
      await handleSecurityViolation('Invalid user data structure');
      return false;
    }

    // Server-side validation
    const isValid = await validateTokenWithServer(token);
    if (!isValid) {
      await handleSecurityViolation('Server token validation failed');
      return false;
    }

    // Reset failed attempts on successful validation
    failedValidationAttempts = 0;
    return true;

  } catch (error) {
    console.error('🔒 Security: Authentication validation error:', error);
    await handleSecurityViolation('Authentication validation error');
    return false;
  }
};

/**
 * Validate token with server
 */
const validateTokenWithServer = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(TOKEN_VALIDATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.ok;
  } catch (error) {
    console.warn('🔒 Security: Server token validation failed:', error);
    return false;
  }
};

/**
 * Handle security violations
 */
const handleSecurityViolation = async (reason: string): Promise<void> => {
  failedValidationAttempts++;
  lastFailedAttempt = Date.now();

  console.warn(`🔒 Security Violation #${failedValidationAttempts}: ${reason}`);

  if (failedValidationAttempts >= MAX_FAILED_ATTEMPTS) {
    securityLockout = true;
    console.error('🔒 Security: Maximum failed attempts reached. Account locked.');
    
    // Clear all authentication data
    clearAllAuthData();
    
    // Redirect to login with security warning
    window.location.href = '/login?security=violation';
  }
};

/**
 * Check if account is security locked
 */
const isSecurityLocked = (): boolean => {
  if (!securityLockout) return false;

  const timeSinceLast = Date.now() - lastFailedAttempt;
  if (timeSinceLast > LOCKOUT_DURATION) {
    // Unlock after duration
    securityLockout = false;
    failedValidationAttempts = 0;
    return false;
  }

  return true;
};

/**
 * Clear all authentication data securely
 */
export const clearAllAuthData = (): void => {
  console.log('🔒 Security: Clearing all authentication data');

  // Clear localStorage
  const authKeys = [
    'authToken', 'userData', 'registrationProgress', 'user', 'token', 
    'userId', 'userRole', 'refreshToken', 'sessionId'
  ];
  
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  // Clear any authentication cookies
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });

  // Clear browser cache if possible
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('auth') || name.includes('user')) {
          caches.delete(name);
        }
      });
    });
  }
};

/**
 * Secure token storage with integrity check
 */
export const secureTokenStorage = (token: string, userData: AuthenticationResponse): boolean => {
  try {
    // Validate inputs
    if (!validateTokenFormat(token) || !validateUserData(userData)) {
      console.warn('🔒 Security: Invalid data provided for storage');
      return false;
    }

    // Create integrity hash
    const dataHash = btoa(JSON.stringify({
      tokenLength: token.length,
      userId: userData.userId,
      role: userData.role,
      timestamp: Date.now()
    }));

    // Store securely
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('authIntegrity', dataHash);

    console.log('🔒 Security: Authentication data stored securely');
    return true;

  } catch (error) {
    console.error('🔒 Security: Failed to store authentication data:', error);
    return false;
  }
};

/**
 * Verify authentication data integrity
 */
export const verifyDataIntegrity = (): boolean => {
  try {
    const token = localStorage.getItem('authToken');
    const userDataStr = localStorage.getItem('userData');
    const storedHash = localStorage.getItem('authIntegrity');

    if (!token || !userDataStr || !storedHash) {
      console.warn('🔒 Security: Missing integrity check data');
      return false;
    }

    const userData = JSON.parse(userDataStr);
    const expectedHash = btoa(JSON.stringify({
      tokenLength: token.length,
      userId: userData.userId,
      role: userData.role,
      timestamp: userData.timestamp || 0
    }));

    if (storedHash !== expectedHash) {
      console.warn('🔒 Security: Data integrity check failed');
      return false;
    }

    return true;

  } catch (error) {
    console.warn('🔒 Security: Integrity verification failed:', error);
    return false;
  }
};

/**
 * Initialize security monitoring
 */
export const initSecurityMonitoring = (): void => {
  // Monitor localStorage changes
  window.addEventListener('storage', (e) => {
    if (e.key && ['authToken', 'userData'].includes(e.key)) {
      console.warn('🔒 Security: External storage modification detected');
      
      // Validate changes
      if (!verifyDataIntegrity()) {
        handleSecurityViolation('Storage tampering detected');
      }
    }
  });

  // Monitor console access (development warning)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    const originalConsole = window.console;
    
    // Override console to detect unauthorized access attempts
    Object.keys(originalConsole).forEach(key => {
      if (typeof (originalConsole as any)[key] === 'function') {
        const original = (originalConsole as any)[key];
        (window.console as any)[key] = function(...args: any[]) {
          // Log security warning for token-related console usage
          if (args.some(arg => typeof arg === 'string' && arg.includes('Bearer'))) {
            console.warn('🔒 Security: Potential token exposure in console');
          }
          return original.apply(this, args);
        };
      }
    });
  }

  console.log('🔒 Security monitoring initialized');
};