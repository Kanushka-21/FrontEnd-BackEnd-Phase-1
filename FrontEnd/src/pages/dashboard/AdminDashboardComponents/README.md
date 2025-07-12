# Admin Dashboard Components

This directory contains modular components for the GemNet Admin Dashboard, organized for better maintainability and separation of concerns.

## Structure

### Main Components
- **Overview.tsx** - Main dashboard overview with statistics and quick actions
- **UserManagement.tsx** - User management with pending approvals and user list
- **ListingsManagement.tsx** - Gemstone listings management and approval
- **AdvertisementsManagement.tsx** - Advertisement management with approval workflow
- **Transactions.tsx** - Transaction history and revenue tracking
- **Meetings.tsx** - Meeting request approval and management
- **Analytics.tsx** - Analytics dashboard and reports
- **SystemSettings.tsx** - System configuration and settings
- **SecurityAudit.tsx** - Security monitoring and audit logs

### Shared Directory
- **types.ts** - TypeScript interfaces and types
- **mockData.ts** - Mock data and helper functions
- **StatsCard.tsx** - Reusable statistics card component
- **index.ts** - Exports for shared components

## Usage

```typescript
import { 
  Overview, 
  UserManagement, 
  AdvertisementsManagement,
  // ... other components
} from './AdminDashboardComponents';
```

## Features

### 🎯 Completed Components
- ✅ **Overview** - Complete with stats cards and quick actions
- ✅ **UserManagement** - Full user management with approval workflow
- ✅ **AdvertisementsManagement** - Complete advertisement management system
- ✅ **Transactions** - Transaction history and revenue tracking
- ✅ **Meetings** - Meeting request management

### 🚧 Placeholder Components
- ⏳ **ListingsManagement** - Placeholder for listing approval system
- ⏳ **Analytics** - Placeholder for analytics dashboard
- ⏳ **SystemSettings** - Placeholder for system configuration
- ⏳ **SecurityAudit** - Placeholder for security monitoring

## Component Architecture

Each component follows the same pattern:
- Accepts `AdminComponentProps` interface
- Uses shared types and mock data
- Implements consistent styling with Ant Design
- Includes search and filtering capabilities
- Provides action handlers through props

## Data Flow

1. **Mock Data** - Centralized in `shared/mockData.ts`
2. **Types** - Defined in `shared/types.ts`
3. **Components** - Import shared data and types
4. **Main Dashboard** - Orchestrates all components

## Next Steps

1. Implement remaining placeholder components
2. Add real API integration
3. Add form validation and error handling
4. Implement advanced filtering and sorting
5. Add export functionality
6. Add real-time updates with WebSocket
