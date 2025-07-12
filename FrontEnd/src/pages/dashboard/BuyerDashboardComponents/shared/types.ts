export interface Advertisement {
  id: string;
  title: string;
  category: string;
  description: string;
  price: string;
  mobileNo: string;
  email: string;
  images: string[];
  approved: string | boolean | null | undefined; // Now supports both string and boolean for backward compatibility
  userId: string;
  createdOn: string;
  modifiedOn: string;
  // UI-specific fields
  status?: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected';
  dateCreated?: string;
  views?: number;
  inquiries?: number;
}

export interface AdvertisementFormData {
  title: string;
  category: string;
  description: string;
  price: string;
  mobileNo: string;
  email: string;
  images: File[]; // Changed to File[] for actual file uploads
}

export interface Stats {
  myAdvertisements: number;
  activeBids: number;
  totalPurchases: number;
  totalSpent: number;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const CATEGORIES = [
  'Sapphires',
  'Rubies',
  'Cats Eye Chrysoberyl',
  'Garnets',
  'Tourmalines',
  'Spinels',
  'Moonstone',
  'Zircons',
  'Topaz',
  'Beryl',
  'Quartz varieties',
  'Padparadscha Sapphire',
  'Ceylon Sapphire',
  'Star Sapphires and Star Rubies',
] as const;

export type Category = typeof CATEGORIES[number];
