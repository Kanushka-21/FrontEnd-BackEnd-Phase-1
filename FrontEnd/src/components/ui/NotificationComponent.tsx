import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { NotificationInfo } from '@/types';

interface NotificationComponentProps {
  userId: string;
  className?: string;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({ userId, className = '' }) => {
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load notifications
  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadUnreadCount();
      
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadUnreadCount();
        if (isOpen) {
          loadNotifications();
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [userId, isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bidding/notifications/${userId}?page=0&size=20`);
      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await fetch(`/api/bidding/notifications/${userId}/unread-count`);
      const result = await response.json();
      
      if (result.success) {
        setUnreadCount(result.data || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/bidding/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_BID':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'BID_PLACED':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'BID_OUTBID':
        return <Clock className="w-5 h-5 text-red-600" />;
      case 'BID_ACTIVITY':
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case 'BID_ACCEPTED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'BID_REJECTED':
        return <X className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationStyle = (type: string, isRead: boolean) => {
    const baseClasses = "p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors";
    const unreadClasses = isRead ? "bg-white" : "bg-blue-50 border-l-4 border-l-blue-500";
    
    let typeClasses = "";
    switch (type) {
      case 'NEW_BID':
        typeClasses = isRead ? "" : "bg-green-50 border-l-green-500";
        break;
      case 'BID_PLACED':
        typeClasses = isRead ? "" : "bg-blue-50 border-l-blue-500";
        break;
      case 'BID_OUTBID':
        typeClasses = isRead ? "" : "bg-red-50 border-l-red-500";
        break;
      case 'BID_ACTIVITY':
        typeClasses = isRead ? "" : "bg-orange-50 border-l-orange-500";
        break;
      default:
        typeClasses = unreadClasses;
    }
    
    return `${baseClasses} ${isRead ? "bg-white" : typeClasses}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            loadNotifications();
          }
        }}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={getNotificationStyle(notification.type, notification.isRead)}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                          {notification.bidAmount && (
                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              LKR {parseInt(notification.bidAmount).toLocaleString()}
                            </span>
                          )}
                        </div>
                        {notification.gemName && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                              {notification.gemName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button
                onClick={() => {
                  // Mark all as read
                  notifications
                    .filter(n => !n.isRead)
                    .forEach(n => markAsRead(n.id));
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;
