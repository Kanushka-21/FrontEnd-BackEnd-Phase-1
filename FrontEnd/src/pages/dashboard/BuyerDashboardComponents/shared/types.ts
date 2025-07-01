export interface Advertisement {
  id: number;
  title: string;
  category: string;
  description: string;
  price: string;
  contactInfo: string;
  images: string[];
  status: 'Draft' | 'Pending Review' | 'Approved' | 'Rejected';
  dateCreated: string;
  views: number;
  inquiries: number;
}

export interface FormData {
  title: string;
  category: string;
  description: string;
  price: string;
  contactInfo: string;
  images: string[];
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
  'Electronics',
  'Vehicles',
  'Property',
  'Furniture',
  'Clothing',
  'Books',
  'Sports',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];
