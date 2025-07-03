import React, { useState } from 'react';
import { 
  Card, Row, Col, Table, 
  Button, Tag, Tabs, Modal,
  Input, message, Alert, Space, Badge,
  Switch, Progress, Divider
} from 'antd';
import {
  UserOutlined, DollarOutlined,
  CloseOutlined, CheckOutlined, 
  EyeOutlined,
  FileTextOutlined, LockOutlined, UnlockOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import {
  BarChart3, Users, Shield, Settings, 
  TrendingUp, Menu as MenuIcon,
  Package, Clock
} from 'lucide-react';
import dayjs from 'dayjs';
import RoleAwareDashboardLayout from '@/components/layout/RoleAwareDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';


const { TabPane } = Tabs;
const { confirm } = Modal;

// Helper function to format price in LKR
const formatLKR = (price: number) => {
  return new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Mock data for admin dashboard
const mockUsers = [
  { 
    id: '1', 
    name: 'John Smith', 
    email: 'john@example.com', 
    role: 'buyer', 
    status: 'active', 
    joinDate: '2025-01-15',
    lastActive: '2025-06-10',
    listings: 0,
    transactions: 8
  },
  { 
    id: '2', 
    name: 'Mary Johnson', 
    email: 'mary@example.com', 
    role: 'seller', 
    status: 'active', 
    joinDate: '2025-02-20',
    lastActive: '2025-06-12',
    listings: 12,
    transactions: 10
  },
  { 
    id: '3', 
    name: 'Robert Brown', 
    email: 'robert@example.com', 
    role: 'buyer', 
    status: 'blocked', 
    joinDate: '2025-03-10',
    lastActive: '2025-05-28',
    listings: 0,
    transactions: 3
  }
];

const pendingUsers = [
  { 
    id: '4', 
    name: 'Alice Williams', 
    email: 'alice@example.com', 
    role: 'seller', 
    status: 'pending', 
    joinDate: '2025-06-05',
    lastActive: '2025-06-05',
    listings: 1,
    transactions: 0
  },
  { 
    id: '5', 
    name: 'David Miller', 
    email: 'david@example.com', 
    role: 'buyer', 
    status: 'pending', 
    joinDate: '2025-06-10',
    lastActive: '2025-06-10',
    listings: 0,
    transactions: 0
  }
];

const pendingListings = [
  { 
    id: '1', 
    title: 'Ceylon Blue Sapphire', 
    seller: 'Alice Williams', 
    price: 15000,
    category: 'Sapphire',
    weight: 3.5,
    status: 'pending', 
    submitDate: '2025-06-12',
    image: 'https://images.unsplash.com/photo-1615654771169-65fde4070ade?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  { 
    id: '2', 
    title: 'Pink Padparadscha', 
    seller: 'David Miller', 
    price: 25000,
    category: 'Padparadscha',
    weight: 2.8,
    status: 'pending', 
    submitDate: '2025-06-14',
    image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const pendingMeetings = [
  { 
    id: '1',
    gemstone: 'Emerald Crystal',
    image: 'https://via.placeholder.com/100',
    buyer: 'David Miller',
    seller: 'Alice Williams',
    date: '2025-06-15',
    time: '10:00 AM',
    requestedDate: '2025-06-15',
    requestedTime: '10:00 AM',
    location: 'GemNet Office',
    status: 'pending'
  }
];

const recentTransactions = [
  

  { 
    id: '2',
    gemstone: 'Ruby Gemstone',
    image: 'https://via.placeholder.com/100',
    seller: 'James Wilson',
    buyer: 'Sarah Davis',
    amount: 2800,
    commission: 280,
    date: '2025-06-02',
    status: 'completed'
  }
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isListingModalVisible, setIsListingModalVisible] = useState(false);
  const [isMeetingModalVisible, setIsMeetingModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);
  
  // Get admin user display name
  const getAdminDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.firstName || 'Admin User';
  };
  
  // Sidebar state and navigation
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  
  // Admin sidebar navigation items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={24} /> },
    { id: 'users', label: 'User Management', icon: <Users size={24} /> },
    { id: 'listings', label: 'Listing Management', icon: <Package size={24} /> },
    { id: 'meetings', label: 'Meeting Approvals', icon: <Clock size={24} /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <TrendingUp size={24} /> },
    { id: 'settings', label: 'System Settings', icon: <Settings size={24} /> }
  ];
  
  // Statistics
  const stats = {
    pendingApprovals: pendingUsers.length + pendingListings.length + pendingMeetings.length,
    totalUsers: 125,
    totalListings: 342,
    totalRevenue: 48750,
    commissionRate: 10,
    totalCommission: 4875
  };    // Function to toggle user status (block/unblock)
  const handleToggleUserStatus = (user: any, active: boolean) => {
    const action = active ? 'unblock' : 'block';
    
    confirm({
      title: `Confirm ${action} user`,
      icon: active ? <UnlockOutlined className="text-green-500" /> : <LockOutlined className="text-red-500" />,
      content: `Are you sure you want to ${action} ${user.name}?`,
      okText: 'Yes',
      okType: active ? 'primary' : 'danger',
      cancelText: 'No',
      onOk() {
        // Here you would typically call your API to update the user's status
        message.success(`User has been ${action}ed successfully`);
      },
    });
  };

  // Function to view user details
  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsUserModalVisible(true);
  };
  
  // Function to view listing details
  const handleViewListing = (listing: any) => {
    setSelectedListing(listing);
    setIsListingModalVisible(true);
  };
  
  // Function to view meeting details
  const handleViewMeeting = (meeting: any) => {
    setSelectedMeeting(meeting);
    setIsMeetingModalVisible(true);
  };
  
  // Function to approve a listing
  const handleApproveListing = (listing: any) => {
    confirm({
      title: 'Approve Listing',
      icon: <CheckCircleOutlined style={{ color: 'green' }} />,
      content: `Are you sure you want to approve "${listing.title}" listing by ${listing.seller}?`,
      onOk() {
        console.log('Listing approved:', listing);
      }
    });
  };
  
  // Function to approve a meeting
  const handleApproveMeeting = (meeting: any) => {
    confirm({
      title: 'Approve Meeting',
      icon: <CheckCircleOutlined style={{ color: 'green' }} />,
      content: `Are you sure you want to approve the meeting between ${meeting.buyer} and ${meeting.seller}?`,
      onOk() {
        console.log('Meeting approved:', meeting);
      }
    });
  };

  return (
    <RoleAwareDashboardLayout>
      <div className="flex bg-gray-50 min-h-full relative">
        {/* Mobile Sidebar Overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed 
            ? 'w-16 sm:w-20' 
            : 'w-64 sm:w-72 fixed sm:relative z-30 sm:z-auto h-full sm:h-auto'
        }`}>
          {/* User Profile */}
          <div className={`border-b border-gray-200 ${sidebarCollapsed ? 'p-3' : 'p-6'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`bg-red-100 rounded-full flex items-center justify-center ${
                  sidebarCollapsed ? 'w-8 h-8' : 'w-12 h-12'
                }`}>
                  <Shield className={`text-red-600 ${sidebarCollapsed ? 'w-4 h-4' : 'w-7 h-7'}`} />
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-gray-900 truncate">
                      {getAdminDisplayName()}
                    </p>
                    <p className="text-sm text-red-600 font-medium">Administrator</p>
                  </div>
                )}
              </div>
              {/* Collapse/Expand button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 sm:hidden"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <MenuIcon size={18} />
              </button>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 hidden sm:block"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <MenuIcon size={18} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`space-y-2 ${sidebarCollapsed ? 'p-2' : 'p-6'}`}>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:bg-gray-100'
                } ${
                  sidebarCollapsed 
                    ? 'justify-center p-3' 
                    : 'space-x-4 px-4 py-3'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className="flex-shrink-0">
                  {item.icon}
                </div>
                {!sidebarCollapsed && (
                  <span className="text-base font-medium truncate">{item.label}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden ${
          !sidebarCollapsed ? 'sm:ml-0' : ''
        }`}>
          {/* Mobile menu button */}
          <div className="sm:hidden bg-white border-b border-gray-200 p-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <MenuIcon size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
      {/* Welcome Header */}
      <div className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl shadow-md relative overflow-hidden">
        {/* Background Pattern */}
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
              System Overview
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-md">
              Manage users, listings, and monitor platform activities
            </p>
          </div>
          
          {stats.pendingApprovals > 0 && (
            <Alert
              message={`${stats.pendingApprovals} pending approvals require your attention`}
              type="warning"
              showIcon
              action={                <Button size="small" type="default">
                  View All
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Statistics  Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #3b82f611 0%, #3b82f622 100%)', borderTop: '4px solid #3b82f6' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100">
                <UserOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Seller/Buyer Ratio</span>
                <span className="text-xs font-medium">40/60</span>
              </div>
              <Progress percent={40} showInfo={false} strokeColor="#3b82f6" trailColor="#e5e7eb" size="small" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #10b98111 0%, #10b98122 100%)', borderTop: '4px solid #10b981' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">{formatLKR(stats.totalRevenue)}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100">
                <DollarOutlined style={{ fontSize: '24px', color: '#10b981' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-xs text-green-600">
                  System Commission ({stats.commissionRate}%)
                </span>
                <span className="text-xs font-medium text-green-600">
                  {formatLKR(stats.totalCommission)}
                </span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #8b5cf611 0%, #8b5cf622 100%)', borderTop: '4px solid #8b5cf6' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Listings</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalListings}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100">
                <FileTextOutlined style={{ fontSize: '24px', color: '#8b5cf6' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Active/Sold Ratio</span>
                <span className="text-xs font-medium">70/30</span>
              </div>
              <Progress percent={70} showInfo={false} strokeColor="#8b5cf6" trailColor="#e5e7eb" size="small" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content - Tabbed Interface */}
      <Card className="mb-6 shadow-md rounded-xl overflow-hidden">
        <Tabs 
          defaultActiveKey="approvals"
          type="card"
          className="custom-tabs"
          size="large"
          animated={{ inkBar: true, tabPane: true }}
          tabBarStyle={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '0 16px' }}
        >          <TabPane 
            tab={<span className="flex items-center px-1"><UserOutlined className="mr-2" /> User Management</span>} 
            key="users"
          >
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">User Accounts</h3>
                  <Input.Search
                    placeholder="Search users..."
                    style={{ width: 250 }}
                    allowClear
                  />
                </div>
                <Table 
                  dataSource={mockUsers}
                  scroll={{ x: 'max-content' }}
                  columns={[
                    {
                      title: 'Name',
                      dataIndex: 'name',
                      key: 'name',
                    },
                    {
                      title: 'Email',
                      dataIndex: 'email',
                      key: 'email',
                    },
                    {
                      title: 'Role',
                      dataIndex: 'role',
                      key: 'role',
                      render: (role: string) => <Tag color={role === 'seller' ? 'purple' : 'blue'}>{role.toUpperCase()}</Tag>
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => (
                        <Tag color={status === 'active' ? 'success' : 'error'}>
                          {status.toUpperCase()}
                        </Tag>
                      )
                    },
                    {
                      title: 'Last Active',
                      dataIndex: 'lastActive',
                      key: 'lastActive',
                      render: date => dayjs(date).format('MMM DD, YYYY')
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_, record) => (
                        <Space>
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => handleViewUser(record)}
                          >
                            View
                          </Button>
                          <Switch
                            checkedChildren={<UnlockOutlined />}
                            unCheckedChildren={<LockOutlined />}
                            checked={record.status === 'active'}
                            onChange={(checked) => handleToggleUserStatus(record, checked)}
                          />
                        </Space>
                      )
                    }
                  ]}
                  pagination={{ pageSize: 10 }}
                />
              </div>
              
              <Divider />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Pending Gemstone Listings</h3>                <Table 
                  dataSource={pendingListings}
                  scroll={{ x: 'max-content' }}
                  columns={[
                    {
                      title: 'Gemstone',
                      key: 'gemstone',
                      render: (_, record) => (
                        <div className="flex items-center space-x-3">
                          <img 
                            src={record.image} 
                            alt={record.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <span className="font-medium">{record.title}</span>
                        </div>
                      ),
                    },
                    {
                      title: 'Price',
                      dataIndex: 'price',
                      key: 'price',
                      render: price => formatLKR(price)
                    },
                    {
                      title: 'Seller',
                      dataIndex: 'seller',
                      key: 'seller',
                    },
                    {
                      title: 'Submitted On',
                      dataIndex: 'submittedAt',
                      key: 'submittedAt',
                      render: date => dayjs(date).format('MMM DD, YYYY')
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_, record) => (
                        <Space>
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => handleViewListing(record)}
                          >
                            View
                          </Button>
                          <Button 
                            size="small" 
                            icon={<CheckOutlined />}
                            onClick={() => handleApproveListing(record)}
                            type="primary"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="small" 
                            icon={<CloseOutlined />}
                            danger
                          >
                            Reject
                          </Button>
                        </Space>
                      )
                    }
                  ]}
                  pagination={false}
                />
              </div>
              
              <Divider />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Meeting Requests</h3>                <Table 
                  dataSource={pendingMeetings}
                  scroll={{ x: 'max-content' }}
                  columns={[
                    {
                      title: 'Gemstone',
                      key: 'gemstone',
                      render: (_, record) => (
                        <div className="flex items-center space-x-3">
                          <img 
                            src={record.image} 
                            alt={record.gemstone}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <span className="font-medium">{record.gemstone}</span>
                        </div>
                      ),
                    },
                    {
                      title: 'Buyer',
                      dataIndex: 'buyer',
                      key: 'buyer',
                    },
                    {
                      title: 'Seller',
                      dataIndex: 'seller',
                      key: 'seller',
                    },
                    {
                      title: 'Requested Date',
                      key: 'datetime',
                      render: (_, record) => `${dayjs(record.requestedDate).format('MMM DD, YYYY')} at ${record.requestedTime}`
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_, record) => (
                        <Space>
                          <Button 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => handleViewMeeting(record)}
                          >
                            View
                          </Button>
                          <Button 
                            size="small" 
                            icon={<CheckOutlined />}
                            onClick={() => handleApproveMeeting(record)}
                            type="primary"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="small" 
                            icon={<CloseOutlined />}
                            danger
                          >
                            Reject
                          </Button>
                        </Space>
                      )
                    }
                  ]}
                  pagination={false}
                />
              </div>
            </div>
          </TabPane>
          
          <TabPane 
            tab={<span className="flex items-center px-1"><DollarOutlined className="mr-2" /> Recent Transactions</span>} 
            key="transactions"
          >            <Table 
              dataSource={recentTransactions}
              scroll={{ x: 'max-content' }}
              columns={[
                {
                  title: 'Gemstone',
                  key: 'gemstone',
                  render: (_, record) => (
                    <div className="flex items-center space-x-3">
                      <img 
                        src={record.image} 
                        alt={record.gemstone}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <span className="font-medium">{record.gemstone}</span>
                    </div>
                  ),
                },
                {
                  title: 'Buyer',
                  dataIndex: 'buyer',
                  key: 'buyer',
                },
                {
                  title: 'Seller',
                  dataIndex: 'seller',
                  key: 'seller',
                },
                {
                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: amount => formatLKR(amount)
                },
                {                  title: 'Commission',
                  dataIndex: 'commission',
                  key: 'commission',
                  render: commission => formatLKR(commission)
                },
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                  render: date => dayjs(date).format('MMM DD, YYYY')
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const statusColors: Record<string, string> = {
                      completed: 'green',
                      pending: 'gold',
                      cancelled: 'red'
                    };
                    return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
                  }
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: () => (
                    <Button size="small" icon={<EyeOutlined />}>
                      Details
                    </Button>
                  )
                }
              ]}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>      {/* User Details Modal */}
      <Modal
        visible={isUserModalVisible}
        title="User Details"
        onCancel={() => setIsUserModalVisible(false)}
        footer={[
          selectedUser?.status === 'active' ? (
            <Button 
              key="block" 
              danger 
              icon={<LockOutlined />}
              onClick={() => handleToggleUserStatus(selectedUser, false)}
            >
              Block User
            </Button>
          ) : (
            <Button 
              key="unblock" 
              type="primary" 
              icon={<UnlockOutlined />}
              onClick={() => handleToggleUserStatus(selectedUser, true)}
            >
              Unblock User
            </Button>
          )
        ]}
        width={600}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
                <Tag color={selectedUser.status === 'active' ? 'success' : 'error'}>
                  {selectedUser.status.toUpperCase()}
                </Tag>
              </div>
              
              <Divider />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">
                    <Tag color={selectedUser.role === 'seller' ? 'purple' : 'blue'}>
                      {selectedUser.role.toUpperCase()}
                    </Tag>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Active</p>
                  <p className="font-medium">{dayjs(selectedUser.lastActive).format('MMMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Listings</p>
                  <p className="font-medium">{selectedUser.listings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="font-medium">{selectedUser.transactions}</p>
                </div>
              </div>
            </div>
            
            {selectedUser.status === 'blocked' && (
              <Alert
                message="User Account Blocked"
                description="This user's account is currently blocked and they cannot access the platform."
                type="error"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>

      {/* Listing Details Modal */}
      <Modal
        visible={isListingModalVisible}
        title="Gemstone Listing Details"
        onCancel={() => setIsListingModalVisible(false)}
        footer={[
          <Button key="reject" danger>
            Reject
          </Button>,
          <Button key="approve" type="primary" onClick={() => handleApproveListing(selectedListing)}>
            Approve
          </Button>
        ]}
        width={700}
      >
        {selectedListing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <img 
                src={selectedListing.image} 
                alt={selectedListing.name}
                className="w-full h-auto rounded-lg"
              />
              <div className="grid grid-cols-3 gap-2">
                <img src="https://via.placeholder.com/100" alt="thumbnail" className="rounded" />
                <img src="https://via.placeholder.com/100" alt="thumbnail" className="rounded" />
                <img src="https://via.placeholder.com/100" alt="thumbnail" className="rounded" />
              </div>
            </div>
            <div>              <h2 className="text-2xl font-bold mb-2">{selectedListing.name}</h2>
              <p className="text-xl text-green-600 font-medium mb-4">{formatLKR(selectedListing.price)}</p>
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Seller</p>
                  <p>{selectedListing.seller}</p>
                </div>
                <div>
                  <p className="font-medium">Submitted On</p>
                  <p>{dayjs(selectedListing.submittedAt).format('MMMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-gray-600">
                    This is a beautiful natural gemstone with excellent clarity and color. 
                    The gemstone has been certified by the Gemological Institute.
                  </p>
                </div>
                <div>
                  <p className="font-medium">Specifications</p>
                  <ul className="list-disc pl-5 text-gray-600">
                    <li>Weight: 2.5 carats</li>
                    <li>Cut: Oval</li>
                    <li>Clarity: VS</li>
                    <li>Origin: Sri Lanka</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Certification</p>
                  <Badge status="success" text="Certificate Attached" />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Meeting Details Modal */}
      <Modal
        visible={isMeetingModalVisible}
        title="Meeting Request Details"
        onCancel={() => setIsMeetingModalVisible(false)}
        footer={[
          <Button key="reject" danger>
            Reject
          </Button>,
          <Button key="approve" type="primary" onClick={() => handleApproveMeeting(selectedMeeting)}>
            Approve
          </Button>
        ]}
        width={600}
      >
        {selectedMeeting && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  src={selectedMeeting.image} 
                  alt={selectedMeeting.gemstone}
                  className="w-16 h-16 object-cover rounded-lg mr-4"
                />
                <div>
                  <h3 className="text-xl font-bold">{selectedMeeting.gemstone}</h3>
                  <p className="text-gray-600">Transaction ID: #M{selectedMeeting.id}2023</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Buyer</p>
                  <p className="font-medium">{selectedMeeting.buyer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-medium">{selectedMeeting.seller}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested Date</p>
                  <p className="font-medium">{dayjs(selectedMeeting.requestedDate).format('MMMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested Time</p>
                  <p className="font-medium">{selectedMeeting.requestedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{selectedMeeting.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Tag color="gold">{selectedMeeting.status.toUpperCase()}</Tag>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Admin Notes:</h4>
              <Input.TextArea rows={3} placeholder="Add notes for this meeting..." />
            </div>
          </div>
        )}
      </Modal>
          </div>
        </div>
      </div>
    </RoleAwareDashboardLayout>
  );
};

export default AdminDashboard;
