import React, { useState } from 'react';
import { 
  Card, Row, Col, Statistic, Table, Button, Tag, 
  Tabs, List, Rate, Modal, Form,
  Input, InputNumber, message
} from 'antd';
import { 
  ShoppingOutlined, HeartOutlined, CalendarOutlined,
  StarOutlined, TrophyOutlined, EyeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

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

// Simple mock data
const mockBids = [
  { id: '1', gemstone: 'Blue Sapphire', image: 'https://via.placeholder.com/100', amount: 2500, status: 'active', date: '2025-06-01' },
  { id: '2', gemstone: 'Ruby', image: 'https://via.placeholder.com/100', amount: 3750, status: 'won', date: '2025-06-05' },
  { id: '3', gemstone: 'Emerald', image: 'https://via.placeholder.com/100', amount: 1850, status: 'lost', date: '2025-06-10' },
  { id: '4', gemstone: 'Diamond', image: 'https://via.placeholder.com/100', amount: 5200, status: 'active', date: '2025-06-15' }
];

const mockMeetings = [
  { 
    id: '1',
    gemstone: 'Ruby',
    image: 'https://via.placeholder.com/100',
    seller: 'Jane Smith',
    date: '2025-06-25',
    time: '10:30 AM',
    location: 'GemNet Office, New York',
    status: 'scheduled'
  },
  { 
    id: '2',
    gemstone: 'Diamond',
    image: 'https://via.placeholder.com/100',
    seller: 'Michael Brown',
    date: '2025-06-28',
    time: '2:00 PM',
    location: 'Virtual Meeting',
    status: 'scheduled'
  }
];

const mockWatchlist = [
  { 
    id: '1',
    name: 'Emerald Ring',
    image: 'https://via.placeholder.com/100',
    price: 1890,
    seller: 'Premium Gems Ltd.',
    rating: 4.8,
    reviews: 24
  },
  { 
    id: '2',
    name: 'Sapphire Pendant',
    image: 'https://via.placeholder.com/100',
    price: 2340,
    seller: 'Luxury Stones Inc.',
    rating: 4.5,
    reviews: 18
  },
  { 
    id: '3',
    name: 'Ruby Earrings',
    image: 'https://via.placeholder.com/100',
    price: 3150,
    seller: 'Jane Smith',
    rating: 4.7,
    reviews: 32
  }
];

const mockPurchaseHistory = [
  { 
    id: '1',
    gemstone: 'Ruby',
    image: 'https://via.placeholder.com/100',
    amount: 3750,
    date: '2025-05-15',
    seller: 'Jane Smith',
    status: 'completed',
    meetingDate: '2025-05-20'
  },
  { 
    id: '2',
    gemstone: 'Emerald',
    image: 'https://via.placeholder.com/100',
    amount: 2200,
    date: '2025-04-10',
    seller: 'Michael Brown',
    status: 'completed',
    meetingDate: '2025-04-15'
  }
];

const BuyerDashboard: React.FC = (): React.ReactNode => {
  // State for modals
  const [isViewGemstoneModalVisible, setIsViewGemstoneModalVisible] = useState(false);
  const [isPlaceBidModalVisible, setIsPlaceBidModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedGemstone, setSelectedGemstone] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState<number | null>(null);
  const [reviewForm] = Form.useForm();

  // Statistics
  const stats = {
    activeBids: 2,
    watchlist: 3,
    upcomingMeetings: 2,
    purchaseHistory: 5
  };
  
  // Function to handle viewing gemstone details
  const handleViewGemstone = (gemstone: any) => {
    setSelectedGemstone(gemstone);
    setIsViewGemstoneModalVisible(true);
  };
  
  // Function to handle opening the place bid modal
  const handleOpenPlaceBidModal = (gemstone: any) => {
    setSelectedGemstone(gemstone);
    setBidAmount(gemstone.price);
    setIsPlaceBidModalVisible(true);
  };
  
  // Function to handle submitting a bid
  const handlePlaceBid = (values: { bidAmount: number }) => {
    if (!values.bidAmount) {
      message.error('Please enter a bid amount');
      return;
    }
    setBidAmount(values.bidAmount);
    
    // Display terms and conditions confirmation
    confirm({
      title: 'Terms & Conditions',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>By placing this bid, you agree to the following terms:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>If you win the bid but fail to complete the purchase twice, your account will be permanently restricted.</li>
            <li>All transactions must be coordinated through the system with admin involvement.</li>
            <li>A commission will be collected for successful transactions.</li>
          </ul>
        </div>
      ),
      onOk() {
        message.success(`Bid placed successfully for ${selectedGemstone?.name || 'gemstone'}`);
        setIsPlaceBidModalVisible(false);
      },
      okText: 'I Agree',
      cancelText: 'Cancel',
    });
  };
  
  // Function to handle opening the review modal
  const handleOpenReviewModal = (gemstone: any) => {
    setSelectedGemstone(gemstone);
    setIsReviewModalVisible(true);
  };
  
  // Function to handle submitting a review
  const handleSubmitReview = (values: any) => {
    console.log('Review submitted:', values);
    message.success('Review submitted successfully');
    setIsReviewModalVisible(false);
    reviewForm.resetFields();
  };
  
  // Function to handle withdrawing a bid
  const handleWithdrawBid = (_: any) => {
    confirm({
      title: 'Withdraw Bid',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to withdraw this bid? This action cannot be undone.',
      onOk() {
        message.success(`Bid withdrawn successfully`);
      },
    });
  };

  // Return the JSX for the dashboard
  return (
    <div className="p-6 space-y-6">      {/* Welcome Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl shadow-md relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10" 
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%234338ca\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          }}
        ></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div className="mb-4 md:mb-0">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold mb-2">
              Welcome Back
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Buyer Dashboard
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-md">
              Track your bids, meetings, and favorite gemstones all in one place
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="primary" size="large" icon={<ShoppingOutlined />}
              className="shadow-md hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #4338ca, #3b82f6)',
                borderColor: '#4338ca'
              }}
            >
              Browse Marketplace
            </Button>
            <Button size="large" icon={<HeartOutlined />} className="shadow-sm">
              View Wishlist
            </Button>
          </div>
        </div>
      </div>{/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #1890ff11 0%, #1890ff22 100%)', borderTop: '4px solid #1890ff' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Bids</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.activeBids}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100">
                <TrophyOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-blue-600">
                {stats.activeBids > 0 ? 'Track your current bids' : 'Place your first bid'}
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #ff4d4f11 0%, #ff4d4f22 100%)', borderTop: '4px solid #ff4d4f' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Watchlist</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.watchlist}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
                <HeartOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-red-600">
                {stats.watchlist > 0 ? 'Items you\'re watching' : 'Add gems to watchlist'}
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #52c41a11 0%, #52c41a22 100%)', borderTop: '4px solid #52c41a' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Upcoming Meetings</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.upcomingMeetings}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100">
                <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-green-600">
                {stats.upcomingMeetings > 0 ? 'Next meeting soon' : 'No scheduled meetings'}
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #72727211 0%, #72727222 100%)', borderTop: '4px solid #722ed1' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Purchase History</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.purchaseHistory}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100">
                <ShoppingOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-purple-600">
                {stats.purchaseHistory > 0 ? 'View your purchases' : 'Make your first purchase'}
              </p>
            </div>
          </Card>
        </Col>
      </Row>      {/* Main Content - Tabbed Interface */}
      <Card className="mb-6 shadow-md rounded-xl overflow-hidden">
        <Tabs 
          defaultActiveKey="bids"
          type="card"
          className="custom-tabs"
          size="large"
          animated={{ inkBar: true, tabPane: true }}
          tabBarStyle={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '0 16px' }}
        >
          <TabPane 
            tab={<span className="flex items-center px-1"><TrophyOutlined className="mr-2" /> My Bids</span>} 
            key="bids"
          >            <Table 
              dataSource={mockBids}
              responsive
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
                {                  title: 'Bid Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: amount => formatLKR(amount)
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const statusColors: Record<string, string> = {
                      active: 'blue',
                      won: 'green',
                      lost: 'red',
                      withdrawn: 'gray'
                    };
                    return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
                  }
                },
                {
                  title: 'Date',
                  dataIndex: 'date',
                  key: 'date',
                  render: date => dayjs(date).format('MMM DD, YYYY')
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <div className="space-x-2">
                      <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewGemstone(record)}>
                        View
                      </Button>
                      {record.status === 'active' && (
                        <Button size="small" danger onClick={() => handleWithdrawBid(record)}>Withdraw</Button>
                      )}
                      {record.status === 'won' && (
                        <Button size="small" type="primary">Schedule Meeting</Button>
                      )}
                    </div>
                  )
                }
              ]}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
            <TabPane 
            tab={<span className="flex items-center px-1"><CalendarOutlined className="mr-2" /> Meetings</span>} 
            key="meetings"
          >            <Table 
              dataSource={mockMeetings}
              responsive
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
                  title: 'Seller',
                  dataIndex: 'seller',
                  key: 'seller',
                },
                {
                  title: 'Date & Time',
                  key: 'datetime',
                  render: (_, record) => `${dayjs(record.date).format('MMM DD, YYYY')} at ${record.time}`
                },
                {
                  title: 'Location',
                  dataIndex: 'location',
                  key: 'location',
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const statusColors: Record<string, string> = {
                      scheduled: 'blue',
                      completed: 'green',
                      cancelled: 'red'
                    };
                    return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
                  }
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: () => (
                    <Button size="small" type="primary" icon={<CalendarOutlined />}>
                      Details
                    </Button>
                  )
                }
              ]}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>          <TabPane 
            tab={<span className="flex items-center px-1"><HeartOutlined className="mr-2" /> Watchlist</span>} 
            key="watchlist"
          >
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
              dataSource={mockWatchlist}
              renderItem={item => (
                <List.Item>
                  <Card
                    hoverable
                    cover={<img alt={item.name} src={item.image} style={{ height: 200, objectFit: 'cover' }} />}
                    actions={[
                      <Button key="view" icon={<EyeOutlined />} onClick={() => handleViewGemstone(item)}>View</Button>,
                      <Button key="bid" type="primary" icon={<TrophyOutlined />} onClick={() => handleOpenPlaceBidModal(item)}>Place Bid</Button>
                    ]}
                  >
                    <Card.Meta
                      title={item.name}
                      description={
                        <div className="space-y-2">
                          <div className="font-medium text-lg text-primary-600">{formatLKR(item.price)}</div>
                          <div>Seller: {item.seller}</div>
                          <div className="flex items-center">
                            <Rate value={item.rating} disabled allowHalf className="text-sm" />
                            <span className="ml-2 text-gray-500">({item.reviews} reviews)</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </TabPane>          <TabPane 
            tab={<span className="flex items-center px-1"><ShoppingOutlined className="mr-2" /> Purchase History</span>} 
            key="purchaseHistory"
          >            <Table 
              dataSource={mockPurchaseHistory}
              responsive
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
                {                  title: 'Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: amount => formatLKR(amount)
                },
                {
                  title: 'Seller',
                  dataIndex: 'seller',
                  key: 'seller',
                },
                {
                  title: 'Purchase Date',
                  dataIndex: 'date',
                  key: 'date',
                  render: date => dayjs(date).format('MMM DD, YYYY')
                },
                {
                  title: 'Meeting Date',
                  dataIndex: 'meetingDate',
                  key: 'meetingDate',
                  render: date => date ? dayjs(date).format('MMM DD, YYYY') : 'Not scheduled'
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <div className="space-x-2">
                      <Button 
                        size="small" 
                        icon={<StarOutlined />} 
                        type="primary"
                        onClick={() => handleOpenReviewModal(record)}
                      >
                        Review Seller
                      </Button>
                    </div>
                  )
                }
              ]}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Gemstone Details Modal */}
      <Modal
        visible={isViewGemstoneModalVisible}
        title="Gemstone Details"
        onCancel={() => setIsViewGemstoneModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedGemstone && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img 
                src={selectedGemstone.image} 
                alt={selectedGemstone.gemstone || selectedGemstone.name}
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4">{selectedGemstone.gemstone || selectedGemstone.name}</h2>
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-lg font-medium text-primary-600">
                  {formatLKR(selectedGemstone.amount || selectedGemstone.price || 0)}
                </div>
                <Button type="primary" icon={<TrophyOutlined />} size="large"
                  onClick={() => handleOpenPlaceBidModal(selectedGemstone)}
                >
                  Place Bid
                </Button>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Seller:</span> {selectedGemstone.seller}
                </div>
                {selectedGemstone.status && (
                  <div>
                    <span className="font-medium">Status:</span> 
                    <Tag color="blue">{selectedGemstone.status.toUpperCase()}</Tag>
                  </div>
                )}
                {selectedGemstone.date && (
                  <div>
                    <span className="font-medium">Date:</span> {dayjs(selectedGemstone.date).format('MMM DD, YYYY')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Place Bid Modal */}
      <Modal
        visible={isPlaceBidModalVisible}
        title="Place Your Bid"
        onCancel={() => setIsPlaceBidModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form
          layout="vertical"
          onFinish={handlePlaceBid}
          initialValues={{ bidAmount: bidAmount }}
        >
          <Form.Item
            label="Bid Amount"
            name="bidAmount"
            rules={[
              { required: true, message: 'Please enter your bid amount' },
              { type: 'number', min: 1, message: 'Bid amount must be at least LKR 1' }
            ]}
          >
            <InputNumber
              placeholder="Enter bid amount"
              style={{ width: '100%' }}              formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3}))/g, ',')}
              parser={(value: string | undefined) => value ? value.replace(/LKR\s?|(,*)/g, '') : ''}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Place Bid
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Review Modal */}
      <Modal
        visible={isReviewModalVisible}
        title="Submit a Review"
        onCancel={() => setIsReviewModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={reviewForm}
          layout="vertical"
          onFinish={handleSubmitReview}
        >
          <Form.Item
            label="Rating"
            name="rating"
            rules={[{ required: true, message: 'Please rate the gemstone' }]}
          >
            <Rate allowHalf />
          </Form.Item>
          <Form.Item
            label="Review"
            name="review"
            rules={[{ required: true, message: 'Please enter your review' }]}
          >
            <Input.TextArea rows={4} placeholder="Write your review here" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Submit Review
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BuyerDashboard;