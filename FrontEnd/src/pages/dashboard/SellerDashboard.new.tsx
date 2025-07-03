import { useState } from 'react';
import { 
  User, Menu, 
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
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Mock user data - replace with actual auth context
  const user = {
    firstName: 'John',
    lastName: 'Seller',
    email: 'john.seller@example.com'
  };

  // Sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: <Home size={24} /> },
    { id: 'listings', label: 'List Items', icon: <Gem size={24} /> },
    { id: 'bids', label: 'Bids', icon: <Trophy size={24} /> },
    { id: 'meetings', label: 'Meetings', icon: <Calendar size={24} /> },
    { id: 'profile', label: 'Profile', icon: <User size={24} /> }
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
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className={`bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 ${
                sidebarCollapsed ? 'w-8 h-8' : 'w-12 h-12'
              }`}>
                <User className={`text-purple-600 ${sidebarCollapsed ? 'w-4 h-4' : 'w-7 h-7'}`} />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium text-gray-900 truncate">
                    {user?.firstName || 'Kamal'} {user?.lastName || 'Silva'}
                  </p>
                  <p className="text-sm text-purple-600 font-medium">Verified Seller</p>
                </div>
              )}
            </div>
            {/* Collapse Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0 sm:hidden"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={18} />
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0 hidden sm:block"
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
        {/* Mobile menu button */}
        <div className="sm:hidden bg-white border-b border-gray-200 p-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu size={20} />
          </button>
        </div>
        
        <div className="flex-1 p-3 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
      </div>
    </RoleAwareDashboardLayout>
  );
};

export default SellerDashboard;