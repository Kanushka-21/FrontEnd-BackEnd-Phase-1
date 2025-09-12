import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  message,
  Statistic,
  Row,
  Col,
  Tabs,
  Badge,
  Select,
  Divider,
  Typography,
  Tooltip,
  Alert
} from 'antd';
import {
  UserOutlined,
  WarningOutlined,
  StopOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import { api } from '../../../services/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userRole: string;
  accountStatus: string;
  noShowCount: number;
  lastNoShowDate?: string;
  isActive: boolean;
  blockingReason?: string;
  blockedAt?: string;
  createdAt: string;
}

interface Meeting {
  id: string;
  meetingDisplayId: string;
  gemName: string;
  buyerId: string;
  sellerId: string;
  confirmedDateTime: string;
  location: string;
  status: string;
  buyerAttended?: boolean;
  sellerAttended?: boolean;
  adminVerified: boolean;
  buyerReasonSubmission?: string;
  sellerReasonSubmission?: string;
  buyerReasonAccepted?: boolean;
  sellerReasonAccepted?: boolean;
  adminNotes?: string;
}

const NoShowManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [statistics, setStatistics] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Modals
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [reasonReviewModalVisible, setReasonReviewModalVisible] = useState(false);
  
  // Forms
  const [form] = Form.useForm();
  const [attendanceForm] = Form.useForm();
  const [reasonForm] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchMeetings(),
        fetchStatistics()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users/with-no-show-stats');
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await api.get('/meetings/admin/all');
      if (response.data.success) {
        setMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/users/no-show-statistics');
      if (response.data.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleMarkAttendance = async (values: any) => {
    try {
      const response = await api.post(`/meetings/admin/${selectedMeeting?.id}/mark-attendance`, {
        adminId: localStorage.getItem('userId'),
        buyerAttended: values.buyerAttended,
        sellerAttended: values.sellerAttended,
        adminNotes: values.adminNotes
      });

      if (response.data.success) {
        message.success('Attendance marked successfully');
        setAttendanceModalVisible(false);
        attendanceForm.resetFields();
        fetchData();
      } else {
        message.error(response.data.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      message.error('Failed to mark attendance');
    }
  };

  const handleReviewReason = async (values: any) => {
    try {
      const response = await api.post(`/meetings/admin/${selectedMeeting?.id}/review-absence-reason`, {
        userId: values.userId,
        accepted: values.accepted,
        adminNotes: values.adminNotes
      });

      if (response.data.success) {
        message.success(`Reason ${values.accepted ? 'accepted' : 'rejected'} successfully`);
        setReasonReviewModalVisible(false);
        reasonForm.resetFields();
        fetchData();
      } else {
        message.error(response.data.message || 'Failed to review reason');
      }
    } catch (error) {
      console.error('Error reviewing reason:', error);
      message.error('Failed to review reason');
    }
  };

  const handleUnblockUser = async (userId: string, adminNotes: string) => {
    try {
      // Use the new no-show management endpoint that reduces no-show count
      const response = await fetch('http://localhost:9092/api/admin/no-show/unblock-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          adminId: 'admin', // You might want to get this from auth context
          reason: adminNotes || 'Unblocked via No-Show Management'
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newNoShowCount = data.newNoShowCount !== undefined ? data.newNoShowCount : 'unknown';
        message.success(
          `User unblocked successfully! No-show count reduced to ${newNoShowCount}.`,
          5
        );
        fetchData();
      } else {
        message.error(data.message || 'Failed to unblock user');
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
      message.error('Failed to unblock user');
    }
  };

  const handleResetNoShows = async (userId: string, adminNotes: string) => {
    try {
      const response = await api.post(`/admin/users/${userId}/reset-no-shows`, {
        adminNotes
      });

      if (response.data.success) {
        message.success('No-show count reset successfully');
        fetchData();
      } else {
        message.error(response.data.message || 'Failed to reset no-show count');
      }
    } catch (error) {
      console.error('Error resetting no-show count:', error);
      message.error('Failed to reset no-show count');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'WARNED': return 'orange';
      case 'BLOCKED': return 'red';
      default: return 'default';
    }
  };

  const getMeetingStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'CONFIRMED': return 'blue';
      case 'NO_SHOW_RECORDED': return 'red';
      case 'PENDING': return 'orange';
      default: return 'default';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery || 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phoneNumber.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'ALL' || user.accountStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const userColumns = [
    {
      title: 'User',
      key: 'user',
      render: (record: User) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.firstName} {record.lastName}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.email}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.phoneNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'userRole',
      key: 'userRole',
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'purple' : role === 'SELLER' ? 'blue' : 'green'}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'accountStatus',
      key: 'accountStatus',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'No-Shows',
      dataIndex: 'noShowCount',
      key: 'noShowCount',
      render: (count: number) => (
        <Badge count={count || 0} showZero color={count > 1 ? 'red' : count > 0 ? 'orange' : 'green'} />
      ),
    },
    {
      title: 'Last No-Show',
      dataIndex: 'lastNoShowDate',
      key: 'lastNoShowDate',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: User) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedUser(record);
              setUserModalVisible(true);
            }}
          >
            View
          </Button>
          {record.accountStatus === 'BLOCKED' && (
            <Tooltip title="Unblock user and reduce their no-show count by 1 as administrative grace">
              <Button
                type="primary"
                size="small"
                icon={<UnlockOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: '🔓 Unblock User & Reduce No-Show Count',
                    content: (
                      <div>
                        <p>Are you sure you want to unblock <strong>{record.firstName} {record.lastName}</strong>?</p>
                        <div style={{ 
                          backgroundColor: '#fff7e6', 
                          border: '1px solid #ffd666', 
                          borderRadius: '6px', 
                          padding: '12px', 
                          margin: '12px 0' 
                        }}>
                          <p style={{ margin: 0, fontWeight: 'bold', color: '#fa8c16' }}>
                            ⚠️ This action will:
                          </p>
                          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#666' }}>
                            <li>Change account status to ACTIVE</li>
                            <li>Reduce no-show count by 1 (current: {record.noShowCount})</li>
                            <li>Send notification email to user</li>
                          </ul>
                        </div>
                        <TextArea
                          placeholder="Admin notes (optional)"
                          id="unblock-notes"
                          rows={3}
                        />
                      </div>
                    ),
                    onOk: () => {
                      const notes = (document.getElementById('unblock-notes') as HTMLTextAreaElement)?.value || '';
                      handleUnblockUser(record.id, notes);
                    }
                  });
                }}
              >
                🔓 Unblock & Reduce Count
              </Button>
            </Tooltip>
          )}
          {record.noShowCount > 0 && (
            <Button
              size="small"
              onClick={() => {
                Modal.confirm({
                  title: 'Reset No-Show Count',
                  content: (
                    <div>
                      <p>Reset no-show count for {record.firstName} {record.lastName}?</p>
                      <p>Current count: {record.noShowCount}</p>
                      <TextArea
                        placeholder="Reason for reset"
                        id="reset-notes"
                        rows={3}
                      />
                    </div>
                  ),
                  onOk: () => {
                    const notes = (document.getElementById('reset-notes') as HTMLTextAreaElement)?.value || '';
                    handleResetNoShows(record.id, notes);
                  }
                });
              }}
            >
              Reset Count
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const meetingColumns = [
    {
      title: 'Meeting ID',
      dataIndex: 'meetingDisplayId',
      key: 'meetingDisplayId',
      render: (id: string) => (
        <Text code>{id}</Text>
      ),
    },
    {
      title: 'Gemstone',
      dataIndex: 'gemName',
      key: 'gemName',
    },
    {
      title: 'Date & Time',
      dataIndex: 'confirmedDateTime',
      key: 'confirmedDateTime',
      render: (date: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getMeetingStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Attendance',
      key: 'attendance',
      render: (record: Meeting) => (
        <div>
          {record.adminVerified ? (
            <div>
              <div>
                Buyer: {record.buyerAttended === true ? '✅' : record.buyerAttended === false ? '❌' : '❓'}
                {record.buyerReasonSubmission && (
                  <Tooltip title={record.buyerReasonSubmission}>
                    <QuestionCircleOutlined style={{ marginLeft: 4, color: '#1890ff' }} />
                  </Tooltip>
                )}
              </div>
              <div>
                Seller: {record.sellerAttended === true ? '✅' : record.sellerAttended === false ? '❌' : '❓'}
                {record.sellerReasonSubmission && (
                  <Tooltip title={record.sellerReasonSubmission}>
                    <QuestionCircleOutlined style={{ marginLeft: 4, color: '#1890ff' }} />
                  </Tooltip>
                )}
              </div>
            </div>
          ) : (
            <Text type="secondary">Not verified</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Meeting) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedMeeting(record);
              setMeetingModalVisible(true);
            }}
          >
            View
          </Button>
          {record.status === 'CONFIRMED' && !record.adminVerified && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setSelectedMeeting(record);
                setAttendanceModalVisible(true);
              }}
            >
              Mark Attendance
            </Button>
          )}
          {(record.buyerReasonSubmission || record.sellerReasonSubmission) && (
            <Button
              size="small"
              icon={<QuestionCircleOutlined />}
              onClick={() => {
                setSelectedMeeting(record);
                setReasonReviewModalVisible(true);
              }}
            >
              Review Reasons
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <StopOutlined style={{ marginRight: 8 }} />
        No-Show Management System
      </Title>

      {/* Enhanced Unblock Feature Alert */}
      <Alert
        message="🆕 Enhanced Unblock Feature"
        description={
          <span>
            When you unblock a user, their no-show count will be automatically reduced by 1 as administrative grace. 
            This encourages better attendance while maintaining accountability. 
            <br />
            <strong>New process:</strong> Unblock → Account activated + No-show count reduced + Email notification sent
          </span>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        closable
      />

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={statistics.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={statistics.activeUsers || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Warned Users"
              value={statistics.warnedUsers || 0}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Blocked Users"
              value={statistics.blockedUsers || 0}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="users" size="large">
        <TabPane tab={<span><UserOutlined />User Management</span>} key="users">
          <Card>
            <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
              <Input
                placeholder="Search users by name, email, or phone"
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 300 }}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 150 }}
              >
                <Option value="ALL">All Status</Option>
                <Option value="ACTIVE">Active</Option>
                <Option value="WARNED">Warned</Option>
                <Option value="BLOCKED">Blocked</Option>
              </Select>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                loading={loading}
              >
                Refresh
              </Button>
            </div>

            <Table
              columns={userColumns}
              dataSource={filteredUsers}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab={<span><CheckCircleOutlined />Meeting Verification</span>} key="meetings">
          <Card>
            <div style={{ marginBottom: 16 }}>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchData}
                loading={loading}
              >
                Refresh Meetings
              </Button>
            </div>

            <Table
              columns={meetingColumns}
              dataSource={meetings.filter(m => m.status === 'CONFIRMED' || m.adminVerified)}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} meetings`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* User Detail Modal */}
      <Modal
        title={`User Details - ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        visible={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Phone:</strong> {selectedUser.phoneNumber}</p>
                <p><strong>Role:</strong> {selectedUser.userRole}</p>
                <p><strong>Status:</strong> 
                  <Tag color={getStatusColor(selectedUser.accountStatus)} style={{ marginLeft: 8 }}>
                    {selectedUser.accountStatus}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <p><strong>No-Show Count:</strong> {selectedUser.noShowCount || 0}</p>
                <p><strong>Last No-Show:</strong> {selectedUser.lastNoShowDate ? new Date(selectedUser.lastNoShowDate).toLocaleDateString() : 'Never'}</p>
                <p><strong>Account Created:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                {selectedUser.blockedAt && (
                  <p><strong>Blocked Date:</strong> {new Date(selectedUser.blockedAt).toLocaleDateString()}</p>
                )}
              </Col>
            </Row>
            
            {selectedUser.blockingReason && (
              <div style={{ marginTop: 16 }}>
                <Divider />
                <Alert
                  message="Blocking Reason"
                  description={selectedUser.blockingReason}
                  type="error"
                  showIcon
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Meeting Detail Modal */}
      <Modal
        title={`Meeting Details - ${selectedMeeting?.meetingDisplayId}`}
        visible={meetingModalVisible}
        onCancel={() => setMeetingModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedMeeting && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <p><strong>Gemstone:</strong> {selectedMeeting.gemName}</p>
                <p><strong>Date & Time:</strong> {new Date(selectedMeeting.confirmedDateTime).toLocaleString()}</p>
                <p><strong>Location:</strong> {selectedMeeting.location}</p>
                <p><strong>Status:</strong> 
                  <Tag color={getMeetingStatusColor(selectedMeeting.status)} style={{ marginLeft: 8 }}>
                    {selectedMeeting.status.replace('_', ' ')}
                  </Tag>
                </p>
              </Col>
              <Col span={12}>
                <p><strong>Admin Verified:</strong> {selectedMeeting.adminVerified ? 'Yes' : 'No'}</p>
                {selectedMeeting.adminVerified && (
                  <>
                    <p><strong>Buyer Attended:</strong> {
                      selectedMeeting.buyerAttended === true ? '✅ Yes' : 
                      selectedMeeting.buyerAttended === false ? '❌ No' : '❓ Unknown'
                    }</p>
                    <p><strong>Seller Attended:</strong> {
                      selectedMeeting.sellerAttended === true ? '✅ Yes' : 
                      selectedMeeting.sellerAttended === false ? '❌ No' : '❓ Unknown'
                    }</p>
                  </>
                )}
              </Col>
            </Row>

            {(selectedMeeting.buyerReasonSubmission || selectedMeeting.sellerReasonSubmission) && (
              <div style={{ marginTop: 16 }}>
                <Divider />
                <Title level={5}>Submitted Reasons</Title>
                {selectedMeeting.buyerReasonSubmission && (
                  <Alert
                    message={`Buyer Reason ${selectedMeeting.buyerReasonAccepted === true ? '(Accepted)' : selectedMeeting.buyerReasonAccepted === false ? '(Rejected)' : '(Pending Review)'}`}
                    description={selectedMeeting.buyerReasonSubmission}
                    type={selectedMeeting.buyerReasonAccepted === true ? 'success' : selectedMeeting.buyerReasonAccepted === false ? 'error' : 'info'}
                    style={{ marginBottom: 8 }}
                  />
                )}
                {selectedMeeting.sellerReasonSubmission && (
                  <Alert
                    message={`Seller Reason ${selectedMeeting.sellerReasonAccepted === true ? '(Accepted)' : selectedMeeting.sellerReasonAccepted === false ? '(Rejected)' : '(Pending Review)'}`}
                    description={selectedMeeting.sellerReasonSubmission}
                    type={selectedMeeting.sellerReasonAccepted === true ? 'success' : selectedMeeting.sellerReasonAccepted === false ? 'error' : 'info'}
                  />
                )}
              </div>
            )}

            {selectedMeeting.adminNotes && (
              <div style={{ marginTop: 16 }}>
                <Divider />
                <Alert
                  message="Admin Notes"
                  description={selectedMeeting.adminNotes}
                  type="info"
                  showIcon
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Mark Attendance Modal */}
      <Modal
        title="Mark Meeting Attendance"
        visible={attendanceModalVisible}
        onCancel={() => setAttendanceModalVisible(false)}
        onOk={() => attendanceForm.submit()}
      >
        <Form
          form={attendanceForm}
          layout="vertical"
          onFinish={handleMarkAttendance}
        >
          <Alert
            message={`Meeting: ${selectedMeeting?.meetingDisplayId} - ${selectedMeeting?.gemName}`}
            description={`Date: ${selectedMeeting?.confirmedDateTime ? new Date(selectedMeeting.confirmedDateTime).toLocaleString() : 'N/A'}`}
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="Buyer Attendance"
            name="buyerAttended"
            rules={[{ required: true, message: 'Please mark buyer attendance' }]}
          >
            <Select placeholder="Select buyer attendance">
              <Option value={true}>✅ Attended</Option>
              <Option value={false}>❌ No Show</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Seller Attendance"
            name="sellerAttended"
            rules={[{ required: true, message: 'Please mark seller attendance' }]}
          >
            <Select placeholder="Select seller attendance">
              <Option value={true}>✅ Attended</Option>
              <Option value={false}>❌ No Show</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Admin Notes"
            name="adminNotes"
          >
            <TextArea
              rows={3}
              placeholder="Any additional notes about the meeting verification..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reason Review Modal */}
      <Modal
        title="Review Absence Reasons"
        visible={reasonReviewModalVisible}
        onCancel={() => setReasonReviewModalVisible(false)}
        onOk={() => reasonForm.submit()}
      >
        <Form
          form={reasonForm}
          layout="vertical"
          onFinish={handleReviewReason}
        >
          <Alert
            message={`Meeting: ${selectedMeeting?.meetingDisplayId} - ${selectedMeeting?.gemName}`}
            type="info"
            style={{ marginBottom: 16 }}
          />

          {selectedMeeting?.buyerReasonSubmission && (
            <div style={{ marginBottom: 16 }}>
              <Alert
                message="Buyer's Reason"
                description={selectedMeeting.buyerReasonSubmission}
                type="info"
              />
            </div>
          )}

          {selectedMeeting?.sellerReasonSubmission && (
            <div style={{ marginBottom: 16 }}>
              <Alert
                message="Seller's Reason"
                description={selectedMeeting.sellerReasonSubmission}
                type="info"
              />
            </div>
          )}

          <Form.Item
            label="Review For"
            name="userId"
            rules={[{ required: true, message: 'Please select user to review' }]}
          >
            <Select placeholder="Select user to review">
              {selectedMeeting?.buyerReasonSubmission && (
                <Option value={selectedMeeting.buyerId}>Buyer</Option>
              )}
              {selectedMeeting?.sellerReasonSubmission && (
                <Option value={selectedMeeting.sellerId}>Seller</Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            label="Decision"
            name="accepted"
            rules={[{ required: true, message: 'Please make a decision' }]}
          >
            <Select placeholder="Accept or reject the reason">
              <Option value={true}>✅ Accept Reason</Option>
              <Option value={false}>❌ Reject Reason</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Admin Notes"
            name="adminNotes"
          >
            <TextArea
              rows={3}
              placeholder="Explain your decision..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NoShowManagement;
