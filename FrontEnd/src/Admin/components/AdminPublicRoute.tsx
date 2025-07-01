import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AdminPublicRouteProps {
  children: React.ReactNode;
}

const AdminPublicRoute: React.FC<AdminPublicRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  console.log('🔍 AdminPublicRoute: Checking authentication state...');
  console.log('🔍 Loading:', loading);
  console.log('🔍 Authenticated:', isAuthenticated);
  console.log('🔍 User role:', user?.role);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  // If user is already authenticated
  if (isAuthenticated && user) {
    const userRole = user.role?.toLowerCase();
    console.log('✅ User is authenticated with role:', userRole);
    
    // If admin, redirect to admin dashboard
    if (userRole === 'admin') {
      console.log('👑 Redirecting admin to dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // If not admin but authenticated, redirect to their appropriate dashboard
    if (userRole === 'seller') {
      console.log('🏪 Redirecting seller to dashboard');
      return <Navigate to="/seller/dashboard" replace />;
    } else {
      console.log('🛒 Redirecting buyer to dashboard');
      return <Navigate to="/buyer/dashboard" replace />;
    }
  }

  // If not authenticated, show the admin login page
  console.log('ℹ️ User not authenticated, showing admin login');
  return <>{children}</>;
};

export default AdminPublicRoute;