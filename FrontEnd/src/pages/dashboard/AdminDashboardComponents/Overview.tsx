import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Alert, message } from 'antd';
import { 
  UserOutlined, FileTextOutlined, DollarOutlined, 
  NotificationOutlined, BarChartOutlined 
} from '@ant-design/icons';
import { AdminComponentProps, StatsCard, formatLKR } from './shared';
import NotificationSummary from '@/components/admin/NotificationSummary';
import { api } from '@/services/api';

const Overview: React.FC<AdminComponentProps> = ({ user, onTabChange }) => {
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    totalUsers: 125,
    totalListings: 342,
    totalRevenue: 48750,
    commissionRate: 10,
    totalCommission: 4875,
    activeAdvertisements: 1
  });

  // Fetch dashboard statistics on component mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        console.log('🔄 Fetching dashboard statistics...');
        
        const response = await api.admin.getDashboardStats();
        
        if (response.success && response.data) {
          console.log('✅ Dashboard stats received:', response.data);
          
          // Update stats with dynamic data from API
          setStats({
            pendingApprovals: response.data.pendingApprovals || 0,
            totalUsers: response.data.totalUsers || 0,
            totalListings: response.data.totalListings || 0,
            totalRevenue: response.data.totalRevenue || 0,
            commissionRate: response.data.commissionRate || 10,
            totalCommission: response.data.totalCommission || 0,
            activeAdvertisements: response.data.activeAdvertisements || 0
          });
        } else {
          console.error('❌ Failed to fetch dashboard stats:', response.message);
          message.error('Failed to load dashboard statistics');
        }
      } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
        message.error('Error loading dashboard statistics');
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10" 
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%231e40af\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          }}
        ></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div className="mb-4 md:mb-0">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-2">
              Admin Dashboard
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || 'Admin'}!
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-l">
              Manage users, listings, advertisements and monitor platform activities
            </p>
          </div>
          
          {stats.pendingApprovals > 0 && (
            <Alert
              message={`${stats.pendingApprovals} pending approvals require your attention`}
              type="warning"
              showIcon
              action={
                <Button size="small" type="default" onClick={() => onTabChange?.('users')}>
                  View All
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<UserOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />}
            color="#3b82f6"
            description="Active users on platform"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Total Revenue"
            value={formatLKR(stats.totalRevenue)}
            icon={<DollarOutlined style={{ fontSize: '24px', color: '#10b981' }} />}
            color="#10b981"
            description={`Commission: ${formatLKR(stats.totalCommission)}`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Total Listings"
            value={stats.totalListings}
            icon={<FileTextOutlined style={{ fontSize: '24px', color: '#8b5cf6' }} />}
            color="#8b5cf6"
            description="Active gemstone listings"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Active Ads"
            value={stats.activeAdvertisements}
            icon={<NotificationOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />}
            color="#f59e0b"
            description="Running advertisements"
          />
        </Col>
      </Row>

      {/* Notification Summary */}
      <div className="mb-6">
        <NotificationSummary onTabChange={onTabChange || (() => {})} />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            type="primary" 
            size="large" 
            block 
            icon={<UserOutlined />}
            onClick={() => onTabChange?.('users')}
          >
            Manage Users
          </Button>
          <Button 
            type="default" 
            size="large" 
            block 
            icon={<FileTextOutlined />}
            onClick={() => onTabChange?.('listings')}
          >
            Review Listings
          </Button>
          <Button 
            type="default" 
            size="large" 
            block 
            icon={<NotificationOutlined />}
            onClick={() => onTabChange?.('advertisements')}
          >
            Manage Ads
          </Button>
          <Button 
            type="default" 
            size="large" 
            block 
            icon={<BarChartOutlined />}
            onClick={() => onTabChange?.('analytics')}
          >
            View Analytics
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Overview;
