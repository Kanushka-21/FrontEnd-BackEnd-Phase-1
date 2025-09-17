import React, { useState, useRef, useEffect } from 'react';
import { 
  Card, Row, Col, Table, 
  Button, Tag, Tabs, Modal,
  Input, message, Alert, Badge,
  Progress, Divider
} from 'antd';
import {
  UserOutlined, DollarOutlined,
  CloseOutlined, CheckOutlined, 
  EyeOutlined,
  FileTextOutlined, LockOutlined, UnlockOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import {
  BarChart3, Users, Shield, Settings, 
  Menu as MenuIcon, Package, Clock, MessageCircle
} from 'lucide-react';
import dayjs from 'dayjs';
import RoleAwareDashboardLayout from '@/components/layout/RoleAwareDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api'; // Import the API functions
import AdminMeetingDashboard from '@/components/admin/AdminMeetingDashboard';


const { TabPane } = Tabs;
const { confirm } = Modal;

// Import enhanced formatter that handles large numbers
import { formatLKR, formatLKRExact, formatNumberCompact } from '../../utils/formatLKR';

// Helper to get image URL from different possible data structures
const getImageUrl = (record: any): string => {
  console.log('Getting image URL for record:', record);
  
  // Direct image URL
  if (record.primaryImageUrl) {
    console.log('Using primaryImageUrl:', record.primaryImageUrl);
    return constructImageUrl(record.primaryImageUrl);
  }
  
  // Image array with url property
  if (record.images && record.images.length > 0) {
    // Handle case where image is a string URL directly
    if (typeof record.images[0] === 'string') {
      console.log('Using image array with string URL:', record.images[0]);
      return constructImageUrl(record.images[0]);
    }
    // Handle case where image is an object with url property
    if (record.images[0].url) {
      console.log('Using image array with object.url:', record.images[0].url);
      return constructImageUrl(record.images[0].url);
    }
  }
  
  // Legacy gemPhotos format
  if (record.gemPhotos && record.gemPhotos.length > 0) {
    if (typeof record.gemPhotos[0] === 'string') {
      console.log('Using gemPhotos array with string URL:', record.gemPhotos[0]);
      return constructImageUrl(record.gemPhotos[0]);
    }
    if (record.gemPhotos[0].url) {
      console.log('Using gemPhotos array with object.url:', record.gemPhotos[0].url);
      return constructImageUrl(record.gemPhotos[0].url);
    }
  }
  
  // Direct image property
  if (record.image) {
    console.log('Using direct image property:', record.image);
    return constructImageUrl(record.image);
  }
  
  // Default placeholder
  console.log('No image found, using placeholder');
  return 'https://via.placeholder.com/100?text=No+Image';
};

// Helper to get additional images from different data structures
const getAdditionalImages = (record: any): string[] => {
  if (!record) return [];
  
  console.log('Getting additional images for record:', record);
  
  // Try to get from images array
  if (record.images && Array.isArray(record.images) && record.images.length > 1) {
    // Handle both string arrays and object arrays
    return record.images.slice(1).map((img: any) => {
      if (typeof img === 'string') return img;
      return img.url || '';
    }).filter(Boolean);
  }
  
  // Try to get from gemPhotos array
  if (record.gemPhotos && Array.isArray(record.gemPhotos) && record.gemPhotos.length > 1) {
    // Handle both string arrays and object arrays
    return record.gemPhotos.slice(1).map((img: any) => {
      if (typeof img === 'string') return img;
      return img.url || '';
    }).filter(Boolean);
  }
  
  return [];
};

// Mock data for admin dashboard
const mockUsers = [
  { 
    id: '1', 
    name: 'John Smith', 
    email: 'john@example.com', 
    role: 'buyer', 
    status: 'active', 
    joinDate: '2025-01-15',
    lastActive: '2025-06-10',
    listings: 0,
    transactions: 8
  },
  { 
    id: '2', 
    name: 'Mary Johnson', 
    email: 'mary@example.com', 
    role: 'seller', 
    status: 'active', 
    joinDate: '2025-02-20',
    lastActive: '2025-06-12',
    listings: 12,
    transactions: 10
  },
  { 
    id: '3', 
    name: 'Robert Brown', 
    email: 'robert@example.com', 
    role: 'buyer', 
    status: 'blocked', 
    joinDate: '2025-03-10',
    lastActive: '2025-05-28',
    listings: 0,
    transactions: 3
  }
];

const pendingUsers = [
  { 
    id: '4', 
    name: 'Alice Williams', 
    email: 'alice@example.com', 
    role: 'seller', 
    status: 'pending', 
    joinDate: '2025-06-05',
    lastActive: '2025-06-05',
    listings: 1,
    transactions: 0
  },
  { 
    id: '5', 
    name: 'David Miller', 
    email: 'david@example.com', 
    role: 'buyer', 
    status: 'pending', 
    joinDate: '2025-06-10',
    lastActive: '2025-06-10',
    listings: 0,
    transactions: 0
  }
];

const pendingListings = [
  { 
    id: '1', 
    title: 'Ceylon Blue Sapphire', 
    seller: 'Alice Williams', 
    price: 15000,
    category: 'Sapphire',
    weight: 3.5,
    status: 'pending', 
    submitDate: '2025-06-12',
    image: 'https://images.unsplash.com/photo-1615654771169-65fde4070ade?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: '2', 
    title: 'Pink Padparadscha', 
    seller: 'David Miller', 
    price: 25000,
    category: 'Padparadscha',
    weight: 2.8,
    status: 'pending', 
    submitDate: '2025-06-14',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const pendingMeetings = [
  { 
    id: '1',
    gemstone: 'Emerald Crystal',
    image: 'https://via.placeholder.com/100',
    buyer: 'David Miller',
    seller: 'Alice Williams',
    date: '2025-06-15',
    time: '10:00 AM',
    requestedDate: '2025-06-15',
    requestedTime: '10:00 AM',
    location: 'GemNet Office',
    status: 'pending'
  }
];

const recentTransactions = [
  

  { 
    id: '2',
    gemstone: 'Ruby Gemstone',
    image: 'https://via.placeholder.com/100',
    seller: 'James Wilson',
    buyer: 'Sarah Davis',
    amount: 2800,
    commission: 280,
    date: '2025-06-02',
    status: 'completed'
  }
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isListingModalVisible, setIsListingModalVisible] = useState(false);
  const [isMeetingModalVisible, setIsMeetingModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  
  // Create refs for sections we want to navigate to
  const listingSectionRef = useRef<HTMLDivElement>(null);
  const meetingSectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Real data states
  const [realPendingListings, setRealPendingListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);
  const [listingError, setListingError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalListings, setTotalListings] = useState<number>(0);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  
  // Get admin user display name
  const getAdminDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || 'Admin User';
  };
  
  // Sidebar state and navigation
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Admin sidebar navigation items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={24} /> },
    { id: 'listings', label: 'Listing Management', icon: <Package size={24} /> },
    { id: 'meetings', label: 'Meeting Approvals', icon: <Clock size={24} /> },
    { id: 'feedback', label: 'Submit Feedback', icon: <MessageCircle size={24} /> },
    { id: 'settings', label: 'System Settings', icon: <Settings size={24} /> }
  ];
  
  // Dynamic Statistics State
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalUsers: 125,
    totalListings: 342,
    totalRevenue: 48750,
    commissionRate: 10,
    totalCommission: 4875,
    activeAdvertisements: 1,
    pendingAdvertisements: 0,
    pendingListings: 0,
    approvedListings: 0,
    rejectedListings: 0
  });
  
  // Function to fetch pending listings from API
  const fetchPendingListings = async (page = 0, size = 10) => {
    setLoadingListings(true);
    setListingError(null);
    
    try {
      const response = await api.admin.getPendingListings(page, size);
      
      if (response.success) {
        console.log('Fetched pending listings:', response.data);
        // Debug image structure in the first listing
        if (response.data.listings && response.data.listings.length > 0) {
          const firstListing = response.data.listings[0];
          console.log('First listing image data:', {
            primaryImageUrl: firstListing.primaryImageUrl,
            images: firstListing.images,
            gemPhotos: firstListing.gemPhotos,
            image: firstListing.image,
            completeStructure: firstListing
          });
          
          // Try to extract the image URL and log it
          const imageUrl = getImageUrl(firstListing);
          console.log('Image URL extracted:', imageUrl);
          
          // Check if we're dealing with a nested structure
          if (firstListing.images && firstListing.images.length > 0) {
            console.log('First image in array:', firstListing.images[0]);
          }
        }
        
        setRealPendingListings(response.data.listings || []);
        setCurrentPage(response.data.currentPage);
        setTotalPages(response.data.totalPages);
        setTotalListings(response.data.totalElements);
      } else {
        setListingError(response.message || 'Failed to fetch pending listings');
        message.error('Failed to fetch pending listings');
      }
    } catch (error) {
      console.error('Error fetching pending listings:', error);
      setListingError('An error occurred while fetching pending listings');
      message.error('An error occurred while fetching pending listings');
    } finally {
      setLoadingListings(false);
    }
  };
  
  // Function to fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await api.admin.getDashboardStats();
      
      if (response.success) {
        console.log('Fetched dashboard stats:', response.data);
        setDashboardStats(response.data);
        
        // Update the main stats object for the overview cards
        setStats(prevStats => ({
          ...prevStats,
          pendingApprovals: response.data.pendingApprovals || 0,
          totalUsers: response.data.totalUsers || prevStats.totalUsers,
          totalListings: response.data.totalListings || prevStats.totalListings,
          totalRevenue: response.data.totalRevenue || prevStats.totalRevenue,
          commissionRate: response.data.commissionRate || prevStats.commissionRate,
          totalCommission: response.data.totalCommission || prevStats.totalCommission,
          activeAdvertisements: response.data.activeAdvertisements || prevStats.activeAdvertisements,
          pendingAdvertisements: response.data.pendingAdvertisements || 0,
          pendingListings: response.data.pendingListings || 0,
          approvedListings: response.data.approvedListings || 0,
          rejectedListings: response.data.rejectedListings || 0
        }));
      } else {
        message.error('Failed to fetch dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      message.error('An error occurred while fetching dashboard statistics');
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchPendingListings();
    fetchDashboardStats();
  }, []);
  
  // Function to handle page change
  const handleListingPageChange = (page: number, pageSize?: number) => {
    // API pages are 0-indexed, but Ant Design Table is 1-indexed
    fetchPendingListings(page - 1, pageSize);
  };

  // Function to toggle user status (block/unblock)
  const handleToggleUserStatus = (user: any, active: boolean) => {
    const action = active ? 'unblock' : 'block';
    
    confirm({
      title: `Confirm ${action} user`,
      icon: active ? <UnlockOutlined className="text-green-500" /> : <LockOutlined className="text-red-500" />,
      content: `Are you sure you want to ${action} ${user.name}?`,
      okText: 'Yes',
      okType: active ? 'primary' : 'danger',
      cancelText: 'No',
      onOk() {
        // Here you would typically call your API to update the user's status
        message.success(`User has been ${action}ed successfully`);
      },
    });
  };

  // Function to view user details
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsUserModalVisible(true);
  };
  
  // Function to view a listing's details
  const handleViewListing = async (listing: any) => {
    setSelectedListing(listing);
    setIsListingModalVisible(true);
    
    try {
      const listingId = listing.id || listing._id;
      const response = await api.admin.getListingDetails(listingId);
      
      if (response.success && response.data) {
        // Log the full data structure to help debug image issues
        console.log('Listing details response:', response.data);
        console.log('Image data in listing details:', {
          primaryImageUrl: response.data.primaryImageUrl,
          images: response.data.images,
          mainImageUrl: getImageUrl(response.data),
          additionalImages: getAdditionalImages(response.data)
        });
        
        setSelectedListing(response.data);
      }
    } catch (error) {
      console.error('Error fetching listing details:', error);
      message.error('Could not fetch complete listing details');
    }
  };
  
  // Function to view meeting details
  const handleViewMeeting = (meeting: any) => {
    setSelectedMeeting(meeting);
    setIsMeetingModalVisible(true);
  };
  
  // Function to approve a listing
  const handleApproveListing = (listing: any) => {
    confirm({
      title: 'Approve Listing',
      icon: <CheckCircleOutlined style={{ color: 'green' }} />,
      content: (
        <div>
          <p>Are you sure you want to approve "{listing.gemName || listing.title}" listing by {listing.userName || listing.seller}?</p>
          <Input.TextArea 
            placeholder="Optional comment for the seller"
            rows={3}
            id="admin-approval-comment"
          />
        </div>
      ),
      onOk: async () => {
        const commentEl = document.getElementById('admin-approval-comment') as HTMLTextAreaElement;
        const adminComment = commentEl?.value || '';
        
        try {
          const listingId = listing.id || listing._id;
          const response = await api.admin.updateListingStatus(listingId, 'APPROVED', adminComment);
          
          if (response.success) {
            message.success('Listing approved successfully');
            // Refresh the pending listings
            fetchPendingListings(currentPage);
            // Also refresh stats as the counts have changed
            fetchDashboardStats();
          } else {
            message.error(response.message || 'Failed to approve listing');
          }
        } catch (error) {
          console.error('Error approving listing:', error);
          message.error('An error occurred while approving the listing');
        }
      }
    });
  };
  
  // Function to reject a listing
  const handleRejectListing = (listing: any) => {
    confirm({
      title: 'Reject Listing',
      icon: <CloseOutlined style={{ color: 'red' }} />,
      content: (
        <div>
          <p>Are you sure you want to reject "{listing.gemName || listing.title}" listing by {listing.userName || listing.seller}?</p>
          <p>Please provide a reason for rejection:</p>
          <Input.TextArea 
            placeholder="Reason for rejection (will be visible to the seller)"
            rows={3}
            id="admin-rejection-comment"
            required
          />
        </div>
      ),
      onOk: async () => {
        const commentEl = document.getElementById('admin-rejection-comment') as HTMLTextAreaElement;
        const adminComment = commentEl?.value || '';
        
        if (!adminComment.trim()) {
          message.error('Please provide a reason for rejection');
          return Promise.reject('No rejection reason provided');
        }
        
        try {
          const listingId = listing.id || listing._id;
          const response = await api.admin.updateListingStatus(listingId, 'REJECTED', adminComment);
          
          if (response.success) {
            message.success('Listing rejected successfully');
            // Refresh the pending listings
            fetchPendingListings(currentPage);
            // Also refresh stats as the counts have changed
            fetchDashboardStats();
          } else {
            message.error(response.message || 'Failed to reject listing');
          }
        } catch (error) {
          console.error('Error rejecting listing:', error);
          message.error('An error occurred while rejecting the listing');
        }
      }
    });
  };
  
  // Function to approve a meeting
  const handleApproveMeeting = (meeting: any) => {
    confirm({
      title: 'Approve Meeting',
      icon: <CheckCircleOutlined style={{ color: 'green' }} />,
      content: `Are you sure you want to approve the meeting between ${meeting.buyer} and ${meeting.seller}?`,
      onOk() {
        console.log('Meeting approved:', meeting);
      }
    });
  };
  
  // Function to handle sidebar item click and scroll to appropriate section
  const handleSidebarItemClick = (itemId: string) => {
    // Handle feedback navigation differently - redirect to feedback page
    if (itemId === 'feedback') {
      // Redirect to feedback page
      window.location.href = '/dashboard/feedback';
      return;
    }
    
    setActiveTab(itemId);
    
    // Wait for any state updates to be applied before scrolling
    setTimeout(() => {
      if (itemId === 'listings' && listingSectionRef.current && contentRef.current) {
        contentRef.current.scrollTo({
          top: listingSectionRef.current.offsetTop - 20,
          behavior: 'smooth'
        });
      } else if (itemId === 'meetings' && meetingSectionRef.current && contentRef.current) {
        contentRef.current.scrollTo({
          top: meetingSectionRef.current.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    }, 100);
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
        
        {/* Sidebar */}
        <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed 
            ? 'w-16 sm:w-20' 
            : 'w-64 sm:w-72 fixed sm:relative z-30 sm:z-auto h-full sm:h-auto'
        }`}>
          {/* User Profile */}
          <div className={`border-b border-gray-200 ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`bg-red-100 rounded-full flex items-center justify-center ${
                  sidebarCollapsed ? 'w-8 h-8' : 'w-12 h-12'
                }`}>
                  <Shield className={`text-red-600 ${sidebarCollapsed ? 'w-4 h-4' : 'w-7 h-7'}`} />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-gray-900 truncate">
                      {getAdminDisplayName()}
                    </p>
                    <p className="text-sm text-red-600 font-medium">Administrator</p>
                  </div>
                )}
              </div>
              {/* Collapse/Expand button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 sm:hidden"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <MenuIcon size={18} />
              </button>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hidden sm:block"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <MenuIcon size={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`space-y-2 ${sidebarCollapsed ? 'p-2' : 'p-6'}`}>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSidebarItemClick(item.id)}
                className={`w-full flex items-center rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-red-100 text-red-700'
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

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden ${
          !sidebarCollapsed ? 'sm:ml-0' : ''
        }`}>
          {/* Mobile menu button */}
          <div className="sm:hidden bg-white border-b border-gray-200 p-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <MenuIcon size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div ref={contentRef} className="flex-1 overflow-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl shadow-md relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10" 
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%231e40af\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          }}
        ></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div className="mb-4 md:mb-0">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-2">
              Admin Dashboard
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              System Overview
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-md">
              Manage users, listings, and monitor platform activities
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
              <Badge count={dashboardStats?.pendingListings || 0} overflowCount={99}>
                <Button icon={<Clock size={16} />} onClick={() => setActiveTab('listings')}>
                  Pending Approvals
                </Button>
              </Badge>
              <span className="text-gray-400">|</span>
              <span>Hello, {getAdminDisplayName()}</span>
              <Shield className="text-purple-500" size={20} />
            </div>
        </div>
      </div>

      {/* Statistics  Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #3b82f611 0%, #3b82f622 100%)', borderTop: '4px solid #3b82f6' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100">
                <UserOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Seller/Buyer Ratio</span>
                <span className="text-xs font-medium">40/60</span>
              </div>
              <Progress percent={40} showInfo={false} strokeColor="#3b82f6" trailColor="#e5e7eb" size="small" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #10b98111 0%, #10b98122 100%)', borderTop: '4px solid #10b981' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">{formatLKR(stats.totalRevenue)}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100">
                <DollarOutlined style={{ fontSize: '24px', color: '#10b981' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">
                  System Commission ({stats.commissionRate}%)
                </span>
                <span className="text-xs font-medium text-green-600">
                  {formatLKR(stats.totalCommission)}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #8b5cf611 0%, #8b5cf622 100%)', borderTop: '4px solid #8b5cf6' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Listings</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalListings}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100">
                <FileTextOutlined style={{ fontSize: '24px', color: '#8b5cf6' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Active/Sold Ratio</span>
                <span className="text-xs font-medium">70/30</span>
              </div>
              <Progress percent={70} showInfo={false} strokeColor="#8b5cf6" trailColor="#e5e7eb" size="small" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Pending Approvals */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-700">Pending</h3>
            <div className="bg-orange-100 p-2 rounded-lg">
              <Clock size={20} className="text-orange-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{dashboardStats?.pendingListings || '...'}</p>
            <p className="text-gray-500 text-sm mt-1">Listings awaiting review</p>
          </div>
          <div className="mt-4">
            <Progress 
              percent={dashboardStats?.pendingPercentage || 0} 
              showInfo={false}
              strokeColor="#f59e0b"
              trailColor="#fef3c7"
            />
            <p className="text-xs text-gray-500 mt-1">
              {dashboardStats?.pendingPercentage || 0}% of all listings
            </p>
          </div>
        </div>
        
        {/* Approved */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-700">Approved</h3>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckOutlined style={{ fontSize: '20px', color: '#10b981' }} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{dashboardStats?.approvedListings || '...'}</p>
            <p className="text-gray-500 text-sm mt-1">Listings approved by admin</p>
          </div>
          <div className="mt-4">
            <Progress 
              percent={dashboardStats?.approvedPercentage || 0} 
              showInfo={false} 
              strokeColor="#10b981"
              trailColor="#d1fae5"
            />
            <p className="text-xs text-gray-500 mt-1">
              {dashboardStats?.approvedPercentage || 0}% of all listings
            </p>
          </div>
        </div>
        
        {/* Rejected */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-700">Rejected</h3>
            <div className="bg-red-100 p-2 rounded-lg">
              <CloseOutlined style={{ fontSize: '20px', color: '#ef4444' }} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{dashboardStats?.rejectedListings || '...'}</p>
            <p className="text-gray-500 text-sm mt-1">Listings rejected by admin</p>
          </div>
          <div className="mt-4">
            <Progress 
              percent={dashboardStats?.rejectedPercentage || 0} 
              showInfo={false} 
              strokeColor="#ef4444"
              trailColor="#fee2e2"
            />
            <p className="text-xs text-gray-500 mt-1">
              {dashboardStats?.rejectedPercentage || 0}% of all listings
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Tabbed Interface */}
      <Card className="mb-6 shadow-md rounded-xl overflow-hidden">
        <Tabs 
          defaultActiveKey="approvals"
          type="card"
          className="custom-tabs"
          size="large"
          animated={{ inkBar: true, tabPane: true }}
          tabBarStyle={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '0 16px' }}
        >          
          <TabPane 
            tab={<span className="flex items-center px-1"><DollarOutlined className="mr-2" /> Recent Transactions</span>} 
            key="transactions"
          >            <Table 
              dataSource={recentTransactions}
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  title: 'Gemstone',
                  key: 'gemstone',
                  render: (_, record) => (
                    <div className="flex items-center space-x-3">
                      <img 
                        src={record.image} 
                        alt={record.gemstone}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <span className="font-medium">{record.gemstone}</span>
                    </div>
                  ),
                },
                {
                  title: 'Buyer',
                  dataIndex: 'buyer',
                  key: 'buyer',
                },
                {
                  title: 'Seller',
                  dataIndex: 'seller',
                  key: 'seller',
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: amount => formatLKR(amount)
                },
                {                  title: 'Commission',
                  dataIndex: 'commission',
                  key: 'commission',
                  render: commission => formatLKR(commission)
                },
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                  render: date => dayjs(date).format('MMM DD, YYYY')
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const statusColors: Record<string, string> = {
                      completed: 'green',
                      pending: 'gold',
                      cancelled: 'red'
                    };
                    return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
                  }
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: () => (
                    <Button size="small" icon={<EyeOutlined />}>
                      Details
                    </Button>
                  )
                }
              ]}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane 
            tab={<span className="flex items-center px-1"><Clock size={18} className="mr-2" /> Meeting Management</span>} 
            key="meetings"
          >
            <AdminMeetingDashboard />
          </TabPane>
        </Tabs>
      </Card>      {/* User Details Modal */}
      <Modal
        visible={isUserModalVisible}
        title="User Details"
        onCancel={() => setIsUserModalVisible(false)}
        footer={[
          selectedUser?.status === 'active' ? (
            <Button 
              key="block" 
              danger 
              icon={<LockOutlined />}
              onClick={() => handleToggleUserStatus(selectedUser, false)}
            >
              Block User
            </Button>
          ) : (
            <Button 
              key="unblock" 
              type="primary" 
              icon={<UnlockOutlined />}
              onClick={() => handleToggleUserStatus(selectedUser, true)}
            >
              Unblock User
            </Button>
          )
        ]}
        width={600}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
                <Tag color={selectedUser.status === 'active' ? 'success' : 'error'}>
                  {selectedUser.status.toUpperCase()}
                </Tag>
              </div>
              
              <Divider />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">
                    <Tag color={selectedUser.role === 'seller' ? 'purple' : 'blue'}>
                      {selectedUser.role.toUpperCase()}
                    </Tag>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Active</p>
                  <p className="font-medium">{dayjs(selectedUser.lastActive).format('MMMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Listings</p>
                  <p className="font-medium">{selectedUser.listings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="font-medium">{selectedUser.transactions}</p>
                </div>
              </div>
            </div>
            
            {selectedUser.status === 'blocked' && (
              <Alert
                message="User Account Blocked"
                description="This user's account is currently blocked and they cannot access the platform."
                type="error"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>

      {/* Listing Details Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <Package className="mr-2" size={20} />
            <span>Gemstone Listing Details</span>
          </div>
        }
        visible={isListingModalVisible}
        onCancel={() => setIsListingModalVisible(false)}
        width={700}
        footer={[
          <Button key="back" onClick={() => setIsListingModalVisible(false)}>
            Close
          </Button>,
          <Button key="reject" danger onClick={() => {
            setIsListingModalVisible(false);
            handleRejectListing(selectedListing);
          }}>
            Reject
          </Button>,
          <Button key="approve" type="primary" onClick={() => {
            setIsListingModalVisible(false);
            handleApproveListing(selectedListing);
          }}>
            Approve
          </Button>
        ]}
      >
        {selectedListing && (
          <div>
            <Row gutter={24}>
              <Col span={8}>
                <div className="bg-purple-50 rounded-lg overflow-hidden" style={{ height: '200px' }}>
                  <img
                    src={getImageUrl(selectedListing)}
                    alt={selectedListing.gemName || selectedListing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Modal image failed to load:', getImageUrl(selectedListing));
                      console.error('Selected listing data:', selectedListing);
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>                  <div className="mt-4">
                  <h4 className="font-medium mb-2">Additional Photos:</h4>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {getAdditionalImages(selectedListing).map((imageUrl, index) => (
                      <div key={index} className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={imageUrl} 
                          alt={`Additional photo ${index+1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {getAdditionalImages(selectedListing).length === 0 && (
                      <div className="text-gray-400">No additional photos</div>
                    )}
                  </div>
                </div>
              </Col>
              <Col span={16}>
                <h2 className="text-xl font-semibold">
                  {selectedListing.gemName || selectedListing.title}
                </h2>
                <div className="flex items-center mt-1 mb-4">
                  <Tag color="blue">{selectedListing.category || selectedListing.gemType || 'Gemstone'}</Tag>
                  <Tag color="purple">
                    Weight: {selectedListing.weight || selectedListing.caratWeight || 'N/A'} carats
                  </Tag>
                  <Tag color="cyan">
                    {selectedListing.shape || selectedListing.gemShape || 'Shape N/A'}
                  </Tag>
                </div>
                
                <Divider orientation="left">Details</Divider>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <div className="text-gray-500">Price:</div>
                    <div className="font-medium">{formatLKR(selectedListing.price)}</div>
                  </Col>
                  <Col span={12}>
                    <div className="text-gray-500">Seller:</div>
                    <div className="font-medium">{selectedListing.userName || selectedListing.seller}</div>
                  </Col>
                  <Col span={12}>
                    <div className="text-gray-500">Submitted On:</div>
                    <div>{dayjs(selectedListing.createdAt || selectedListing.submitDate).format('MMMM DD, YYYY')}</div>
                  </Col>
                  <Col span={12}>
                    <div className="text-gray-500">Status:</div>
                    <Tag color={
                      selectedListing.listingStatus === 'PENDING' || selectedListing.status === 'pending' ? 'orange' :
                      selectedListing.listingStatus === 'APPROVED' || selectedListing.status === 'approved' ? 'green' :
                      'red'
                    }>
                      {selectedListing.listingStatus || selectedListing.status}
                    </Tag>
                  </Col>
                </Row>
                
                <Divider orientation="left">Gemstone Attributes</Divider>
                <Row gutter={[16, 8]}>
                  {selectedListing.color && (
                    <Col span={12}>
                      <div className="text-gray-500">Color:</div>
                      <div>{selectedListing.color}</div>
                    </Col>
                  )}
                  {selectedListing.clarity && (
                    <Col span={12}>
                      <div className="text-gray-500">Clarity:</div>
                      <div>{selectedListing.clarity}</div>
                    </Col>
                  )}
                  {selectedListing.cut && (
                    <Col span={12}>
                      <div className="text-gray-500">Cut:</div>
                      <div>{selectedListing.cut}</div>
                    </Col>
                  )}
                  {selectedListing.treatment && (
                    <Col span={12}>
                      <div className="text-gray-500">Treatment:</div>
                      <div>{selectedListing.treatment}</div>
                    </Col>
                  )}
                  {selectedListing.origin && (
                    <Col span={12}>
                      <div className="text-gray-500">Origin:</div>
                      <div>{selectedListing.origin}</div>
                    </Col>
                  )}
                </Row>
                
                {selectedListing.description && (
                  <>
                    <Divider orientation="left">Description</Divider>
                    <p>{selectedListing.description}</p>
                  </>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Meeting Details Modal */}
      <Modal
        visible={isMeetingModalVisible}
        title="Meeting Request Details"
        onCancel={() => setIsMeetingModalVisible(false)}
        footer={[
          <Button key="reject" danger>
            Reject
          </Button>,
          <Button key="approve" type="primary" onClick={() => handleApproveMeeting(selectedMeeting)}>
            Approve
          </Button>
        ]}
        width={600}
      >
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  src={selectedMeeting.image} 
                  alt={selectedMeeting.gemstone}
                  className="w-16 h-16 object-cover rounded-lg mr-4"
                />
                <div>
                  <h3 className="text-xl font-bold">{selectedMeeting.gemstone}</h3>
                  <p className="text-gray-600">Transaction ID: #M{selectedMeeting.id}2023</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Buyer</p>
                  <p className="font-medium">{selectedMeeting.buyer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-medium">{selectedMeeting.seller}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested Date</p>
                  <p className="font-medium">{dayjs(selectedMeeting.requestedDate).format('MMMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested Time</p>
                  <p className="font-medium">{selectedMeeting.requestedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedMeeting.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Tag color="gold">{selectedMeeting.status.toUpperCase()}</Tag>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Admin Notes:</h4>
              <Input.TextArea rows={3} placeholder="Add notes for this meeting..." />
            </div>
          </div>
        )}
      </Modal>
          </div>
        </div>
      </div>
    </RoleAwareDashboardLayout>
  );
};

export default AdminDashboard;

// Helper to construct proper image URL (handle relative paths)
const constructImageUrl = (imagePath: string): string => {
  if (!imagePath) return 'https://via.placeholder.com/100?text=No+Image';
  
  // If it's already a complete URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a relative path, construct the full URL
  const baseUrl = 'http://localhost:9092'; // Backend server URL
  
  // Handle paths that start with /
  if (imagePath.startsWith('/')) {
    return `${baseUrl}${imagePath}`;
  }
  
  // Handle paths that don't start with /
  return `${baseUrl}/${imagePath}`;
};
