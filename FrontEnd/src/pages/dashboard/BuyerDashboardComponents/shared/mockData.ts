import { Advertisement, Stats } from './types';

export const MOCK_STATS: Stats = {
  myAdvertisements: 12,
  activeBids: 3,
  totalPurchases: 8,
  totalSpent: 2500000 // LKR
};

export const MOCK_ADVERTISEMENTS: Advertisement[] = [
  {
    id: '1',
    title: 'iPhone 14 Pro Max - Excellent Condition',
    category: 'Electronics',
    description: 'Brand new iPhone 14 Pro Max, 256GB, Deep Purple color. Complete with box and accessories.',
    price: 'LKR 450,000',
    mobileNo: '0777875691',
    email: 'seller1@example.com',
    images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=60&h=60&fit=crop'],
    approved: true,
    userId: 'user1',
    createdOn: '2024-01-15T10:00:00.000Z',
    modifiedOn: '2024-01-15T10:00:00.000Z',
    status: 'Approved',
    dateCreated: '1/15/2024',
    views: 245,
    inquiries: 12
  },
  {
    id: '2',
    title: 'Toyota Corolla 2020 - Low Mileage',
    category: 'Vehicles',
    description: 'Well-maintained Toyota Corolla 2020 with low mileage. Single owner, full service history.',
    price: 'LKR 6,500,000',
    mobileNo: '0777875692',
    email: 'seller2@example.com',
    images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=60&h=60&fit=crop'],
    approved: false,
    userId: 'user2',
    createdOn: '2024-01-14T10:00:00.000Z',
    modifiedOn: '2024-01-14T10:00:00.000Z',
    status: 'Pending Review',
    dateCreated: '1/14/2024',
    views: 89,
    inquiries: 5
  },
  {
    id: '3',
    title: 'Apartment for Rent - Colombo 03',
    category: 'Property',
    description: '2 bedroom apartment in prime location. Fully furnished with modern amenities.',
    price: 'LKR 75,000',
    mobileNo: '0777875693',
    email: 'seller3@example.com',
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=60&h=60&fit=crop'],
    approved: false,
    userId: 'user3',
    createdOn: '2024-01-13T10:00:00.000Z',
    modifiedOn: '2024-01-13T10:00:00.000Z',
    status: 'Draft',
    dateCreated: '1/13/2024',
    views: 0,
    inquiries: 0
  }
];

// Import enhanced formatter that handles large numbers
export { formatLKR, formatLKRExact, formatNumberCompact } from '../../../../utils/formatLKR';
