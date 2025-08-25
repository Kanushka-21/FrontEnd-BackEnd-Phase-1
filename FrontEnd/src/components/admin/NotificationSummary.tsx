import React from 'react';
import { useNotifications, NotificationBadge } from '@/contexts/NotificationContext';
import { Users, Package, Clock, Settings, AlertTriangle, Megaphone } from 'lucide-react';

interface NotificationSummaryProps {
  onTabChange: (tab: string) => void;
}

const NotificationSummary: React.FC<NotificationSummaryProps> = ({ onTabChange }) => {
  const { notifications, totalNotifications, loading, refreshNotifications } = useNotifications();

  const notificationItems = [
    {
      id: 'users',
      title: 'User Management',
      description: 'Pending user verifications',
      count: notifications.userManagement,
      icon: <Users className="w-8 h-8 text-blue-600" />,
      color: 'blue',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 'listings',
      title: 'Listing Management',
      description: 'Pending listing approvals',
      count: notifications.listingManagement,
      icon: <Package className="w-8 h-8 text-green-600" />,
      color: 'green',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      id: 'advertisements',
      title: 'Advertisement Management',
      description: 'Pending advertisement approvals',
      count: notifications.advertisements,
      icon: <Megaphone className="w-8 h-8 text-purple-600" />,
      color: 'purple',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      id: 'meetings',
      title: 'Meeting Requests',
      description: 'Pending meeting requests',
      count: notifications.meetingRequests,
      icon: <Clock className="w-8 h-8 text-orange-600" />,
      color: 'orange',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      id: 'settings',
      title: 'System Alerts',
      description: 'Unread system alerts',
      count: notifications.systemAlerts,
      icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
      color: 'red',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
  ];

  const handleNotificationClick = (tabId: string) => {
    onTabChange(tabId);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Notifications Summary</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Total: <span className="font-semibold text-red-600">{totalNotifications}</span> pending items
          </span>
          <button
            onClick={refreshNotifications}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Notification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {notificationItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleNotificationClick(item.id)}
            className={`
              ${item.bgColor} ${item.borderColor}
              border rounded-lg p-4 cursor-pointer
              hover:shadow-md transition-all duration-200
              ${item.count > 0 ? 'hover:scale-105' : 'opacity-60'}
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                {item.icon}
                {item.count > 0 && (
                  <NotificationBadge 
                    count={item.count} 
                    size="small"
                    color="red"
                  />
                )}
              </div>
              {item.count > 0 && (
                <div className="text-right">
                  <NotificationBadge 
                    count={item.count} 
                    size="medium"
                    color="red"
                  />
                </div>
              )}
            </div>
            
            <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-gray-600">{item.description}</p>
            
            {item.count > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs font-medium text-gray-700">
                  Click to review ({item.count} pending)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      {totalNotifications > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Action Required</h3>
                <p className="text-sm text-yellow-700">
                  You have {totalNotifications} pending items that require your attention.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Navigate to the section with the most notifications
                const maxNotificationItem = notificationItems.reduce((max, item) => 
                  item.count > max.count ? item : max, notificationItems[0]
                );
                if (maxNotificationItem.count > 0) {
                  handleNotificationClick(maxNotificationItem.id);
                }
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Review Now
            </button>
          </div>
        </div>
      )}

      {/* No Notifications */}
      {totalNotifications === 0 && (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600 text-sm">No pending items require your attention right now.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationSummary;
