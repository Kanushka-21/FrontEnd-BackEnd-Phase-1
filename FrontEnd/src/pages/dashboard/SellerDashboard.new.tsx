import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  User, Menu, 
  Home, Trophy, Calendar, Gem, Megaphone, MessageCircle
} from 'lucide-react';
import RoleAwareDashboardLayout from '@/components/layout/RoleAwareDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

// Import modular components
import {
  Overview,
  Listings,
  Bids,
  Meetings,
  Profile,
  Advertisements
} from './SellerDashbaordComponents';

import { SidebarItem } from './SellerDashbaordComponents/shared';

// Import feedback page
import FeedbackForm from '../Feedback/FeedbackPage';

const SellerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Check URL parameters on component mount and when location changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section');
    
    console.log('🔧 SellerDashboard URL params:', { section, pathname: location.pathname });
    
    if (section && ['overview', 'listings', 'advertisements', 'bids', 'meetings', 'feedback', 'profile'].includes(section)) {
      console.log('🔧 Setting active tab from URL parameter:', section);
      setActiveTab(section);
    }
  }, [location]);

  // Debug user state for notifications
  console.log('🔧 SellerDashboard - User state:', user);
  console.log('🔧 SellerDashboard - User ID:', user?.userId);
  console.log('🔧 SellerDashboard - User role:', user?.role);

  // Sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: <Home size={24} /> },
    { id: 'listings', label: 'List Items', icon: <Gem size={24} /> },
    { id: 'advertisements', label: 'Advertisements', icon: <Megaphone size={24} /> },
    { id: 'bids', label: 'Bids', icon: <Trophy size={24} /> },
    { id: 'meetings', label: 'Meetings', icon: <Calendar size={24} /> },
    { id: 'feedback', label: 'Submit Feedback', icon: <MessageCircle size={24} /> },
    { id: 'profile', label: 'Profile', icon: <User size={24} /> }
  ];
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview user={user} onTabChange={setActiveTab} />;
      case 'listings':
        return <Listings user={user} />;
      case 'advertisements':
        return <Advertisements user={user} />;
      case 'bids':
        return <Bids user={user} />;
      case 'meetings':
        return <Meetings user={user} />;
      case 'feedback':
        return <FeedbackForm />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return <Overview user={user} onTabChange={setActiveTab} />;
    }
  };

  return (
    <RoleAwareDashboardLayout>
      <div className="flex bg-gray-50 min-h-full relative">
        {/* Mobile Sidebar Overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        
        {/* Sidebar - Fixed */}
        <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 relative flex-shrink-0 ${
          sidebarCollapsed 
            ? 'w-16 sm:w-20' 
            : 'w-64 sm:w-72 fixed sm:relative z-30 sm:z-auto h-full sm:h-auto'
        }`}>
        {/* User Profile with Collapse Button */}
        <div className={`border-b border-gray-200 ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`bg-purple-100 rounded-full flex items-center justify-center ${
                sidebarCollapsed ? 'w-8 h-8' : 'w-12 h-12'
              }`}>
                <User className={`text-purple-600 ${sidebarCollapsed ? 'w-4 h-4' : 'w-7 h-7'}`} />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium text-gray-900 truncate">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Kamal Silva'}
                  </p>
                  <p className="text-sm text-purple-600 font-medium">Verified Seller</p>
                </div>
              )}
            </div>
            {/* Collapse/Expand button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 sm:hidden"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={18} />
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hidden sm:block"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
        {/* Navigation */}
        <nav className={`space-y-2 ${sidebarCollapsed ? 'p-2' : 'p-6'}`}>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              } ${
                sidebarCollapsed 
                  ? 'justify-center p-3' 
                  : 'space-x-4 px-4 py-3'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {!sidebarCollapsed && (
                <span className="text-base font-medium truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content - Scrollable */}
      <div className={`flex-1 flex flex-col overflow-hidden ${
        !sidebarCollapsed ? 'sm:ml-0' : ''
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left side - Title and mobile menu */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Seller Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, {user?.firstName || 'Seller'}
                </p>
              </div>
            </div>
            
            {/* Right side - Dashboard controls */}
            <div className="flex items-center space-x-4">
              {/* Dashboard-specific controls can be added here if needed */}
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
      </div>
    </RoleAwareDashboardLayout>
  );
};

export default SellerDashboard;