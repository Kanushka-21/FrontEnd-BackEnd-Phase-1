import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, LogOut, Menu, 
  Home, Trophy, Calendar, Gem
} from 'lucide-react';
import RoleAwareDashboardLayout from '@/components/layout/RoleAwareDashboardLayout';

// Import modular components
import {
  Overview,
  Listings,
  Bids,
  Meetings,
  Profile
} from './SellerDashbaordComponents';

import { SidebarItem } from './SellerDashbaordComponents/shared';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock user data - replace with actual auth context
  const user = {
    firstName: 'John',
    lastName: 'Seller',
    email: 'john.seller@example.com'
  };

  // Handle logout
  const handleLogout = () => {
    // Implement logout logic
    navigate('/login');
  };

  // Sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: <Home size={20} /> },
    { id: 'listings', label: 'List Items', icon: <Gem size={20} /> },
    { id: 'bids', label: 'Bids', icon: <Trophy size={20} /> },
    { id: 'meetings', label: 'Meetings', icon: <Calendar size={20} /> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> }
  ];
  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview user={user} onTabChange={setActiveTab} />;
      case 'listings':
        return <Listings user={user} />;
      case 'bids':
        return <Bids user={user} />;
      case 'meetings':
        return <Meetings user={user} />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return <Overview user={user} onTabChange={setActiveTab} />;
    }
  };

  return (
    <RoleAwareDashboardLayout>
      <div className="flex bg-gray-50 min-h-full">
        {/* Sidebar - Fixed */}
        <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 relative flex-shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
        {/* User Profile with Collapse Button */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-purple-600">Verified Seller</p>
                </div>
              )}
            </div>
            {/* Collapse Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      
        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-100'
              } ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {item.icon}
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${
              sidebarCollapsed ? 'justify-center' : 'space-x-3'
            }`}
            title="Logout"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-3 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
      </div>
    </RoleAwareDashboardLayout>
  );
};

export default SellerDashboard;