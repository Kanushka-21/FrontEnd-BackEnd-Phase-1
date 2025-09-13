export * from './types';
export { default as StatsCard } from './StatsCard';

// Import enhanced formatter that handles large numbers
export { formatLKR, formatLKRExact, formatNumberCompact } from '../../../../utils/formatLKR';

// Mock stats data for seller dashboard
export const mockStats = {
  activeListings: 12,
  pendingReview: 3,
  totalBids: 28,
  upcomingMeetings: 5,
  totalRevenue: 2450000,
  averageRating: 4.8,
};

// Mock listings data for seller dashboard
export const mockListings = [
  {
    id: '1',
    name: 'Blue Sapphire - Ceylon',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop&crop=center',
    price: 450000,
    status: 'active' as const,
    bids: 8,
    views: 125,
    createdAt: '2024-01-15',
    category: 'sapphire',
    description: 'Beautiful Ceylon Blue Sapphire with excellent clarity',
    isCertified: true
  },
  {
    id: '2',
    name: 'Ruby - Pigeon Blood',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&h=100&fit=crop&crop=center',
    price: 750000,
    status: 'pending' as const,
    bids: 3,
    views: 89,
    createdAt: '2024-01-20',
    category: 'ruby',
    description: 'Rare Pigeon Blood Ruby from Myanmar',
    isCertified: true
  },
  {
    id: '3',
    name: 'Emerald - Colombian',
    image: 'https://images.unsplash.com/photo-1608113165045-8c0ff3c7bb9b?w=100&h=100&fit=crop&crop=center',
    price: 320000,
    status: 'sold' as const,
    bids: 15,
    views: 234,
    createdAt: '2024-01-10',
    category: 'emerald',
    description: 'High quality Colombian Emerald',
    isCertified: false
  },
  {
    id: '4',
    name: 'Yellow Sapphire',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&h=100&fit=crop&crop=center',
    price: 180000,
    status: 'active' as const,
    bids: 5,
    views: 67,
    createdAt: '2024-01-25',
    category: 'sapphire',
    description: 'Natural Yellow Sapphire with good clarity',
    isCertified: false
  },
  {
    id: '5',
    name: 'Padparadscha Sapphire',
    image: 'https://images.unsplash.com/photo-1631540029229-6f3b3bbfa3e6?w=100&h=100&fit=crop&crop=center',
    price: 980000,
    status: 'active' as const,
    bids: 12,
    views: 189,
    createdAt: '2024-01-18',
    category: 'sapphire',
    description: 'Rare Padparadscha Sapphire with perfect color',
    isCertified: true
  }
];

// Mock meetings data for seller dashboard
export const mockMeetings = [
  {
    id: '1',
    gemstone: 'Blue Sapphire - Ceylon',
    image: 'https://via.placeholder.com/50',
    buyer: 'John Anderson',
    date: '2024-01-30',
    time: '14:00',
    location: 'Gem Palace, Colombo',
    status: 'scheduled' as const
  },
  {
    id: '2',
    gemstone: 'Ruby - Pigeon Blood',
    image: 'https://via.placeholder.com/50',
    buyer: 'Sarah Johnson',
    date: '2024-02-01',
    time: '10:30',
    location: 'Trade Center, Kandy',
    status: 'scheduled' as const
  },
  {
    id: '3',
    gemstone: 'Emerald - Colombian',
    image: 'https://via.placeholder.com/50',
    buyer: 'David Wilson',
    date: '2024-01-20',
    time: '16:00',
    location: 'Hotel Hilton, Colombo',
    status: 'completed' as const
  }
];
