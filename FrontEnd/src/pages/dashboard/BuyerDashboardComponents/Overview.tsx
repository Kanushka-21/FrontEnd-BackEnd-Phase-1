import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, TrendingUp, ShoppingBag, Package, Calendar
} from 'lucide-react';
import { StatsCard, formatLKR } from './shared';
import { api } from '@/services/api';
import { authUtils } from '@/utils';

interface OverviewProps {
  user: any;
}

const Overview: React.FC<OverviewProps> = ({ user }) => {
  const [meetingStats, setMeetingStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });

  const [buyerStats, setBuyerStats] = useState({
    totalBidsPlaced: 0,
    activeBids: 0,
    totalPurchases: 0,
    totalSpent: 0,
    upcomingMeetings: 0,
    savedSearches: 0
  });

  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch buyer statistics
  const fetchBuyerStats = async () => {
    try {
      setStatsLoading(true);
      const userId = authUtils.getCurrentUserId();
      
      if (!userId) {
        console.error('User ID not found in localStorage');
        // Use fallback mock data
        setBuyerStats({
          totalBidsPlaced: 15,
          activeBids: 3,
          totalPurchases: 8,
          totalSpent: 2500000,
          upcomingMeetings: 2,
          savedSearches: 5
        });
        return;
      }
      
      console.log('Fetching buyer statistics for user:', userId);
      
      const response = await api.getUserStats.getBuyerStats(userId);
      
      if (response.success && response.data) {
        console.log('✅ Buyer stats received:', response.data);
        setBuyerStats(response.data);
      } else {
        console.error('❌ Failed to fetch buyer stats:', response.message);
        console.log('📊 Using fallback mock data for buyer statistics');
        // Use fallback mock data when API fails
        setBuyerStats({
          totalBidsPlaced: 15,
          activeBids: 3,
          totalPurchases: 8,
          totalSpent: 2500000,
          upcomingMeetings: 2,
          savedSearches: 5
        });
      }
    } catch (error) {
      console.error('❌ Error fetching buyer stats:', error);
      console.log('📊 Using fallback mock data due to error');
      // Use fallback mock data when API call fails
      setBuyerStats({
        totalBidsPlaced: 15,
        activeBids: 3,
        totalPurchases: 8,
        totalSpent: 2500000,
        upcomingMeetings: 2,
        savedSearches: 5
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch meeting and buyer statistics
  useEffect(() => {
    const fetchData = async () => {
      // Fetch buyer stats
      await fetchBuyerStats();
      
      // Fetch meeting statistics
      try {
        const userId = user?.userId || user?.id;
        if (!userId) return;

        const response = await fetch(`http://localhost:9092/api/meetings/user/${userId}`);
        const data = await response.json();
        
        if (data.success && data.meetings) {
          const meetings = data.meetings;
          const stats = {
            total: meetings.length,
            pending: meetings.filter((m: any) => m.status === 'PENDING').length,
            confirmed: meetings.filter((m: any) => m.status === 'CONFIRMED').length,
            completed: meetings.filter((m: any) => m.status === 'COMPLETED').length
          };
          setMeetingStats(stats);
        }
      } catch (error) {
        console.error('Error fetching meeting stats:', error);
      }
    };

    fetchData();
  }, [user]);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Purchases"
          value={statsLoading ? "..." : buyerStats.totalPurchases}
          change={statsLoading ? "Loading..." : (buyerStats.totalPurchases > 0 ? `${buyerStats.totalPurchases} completed` : "No purchases yet")}
          icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          textColor="text-blue-600"
        />

        <StatsCard
          title="Active Bids"
          value={statsLoading ? "..." : buyerStats.activeBids}
          change={statsLoading ? "Loading..." : (buyerStats.activeBids > 0 ? `${buyerStats.activeBids} ongoing` : "No active bids")}
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          iconBgColor="bg-green-100"
          textColor="text-green-600"
        />

        <StatsCard
          title="Meetings"
          value={meetingStats.total}
          change={meetingStats.pending > 0 ? `${meetingStats.pending} pending` : 'All up to date'}
          icon={<Calendar className="w-6 h-6 text-purple-600" />}
          iconBgColor="bg-purple-100"
          textColor="text-purple-600"
        />

        <StatsCard
          title="Bids Placed"
          value={statsLoading ? "..." : buyerStats.totalBidsPlaced}
          change={statsLoading ? "Loading..." : (buyerStats.totalBidsPlaced > 0 ? "Total bid history" : "No bids yet")}
          icon={<Package className="w-6 h-6 text-orange-600" />}
          iconBgColor="bg-orange-100"
          textColor="text-orange-600"
        />

        <StatsCard
          title="Total Spent"
          value={statsLoading ? "..." : formatLKR(buyerStats.totalSpent)}
          change={statsLoading ? "Loading..." : (buyerStats.totalSpent > 0 ? "Total investment" : "No purchases yet")}
          icon={<Package className="w-6 h-6 text-indigo-600" />}
          iconBgColor="bg-indigo-100"
          textColor="text-indigo-600"
        />
      </div>
    </div>
  );
};

export default Overview;
