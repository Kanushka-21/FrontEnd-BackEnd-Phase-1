import React from 'react';

// Sidebar item interface
export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

// User interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  status: 'active' | 'blocked' | 'pending';
  joinDate: string;
  lastActive: string;
  listings: number;
  transactions: number;
}

// Transaction interface
export interface Transaction {
  id: string;
  gemstone: string;
  image: string;
  seller: string;
  buyer: string;
  amount: number;
  commission: number;
  date: string;
  status: 'completed' | 'pending' | 'cancelled';
}

// Meeting interface
export interface Meeting {
  id: string;
  gemstone: string;
  image: string;
  buyer: string;
  seller: string;
  date: string;
  time: string;
  requestedDate: string;
  requestedTime: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Advertisement interface based on actual API response
export interface Advertisement {
  id: string;
  title: string;
  category: string; // Gemstone category like "Cats Eye Chrysoberyl"
  description: string;
  price: string; // Price as string from API
  mobileNo: string;
  email: string;
  userId: string;
  images: string[]; // Array of image URLs
  approved: string | boolean | null | undefined; // Now supports both string and boolean for backward compatibility
  createdOn: string; // ISO date string
  modifiedOn: string; // ISO date string
  validForSave: boolean;
  // Computed fields for display
  status?: 'approved' | 'pending' | 'rejected';
  advertiser?: string; // Derived from email or user info
  type?: string; // Advertisement type for display
  startDate?: string;
  endDate?: string;
  budget?: number;
  spent?: number;
  clicks?: number;
  impressions?: number;
  location?: string;
}

// Statistics interface
export interface AdminStats {
  pendingApprovals: number;
  totalUsers: number;
  totalListings: number;
  totalRevenue: number;
  commissionRate: number;
  totalCommission: number;
  activeAdvertisements: number;
  pendingAdvertisements: number;
}

// Component props interfaces
export interface AdminComponentProps {
  user?: any;
  onTabChange?: (tab: string) => void;
}

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

// Modal states
export interface ModalState {
  isUserModalVisible: boolean;
  isListingModalVisible: boolean;
  isMeetingModalVisible: boolean;
  isAdvertisementModalVisible: boolean;
  selectedUser: User | null;
  selectedListing: any | null;
  selectedMeeting: Meeting | null;
  selectedAdvertisement: Advertisement | null;
}

// Action handlers
export interface ActionHandlers {
  handleViewUser: (user: User) => void;
  handleViewListing: (listing: any) => void;
  handleViewMeeting: (meeting: Meeting) => void;
  handleViewAdvertisement: (advertisement: Advertisement) => void;
  handleToggleUserStatus: (user: User, active: boolean) => void;
  handleApproveUser: (user: User) => void;
  handleRejectUser: (user: User) => void;
  handleApproveListing: (listing: any) => void;
  handleApproveMeeting: (meeting: Meeting) => void;
  handleToggleAdvertisementStatus: (advertisement: Advertisement, status: string) => void;
}
