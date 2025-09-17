import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';
import { useAuth } from './AuthContext';

// Notification types for different admin sections
export interface AdminNotifications {
  userManagement: number;        // Pending user verifications
  listingManagement: number;     // Pending listing approvals
  advertisements: number;        // Pending advertisement approvals
  meetingRequests: number;       // Pending meeting requests
  systemAlerts: number;         // System alerts
}

// Notification types for seller dashboard
export interface SellerNotifications {
  overview: number;              // Overview notifications
  listings: number;              // New bids, listing updates
  advertisements: number;        // Advertisement approvals/rejections
  bids: number;                 // New bids received
  meetings: number;             // Meeting requests/updates
  feedback: number;             // New feedback/reviews
  profile: number;              // Profile verification/updates
}

// Notification types for buyer dashboard
export interface BuyerNotifications {
  overview: number;             // General overview updates
  reservedItems: number;        // Items won/status updates
  meetings: number;             // Meeting confirmations/changes
  feedback: number;             // Feedback reminders
  profile: number;              // Profile/account updates
}

// Combined notification types
export interface AllNotifications {
  admin: AdminNotifications;
  seller: SellerNotifications;
  buyer: BuyerNotifications;
}

// Context type
interface NotificationContextType {
  notifications: AllNotifications;
  totalNotifications: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (role: keyof AllNotifications, section: string, count?: number) => void;
  getNotificationCount: (role: keyof AllNotifications, section: string) => number;
}

// Create context
const NotificationContext = createContext<NotificationContextType>({
  notifications: {
    admin: {
      userManagement: 0,
      listingManagement: 0,
      advertisements: 0,
      meetingRequests: 0,
      systemAlerts: 0,
    },
    seller: {
      overview: 0,
      listings: 0,
      advertisements: 0,
      bids: 0,
      meetings: 0,
      feedback: 0,
      profile: 0,
    },
    buyer: {
      overview: 0,
      reservedItems: 0,
      meetings: 0,
      feedback: 0,
      profile: 0,
    },
  },
  totalNotifications: 0,
  loading: false,
  refreshNotifications: async () => {},
  markAsRead: () => {},
  getNotificationCount: () => 0,
});

// Hook to use notification context
export const useNotifications = () => useContext(NotificationContext);

// Notification Provider Component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AllNotifications>({
    admin: {
      userManagement: 0,
      listingManagement: 0,
      advertisements: 0,
      meetingRequests: 0,
      systemAlerts: 0,
    },
    seller: {
      overview: 0,
      listings: 0,
      advertisements: 0,
      bids: 0,
      meetings: 0,
      feedback: 0,
      profile: 0,
    },
    buyer: {
      overview: 0,
      reservedItems: 0,
      meetings: 0,
      feedback: 0,
      profile: 0,
    },
  });
  const [loading, setLoading] = useState(false);

  // Calculate total notifications based on user role
  const totalNotifications = user?.role 
    ? Object.values(notifications[user.role.toLowerCase() as keyof AllNotifications] || {}).reduce((sum, count) => sum + count, 0)
    : 0;

  // Fetch notification counts from API based on user role
  const fetchNotificationCounts = async () => {
    if (!user?.userId || !user?.role) return;
    
    setLoading(true);
    try {
      const userRole = user.role.toLowerCase() as keyof AllNotifications;
      
      if (userRole === 'admin') {
        await fetchAdminNotifications();
      } else if (userRole === 'seller') {
        await fetchSellerNotifications();
      } else if (userRole === 'buyer') {
        await fetchBuyerNotifications();
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error);
      // Set mock data for development
      setMockNotifications();
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin notifications
  const fetchAdminNotifications = async () => {
    const [
      pendingUsers,
      pendingListings,
      pendingAdvertisements,
      pendingMeetings,
      systemAlerts
    ] = await Promise.allSettled([
      api.getUsers(),
      api.admin.getPendingListings(0, 1),
      api.getAllAdvertisements('false'),
      api.getMeetings(),
      api.getSystemAlerts()
    ]);

    const adminNotifications: AdminNotifications = {
      userManagement: 0,
      listingManagement: 0,
      advertisements: 0,
      meetingRequests: 0,
      systemAlerts: 0,
    };

    // Process results
    if (pendingUsers.status === 'fulfilled' && pendingUsers.value.success) {
      const users = Array.isArray(pendingUsers.value.data) ? pendingUsers.value.data : [];
      adminNotifications.userManagement = users.filter((user: any) => 
        user.role?.toLowerCase() !== 'admin' && (
          user.verificationStatus === 'pending' || 
          user.verificationStatus === 'PENDING' ||
          !user.isVerified
        )
      ).length;
    }

    if (pendingListings.status === 'fulfilled' && pendingListings.value.success) {
      adminNotifications.listingManagement = pendingListings.value.data?.totalElements || 0;
    }

    if (pendingAdvertisements.status === 'fulfilled' && pendingAdvertisements.value.success) {
      adminNotifications.advertisements = Array.isArray(pendingAdvertisements.value.data)
        ? pendingAdvertisements.value.data.filter((ad: any) => ad.status === 'pending' || ad.approved === false).length
        : 0;
    }

    if (pendingMeetings.status === 'fulfilled' && pendingMeetings.value.success) {
      adminNotifications.meetingRequests = Array.isArray(pendingMeetings.value.data)
        ? pendingMeetings.value.data.filter((meeting: any) => meeting.status === 'pending').length
        : 0;
    }

    if (systemAlerts.status === 'fulfilled' && systemAlerts.value.success) {
      adminNotifications.systemAlerts = Array.isArray(systemAlerts.value.data)
        ? systemAlerts.value.data.filter((alert: any) => !alert.dismissed).length
        : 0;
    }

    setNotifications(prev => ({
      ...prev,
      admin: adminNotifications
    }));
  };

  // Fetch seller notifications
  const fetchSellerNotifications = async () => {
    try {
      // Mock API calls for seller notifications
      const sellerNotifications: SellerNotifications = {
        overview: 0,
        listings: Math.floor(Math.random() * 4), // 0-3 listing updates
        advertisements: Math.floor(Math.random() * 2), // 0-1 ad updates
        bids: Math.floor(Math.random() * 7) + 1, // 1-7 new bids
        meetings: Math.floor(Math.random() * 3), // 0-2 meeting requests
        feedback: Math.floor(Math.random() * 2), // 0-1 new feedback
        profile: 0,
      };

      setNotifications(prev => ({
        ...prev,
        seller: sellerNotifications
      }));
    } catch (error) {
      console.error('Error fetching seller notifications:', error);
    }
  };

  // Fetch buyer notifications
  const fetchBuyerNotifications = async () => {
    try {
      // Mock API calls for buyer notifications
      const buyerNotifications: BuyerNotifications = {
        overview: 0,
        reservedItems: Math.floor(Math.random() * 3), // 0-2 item updates
        meetings: Math.floor(Math.random() * 2), // 0-1 meeting updates
        feedback: Math.floor(Math.random() * 1), // 0 feedback reminders
        profile: 0,
      };

      setNotifications(prev => ({
        ...prev,
        buyer: buyerNotifications
      }));
    } catch (error) {
      console.error('Error fetching buyer notifications:', error);
    }
  };

  // Set mock notifications for development
  const setMockNotifications = () => {
    const userRole = user?.role?.toLowerCase() as keyof AllNotifications;
    
    if (userRole === 'admin') {
      setNotifications(prev => ({
        ...prev,
        admin: {
          userManagement: 3,
          listingManagement: 7,
          advertisements: 5,
          meetingRequests: 2,
          systemAlerts: 1,
        }
      }));
    } else if (userRole === 'seller') {
      setNotifications(prev => ({
        ...prev,
        seller: {
          overview: 0,
          listings: 2,
          advertisements: 1,
          bids: 5,
          meetings: 2,
          feedback: 1,
          profile: 0,
        }
      }));
    } else if (userRole === 'buyer') {
      setNotifications(prev => ({
        ...prev,
        buyer: {
          overview: 0,
          reservedItems: 2,
          meetings: 1,
          feedback: 0,
          profile: 0,
        }
      }));
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    await fetchNotificationCounts();
  };

  // Mark notifications as read
  const markAsRead = (role: keyof AllNotifications, section: string, count: number = 1) => {
    setNotifications(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [section]: Math.max(0, (prev[role] as any)[section] - count)
      }
    }));
  };

  // Get notification count for specific role and section
  const getNotificationCount = (role: keyof AllNotifications, section: string): number => {
    return (notifications[role] as any)?.[section] || 0;
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
        getNotificationCount,
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
