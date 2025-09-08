import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, TrendingUp, CheckCircle, Users, Package, Calendar, Settings, AlertTriangle } from 'lucide-react';

interface AdminNotification {
  id: string;
  type: 'USER_REGISTRATION' | 'LISTING_PENDING' | 'MEETING_REQUEST' | 'ADVERTISEMENT_PENDING' | 'SYSTEM_ALERT' | 'VERIFICATION_REQUEST';
  title: string;
  message: string;
  section: 'overview' | 'users' | 'listings' | 'advertisements' | 'meetings' | 'settings';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  actionRequired?: boolean;
  metadata?: {
    userId?: string;
    listingId?: string;
    meetingId?: string;
    advertisementId?: string;
    userName?: string;
    itemName?: string;
  };
}

interface AdminNotificationComponentProps {
  userId: string;
  className?: string;
  maxNotifications?: number;
  onSectionChange?: (section: string) => void; // Callback to change dashboard section
}

const AdminNotificationComponent: React.FC<AdminNotificationComponentProps> = ({ 
  userId, 
  className = '', 
  maxNotifications = 20,
  onSectionChange
}) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all'); // 'all', 'unread', or specific section

  // Debug logging
  console.log('🔔 AdminNotificationComponent rendered with userId:', userId);
  console.log('🔔 Current notifications count:', notifications.length);
  console.log('🔔 Unread count:', unreadCount);

  // Load admin notifications
  useEffect(() => {
    if (userId) {
      console.log('🔔 Loading admin notifications for userId:', userId);
      loadNotifications();
      loadUnreadCount();
      
      // Set up polling for real-time updates
      const interval = setInterval(() => {
        loadNotifications();
        loadUnreadCount();
      }, 30000); // Poll every 30 seconds
      
      return () => clearInterval(interval);
    } else {
      console.log('🔔 No userId provided, skipping notification load');
    }
  }, [userId]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      console.log('🔔 Fetching admin notifications for userId:', userId);
      
      // Try different admin notification endpoints
      let response;
      let result;
      
      // First try admin-specific notification endpoint
      try {
        response = await fetch(`http://localhost:9092/api/admin/notifications/${userId}?page=0&size=${maxNotifications}`);
        result = await response.json();
        console.log('🔔 Admin notification API response:', result);
      } catch (error) {
        console.log('🔔 Admin endpoint failed, trying generic endpoint');
        // Fallback to generic notification endpoint
        response = await fetch(`http://localhost:9092/api/bidding/notifications/${userId}?page=0&size=${maxNotifications}`);
        result = await response.json();
        console.log('🔔 Generic notification API response:', result);
      }
      
      if (result.success) {
        // Process notifications and categorize them for admin
        const processedNotifications = processAdminNotifications(result.data.notifications || []);
        setNotifications(processedNotifications);
        console.log('🔔 Loaded admin notifications:', processedNotifications.length);
      } else {
        console.error('🔔 Failed to load admin notifications:', result.message);
        // Load mock notifications for development
        loadMockAdminNotifications();
      }
    } catch (error) {
      console.error('🔔 Error loading admin notifications:', error);
      // Load mock notifications for development
      loadMockAdminNotifications();
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      console.log('🔔 Fetching admin unread count for userId:', userId);
      
      // Try admin-specific unread count endpoint
      let response;
      let result;
      
      try {
        response = await fetch(`http://localhost:9092/api/admin/notifications/${userId}/unread-count`);
        result = await response.json();
      } catch (error) {
        // Fallback to generic endpoint
        response = await fetch(`http://localhost:9092/api/bidding/notifications/${userId}/unread-count`);
        result = await response.json();
      }
      
      console.log('🔔 Admin unread count API response:', result);
      
      if (result.success) {
        setUnreadCount(result.data || 0);
        console.log('🔔 Admin unread count:', result.data || 0);
      } else {
        console.error('🔔 Failed to load admin unread count:', result.message);
        // Count unread from current notifications
        const unreadCount = notifications.filter(n => !n.isRead).length;
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error('🔔 Error loading admin unread count:', error);
      // Count unread from current notifications
      const unreadCount = notifications.filter(n => !n.isRead).length;
      setUnreadCount(unreadCount);
    }
  };

  // Process generic notifications into admin-specific format
  const processAdminNotifications = (rawNotifications: any[]): AdminNotification[] => {
    return rawNotifications.map(notification => ({
      id: notification.id,
      type: determineAdminNotificationType(notification.type || 'SYSTEM_ALERT'),
      title: notification.title || 'Admin Notification',
      message: notification.message || 'New administrative task requires attention',
      section: determineAdminSection(notification.type || 'SYSTEM_ALERT'),
      priority: determinePriority(notification.type || 'SYSTEM_ALERT'),
      isRead: notification.isRead || notification.read || false,
      createdAt: notification.createdAt || new Date().toISOString(),
      readAt: notification.readAt,
      actionRequired: requiresAction(notification.type || 'SYSTEM_ALERT'),
      metadata: {
        userId: notification.userId,
        listingId: notification.listingId,
        userName: notification.triggerUserName || notification.userName,
        itemName: notification.gemName || notification.itemName
      }
    }));
  };

  // Load mock notifications for development/testing
  const loadMockAdminNotifications = () => {
    const mockNotifications: AdminNotification[] = [
      {
        id: '1',
        type: 'USER_REGISTRATION',
        title: 'New User Registration',
        message: 'John Doe has registered as a seller and requires verification',
        section: 'users',
        priority: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        actionRequired: true,
        metadata: { userId: 'user123', userName: 'John Doe' }
      },
      {
        id: '2',
        type: 'LISTING_PENDING',
        title: 'Listing Approval Required',
        message: 'Sapphire Ring listing by Jane Smith is pending approval',
        section: 'listings',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        actionRequired: true,
        metadata: { listingId: 'listing123', userName: 'Jane Smith', itemName: 'Sapphire Ring' }
      },
      {
        id: '3',
        type: 'MEETING_REQUEST',
        title: 'New Meeting Request',
        message: 'Meeting requested for Ruby verification on Friday',
        section: 'meetings',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
        actionRequired: true,
        metadata: { meetingId: 'meeting123', itemName: 'Ruby' }
      },
      {
        id: '4',
        type: 'ADVERTISEMENT_PENDING',
        title: 'Advertisement Approval',
        message: 'Premium gemstone advertisement requires review',
        section: 'advertisements',
        priority: 'low',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        actionRequired: true,
        metadata: { advertisementId: 'ad123' }
      },
      {
        id: '5',
        type: 'SYSTEM_ALERT',
        title: 'System Performance Alert',
        message: 'Database response time increased by 15% in the last hour',
        section: 'settings',
        priority: 'high',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        actionRequired: false
      }
    ];
    
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  };

  // Helper functions
  const determineAdminNotificationType = (type: string): AdminNotification['type'] => {
    const typeMap: { [key: string]: AdminNotification['type'] } = {
      'NEW_USER': 'USER_REGISTRATION',
      'USER_VERIFICATION': 'VERIFICATION_REQUEST',
      'LISTING_SUBMITTED': 'LISTING_PENDING',
      'MEETING_REQUESTED': 'MEETING_REQUEST',
      'AD_SUBMITTED': 'ADVERTISEMENT_PENDING',
      'SYSTEM_ERROR': 'SYSTEM_ALERT'
    };
    return typeMap[type] || 'SYSTEM_ALERT';
  };

  const determineAdminSection = (type: string): AdminNotification['section'] => {
    const sectionMap: { [key: string]: AdminNotification['section'] } = {
      'USER_REGISTRATION': 'users',
      'VERIFICATION_REQUEST': 'users',
      'LISTING_PENDING': 'listings',
      'MEETING_REQUEST': 'meetings',
      'ADVERTISEMENT_PENDING': 'advertisements',
      'SYSTEM_ALERT': 'settings'
    };
    return sectionMap[type] || 'overview';
  };

  const determinePriority = (type: string): AdminNotification['priority'] => {
    const highPriority = ['USER_REGISTRATION', 'SYSTEM_ALERT', 'VERIFICATION_REQUEST'];
    const mediumPriority = ['LISTING_PENDING', 'MEETING_REQUEST'];
    
    if (highPriority.includes(type)) return 'high';
    if (mediumPriority.includes(type)) return 'medium';
    return 'low';
  };

  const requiresAction = (type: string): boolean => {
    const actionRequired = ['USER_REGISTRATION', 'LISTING_PENDING', 'MEETING_REQUEST', 'ADVERTISEMENT_PENDING', 'VERIFICATION_REQUEST'];
    return actionRequired.includes(type);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('🔔 Marking admin notification as read:', notificationId, 'for user:', userId);
      
      // Update local state immediately
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Try to sync with backend
      try {
        const response = await fetch(`http://localhost:9092/api/admin/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          // Fallback to generic endpoint
          await fetch(`http://localhost:9092/api/bidding/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch (error) {
        console.log('🔔 Backend sync failed, but UI updated');
      }
    } catch (error) {
      console.error('🔔 Error marking admin notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: AdminNotification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Close notification dropdown
    setIsOpen(false);
    
    // Navigate to relevant section if callback provided
    if (onSectionChange && notification.section) {
      console.log('🔔 Navigating to admin section:', notification.section);
      
      // Map notification sections to dashboard sections correctly
      const sectionMap: { [key: string]: string } = {
        'users': 'users',
        'listings': 'listings', 
        'meetings': 'meetings',
        'advertisements': 'advertisements',
        'settings': 'settings',
        'overview': 'overview'
      };
      
      const targetSection = sectionMap[notification.section] || notification.section;
      console.log('🔔 Mapped section:', notification.section, '->', targetSection);
      
      onSectionChange(targetSection);
    } else {
      console.log('🔔 No section change callback available');
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getNotificationIcon = (type: AdminNotification['type']) => {
    switch (type) {
      case 'USER_REGISTRATION':
      case 'VERIFICATION_REQUEST':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'LISTING_PENDING':
        return <Package className="w-5 h-5 text-green-600" />;
      case 'MEETING_REQUEST':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'ADVERTISEMENT_PENDING':
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      case 'SYSTEM_ALERT':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: AdminNotification['priority']) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.section === filter;
  });

  const filterOptions = [
    { key: 'all', label: 'All', count: notifications.length },
    { key: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
    { key: 'users', label: 'Users', count: notifications.filter(n => n.section === 'users').length },
    { key: 'listings', label: 'Listings', count: notifications.filter(n => n.section === 'listings').length },
    { key: 'meetings', label: 'Meetings', count: notifications.filter(n => n.section === 'meetings').length },
    { key: 'advertisements', label: 'Ads', count: notifications.filter(n => n.section === 'advertisements').length },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        title="Admin Notifications"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Admin Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 p-2 border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {filterOptions.map(option => (
              <button
                key={option.key}
                onClick={() => setFilter(option.key)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                  filter === option.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">No {filter === 'all' ? '' : filter + ' '}notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          {notification.actionRequired && (
                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                              Action Required
                            </span>
                          )}
                          {getPriorityBadge(notification.priority)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {formatDateTime(notification.createdAt)}
                        </p>
                        <span className="text-xs text-gray-400 capitalize">
                          {notification.section}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  // Mark all visible notifications as read
                  filteredNotifications.forEach(notification => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  });
                }}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
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

export default AdminNotificationComponent;
