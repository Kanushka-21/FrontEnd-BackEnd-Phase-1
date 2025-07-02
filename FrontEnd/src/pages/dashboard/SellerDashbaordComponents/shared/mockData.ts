import { GemListing, Bid, Meeting, SellerStats } from './types';

export const mockListings: GemListing[] = [
  { 
    id: '1', 
    name: 'Blue Sapphire', 
    image: 'https://via.placeholder.com/100', 
    price: 2500, 
    status: 'active', 
    bids: 5,
    createdAt: '2025-05-15',
    views: 48,
    category: 'sapphire',
    description: 'Beautiful blue sapphire with excellent clarity',
    isCertified: true
  },
  { 
    id: '2', 
    name: 'Ruby', 
    image: 'https://via.placeholder.com/100', 
    price: 3750, 
    status: 'active', 
    bids: 3,
    createdAt: '2025-05-28',
    views: 32,
    category: 'ruby',
    description: 'High-quality ruby with rich red color',
    isCertified: false
  },  { 
    id: '3', 
    name: 'Emerald', 
    image: 'https://via.placeholder.com/100', 
    price: 1850, 
    status: 'pending', 
    bids: 0,
    createdAt: '2025-06-10',
    views: 15,
    category: 'emerald',
    description: 'Natural emerald with good transparency',
    isCertified: true
  },
  { 
    id: '4', 
    name: 'Diamond', 
    image: 'https://via.placeholder.com/100', 
    price: 5200, 
    status: 'sold', 
    bids: 7,
    createdAt: '2025-05-05',
    views: 76,
    category: 'diamond',
    description: 'Brilliant cut diamond with excellent clarity',
    isCertified: true
  }
];

export const mockBids: Bid[] = [
  { 
    id: '1',
    gemstone: 'Blue Sapphire',
    image: 'https://via.placeholder.com/100',
    buyer: 'John Doe',
    amount: 2400,
    date: '2025-06-15',
    status: 'pending'
  },  { 
    id: '2',
    gemstone: 'Ruby',
    image: 'https://via.placeholder.com/100',
    buyer: 'Alice Smith',
    amount: 3500,
    date: '2025-06-14',
    status: 'accepted'
  },
  { 
    id: '3',
    gemstone: 'Blue Sapphire',
    image: 'https://via.placeholder.com/100',
    buyer: 'Robert Johnson',
    amount: 2300,
    date: '2025-06-13',
    status: 'rejected'
  }
];

export const mockMeetings: Meeting[] = [
  { 
    id: '1',
    gemstone: 'Ruby',
    image: 'https://via.placeholder.com/100',
    buyer: 'Alice Smith',
    date: '2025-06-25',
    time: '10:30 AM',
    location: 'GemNet Office, New York',
    status: 'scheduled'
  },
  { 
    id: '2',    gemstone: 'Diamond',
    image: 'https://via.placeholder.com/100',
    buyer: 'Michael Brown',
    date: '2025-06-28',
    time: '2:00 PM',
    location: 'Virtual Meeting',
    status: 'scheduled'
  }
];

export const mockStats: SellerStats = {
  activeListings: 3,
  pendingReview: 1,
  totalBids: 8,
  upcomingMeetings: 2,
  totalRevenue: 12500,
  averageRating: 4.7
};

// Helper function to format price in LKR
export const formatLKR = (price: number) => {
  return new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};