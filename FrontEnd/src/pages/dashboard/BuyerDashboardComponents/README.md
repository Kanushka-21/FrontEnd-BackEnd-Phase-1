# Buyer Dashboard Components

This directory contains the modularized components for the Buyer Dashboard, breaking down the previously large monolithic file into smaller, maintainable pieces.

## Directory Structure

```
BuyerDashboardComponents/
├── index.ts                 # Main exports for all components
├── Overview.tsx            # Dashboard overview with stats and recent items
├── Advertisements.tsx      # Advertisement management (create, edit, list)
├── Purchases.tsx          # Purchase history and tracking
├── Bids.tsx               # Bid management and tracking
├── Searches.tsx           # Saved searches with notifications
├── Profile.tsx            # User profile management
├── shared/                # Shared utilities and components
│   ├── index.ts           # Shared exports
│   ├── types.ts           # TypeScript interfaces and types
│   ├── mockData.ts        # Mock data for development
│   └── StatsCard.tsx      # Reusable statistics card component
└── README.md              # This documentation file
```

## Components Overview

### 1. Overview (Overview.tsx)
- Welcome header with user information
- Statistics cards showing key metrics
- Latest advertisements table
- Navigation to other sections

### 2. Advertisements (Advertisements.tsx)
- Complete advertisement management system
- Create new advertisements with form validation
- Edit existing advertisements
- List all advertisements with status tracking
- Image upload and management
- Status indicators (Draft, Pending Review, Approved)

### 3. Purchases (Purchases.tsx)
- Purchase history display
- Order tracking and status
- Seller rating functionality
- Purchase details and receipts

### 4. Bids (Bids.tsx)
- Active bid tracking
- Bid history and status
- Bid withdrawal functionality
- Real-time bid updates

### 5. Searches (Searches.tsx)
- Save frequently used search queries
- Search notifications and alerts
- Category and price range filtering
- Search result tracking

### 6. Profile (Profile.tsx)
- User profile editing
- Account verification status
- Personal information management
- Account statistics and achievements

## Shared Components and Utilities

### StatsCard.tsx
Reusable component for displaying statistics with icons and change indicators.

### types.ts
TypeScript interfaces for:
- Advertisement data structure
- Form data types
- Statistics interface
- Sidebar navigation items

### mockData.ts
Development data including:
- Sample advertisements
- Statistics data
- Utility functions (formatLKR)

## Usage

Import components from the main index file:

```typescript
import {
  Overview,
  Advertisements,
  Purchases,
  Bids,
  Searches,
  Profile
} from './BuyerDashboardComponents';
```

Or import shared utilities:

```typescript
import { StatsCard, MOCK_STATS, formatLKR } from './BuyerDashboardComponents/shared';
```

## Features Implemented

✅ **Advertisement Management**
- Full CRUD operations
- Image upload with preview
- Category selection
- Status workflow
- Performance tracking (views, inquiries)

✅ **Purchase Tracking**
- Order history
- Status monitoring
- Seller interactions

✅ **Bid Management**
- Active bid monitoring
- Status tracking
- Withdrawal functionality

✅ **Search Management**
- Save searches
- Notification preferences
- Result tracking

✅ **Profile Management**
- Editable user information
- Account statistics
- Verification status

## Benefits of This Structure

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Shared components can be used across sections
3. **Testability**: Individual components can be tested in isolation
4. **Performance**: Components can be lazy-loaded if needed
5. **Collaboration**: Different developers can work on different sections
6. **Type Safety**: Strong TypeScript typing throughout
7. **Scalability**: Easy to add new features or sections

## Future Enhancements

- Real API integration
- WebSocket for real-time updates
- Advanced filtering and sorting
- Bulk operations
- Export functionality
- Advanced analytics dashboard
