import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { NotificationInfo } from '@/types';
import { UserIdMappingService } from '@/services/UserIdMappingService';

interface NotificationComponentProps {
  userId: string;
  className?: string;
  context?: string; // Add context prop for role-based filtering
  maxNotifications?: number; // Add optional max notifications limit
  user?: any; // Add user object for dynamic ID resolution
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({ 
  userId, 
  className = '', 
  context, 
  maxNotifications = 20,
  user 
}) => {
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolvedUserId, setResolvedUserId] = useState<string>(userId);

  // Debug logging
  console.log('🔔 NotificationComponent rendered with userId:', userId);
  console.log('🔔 Context:', context);
  console.log('🔔 User object:', user);
  console.log('🔔 Resolved userId:', resolvedUserId);
  console.log('🔔 Current unreadCount:', unreadCount);
  console.log('🔔 Current notifications count:', notifications.length);

  // Monitor unreadCount changes
  useEffect(() => {
    console.log('🔔 unreadCount changed to:', unreadCount);
  }, [unreadCount]);

  // Resolve the correct user ID for marketplace notifications
  useEffect(() => {
    const resolveUserId = async () => {
      if (user && context === 'seller') {
        try {
          console.log('🔍 Resolving marketplace user ID for seller...');
          const marketplaceUserId = await UserIdMappingService.resolveMarketplaceUserId(user);
          
          if (marketplaceUserId !== userId) {
            console.log('🎯 User ID resolved:', {
              original: userId,
              resolved: marketplaceUserId,
              context: context
            });
            setResolvedUserId(marketplaceUserId);
          } else {
            setResolvedUserId(userId);
          }
        } catch (error) {
          console.error('❌ Error resolving user ID:', error);
          setResolvedUserId(userId); // Fallback to original
        }
      } else {
        setResolvedUserId(userId); // Use original if not seller context
      }
    };

    resolveUserId();
  }, [userId, user, context]);

  // Load notifications
  useEffect(() => {
    if (resolvedUserId) {
      console.log('🔔 Loading notifications for resolved userId:', resolvedUserId);
      loadNotifications();
      loadUnreadCount();
      
      // Set up more frequent polling for real-time updates (every 5 seconds for better responsiveness)
      const interval = setInterval(() => {
        loadUnreadCount();
        if (isOpen) {
          loadNotifications();
        }
      }, 5000);
      
      return () => clearInterval(interval);
    } else {
      console.log('🔔 No resolved userId, skipping notification load');
    }
  }, [resolvedUserId, isOpen]);

  // Also reload when dropdown opens
  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      console.log('🔔 Fetching notifications for resolved userId:', resolvedUserId, 'context:', context);
      
      // Build URL with context parameter if provided
      let url = `http://localhost:9092/api/bidding/notifications/${resolvedUserId}?page=0&size=${maxNotifications}`;
      if (context) {
        url += `&context=${context}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      
      console.log('🔔 Notification API response:', result);
      
      if (result.success) {
        setNotifications(result.data.notifications || []);
        console.log('🔔 Loaded notifications:', result.data.notifications?.length || 0);
        console.log('🔔 Context filtering applied:', context || 'none');
        console.log('🔔 Using resolved user ID:', resolvedUserId);
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
      console.log('🔔 Fetching unread count for resolved userId:', resolvedUserId);
      const response = await fetch(`http://localhost:9092/api/bidding/notifications/${resolvedUserId}/unread-count`);
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
      const response = await fetch(`http://localhost:9092/api/bidding/notifications/${resolvedUserId}/read-all`, {
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
    console.log('🔔 Notification clicked:', notification);
    
    // Mark as read if unread
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Close notification dropdown first
    setIsOpen(false);
    
    // Enhanced notification routing based on context and type
    const routeNotification = () => {
      console.log('🔔 Routing notification:', { type: notification.type, context, listingId: notification.listingId });
      
      // Context-aware routing based on user role
      if (context === 'seller') {
        // For seller notifications related to specific listings, navigate to marketplace with GemDetailsModal
        switch (notification.type) {
          case 'NEW_BID':
          case 'ITEM_SOLD':
          case 'BIDDING_CANCELLED':
          case 'BIDDING_ENDED':
            if (notification.listingId) {
              console.log('🔔 Routing seller to marketplace with listing:', notification.listingId);
              window.location.href = `/marketplace?viewGemstone=${notification.listingId}`;
            } else {
              console.log('🔔 No listingId found, routing to seller bids section');
              window.location.href = '/seller/dashboard?section=bids';
            }
            break;
          case 'MEETING_REQUEST_RECEIVED':
          case 'MEETING_CONFIRMED':
          case 'MEETING_RESCHEDULED':
          case 'MEETING_CANCELLED':
          case 'MEETING_COMPLETED':
            console.log('🔔 Routing to seller meetings section');
            window.location.href = '/seller/dashboard?section=meetings';
            break;
          default:
            // For other seller notifications, check if there's a listingId
            if (notification.listingId) {
              console.log('🔔 Default seller routing to marketplace with listing:', notification.listingId);
              window.location.href = `/marketplace?viewGemstone=${notification.listingId}`;
            } else {
              console.log('🔔 Routing to seller overview');
              window.location.href = '/seller/dashboard?section=overview';
            }
        }
      } else if (context === 'buyer') {
        // Buyer dashboard routing - also navigate to marketplace for listing-specific notifications
        switch (notification.type) {
          case 'BID_WON':
          case 'BID_ACCEPTED':
            if (notification.listingId) {
              console.log('🔔 Routing buyer to marketplace with listing:', notification.listingId);
              window.location.href = `/marketplace?viewGemstone=${notification.listingId}`;
            } else {
              console.log('🔔 Routing to buyer purchases section');
              window.location.href = '/buyer/dashboard?section=purchases';
            }
            break;
          case 'BID_OUTBID':
          case 'BID_PLACED':
          case 'BIDDING_ENDED':
            if (notification.listingId) {
              console.log('🔔 Routing buyer to marketplace with listing:', notification.listingId);
              window.location.href = `/marketplace?viewGemstone=${notification.listingId}`;
            } else {
              console.log('🔔 Routing to buyer bids section');
              window.location.href = '/buyer/dashboard?section=bids';
            }
            break;
          case 'MEETING_REQUEST_SENT':
          case 'MEETING_CONFIRMED':
          case 'MEETING_RESCHEDULED':
          case 'MEETING_CANCELLED':
          case 'MEETING_COMPLETED':
            console.log('🔔 Routing to buyer meetings section');
            window.location.href = '/buyer/dashboard?section=meetings';
            break;
          default:
            // For other buyer notifications, check if there's a listingId
            if (notification.listingId) {
              console.log('🔔 Default buyer routing to marketplace with listing:', notification.listingId);
              window.location.href = `/marketplace?viewGemstone=${notification.listingId}`;
            } else {
              console.log('🔔 Routing to buyer overview');
              window.location.href = '/buyer/dashboard?section=overview';
            }
        }
      } else if (context === 'admin') {
        // Admin dashboard routing
        switch (notification.type) {
          case 'USER_REGISTRATION':
          case 'USER_VERIFICATION':
            console.log('🔔 Routing to admin users section');
            window.location.href = '/admin/dashboard?section=users';
            break;
          case 'NEW_LISTING':
          case 'LISTING_APPROVED':
          case 'LISTING_REJECTED':
            console.log('🔔 Routing to admin listings section');
            window.location.href = '/admin/dashboard?section=listings';
            break;
          case 'MEETING_SCHEDULED':
          case 'MEETING_COMPLETED':
            console.log('🔔 Routing to admin meetings section');
            window.location.href = '/admin/dashboard?section=meetings';
            break;
          default:
            console.log('🔔 Routing to admin overview');
            window.location.href = '/admin/dashboard?section=overview';
        }
      } else {
        // Fallback routing - prioritize marketplace for listing-specific notifications
        if (notification.listingId) {
          console.log('🔔 Fallback: Routing to marketplace with listingId:', notification.listingId);
          window.location.href = `/marketplace?viewGemstone=${notification.listingId}`;
        } else if (notification.type === 'BID_ACCEPTED' || notification.type === 'BID_WON') {
          console.log('🔔 Fallback: Routing to buyer purchases');
          window.location.href = '/buyer/dashboard?section=purchases';
        } else if (notification.type === 'NEW_BID' || notification.type === 'BID_OUTBID') {
          console.log('🔔 Fallback: Routing to marketplace');
          window.location.href = '/marketplace';
        } else {
          console.log('🔔 Fallback: Routing to marketplace');
          window.location.href = '/marketplace';
        }
      }
    };
    
    // Execute routing
    routeNotification();
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
      // Meeting notification icons
      case 'MEETING_REQUEST_RECEIVED':
      case 'MEETING_REQUEST_SENT':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'MEETING_CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'MEETING_RESCHEDULED':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'MEETING_CANCELLED':
        return <X className="w-5 h-5 text-red-600" />;
      case 'MEETING_COMPLETED':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
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
      case 'BID_WON':
        typeClasses = isRead ? "" : "bg-green-50 border-l-green-500";
        break;
      case 'ITEM_SOLD':
        typeClasses = isRead ? "" : "bg-blue-50 border-l-blue-500";
        break;
      case 'BIDDING_ENDED':
        typeClasses = isRead ? "" : "bg-gray-50 border-l-gray-500";
        break;
      // Meeting notification styles
      case 'MEETING_REQUEST_RECEIVED':
      case 'MEETING_REQUEST_SENT':
        typeClasses = isRead ? "" : "bg-blue-50 border-l-blue-500";
        break;
      case 'MEETING_CONFIRMED':
        typeClasses = isRead ? "" : "bg-green-50 border-l-green-500";
        break;
      case 'MEETING_RESCHEDULED':
        typeClasses = isRead ? "" : "bg-orange-50 border-l-orange-500";
        break;
      case 'MEETING_CANCELLED':
        typeClasses = isRead ? "" : "bg-red-50 border-l-red-500";
        break;
      case 'MEETING_COMPLETED':
        typeClasses = isRead ? "" : "bg-purple-50 border-l-purple-500";
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
