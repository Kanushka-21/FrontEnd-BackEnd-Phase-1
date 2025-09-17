import { User, Transaction, Meeting, Advertisement, AdminStats } from './types';

// Mock users data
export const mockUsers: User[] = [
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

// Pending users data
export const pendingUsers: User[] = [
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

// Pending meetings data
export const pendingMeetings: Meeting[] = [
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

// Mock advertisements data (updated to match API structure)
export const mockAdvertisements: Advertisement[] = [
  {
    id: '1',
    title: 'Premium Sapphire Collection',
    category: 'Blue Sapphire',
    description: 'High quality blue sapphires from Sri Lanka',
    price: '50000',
    mobileNo: '0771234567',
    email: 'blugem@example.com',
    userId: 'user123',
    images: ['https://via.placeholder.com/300'],
    approved: 'approved',
    createdOn: '2025-06-01T10:00:00.000Z',
    modifiedOn: '2025-06-01T10:00:00.000Z',
    validForSave: true,
    // Computed fields
    status: 'approved',
    advertiser: 'Blue Gem Co.',
    type: 'banner',
    budget: 50000,
    spent: 32000,
    clicks: 1250,
    impressions: 25000,
    location: 'homepage-banner'
  },
  {
    id: '2',
    title: 'Ruby Specialists',
    category: 'Ruby',
    description: 'Certified ruby gemstones',
    price: '30000',
    mobileNo: '0779876543',
    email: 'redstone@example.com',
    userId: 'user456',
    images: ['https://via.placeholder.com/300'],
    approved: 'pending',
    createdOn: '2025-06-15T10:00:00.000Z',
    modifiedOn: '2025-06-15T10:00:00.000Z',
    validForSave: true,
    // Computed fields
    status: 'pending',
    advertiser: 'Red Stone Ltd.',
    type: 'sidebar',
    budget: 30000,
    spent: 0,
    clicks: 0,
    impressions: 0,
    location: 'sidebar'
  }
];

// Recent transactions data
export const recentTransactions: Transaction[] = [
  { 
    id: '1',
    gemstone: 'Ruby Gemstone',
    image: 'https://via.placeholder.com/100',
    seller: 'James Wilson',
    buyer: 'Sarah Davis',
    amount: 2800,
    commission: 280,
    date: '2025-06-02',
    status: 'completed'
  },
  { 
    id: '2',
    gemstone: 'Emerald Stone',
    image: 'https://via.placeholder.com/100',
    seller: 'Mary Johnson',
    buyer: 'John Smith',
    amount: 3500,
    commission: 350,
    date: '2025-06-01',
    status: 'completed'
  }
];

// Import enhanced formatter that handles large numbers
export { formatLKR, formatLKRExact, formatNumberCompact } from '../../../../utils/formatLKR';

// Helper function to map approval status to display status
export const mapApprovalToStatus = (approved: boolean | string | null | undefined): 'approved' | 'pending' | 'rejected' => {
  if (approved === true || approved === 'approved') return 'approved';
  if (approved === false || approved === 'rejected') return 'rejected';
  if (approved === 'pending') return 'pending';
  return 'pending'; // Default to pending for null/undefined
};

// Helper function to get advertiser name from email
export const getAdvertiserFromEmail = (email: string): string => {
  return email ? email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown Advertiser';
};

// Helper function to safely parse price
export const parsePrice = (price: string | number): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Generate statistics
export const generateStats = (): AdminStats => {
  return {
    pendingApprovals: pendingUsers.length + pendingMeetings.length,
    totalUsers: 125,
    totalListings: 342,
    totalRevenue: 48750,
    commissionRate: 10,
    totalCommission: 4875,
    activeAdvertisements: mockAdvertisements.filter(ad => ad.approved === 'approved').length,
    pendingAdvertisements: mockAdvertisements.filter(ad => ad.approved === 'pending' || ad.approved === null || ad.approved === undefined).length
  };
};
