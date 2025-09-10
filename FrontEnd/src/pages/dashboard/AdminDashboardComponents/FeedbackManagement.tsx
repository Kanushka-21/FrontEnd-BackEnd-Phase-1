import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Button, Space, message, Modal, Typography, 
  Rate, Tag, Avatar, Tooltip, Pagination, Input, Select 
} from 'antd';
import { 
  DeleteOutlined, EyeOutlined, MessageOutlined, 
  UserOutlined, CalendarOutlined, StarOutlined,
  ExclamationCircleOutlined, ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { AdminComponentProps } from './shared';
import { api } from '@/services/api';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;
const { Search } = Input;
const { Option } = Select;

interface Feedback {
  id: string;
  name: string;
  title: string;
  message: string;
  rating: number;
  fromRole: string;
  toRole: string;
  createdAt: string;
  isApproved: boolean;
  transactionId?: string;
  fromUserName?: string;
  fromUserEmail?: string;
  toUserName?: string;
  toUserEmail?: string;
}

interface FeedbackResponse {
  feedbacks: Feedback[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const FeedbackManagement: React.FC<AdminComponentProps> = ({ user, onTabChange }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Fetch feedbacks from backend
  const fetchFeedbacks = async (page: number = 0, size: number = 10) => {
    try {
      setLoading(true);
      console.log('🔄 Fetching admin feedbacks...');
      
      const response = await api.admin.getAllFeedbacks(page, size);
      
      if (response.success && response.data) {
        const feedbackData: FeedbackResponse = response.data;
        setFeedbacks(feedbackData.feedbacks);
        setTotalElements(feedbackData.totalElements);
        setCurrentPage(feedbackData.currentPage);
        
        console.log('✅ Feedbacks loaded:', feedbackData.feedbacks.length);
        message.success(`Loaded ${feedbackData.feedbacks.length} feedbacks`);
      } else {
        console.error('❌ Failed to fetch feedbacks:', response.message);
        message.error('Failed to load feedbacks');
      }
    } catch (error) {
      console.error('❌ Error fetching feedbacks:', error);
      message.error('Error loading feedbacks');
    } finally {
      setLoading(false);
    }
  };

  // Delete feedback
  const handleDeleteFeedback = (feedback: Feedback) => {
    confirm({
      title: 'Delete Feedback',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to delete this feedback?</p>
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <p><strong>From:</strong> {feedback.name}</p>
            <p><strong>Title:</strong> {feedback.title}</p>
            <p><strong>Rating:</strong> <Rate disabled defaultValue={feedback.rating} /></p>
          </div>
          <p className="mt-2 text-red-600">
            <strong>Warning:</strong> This action cannot be undone and will remove the feedback from the homepage.
          </p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setDeleteLoading(feedback.id);
          console.log('🗑️ Deleting feedback:', feedback.id);
          
          const response = await api.admin.deleteFeedback(feedback.id);
          
          if (response.success) {
            message.success('Feedback deleted successfully');
            // Refresh the feedbacks list
            fetchFeedbacks(currentPage, pageSize);
          } else {
            message.error(response.message || 'Failed to delete feedback');
          }
        } catch (error) {
          console.error('❌ Error deleting feedback:', error);
          message.error('Error deleting feedback');
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  // View feedback details
  const handleViewFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setModalVisible(true);
  };

  // Filter feedbacks based on search and filters
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = !searchTerm || 
      feedback.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.fromUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.toUserName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = !ratingFilter || feedback.rating === ratingFilter;
    const matchesRole = !roleFilter || feedback.fromRole === roleFilter || feedback.toRole === roleFilter;
    
    return matchesSearch && matchesRating && matchesRole;
  });

  // Table columns
  const columns = [
    {
      title: 'From User',
      key: 'fromUser',
      render: (_, record: Feedback) => (
        <div className="flex items-center space-x-2">
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" className="text-xs">
              {record.fromUserEmail || 'Unknown'}
            </Text>
            <br />
            <Tag size="small" color="blue">{record.fromRole}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'To User',
      key: 'toUser',
      render: (_, record: Feedback) => (
        <div className="flex items-center space-x-2">
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <Text strong>{record.toUserName || 'Unknown'}</Text>
            <br />
            <Text type="secondary" className="text-xs">
              {record.toUserEmail || 'Unknown'}
            </Text>
            <br />
            <Tag size="small" color="green">{record.toRole}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Feedback',
      key: 'feedback',
      render: (_, record: Feedback) => (
        <div>
          <Text strong className="block">{record.title}</Text>
          <Text className="text-sm text-gray-600 block mb-2">
            {record.message.length > 100 
              ? `${record.message.substring(0, 100)}...` 
              : record.message}
          </Text>
          <Rate disabled defaultValue={record.rating} className="text-sm" />
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => (
        <div className="flex items-center space-x-1">
          <CalendarOutlined className="text-gray-400" />
          <Text className="text-sm">
            {dayjs(createdAt).format('MMM DD, YYYY')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record: Feedback) => (
        <div>
          <Tag color={record.isApproved ? 'green' : 'orange'}>
            {record.isApproved ? 'Approved' : 'Pending'}
          </Tag>
          {record.transactionId && (
            <Tooltip title="Linked to transaction">
              <Tag color="purple" className="mt-1">Transaction</Tag>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: Feedback) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="primary"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewFeedback(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Feedback">
            <Button 
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={deleteLoading === record.id}
              onClick={() => handleDeleteFeedback(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handle page change
  const handlePageChange = (page: number, newPageSize?: number) => {
    const newPage = page - 1; // Convert to 0-indexed
    const size = newPageSize || pageSize;
    setPageSize(size);
    fetchFeedbacks(newPage, size);
  };

  // Refresh feedbacks
  const handleRefresh = () => {
    fetchFeedbacks(currentPage, pageSize);
  };

  // Load feedbacks on component mount
  useEffect(() => {
    fetchFeedbacks(0, pageSize);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <Title level={2} className="mb-1">
            <MessageOutlined className="mr-2" />
            Feedback Management
          </Title>
          <Text type="secondary">
            Manage user feedback and testimonials displayed on the homepage
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card size="small">
          <div className="text-center">
            <Title level={3} className="mb-1">{totalElements}</Title>
            <Text type="secondary">Total Feedbacks</Text>
          </div>
        </Card>
        <Card size="small">
          <div className="text-center">
            <Title level={3} className="mb-1">
              {feedbacks.filter(f => f.isApproved).length}
            </Title>
            <Text type="secondary">Approved</Text>
          </div>
        </Card>
        <Card size="small">
          <div className="text-center">
            <Title level={3} className="mb-1">
              {feedbacks.length > 0 
                ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
                : '0.0'}
            </Title>
            <Text type="secondary">Average Rating</Text>
          </div>
        </Card>
        <Card size="small">
          <div className="text-center">
            <Title level={3} className="mb-1">
              {feedbacks.filter(f => f.rating === 5).length}
            </Title>
            <Text type="secondary">5-Star Reviews</Text>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Search
            placeholder="Search by name, title, or message"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
          />
          <Select
            placeholder="Filter by rating"
            value={ratingFilter}
            onChange={setRatingFilter}
            allowClear
            className="w-full"
          >
            <Option value={5}>5 Stars</Option>
            <Option value={4}>4 Stars</Option>
            <Option value={3}>3 Stars</Option>
            <Option value={2}>2 Stars</Option>
            <Option value={1}>1 Star</Option>
          </Select>
          <Select
            placeholder="Filter by role"
            value={roleFilter}
            onChange={setRoleFilter}
            allowClear
            className="w-full"
          >
            <Option value="SELLER">From Sellers</Option>
            <Option value="BUYER">From Buyers</Option>
            <Option value="USER">From Users</Option>
          </Select>
        </div>
      </Card>

      {/* Feedbacks Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredFeedbacks}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
          className="feedback-table"
        />
        
        {/* Custom Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <Text type="secondary">
            Showing {Math.min(filteredFeedbacks.length, pageSize)} of {totalElements} feedbacks
          </Text>
          <Pagination
            current={currentPage + 1}
            total={totalElements}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} feedbacks`
            }
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </div>
      </Card>

      {/* Feedback Details Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <MessageOutlined />
            <span>Feedback Details</span>
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
          selectedFeedback && (
            <Button 
              key="delete" 
              type="primary" 
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setModalVisible(false);
                if (selectedFeedback) {
                  handleDeleteFeedback(selectedFeedback);
                }
              }}
            >
              Delete Feedback
            </Button>
          )
        ]}
        width={600}
      >
        {selectedFeedback && (
          <div className="space-y-4">
            {/* User Information */}
            <div className="grid grid-cols-2 gap-4">
              <Card size="small" title="From User" className="h-full">
                <div className="flex items-center space-x-3">
                  <Avatar icon={<UserOutlined />} size="large" />
                  <div>
                    <Text strong className="block">{selectedFeedback.name}</Text>
                    <Text type="secondary" className="text-sm">
                      {selectedFeedback.fromUserEmail || 'Unknown email'}
                    </Text>
                    <div className="mt-1">
                      <Tag color="blue">{selectedFeedback.fromRole}</Tag>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card size="small" title="To User" className="h-full">
                <div className="flex items-center space-x-3">
                  <Avatar icon={<UserOutlined />} size="large" />
                  <div>
                    <Text strong className="block">
                      {selectedFeedback.toUserName || 'Unknown'}
                    </Text>
                    <Text type="secondary" className="text-sm">
                      {selectedFeedback.toUserEmail || 'Unknown email'}
                    </Text>
                    <div className="mt-1">
                      <Tag color="green">{selectedFeedback.toRole}</Tag>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Feedback Content */}
            <Card size="small" title="Feedback Content">
              <div className="space-y-3">
                <div>
                  <Text strong>Title:</Text>
                  <Title level={4} className="mt-1">{selectedFeedback.title}</Title>
                </div>
                
                <div>
                  <Text strong>Rating:</Text>
                  <div className="mt-1 flex items-center space-x-2">
                    <Rate disabled defaultValue={selectedFeedback.rating} />
                    <Text>({selectedFeedback.rating}/5)</Text>
                  </div>
                </div>
                
                <div>
                  <Text strong>Message:</Text>
                  <Paragraph className="mt-1 p-3 bg-gray-50 rounded">
                    {selectedFeedback.message}
                  </Paragraph>
                </div>
              </div>
            </Card>

            {/* Metadata */}
            <Card size="small" title="Metadata">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Text>Created:</Text>
                  <Text>{dayjs(selectedFeedback.createdAt).format('MMMM DD, YYYY [at] HH:mm')}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Status:</Text>
                  <Tag color={selectedFeedback.isApproved ? 'green' : 'orange'}>
                    {selectedFeedback.isApproved ? 'Approved' : 'Pending'}
                  </Tag>
                </div>
                {selectedFeedback.transactionId && (
                  <div className="flex justify-between">
                    <Text>Transaction ID:</Text>
                    <Text code>{selectedFeedback.transactionId}</Text>
                  </div>
                )}
                <div className="flex justify-between">
                  <Text>Feedback ID:</Text>
                  <Text code>{selectedFeedback.id}</Text>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FeedbackManagement;
