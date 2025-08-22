import React from 'react';
import { 
  CheckCircle, TrendingUp, ShoppingBag, Package
} from 'lucide-react';
import { StatsCard, MOCK_STATS, formatLKR } from './shared';

interface OverviewProps {
  user: any;
}

const Overview: React.FC<OverviewProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-gray-600">Here's an overview of your purchases and bidding activity</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle size={16} className="mr-1" />
              Verified Buyer
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Purchases"
          value={MOCK_STATS.totalPurchases}
          change="+3 this month"
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          textColor="text-blue-600"
        />

        <StatsCard
          title="Active Bids"
          value={MOCK_STATS.activeBids}
          change="+1 from last month"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          iconBgColor="bg-green-100"
          textColor="text-green-600"
        />

        <StatsCard
          title="Completed Orders"
          value={8}
          change="+2 from last month"
          icon={<Package className="w-6 h-6 text-purple-600" />}
          iconBgColor="bg-purple-100"
          textColor="text-purple-600"
        />

        <StatsCard
          title="Total Spent"
          value={formatLKR(MOCK_STATS.totalSpent)}
          change="+12% from last month"
          icon={<Package className="w-6 h-6 text-orange-600" />}
          iconBgColor="bg-orange-100"
          textColor="text-orange-600"
        />
      </div>
    </div>
  );
};

export default Overview;
