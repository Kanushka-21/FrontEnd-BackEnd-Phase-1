export interface GemListing {
  id: string;
  name: string;
  image: string;
  images?: string[]; // Multiple images support
  price: number;
  status: 'active' | 'pending' | 'sold' | 'rejected';
  bids: number;
  views: number;
  createdAt: string;
  category?: string;
  description?: string;
  attributes?: any;
  isCertified?: boolean;
  
  // Extended gemstone properties
  weight?: number;
  color?: string;
  species?: string;
  variety?: string;
  shape?: string;
  cut?: string;
  clarity?: string;
  measurements?: string;
  treatment?: string;
  origin?: string;
  transparency?: string;
  refractiveIndex?: string;
  specificGravity?: string;
}

export interface Bid {
  id: string;
  gemstone: string;
  image: string;
  buyer: string;
  amount: number;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Meeting {
  id: string;
  gemstone: string;
  image: string;
  buyer: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface SellerStats {
  activeListings: number;
  pendingReview: number;
  totalBids: number;
  upcomingMeetings: number;
  totalRevenue: number;
  averageRating: number;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface FormData {
  name: string;
  category: string;
  description: string;
  price: number;
  attributes: any;
  images: any[];
  certificateFile?: any;
  isCertified: boolean;
}

export const GEM_CATEGORIES = [
  'sapphire',
  'ruby', 
  'emerald',
  'diamond',
  'other'
] as const;

export type GemCategory = typeof GEM_CATEGORIES[number];

export const BID_STATUS_COLORS: Record<string, string> = {
  pending: 'gold',
  accepted: 'green', 
  rejected: 'red'
};

export const LISTING_STATUS_COLORS: Record<string, string> = {
  active: 'blue',
  pending: 'gold',
  sold: 'green', 
  rejected: 'red'
};

export const MEETING_STATUS_COLORS: Record<string, string> = {
  scheduled: 'blue',
  completed: 'green',
  cancelled: 'red'
};