import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, apiUtils } from '@/services/api';
import { LoginRequest, AuthenticationResponse } from '@/types';
import { AdminLoginRequest } from '@/Admin/types/AdminTypes';
import { toast } from 'react-hot-toast';
import { Alert, Modal } from 'antd';
import { 
  clearAllAuthData, 
  initSecurityMonitoring 
} from '@/utils/authSecurity';

// SECURITY: Helper functions for authentication validation
const isValidAuthToken = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  // Basic JWT format validation (3 parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

const isValidUserData = (userData: any): boolean => {
  if (!userData || typeof userData !== 'object') return false;
  // Validate required user data structure
  const requiredFields = ['userId', 'email', 'role'];
  return requiredFields.every(field => userData[field]);
};

const clearSecureStorage = (): void => {
  // Clear all authentication-related storage
  const authKeys = ['authToken', 'userData', 'registrationProgress', 'user', 'token', 'userId', 'userRole'];
  authKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // Clear any cookies if they exist
  document.cookie.split(";").forEach(function(c) { 
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
  });
};

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticationResponse | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  adminLogin: (credentials: AdminLoginRequest) => Promise<boolean>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => false,
  adminLogin: async () => false,
  logout: () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<AuthenticationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  // Check if user is authenticated on mount with enhanced security
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 AuthContext: Initializing secure authentication...');
      
      // Initialize security monitoring
      initSecurityMonitoring();
      
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userData');
      
      // Authentication data checked securely
      
      if (token && storedUser) {
        try {
          // Basic client-side validation only (server validation disabled to prevent auto-logout)
          const userData = JSON.parse(storedUser);
          const isValidToken = token.length > 20; // Basic token format check
          const hasRequiredFields = userData && userData.userId && userData.email;
          
          if (!isValidToken || !hasRequiredFields) {
            console.warn('⚠️ Basic validation failed, clearing data');
            clearAllAuthData();
            setLoading(false);
            return;
          }
          
          // Additional client-side validation
          if (!isValidAuthToken(token) || !isValidUserData(userData)) {
            console.warn('⚠️ Client-side validation failed, clearing storage');
            clearAllAuthData();
            setLoading(false);
            return;
          }
          
          // Add token back to userData for complete AuthenticationResponse
          const completeUserData = { ...userData, token };
          setUser(completeUserData);
          setIsAuthenticated(true);
          
          console.log('✅ Authentication restored successfully');
        } catch (error) {
          console.error('❌ Error during secure authentication check:', error);
          clearAllAuthData();
        }
      } else {
        console.log('ℹ️ Authentication initialization complete');
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        const { token, ...userData } = response.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Keep complete response data including token
        setUser(response.data);
        setIsAuthenticated(true);
        
        // Show login success message first
        toast.success('Login successful!');
        
        // Role-based routing
        const userRole = response.data.role?.toLowerCase() || 'buyer';

        console.log('🔄 Redirecting user to dashboard');
        
        if (userRole === 'admin') {
          console.log('👑 Redirecting to admin dashboard');
          navigate('/admin/dashboard');
        } else if (userRole === 'seller') {
          console.log('🏪 Redirecting to seller dashboard');
          navigate('/seller/dashboard');
        } else {
          console.log('🛒 Redirecting to buyer dashboard');
          navigate('/buyer/dashboard');
        }

        // Check for verification status - Handle REJECTED users (after navigation)
        if (response.data.verificationStatus === 'REJECTED') {
          // Delay the modal to appear after navigation and success message
          setTimeout(() => {
            Modal.error({
              title: '❌ Account Verification Required',
              content: (
                <div style={{ padding: '16px 0' }}>
                  <Alert
                    message="You are unverified"
                    description={
                      <div>
                        <p style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.6' }}>
                          <strong>Verification Status:</strong> Your account verification has been rejected or is incomplete.
                        </p>
                        <p style={{ marginBottom: '12px', fontSize: '14px', color: '#dc2626', lineHeight: '1.6' }}>
                          🚫 <strong>Marketplace Restrictions:</strong> As an unverified user, you cannot bid on marketplace items or access full platform features.
                        </p>
                        <p style={{ marginBottom: '12px', fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
                          � <strong>Next Steps:</strong> Please contact our admin team for account approval and verification assistance.
                        </p>
                        <div style={{ 
                          backgroundColor: '#f3f4f6', 
                          padding: '12px', 
                          borderRadius: '6px', 
                          border: '1px solid #d1d5db',
                          marginTop: '16px'
                        }}>
                          <p style={{ margin: '0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                            📧 <strong>Contact Admin:</strong> 
                            <a 
                              href="mailto:gemnetsystem@gmail.com" 
                              style={{ 
                                color: '#2563eb', 
                                textDecoration: 'none',
                                marginLeft: '8px'
                              }}
                              onMouseOver={(e) => (e.target as HTMLElement).style.textDecoration = 'underline'}
                              onMouseOut={(e) => (e.target as HTMLElement).style.textDecoration = 'none'}
                            >
                              gemnetsystem@gmail.com
                            </a>
                          </p>
                        </div>
                      </div>
                    }
                    type="error"
                    showIcon
                    style={{ marginTop: '8px' }}
                  />
                </div>
              ),
              okText: 'I Understand',
              width: 550,
              centered: true,
              maskClosable: false,
              onOk: () => {
                console.log('Unverified user acknowledged verification requirement');
              }
            });
          }, 1000); // Show modal 1 second after login success
        }
        
        // Check for account warnings and blocks
        if (response.data.accountStatus === 'WARNED' && response.data.warningMessage) {
          Modal.warning({
            title: '⚠️ Account Warning',
            content: (
              <div style={{ padding: '16px 0' }}>
                <Alert
                  message="Your Account Has Been Flagged"
                  description={
                    <div>
                      <p style={{ marginBottom: '12px', fontSize: '14px' }}>
                        <strong>Reason:</strong> {response.data.warningMessage}
                      </p>
                      <p style={{ marginBottom: '8px', fontSize: '13px', color: '#d97706' }}>
                        ⚡ <strong>Action Required:</strong> Please review our community guidelines and improve your attendance.
                      </p>
                      <p style={{ marginBottom: '0', fontSize: '13px', color: '#374151' }}>
                        � <strong>Next Steps:</strong> Attend scheduled meetings to maintain good standing and avoid account restrictions.
                      </p>
                    </div>
                  }
                  type="warning"
                  showIcon
                  style={{ marginTop: '8px' }}
                />
              </div>
            ),
            okText: 'I Understand',
            width: 500,
            centered: true,
            maskClosable: false,
            onOk: () => {
              console.log('User acknowledged account warning');
            }
          });
        }
        
        if (response.data.accountStatus === 'BLOCKED') {
          Modal.error({
            title: '🚫 Account Access Restricted',
            content: (
              <div style={{ padding: '16px 0' }}>
                <Alert
                  message="Your Account Has Been Temporarily Blocked"
                  description={
                    <div>
                      <p style={{ marginBottom: '12px', fontSize: '14px' }}>
                        <strong>Status:</strong> Your account access has been suspended due to multiple missed meetings or policy violations.
                      </p>
                      <p style={{ marginBottom: '8px', fontSize: '13px', color: '#dc2626' }}>
                        🔒 <strong>Impact:</strong> You cannot book new meetings or access platform features until resolved.
                      </p>
                      <p style={{ marginBottom: '0', fontSize: '13px', color: '#374151' }}>
                        📞 <strong>Support:</strong> Contact our support team to discuss account restoration options.
                      </p>
                    </div>
                  }
                  type="error"
                  showIcon
                  style={{ marginTop: '8px' }}
                />
              </div>
            ),
            okText: 'Contact Support',
            width: 500,
            centered: true,
            maskClosable: false,
            onOk: () => {
              // Could redirect to support page or show contact info
              console.log('User needs to contact support for blocked account');
            }
          });
        }
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      const errorMessage = apiUtils.formatErrorMessage(error);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Admin login function
  const adminLogin = async (credentials: AdminLoginRequest): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔑 Admin login attempt initiated');
      const response = await authAPI.adminLogin(credentials);
      
      if (response.success && response.data) {
        console.log('✅ Admin login successful');
        
        // Securely store admin token and data
        const adminData = {
          userId: response.data.userId,
          username: response.data.username,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
          department: response.data.department,
          employeeId: response.data.employeeId,
          accessLevel: response.data.accessLevel,
          isActive: response.data.isActive
        };
        
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(adminData));
        
        // Convert admin response to AuthenticationResponse format for compatibility
        const adminUserData: AuthenticationResponse = {
          token: response.data.token,
          userId: response.data.userId,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          isVerified: true, // Admins are always verified
          verificationStatus: 'VERIFIED',
          role: response.data.role as 'admin' // Type assertion for admin role
        };
        
        // Update auth context state
        setUser(adminUserData);
        setIsAuthenticated(true);
        
        toast.success('Admin login successful!');
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
        return true;
      } else {
        console.error('❌ Admin login failed:', response.message);
        toast.error(response.message || 'Admin login failed');
        return false;
      }
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      toast.error(error.response?.data?.message || 'Admin login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Check user role before clearing data
    const isAdminUser = user?.role?.toLowerCase() === 'admin';
    const currentPath = location.pathname;
    
    console.log('🚪 Logout initiated...');
    console.log('🔍 Current path:', currentPath);
    console.log('🔍 Is admin user:', isAdminUser);
    
    // SECURITY: Clear all sensitive browser data
    clearSecureStorage();
    
    // Securely clear all authentication data
    clearAllAuthData();
    
    // Clear context state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect based on user role and current location
    if (isAdminUser || currentPath.startsWith('/admin')) {
      console.log('👑 Redirecting admin to regular login');
      navigate('/login');
      toast.success('Admin logged out successfully');
    } else {
      console.log('👤 Redirecting regular user to login');
      navigate('/login');
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        adminLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
