import React, { useState } from 'react';
import GemListingForm from '../../components/forms/GemListingForm';
import { 
  Card, Row, Col, Table, Button, Tag, 
  Tabs, Space, Modal, Form, Input, InputNumber, message
} from 'antd';
import { 
  ShopOutlined, DollarOutlined,
  CalendarOutlined, TrophyOutlined, PlusOutlined,
  EditOutlined, EyeOutlined, DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { TabPane } = Tabs;

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
const mockListings = [
  { 
    id: '1', 
    name: 'Blue Sapphire', 
    image: 'https://via.placeholder.com/100', 
    price: 2500, 
    status: 'active', 
    bids: 5,
    createdAt: '2025-05-15',
    views: 48
  },
  { 
    id: '2', 
    name: 'Ruby', 
    image: 'https://via.placeholder.com/100', 
    price: 3750, 
    status: 'active', 
    bids: 3,
    createdAt: '2025-05-28',
    views: 32
  },
  { 
    id: '3', 
    name: 'Emerald', 
    image: 'https://via.placeholder.com/100', 
    price: 1850, 
    status: 'pending', 
    bids: 0,
    createdAt: '2025-06-10',
    views: 15
  },
  { 
    id: '4', 
    name: 'Diamond', 
    image: 'https://via.placeholder.com/100', 
    price: 5200, 
    status: 'sold', 
    bids: 7,
    createdAt: '2025-05-05',
    views: 76
  }
];

const mockBids = [
  { 
    id: '1',
    gemstone: 'Blue Sapphire',
    image: 'https://via.placeholder.com/100',
    buyer: 'John Doe',
    amount: 2400,
    date: '2025-06-15',
    status: 'pending'
  },
  { 
    id: '2',
    gemstone: 'Ruby',
    image: 'https://via.placeholder.com/100',
    buyer: 'Alice Smith',
    amount: 3500,
    date: '2025-06-14',
    status: 'accepted'
  },
  { 
    id: '3',
    gemstone: 'Blue Sapphire',
    image: 'https://via.placeholder.com/100',
    buyer: 'Robert Johnson',
    amount: 2300,
    date: '2025-06-13',
    status: 'rejected'
  }
];

const mockMeetings = [
  { 
    id: '1',
    gemstone: 'Ruby',
    image: 'https://via.placeholder.com/100',
    buyer: 'Alice Smith',
    date: '2025-06-25',
    time: '10:30 AM',
    location: 'GemNet Office, New York',
    status: 'scheduled'
  },
  { 
    id: '2',
    gemstone: 'Diamond',
    image: 'https://via.placeholder.com/100',
    buyer: 'Michael Brown',
    date: '2025-06-28',
    time: '2:00 PM',
    location: 'Virtual Meeting',
    status: 'scheduled'
  }
];

const SellerDashboard: React.FC = () => {
  // State for modals
  const [isAddListingModalVisible, setIsAddListingModalVisible] = useState(false);
  const [isEditListingModalVisible, setIsEditListingModalVisible] = useState(false);
  const [isAcceptBidModalVisible, setIsAcceptBidModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedBid, setSelectedBid] = useState<any>(null);  const [editListingForm] = Form.useForm();

  // Statistics
  const stats = {
    activeListings: 3,
    pendingReview: 1,
    totalBids: 8,
    upcomingMeetings: 2,
    totalRevenue: 12500,
    averageRating: 4.7
  };
    // Function to handle opening add listing modal
  const handleOpenAddListingModal = () => {
    setIsAddListingModalVisible(true);
  };
  
  // Function to handle opening edit listing modal
  const handleOpenEditListingModal = (listing: any) => {
    setSelectedListing(listing);
    editListingForm.setFieldsValue({
      name: listing.name,
      price: listing.price
    });
    setIsEditListingModalVisible(true);
  };
  
  // Function to handle submitting a new listing
  const handleAddListing = async (values: any) => {
    try {
      console.log('New listing values:', values);
      // Here you would typically send the data to your backend
      
      message.success('Listing submitted for approval');
      setIsAddListingModalVisible(false);
    } catch (error) {
      message.error('Failed to create listing');
    }
  };
  
  // Function to handle editing a listing
  const handleEditListing = (values: any) => {
    console.log('Edit listing values:', values);
    message.success('Listing updated successfully');
    setIsEditListingModalVisible(false);
  };
  
  // Function to handle opening accept bid modal
  const handleOpenAcceptBidModal = (bid: any) => {
    setSelectedBid(bid);
    setIsAcceptBidModalVisible(true);
  };
  
  // Function to handle accepting a bid
  const handleAcceptBid = () => {
    console.log('Accepting bid:', selectedBid);
    message.success('Bid accepted successfully');
    setIsAcceptBidModalVisible(false);
  };

  // Return the JSX for the dashboard
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-100 p-6 rounded-xl shadow-md relative overflow-hidden">
        {/* Background Pattern */}
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
              Welcome Back, Seller
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-md">
              Manage your gemstone listings, bids, and schedule meetings
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleOpenAddListingModal}
              size="large"
              className="shadow-md hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                borderColor: '#7c3aed'
              }}
            >
              New Listing
            </Button>
            <Button size="large" className="shadow-sm">
              View Store
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #7c3aed11 0%, #7c3aed22 100%)', borderTop: '4px solid #7c3aed' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Active Listings</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.activeListings}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100">
                <ShopOutlined style={{ fontSize: '24px', color: '#7c3aed' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-purple-600">
                {stats.activeListings > 0 ? `${stats.activeListings} gems for sale` : 'Add your first listing'}
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #06b6d411 0%, #06b6d422 100%)', borderTop: '4px solid #06b6d4' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Bids</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.totalBids}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-cyan-100">
                <TrophyOutlined style={{ fontSize: '24px', color: '#06b6d4' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-cyan-600">
                {stats.totalBids > 0 ? `${stats.totalBids} active bids` : 'No bids yet'}
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #10b98111 0%, #10b98122 100%)', borderTop: '4px solid #10b981' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800">{formatLKR(stats.totalRevenue)}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-100">
                <DollarOutlined style={{ fontSize: '24px', color: '#10b981' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-green-600">
                {stats.totalRevenue > 0 ? 'Total earnings' : 'No earnings yet'}
              </p>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            bordered={false}
            style={{ background: 'linear-gradient(135deg, #f5972511 0%, #f5972522 100%)', borderTop: '4px solid #f59725' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Upcoming Meetings</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats.upcomingMeetings}</h3>
              </div>
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-100">
                <CalendarOutlined style={{ fontSize: '24px', color: '#f59725' }} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-orange-600">
                {stats.upcomingMeetings > 0 ? 'View your schedule' : 'No meetings yet'}
              </p>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Content - Tabbed Interface */}
      <Card className="mb-6 shadow-md rounded-xl overflow-hidden">
        <Tabs 
          defaultActiveKey="listings"
          type="card"
          className="custom-tabs"
          size="large"
          animated={{ inkBar: true, tabPane: true }}
          tabBarStyle={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', padding: '0 16px' }}
        >
          <TabPane 
            tab={<span className="flex items-center px-1"><ShopOutlined className="mr-2" /> My Listings</span>} 
            key="listings"
          >
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Your Gemstones</h3>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleOpenAddListingModal}
              >
                Add New
              </Button>
            </div>
            <Table 
              dataSource={mockListings}
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
                        alt={record.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <span className="font-medium">{record.name}</span>
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
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => {
                    const statusColors: Record<string, string> = {
                      active: 'blue',
                      pending: 'gold',
                      sold: 'green',
                      rejected: 'red'
                    };
                    return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
                  }
                },
                {
                  title: 'Bids',
                  dataIndex: 'bids',
                  key: 'bids',
                },
                {
                  title: 'Views',
                  dataIndex: 'views',
                  key: 'views',
                },
                {
                  title: 'Created',
                  dataIndex: 'createdAt',
                  key: 'createdAt',
                  render: date => dayjs(date).format('MMM DD, YYYY')
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Space size="small">
                      <Button 
                        size="small" 
                        icon={<EyeOutlined />}
                        type="text"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Button>
                      <Button 
                        size="small" 
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEditListingModal(record)}
                        type="text"
                        className="text-green-600 hover:text-green-800"
                      >
                        Edit
                      </Button>
                      {record.status !== 'sold' && (
                        <Button 
                          size="small" 
                          icon={<DeleteOutlined />} 
                          danger
                          type="text"
                        >
                          Remove
                        </Button>
                      )}
                    </Space>
                  )
                }
              ]}
              pagination={{ pageSize: 5 }}
            />
          </TabPane>
          
          <TabPane 
            tab={<span className="flex items-center px-1"><TrophyOutlined className="mr-2" /> Bids</span>} 
            key="bids"
          >
            <Table 
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
                {
                  title: 'Buyer',
                  dataIndex: 'buyer',
                  key: 'buyer',
                },
                {
                  title: 'Bid Amount',
                  dataIndex: 'amount',
                  key: 'amount',
                  render: amount => formatLKR(amount)
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
                      pending: 'gold',
                      accepted: 'green',
                      rejected: 'red'
                    };
                    return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
                  }
                },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <div className="space-x-2">
                      {record.status === 'pending' && (
                        <>
                          <Button 
                            size="small" 
                            type="primary"
                            onClick={() => handleOpenAcceptBidModal(record)}
                          >
                            Accept
                          </Button>
                          <Button size="small" danger>
                            Reject
                          </Button>
                        </>
                      )}
                      {record.status === 'accepted' && (
                        <Button size="small" type="primary">
                          Schedule Meeting
                        </Button>
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
          >
            <Table 
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
                  title: 'Buyer',
                  dataIndex: 'buyer',
                  key: 'buyer',
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
          </TabPane>
        </Tabs>
      </Card>      {/* Add Listing Modal */}
      <Modal
        open={isAddListingModalVisible}
        title="Add New Gemstone Listing"
        onCancel={() => setIsAddListingModalVisible(false)}
        footer={null}
        width={720}
        style={{ top: 20 }}
        destroyOnClose
      >
        <div className="-mx-6 -mt-6">
          <GemListingForm onSubmit={handleAddListing} onCancel={() => setIsAddListingModalVisible(false)} />
        </div>
      </Modal>

      {/* Edit Listing Modal */}
      <Modal
        visible={isEditListingModalVisible}
        title="Edit Gemstone Listing"
        onCancel={() => setIsEditListingModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedListing && (
          <Form
            form={editListingForm}
            layout="vertical"
            onFinish={handleEditListing}
            initialValues={{
              name: selectedListing.name,
              price: selectedListing.price
            }}
          >
            <Form.Item
              label="Gemstone Name"
              name="name"
              rules={[{ required: true, message: 'Please enter gemstone name' }]}
            >
              <Input placeholder="e.g. Blue Sapphire" />
            </Form.Item>
            
            <Form.Item
              label="Price (USD)"
              name="price"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber
                placeholder="Enter price"
                style={{ width: '100%' }}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3}))/g, ',')}
                parser={(value: string | undefined) => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
              />
            </Form.Item>
            
            <Form.Item
              label="Description"
              name="description"
            >
              <Input.TextArea rows={4} placeholder="Enter gemstone description..." />
            </Form.Item>
            
            <Form.Item>
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setIsEditListingModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Accept Bid Modal */}
      <Modal
        visible={isAcceptBidModalVisible}
        title="Accept Bid"
        onCancel={() => setIsAcceptBidModalVisible(false)}
        onOk={handleAcceptBid}
        okText="Accept Bid"
        cancelText="Cancel"
      >
        {selectedBid && (
          <div className="space-y-4">
            <p>
              Are you sure you want to accept the following bid?
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p><strong>Gemstone:</strong> {selectedBid.gemstone}</p>
              <p><strong>Buyer:</strong> {selectedBid.buyer}</p>
              <p><strong>Bid Amount:</strong> ${selectedBid.amount.toLocaleString()}</p>
              <p><strong>Date:</strong> {dayjs(selectedBid.date).format('MMMM D, YYYY')}</p>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>By accepting this bid, you agree to meet with the buyer to complete the transaction.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SellerDashboard;
