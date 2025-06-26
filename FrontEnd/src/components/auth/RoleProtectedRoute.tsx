import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.role) {
    console.warn('User role not found, redirecting to buyer dashboard');
    return <Navigate to="/buyer/dashboard" replace />;
  }

  const userRole = user.role.toLowerCase();
  
  if (!allowedRoles.includes(userRole)) {
    console.warn(`Access denied: User role '${userRole}' not in allowed roles:`, allowedRoles);
    
    // Redirect to appropriate dashboard based on user's role
    if (userRole === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === 'seller') {
      return <Navigate to="/seller/dashboard" replace />;
    } else {
      return <Navigate to="/buyer/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
