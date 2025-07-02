import React from 'react';
import { Row, Col } from 'antd';
import { 
  ShopOutlined, DollarOutlined,
  CalendarOutlined, TrophyOutlined
} from '@ant-design/icons';
import { StatsCard, mockStats, formatLKR } from './shared';

interface OverviewProps {
  user?: any;
  onTabChange: (tab: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ user, onTabChange }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-100 p-6 rounded-xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10" 
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%237c3aed\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          }}
        ></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div className="mb-4 md:mb-0">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-2">
              Seller Dashboard
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back, {user?.firstName || 'Seller'}
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-md">
              Manage your gemstone listings, bids, and schedule meetings
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Active Listings"
            value={mockStats.activeListings}
            icon={<ShopOutlined />}
            color="#7c3aed"
            gradient="linear-gradient(135deg, #7c3aed11 0%, #7c3aed22 100%)"
            subtitle={mockStats.activeListings > 0 ? `${mockStats.activeListings} gems for sale` : 'Add your first listing'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Total Bids"
            value={mockStats.totalBids}
            icon={<TrophyOutlined />}
            color="#06b6d4"
            gradient="linear-gradient(135deg, #06b6d411 0%, #06b6d422 100%)"
            subtitle={mockStats.totalBids > 0 ? `${mockStats.totalBids} active bids` : 'No bids yet'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Revenue"
            value={formatLKR(mockStats.totalRevenue)}
            icon={<DollarOutlined />}
            color="#10b981"
            gradient="linear-gradient(135deg, #10b98111 0%, #10b98122 100%)"
            subtitle={mockStats.totalRevenue > 0 ? 'Total earnings' : 'No earnings yet'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Upcoming Meetings"
            value={mockStats.upcomingMeetings}
            icon={<CalendarOutlined />}
            color="#f59725"
            gradient="linear-gradient(135deg, #f5972511 0%, #f5972522 100%)"
            subtitle={mockStats.upcomingMeetings > 0 ? 'View your schedule' : 'No meetings yet'}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Overview;