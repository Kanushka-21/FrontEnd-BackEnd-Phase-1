import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BuyerUserManual from './BuyerUserManual';
import SellerUserManual from './SellerUserManual';
import AdminUserManual from './AdminUserManual';
import { 
  BookOpen, User, Shield, Package
} from 'lucide-react';

interface UserManualProps {
  onNavigateToSection?: (section: string) => void;
  onBack?: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ onNavigateToSection }) => {
  const { user } = useAuth();

  // If no user is logged in, show login message
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-gray-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Manual</h1>
          <p className="text-lg text-gray-600">
            Please log in to access your role-specific user manual.
          </p>
        </div>
      </div>
    );
  }

  // Get user role and render appropriate manual
  const userRole = user.role.toLowerCase();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header showing current user's manual */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3">
          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
            userRole === 'buyer' ? 'bg-blue-50' :
            userRole === 'seller' ? 'bg-purple-50' :
            'bg-green-50'
          }`}>
            {userRole === 'buyer' && <Package className="w-5 h-5 text-blue-600" />}
            {userRole === 'seller' && <User className="w-5 h-5 text-purple-600" />}
            {userRole === 'admin' && <Shield className="w-5 h-5 text-green-600" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} User Manual
            </h1>
            <p className="text-sm text-gray-600">
              Comprehensive guide for {userRole} users
            </p>
          </div>
        </div>
      </div>

      {/* Render the specific manual based on user role */}
      {userRole === 'buyer' && <BuyerUserManual onNavigate={onNavigateToSection} />}
      {userRole === 'seller' && <SellerUserManual onNavigate={onNavigateToSection} />}
      {userRole === 'admin' && <AdminUserManual onNavigate={onNavigateToSection} />}
    </div>
  );
};

export default UserManual;