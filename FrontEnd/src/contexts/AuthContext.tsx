import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, apiUtils } from '@/services/api';
import { LoginRequest, AuthenticationResponse } from '@/types';
import { toast } from 'react-hot-toast';

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthenticationResponse | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => false,
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

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
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
        
        setUser(userData);
        setIsAuthenticated(true);
        
        toast.success('Login successful!');
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

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('registrationProgress');
    
    setUser(null);
    setIsAuthenticated(false);
    
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
