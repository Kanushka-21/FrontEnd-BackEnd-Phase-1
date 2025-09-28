export interface GemImage {
  imageId?: string;
  originalName?: string;
  contentType?: string;
  size?: number;
  imageUrl?: string;
  videoUrl?: string; // For video files
  thumbnailUrl?: string;
  isPrimary?: boolean;
  displayOrder?: number;
  description?: string;
  imageType?: string; // "GEMSTONE" or "CERTIFICATE"
  mediaType: 'IMAGE' | 'VIDEO';
  videoThumbnailUrl?: string;
  videoDurationSeconds?: number;
  videoFormat?: string;
}

export interface GemListing {
  id: string;
  name: string;
  image: string;
  images?: GemImage[]; // Support for both images and videos
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

// Enhanced Bid interface for dynamic API data
export interface EnhancedBid {
  bidId: string;
  listingId: string;
  bidAmount: number;
  currency: string;
  bidTime: string;
  status: string;
  message?: string;
  bidderName: string;
  bidderEmail: string;
  gemName: string;
  gemSpecies: string;
  listingPrice: number;
  images: string[];
  biddingActive: boolean;
  biddingEndTime: string;
  remainingTimeSeconds: number;
  currentHighestBid: number;
  isCurrentlyWinning: boolean;
  currentHighestBidder?: string;
  totalBidsForListing: number;
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
  notificationCount?: number;
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