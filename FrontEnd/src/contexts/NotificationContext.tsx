import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';

// Notification types for different admin sections
export interface AdminNotifications {
  userManagement: number;        // Pending user verifications
  listingManagement: number;     // Pending listing approvals
  advertisements: number;        // Pending advertisement approvals
  meetingRequests: number;       // Pending meeting requests
  systemAlerts: number;         // System alerts
}

// Context type
interface NotificationContextType {
  notifications: AdminNotifications;
  totalNotifications: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (section: keyof AdminNotifications, count?: number) => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType>({
  notifications: {
    userManagement: 0,
    listingManagement: 0,
    advertisements: 0,
    meetingRequests: 0,
    systemAlerts: 0,
  },
  totalNotifications: 0,
  loading: false,
  refreshNotifications: async () => {},
  markAsRead: () => {},
});

// Hook to use notification context
export const useNotifications = () => useContext(NotificationContext);

// Notification Provider Component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<AdminNotifications>({
    userManagement: 0,
    listingManagement: 0,
    advertisements: 0,
    meetingRequests: 0,
    systemAlerts: 0,
  });
  const [loading, setLoading] = useState(false);

  // Calculate total notifications
  const totalNotifications = Object.values(notifications).reduce((sum, count) => sum + count, 0);

  // Fetch notification counts from API
  const fetchNotificationCounts = async () => {
    setLoading(true);
    try {
      // Fetch all notification counts in parallel
      const [
        pendingUsers,
        pendingListings,
        pendingAdvertisements,
        pendingMeetings,
        systemAlerts
      ] = await Promise.allSettled([
        api.getUsers(), // Get all users to filter pending verifications
        api.admin.getPendingListings(0, 1), // Just get count, not actual data
        api.getAllAdvertisements('false'), // Pending advertisements
        api.getMeetings(),
        api.getSystemAlerts() // Use main API method
      ]);

      const newNotifications: AdminNotifications = {
        userManagement: 0,
        listingManagement: 0,
        advertisements: 0,
        meetingRequests: 0,
        systemAlerts: 0,
      };

      // Process pending user verifications
      if (pendingUsers.status === 'fulfilled' && pendingUsers.value.success) {
        // Filter users needing verification (exclude admins)
        const users = Array.isArray(pendingUsers.value.data) ? pendingUsers.value.data : [];
        newNotifications.userManagement = users.filter((user: any) => 
          user.role?.toLowerCase() !== 'admin' && (
            user.verificationStatus === 'pending' || 
            user.verificationStatus === 'PENDING' ||
            !user.isVerified
          )
        ).length;
      }

      // Process pending listings
      if (pendingListings.status === 'fulfilled' && pendingListings.value.success) {
        newNotifications.listingManagement = pendingListings.value.data?.totalElements || 0;
      }

      // Process pending advertisements
      if (pendingAdvertisements.status === 'fulfilled' && pendingAdvertisements.value.success) {
        newNotifications.advertisements = Array.isArray(pendingAdvertisements.value.data)
          ? pendingAdvertisements.value.data.filter((ad: any) => ad.status === 'pending' || ad.approved === false).length
          : 0;
      }

      // Process pending meetings
      if (pendingMeetings.status === 'fulfilled' && pendingMeetings.value.success) {
        newNotifications.meetingRequests = Array.isArray(pendingMeetings.value.data)
          ? pendingMeetings.value.data.filter((meeting: any) => meeting.status === 'pending').length
          : 0;
      }

      // Process system alerts
      if (systemAlerts.status === 'fulfilled' && systemAlerts.value.success) {
        newNotifications.systemAlerts = Array.isArray(systemAlerts.value.data)
          ? systemAlerts.value.data.filter((alert: any) => !alert.dismissed).length
          : 0;
      }

      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      // Set default mock data for development
      setNotifications({
        userManagement: 3,
        listingManagement: 7,
        advertisements: 5,
        meetingRequests: 2,
        systemAlerts: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    await fetchNotificationCounts();
  };

  // Mark notifications as read
  const markAsRead = (section: keyof AdminNotifications, count: number = 1) => {
    setNotifications(prev => ({
      ...prev,
      [section]: Math.max(0, prev[section] - count)
    }));
  };

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotificationCounts();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchNotificationCounts, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        totalNotifications,
        loading,
        refreshNotifications,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Badge Component
interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  size?: 'small' | 'medium' | 'large';
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  maxCount = 99, 
  size = 'medium',
  color = 'red' 
}) => {
  if (count === 0) return null;

  const sizeClasses = {
    small: 'w-4 h-4 text-xs',
    medium: 'w-5 h-5 text-xs',
    large: 'w-6 h-6 text-sm'
  };

  const colorClasses = {
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    purple: 'bg-purple-500 text-white'
  };

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span className={`
      inline-flex items-center justify-center 
      ${sizeClasses[size]} 
      ${colorClasses[color]}
      rounded-full font-medium
      min-w-fit px-1
      absolute -top-1 -right-1
      border-2 border-white
      shadow-sm
    `}>
      {displayCount}
    </span>
  );
};

export default NotificationProvider;
