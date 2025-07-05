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

  // Debug logging
  console.log('🔔 NotificationComponent rendered with userId:', userId);
  console.log('🔔 Current unreadCount:', unreadCount);
  console.log('🔔 Current notifications count:', notifications.length);

  // Monitor unreadCount changes
  useEffect(() => {
    console.log('🔔 unreadCount changed to:', unreadCount);
  }, [unreadCount]);

  // Load notifications
  useEffect(() => {
    if (userId) {
      console.log('🔔 Loading notifications for userId:', userId);
      loadNotifications();
      loadUnreadCount();
      
      // Set up more frequent polling for real-time updates (every 10 seconds)
      const interval = setInterval(() => {
        loadUnreadCount();
        if (isOpen) {
          loadNotifications();
        }
      }, 10000);
      
      return () => clearInterval(interval);
    } else {
      console.log('🔔 No userId provided, skipping notification load');
    }
  }, [userId, isOpen]);

  // Also reload when dropdown opens
  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      console.log('🔔 Fetching notifications for userId:', userId);
      const response = await fetch(`http://localhost:9092/api/bidding/notifications/${userId}?page=0&size=20`);
      const result = await response.json();
      
      console.log('🔔 Notification API response:', result);
      
      if (result.success) {
        setNotifications(result.data.notifications || []);
        console.log('🔔 Loaded notifications:', result.data.notifications?.length || 0);
      } else {
        console.error('🔔 Failed to load notifications:', result.message);
      }
    } catch (error) {
      console.error('🔔 Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      console.log('🔔 Fetching unread count for userId:', userId);
      const response = await fetch(`http://localhost:9092/api/bidding/notifications/${userId}/unread-count`);
      const result = await response.json();
      
      console.log('🔔 Unread count API response:', result);
      
      if (result.success) {
        setUnreadCount(result.data || 0);
        console.log('🔔 Unread count:', result.data || 0);
      } else {
        console.error('🔔 Failed to load unread count:', result.message);
      }
    } catch (error) {
      console.error('🔔 Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Immediately update UI for better user experience
      const previousNotifications = [...notifications];
      const previousUnreadCount = unreadCount;
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Then sync with backend
      const response = await fetch(`http://localhost:9092/api/bidding/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // If backend fails, revert the UI changes
        console.error('🔔 Failed to mark notification as read, reverting UI changes');
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    console.log('🔔 markAllAsRead called - Current unreadCount:', unreadCount);
    console.log('🔔 markAllAsRead called - Current notifications:', notifications.length);
    
    try {
      setLoading(true);
      
      // Immediately update UI for better user experience
      const previousNotifications = [...notifications];
      const previousUnreadCount = unreadCount;
      
      console.log('🔔 Setting unreadCount to 0 and marking all notifications as read');
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      console.log('🔔 UI updated: All notifications marked as read, unreadCount set to 0');
      
      // Then try to sync with backend
      const response = await fetch(`http://localhost:9092/api/bidding/notifications/${userId}/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        console.log('🔔 Backend sync successful: All notifications marked as read');
      } else {
        // If backend fails, revert the UI changes
        console.error('🔔 Backend sync failed, reverting UI changes');
        setNotifications(previousNotifications);
        setUnreadCount(previousUnreadCount);
        throw new Error('Failed to mark all as read');
      }
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Show user-friendly error message but keep UI changes if it was just a network issue
      // The user can see the change happened locally
    } finally {
      setLoading(false);
      console.log('🔔 markAllAsRead completed');
    }
  };

  const handleNotificationClick = (notification: NotificationInfo) => {
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate to the marketplace item
    if (notification.listingId) {
      // Close notification dropdown
      setIsOpen(false);
      
      // Navigate to marketplace with specific item
      const marketplaceUrl = `/marketplace?item=${notification.listingId}`;
      window.location.href = marketplaceUrl;
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
          <span 
            key={`badge-${unreadCount}`}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Notifications {unreadCount > 0 && <span className="text-sm text-red-600">({unreadCount} unread)</span>}
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                >
                  {loading ? 'Marking...' : 'Read All'}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
                    onClick={() => handleNotificationClick(notification)}
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
                onClick={markAllAsRead}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              >
                {loading ? 'Marking all as read...' : 'Mark all as read'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;
