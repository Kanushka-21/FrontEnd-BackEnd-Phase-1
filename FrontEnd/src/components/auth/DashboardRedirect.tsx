import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DashboardRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user?.role) {
    // Default to buyer dashboard if no role is found
    return <Navigate to="/buyer/dashboard" replace />;
  }

  const userRole = user.role.toLowerCase();
  
  switch (userRole) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'seller':
      return <Navigate to="/seller/dashboard" replace />;
    case 'buyer':
    default:
      return <Navigate to="/buyer/dashboard" replace />;
  }
};

export default DashboardRedirect;
