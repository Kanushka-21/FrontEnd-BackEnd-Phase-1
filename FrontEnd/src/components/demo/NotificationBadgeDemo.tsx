import React, { useState } from 'react';
import { NotificationBadge } from '@/contexts/NotificationContext';
import { Users, Package, Clock, Settings, AlertTriangle, Megaphone, Bell } from 'lucide-react';

// Demo component to show notification badges in action
const NotificationBadgeDemo: React.FC = () => {
  const [notifications, setNotifications] = useState({
    userManagement: 3,
    listingManagement: 7,
    advertisements: 5,
    meetingRequests: 2,
    systemAlerts: 1,
  });

  const totalNotifications = Object.values(notifications).reduce((sum, count) => sum + count, 0);

  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Dashboard Overview', 
      icon: <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center"><span className="text-blue-600 text-sm">📊</span></div>,
      notificationCount: 0
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: <Users size={24} />,
      notificationCount: notifications.userManagement
    },
    { 
      id: 'listings', 
      label: 'Listing Management', 
      icon: <Package size={24} />,
      notificationCount: notifications.listingManagement
    },
    { 
      id: 'advertisements', 
      label: 'Manage Advertisement', 
      icon: <Megaphone size={24} />,
      notificationCount: notifications.advertisements
    },
    { 
      id: 'meetings', 
      label: 'Meeting Requests', 
      icon: <Clock size={24} />,
      notificationCount: notifications.meetingRequests
    },
    { 
      id: 'settings', 
      label: 'System Settings', 
      icon: <Settings size={24} />,
      notificationCount: notifications.systemAlerts
    }
  ];

  const incrementNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: prev[key] + 1
    }));
  };

  const clearNotifications = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: 0
    }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🔔 Admin Dashboard Notification Badge System
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Bell className="mr-2" size={20} />
                Admin Sidebar Preview
                {totalNotifications > 0 && (
                  <div className="ml-auto">
                    <NotificationBadge count={totalNotifications} size="small" />
                  </div>
                )}
              </h2>
              
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="mr-3 relative">
                      {item.icon}
                      {item.notificationCount > 0 && (
                        <NotificationBadge 
                          count={item.notificationCount} 
                          size="small"
                          color="red"
                        />
                      )}
                    </span>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.notificationCount > 0 && (
                      <div className="ml-2">
                        <NotificationBadge 
                          count={item.notificationCount} 
                          size="small"
                          color="red"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">🎮 Notification Controls</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(notifications).map(([key, count]) => {
                  const item = sidebarItems.find(item => 
                    item.id === key || 
                    (key === 'userManagement' && item.id === 'users') ||
                    (key === 'listingManagement' && item.id === 'listings') ||
                    (key === 'systemAlerts' && item.id === 'settings')
                  );
                  
                  return (
                    <div key={key} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </h3>
                        <div className="text-2xl font-bold text-blue-600">{count}</div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => incrementNotification(key as keyof typeof notifications)}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => clearNotifications(key as keyof typeof notifications)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">📊 Summary</h3>
                <p className="text-blue-700">
                  Total Notifications: <span className="font-bold">{totalNotifications}</span>
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  This demonstrates how admin notifications will appear in the real dashboard
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">✨ Notification System Features</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">📱 Real-time Updates</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Automatic polling every 30 seconds</li>
                    <li>• Manual refresh capability</li>
                    <li>• Instant UI updates</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">🎯 Smart Badges</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Shows count up to 99+</li>
                    <li>• Color-coded by priority</li>
                    <li>• Auto-hides when count is 0</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">📋 Tracked Items</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• User verification requests</li>
                    <li>• Listing approval queue</li>
                    <li>• Advertisement reviews</li>
                    <li>• Meeting requests</li>
                    <li>• System alerts</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">🚀 Admin Benefits</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Never miss pending tasks</li>
                    <li>• Quick navigation to issues</li>
                    <li>• Priority-based workflow</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBadgeDemo;
