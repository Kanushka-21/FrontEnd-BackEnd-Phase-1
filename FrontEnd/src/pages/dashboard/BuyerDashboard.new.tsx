import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { 
  ShoppingBag, User, 
  TrendingUp, Menu, Home, Calendar, MessageCircle
} from 'lucide-react';
import RoleAwareDashboardLayout from '@/components/layout/RoleAwareDashboardLayout';
import NotificationComponent from '@/components/ui/NotificationComponent';

// Import modular components
import {
  Overview,
  Purchases,
  Bids,
  Profile
} from './BuyerDashboardComponents';

import MeetingManager from '../../components/scheduling/MeetingManager';

import { SidebarItem } from './BuyerDashboardComponents/shared';

// Import feedback page
import FeedbackForm from '../Feedback/FeedbackPage';

const BuyerDashboard = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Check URL parameters on component mount and when location changes
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams.get('section');
    
    console.log('🔧 BuyerDashboard URL params:', { section, pathname: location.pathname });
    
    if (section && ['overview', 'purchases', 'bids', 'meetings', 'profile'].includes(section)) {
      console.log('🔧 Setting active tab from URL parameter:', section);
      setActiveTab(section);
    }
  }, [location]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: <Home size={24} /> },
    { id: 'purchases', label: 'Purchases', icon: <ShoppingBag size={24} /> },
    { id: 'bids', label: 'My Bids', icon: <TrendingUp size={24} /> },
    { id: 'meetings', label: 'Meetings', icon: <Calendar size={24} /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageCircle size={24} /> },
    { id: 'profile', label: 'Profile', icon: <User size={24} /> }
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview user={user} />;
      case 'purchases':
        return <Purchases user={user} />;
      case 'bids':
        return <Bids />;
      case 'meetings':
        return <MeetingManager user={user} />;
      case 'feedback':
        return <FeedbackForm />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return <Overview user={user} />;
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
        
        {/* Sidebar */}
        <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed 
            ? 'w-16 sm:w-20' 
            : 'w-64 sm:w-72 fixed sm:relative z-30 sm:z-auto h-full sm:h-auto'
        }`}>


        {/* User Profile */}
        <div className={`border-b border-gray-200 ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`bg-blue-100 rounded-full flex items-center justify-center ${
                sidebarCollapsed ? 'w-8 h-8' : 'w-12 h-12'
              }`}>
                <User className={`text-blue-600 ${sidebarCollapsed ? 'w-4 h-4' : 'w-7 h-7'}`} />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium text-gray-900 truncate">
                    {user?.firstName || 'Pasindu'} {user?.lastName || 'Perera'}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">Verified Buyer</p>
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
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              } ${
                sidebarCollapsed 
                  ? 'justify-center p-3' 
                  : 'space-x-4 px-4 py-3'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className={`flex-shrink-0 ${sidebarCollapsed ? '' : ''}`}>
                {item.icon}
              </div>
              {!sidebarCollapsed && (
                <span className="text-base font-medium truncate">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${
        !sidebarCollapsed ? 'sm:ml-0' : ''
      }`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Buyer Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, {user?.firstName || 'Buyer'}
                </p>
              </div>
            </div>
            
            {/* Right side - Notifications */}
            <div className="flex items-center space-x-4">
              {user?.userId && (
                <NotificationComponent 
                  userId={user.userId} 
                  context="buyer"
                  maxNotifications={5}
                  user={user}
                />
              )}
            </div>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>
      </div>
    </RoleAwareDashboardLayout>
  );
};

export default BuyerDashboard;
