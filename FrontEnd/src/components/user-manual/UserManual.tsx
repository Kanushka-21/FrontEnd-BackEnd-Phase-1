import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BuyerUserManual from './BuyerUserManual';
import SellerUserManual from './SellerUserManual';
import AdminUserManual from './AdminUserManual';
import { 
  BookOpen, ArrowLeft, User, Shield, Package
} from 'lucide-react';

interface UserManualProps {
  onNavigateToSection?: (section: string) => void;
  onBack?: () => void;
}

const UserManual: React.FC<UserManualProps> = ({ onNavigateToSection }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'main' | 'buyer' | 'seller' | 'admin'>('main');

  // Automatically set the current view based on user role when component mounts
  useEffect(() => {
    if (user?.role) {
      const roleToView = {
        'buyer': 'buyer',
        'seller': 'seller', 
        'admin': 'admin'
      } as const;
      
      const userRole = user.role.toLowerCase();
      if (userRole in roleToView) {
        setCurrentView(roleToView[userRole as keyof typeof roleToView]);
      }
    }
  }, [user]);

  // If we have a specific manual view, render it directly
  if (currentView !== 'main') {
    return (
      <div className="max-w-6xl mx-auto">
        {/* Header with back to selection option */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                currentView === 'buyer' ? 'bg-blue-50' :
                currentView === 'seller' ? 'bg-purple-50' :
                'bg-green-50'
              }`}>
                <BookOpen className={`w-5 h-5 ${
                  currentView === 'buyer' ? 'text-blue-600' :
                  currentView === 'seller' ? 'text-purple-600' :
                  'text-green-600'
                }`} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {currentView.charAt(0).toUpperCase() + currentView.slice(1)} User Manual
                </h1>
                <p className="text-sm text-gray-600">
                  Comprehensive guide for {currentView} users
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentView('main')}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>View All Manuals</span>
            </button>
          </div>
        </div>

        {/* Render the specific manual */}
        {currentView === 'buyer' && <BuyerUserManual onNavigate={onNavigateToSection} />}
        {currentView === 'seller' && <SellerUserManual onNavigate={onNavigateToSection} />}
        {currentView === 'admin' && <AdminUserManual onNavigate={onNavigateToSection} />}
      </div>
    );
  }

  // Main selection screen
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <BookOpen className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GemNet User Manual</h1>
        <p className="text-lg text-gray-600">
          Comprehensive guides for using the GemNet platform
        </p>
        {user && (
          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
            <User className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Your role: <span className="font-semibold capitalize">{user.role}</span>
            </span>
          </div>
        )}
      </div>

      {/* Quick access for current user role */}
      {user?.role && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">Quick Access</h2>
          <div className="max-w-md mx-auto">
            <div className={`p-6 rounded-lg border-2 ${
              user.role.toLowerCase() === 'buyer' ? 'border-blue-200 bg-blue-50' :
              user.role.toLowerCase() === 'seller' ? 'border-purple-200 bg-purple-50' :
              'border-green-200 bg-green-50'
            }`}>
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg mb-4 mx-auto ${
                user.role.toLowerCase() === 'buyer' ? 'bg-blue-100' :
                user.role.toLowerCase() === 'seller' ? 'bg-purple-100' :
                'bg-green-100'
              }`}>
                {user.role.toLowerCase() === 'buyer' && <Package className="w-6 h-6 text-blue-600" />}
                {user.role.toLowerCase() === 'seller' && <User className="w-6 h-6 text-purple-600" />}
                {user.role.toLowerCase() === 'admin' && <Shield className="w-6 h-6 text-green-600" />}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Your {user.role} Manual</h3>
              <p className="text-gray-600 mb-4 text-center">
                Complete guide for your current role on the platform.
              </p>
              <div className="text-center">
                <button 
                  onClick={() => setCurrentView(user.role.toLowerCase() as 'buyer' | 'seller' | 'admin')}
                  className={`px-6 py-3 text-white rounded-lg transition-colors font-medium ${
                    user.role.toLowerCase() === 'buyer' ? 'bg-blue-600 hover:bg-blue-700' :
                    user.role.toLowerCase() === 'seller' ? 'bg-purple-600 hover:bg-purple-700' :
                    'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  Open {user.role} Manual
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All available manuals */}
      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">All Available Manuals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border-2 border-blue-200 bg-white">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Buyer Manual</h3>
            <p className="text-gray-600 mb-4">
              Complete guide for browsing, bidding, and purchasing gemstones.
            </p>
            <button 
              onClick={() => setCurrentView('buyer')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Buyer Manual
            </button>
          </div>

          <div className="p-6 rounded-lg border-2 border-purple-200 bg-white">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <User className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Seller Manual</h3>
            <p className="text-gray-600 mb-4">
              Comprehensive guide for listing gemstones and managing sales.
            </p>
            <button 
              onClick={() => setCurrentView('seller')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Seller Manual
            </button>
          </div>

          <div className="p-6 rounded-lg border-2 border-green-200 bg-white">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Manual</h3>
            <p className="text-gray-600 mb-4">
              Complete platform administration and management guide.
            </p>
            <button 
              onClick={() => setCurrentView('admin')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Admin Manual
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManual;