import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface AdminLogoutButtonProps {
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

const AdminLogoutButton: React.FC<AdminLogoutButtonProps> = ({ 
  className = "", 
  showIcon = true, 
  children 
}) => {
  const { logout, user } = useAuth();

  const handleAdminLogout = () => {
    console.log('👑 Admin logout button clicked');
    console.log('🔍 Current user role:', user?.role);
    logout(); // The logout function will handle admin-specific redirect
  };

  return (
    <button
      onClick={handleAdminLogout}
      className={`flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors ${className}`}
      title="Logout from Admin Panel"
    >
      {showIcon && <LogOut className="w-4 h-4" />}
      <span>{children || 'Logout'}</span>
    </button>
  );
};

export default AdminLogoutButton;