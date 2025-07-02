# Seller Dashboard Components

This directory contains modular components for the Seller Dashboard, organized similar to the Buyer Dashboard structure.

## Structure

```
SellerDashbaordComponents/
├── shared/
│   ├── types.ts          # TypeScript interfaces and types
│   ├── mockData.ts       # Mock data for development
│   ├── StatsCard.tsx     # Reusable stats card component
│   └── index.ts          # Shared exports
├── Overview.tsx          # Dashboard overview with stats
├── Listings.tsx          # List Items section with table and form
├── Bids.tsx              # Bids management
├── Meetings.tsx          # Meetings schedule
├── Profile.tsx           # Seller profile management
└── index.ts              # Main component exports
```

## Components

### Overview
- Dashboard overview with statistics cards
- Welcome message and quick stats

### Listings (List Items)
- **Main feature**: Table showing all gemstone listings
- **Plus icon**: Opens a drawer with NewGemListingForm
- **Actions**: View, Edit, Delete listings
- **Drawer**: Full-screen form with close icon in top-right corner

### Bids
- Table showing all bids received
- Actions to accept/reject bids
- Modal confirmations for bid actions

### Meetings
- Table showing scheduled meetings
- Integration with accepted bids

### Profile
- Seller profile information
- Settings and preferences

## Key Features

### List Items Section
- **Table**: Displays all gemstone listings with status, bids, views
- **Add New Button**: Plus icon opens a drawer
- **Form**: Uses existing NewGemListingForm component
- **Close Icon**: Top-right corner of drawer (similar to advertisement creation)
- **Status Colors**: Visual indicators for listing status

### Form Integration
- Uses existing gem model from NewGemListingForm
- Maintains all certification and attribute features
- Drawer layout for better user experience

## Usage

```tsx
import { Overview, Listings, Bids, Meetings, Profile } from './SellerDashbaordComponents';

// In your main dashboard component
const renderContent = () => {
  switch (activeTab) {
    case 'overview':
      return <Overview user={user} onTabChange={setActiveTab} />;
    case 'listings':
      return <Listings user={user} />;
    // ... other cases
  }
};
```

## Data Flow

1. **Mock Data**: Development data in `shared/mockData.ts`
2. **Types**: All interfaces in `shared/types.ts`
3. **State Management**: Local state in each component
4. **API Integration**: Ready for backend integration

## Responsive Design

All components are built with responsive design:
- Tables scroll horizontally on mobile
- Forms adapt to different screen sizes
- Sidebar collapses on smaller screens

## Future Enhancements

- Real API integration
- Advanced filtering and search
- Bulk operations
- Export functionality
- Real-time notifications
