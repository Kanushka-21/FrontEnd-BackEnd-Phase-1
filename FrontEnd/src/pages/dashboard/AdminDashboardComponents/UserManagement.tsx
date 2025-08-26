import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Input, Tabs, Switch, message, Spin, Alert, Modal, Descriptions, Image, Card } from 'antd';
import { 
  EyeOutlined, CheckOutlined, CloseOutlined, 
  LockOutlined, UnlockOutlined, UserOutlined, ReloadOutlined,
  PhoneOutlined, MailOutlined, CalendarOutlined, IdcardOutlined,
  HomeOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { api } from '@/services/api';
import { AdminComponentProps, ActionHandlers } from './shared';

interface UserManagementProps extends AdminComponentProps {
  actionHandlers: ActionHandlers;
}

// Extended User interface for real data
interface RealUser {
  userId: string;
  id?: string;
  _id?: { $oid: string };
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  userRole?: string;
  isVerified: boolean;
  verificationStatus: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  phoneNumber?: string;
  profilePicture?: string;
  address?: string;
  dateOfBirth?: string;
  nicNumber?: string;
  bio?: string;
  faceImagePath?: string;
  nicImagePath?: string;
  extractedNicImagePath?: string;
  isFaceVerified?: boolean;
  isNicVerified?: boolean;
  isLocked?: boolean;
  // Additional computed fields
  name?: string;
  status?: string;
  joinDate?: string;
  lastActive?: string;
  listings?: number;
  transactions?: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ actionHandlers }) => {
  const [allUsers, setAllUsers] = useState<RealUser[]>([]);
  const [pendingUsers, setPendingUsers] = useState<RealUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<RealUser | null>(null);
  const [userDetailsVisible, setUserDetailsVisible] = useState(false);
  const [userDetailsLoading, setUserDetailsLoading] = useState(false);
  const { handleViewUser } = actionHandlers;

  // Fetch users from database
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getUsers();
      
      if (response.success && response.data) {
        // Filter out admin users and transform data
        const nonAdminUsers = response.data
          .filter((user: any) => {
            const userRole = user.userRole || user.role;
            return userRole?.toLowerCase() !== 'admin';
          })
          .map((user: any) => ({
            ...user,
            userId: user._id?.$oid || user.userId || user.id,
            id: user._id?.$oid || user.userId || user.id,
            role: user.userRole || user.role || 'BUYER',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            status: user.isActive ? 'active' : 'inactive',
            joinDate: user.createdAt,
            lastActive: user.lastLoginAt || user.createdAt,
            listings: 0, // TODO: Fetch from listings API
            transactions: 0, // TODO: Fetch from transactions API
          }));

        setAllUsers(nonAdminUsers);
        
        // Filter unverified users (users with status UNVERIFIED)
        const unverified = nonAdminUsers.filter((user: RealUser) => 
          !user.isVerified || 
          user.verificationStatus === 'UNVERIFIED' ||
          user.verificationStatus === 'PENDING'
        );
        setPendingUsers(unverified);
        
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Failed to load user data');
      message.error('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch detailed user information
  const fetchUserDetails = async (userId: string) => {
    setUserDetailsLoading(true);
    try {
      console.log('Fetching user details for:', userId);
      
      // Try to fetch from API first
      try {
        const response = await api.getUserProfile(userId);
        if (response.success && response.data) {
          console.log('✅ Successfully fetched user details from API:', response.data);
          
          // Log image paths for debugging
          console.log('🖼️ Face Image Path:', response.data.faceImagePath);
          console.log('🖼️ NIC Image Path:', response.data.nicImagePath);
          console.log('🖼️ Extracted NIC Image Path:', response.data.extractedNicImagePath);
          
          setSelectedUser(response.data as any);
          setUserDetailsVisible(true);
          return;
        }
      } catch (apiError) {
        console.warn('⚠️ API call failed, using existing user data:', apiError);
      }
      
      // Fallback to existing user data if API fails
      const existingUser = allUsers.find(u => 
        u.userId === userId || 
        u._id?.$oid === userId || 
        u.id === userId
      );
      
      if (!existingUser) {
        message.error('User not found');
        return;
      }
      
      // Create enhanced user details by combining existing data with additional fields
      const enhancedUserDetails = {
        ...existingUser,
        // Ensure all required fields are present
        userId: userId,
        id: userId,
        name: existingUser.name || `${existingUser.firstName || ''} ${existingUser.lastName || ''}`.trim(),
        role: existingUser.role || existingUser.userRole || 'BUYER',
        userRole: existingUser.userRole || existingUser.role || 'BUYER',
        joinDate: existingUser.joinDate || existingUser.createdAt || new Date().toISOString(),
        lastActive: existingUser.lastActive || existingUser.updatedAt || new Date().toISOString(),
        // Set image paths (will be served through API endpoint)
        faceImagePath: existingUser.faceImagePath || 'default_face.jpg',
        nicImagePath: existingUser.nicImagePath || 'default_nic.jpg',
        // Ensure boolean fields are proper booleans
        isVerified: existingUser.isVerified === true,
        isFaceVerified: existingUser.isFaceVerified === true,
        isNicVerified: existingUser.isNicVerified === true,
        isActive: existingUser.isActive !== false,
        isLocked: existingUser.isLocked === true,
      };
      
      setSelectedUser(enhancedUserDetails);
      setUserDetailsVisible(true);
      
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      message.error('Failed to load user details. Please try again.');
    } finally {
      setUserDetailsLoading(false);
    }
  };

  // Handle view user details
  const handleViewUserDetails = async (user: RealUser) => {
    const userId = user.userId || user._id?.$oid || user.id;
    if (userId) {
      await fetchUserDetails(userId);
    } else {
      message.error('User ID not found');
    }
  };

  // Handle user approval
  const handleApproveUserAction = async (user: RealUser) => {
    try {
      const userId = user.userId || user._id?.$oid || user.id;
      if (!userId) {
        throw new Error('User ID not found');
      }
      const response = await api.updateVerificationStatus(userId, true);
      if (response.success) {
        message.success(`User ${user.name} approved successfully`);
        fetchUsers(); // Refresh data
      } else {
        throw new Error(response.message || 'Failed to approve user');
      }
    } catch (error: any) {
      console.error('Error approving user:', error);
      message.error('Failed to approve user. Please try again.');
    }
  };

  // Handle user rejection
  const handleRejectUserAction = async (user: RealUser) => {
    try {
      const userId = user.userId || user._id?.$oid || user.id;
      if (!userId) {
        throw new Error('User ID not found');
      }
      const response = await api.updateVerificationStatus(userId, false);
      if (response.success) {
        message.success(`User ${user.name} rejected`);
        fetchUsers(); // Refresh data
      } else {
        throw new Error(response.message || 'Failed to reject user');
      }
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      message.error('Failed to reject user. Please try again.');
    }
  };

  // Handle user status toggle
  const handleToggleUserStatusAction = async (user: RealUser, isActive: boolean) => {
    try {
      const userId = user.userId || user._id?.$oid || user.id;
      if (!userId) {
        throw new Error('User ID not found');
      }
      const action = isActive ? 'activate' : 'deactivate';
      const response = await api.updateUserStatus(userId, action);
      if (response.success) {
        message.success(`User ${user.name} ${isActive ? 'activated' : 'deactivated'} successfully`);
        fetchUsers(); // Refresh data
      } else {
        throw new Error(response.message || `Failed to ${action} user`);
      }
    } catch (error: any) {
      console.error('Error updating user status:', error);
      message.error(`Failed to update user status. Please try again.`);
    }
  };

  // Filter users based on search term
  const filteredAllUsers = allUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUnverifiedUsers = pendingUsers.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: RealUser) => (
        <div className="flex items-center space-x-2">
          {record.profilePicture ? (
            <img 
              src={record.profilePicture} 
              alt={name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <UserOutlined className="text-gray-600" />
            </div>
          )}
          <span>{name}</span>
        </div>
      ),
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
      render: (role: string, record: RealUser) => {
        const userRole = role || record.userRole || 'BUYER';
        return (
          <Tag color={userRole?.toLowerCase() === 'seller' ? 'purple' : 'blue'}>
            {userRole?.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (isVerified: boolean, record: RealUser) => (
        <div className="space-y-1">
          <Tag color={record.isActive ? 'green' : 'red'}>
            {record.isActive ? 'ACTIVE' : 'INACTIVE'}
          </Tag>
          <Tag color="orange">
            UNVERIFIED
          </Tag>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RealUser) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewUserDetails(record)}
            loading={userDetailsLoading}
          >
            View
          </Button>
          <Button 
            size="small" 
            icon={<CheckOutlined />} 
            type="primary" 
            onClick={() => handleApproveUserAction(record)}
            loading={loading}
          >
            Verify
          </Button>
          <Button 
            size="small" 
            icon={<CloseOutlined />} 
            danger 
            onClick={() => handleRejectUserAction(record)}
            loading={loading}
          >
            Reject
          </Button>
        </Space>
      )
    }
  ];

  const allUsersColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: RealUser) => (
        <div className="flex items-center space-x-2">
          {record.profilePicture ? (
            <img 
              src={record.profilePicture} 
              alt={name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <UserOutlined className="text-gray-600" />
            </div>
          )}
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-500">ID: {record.userId}</div>
          </div>
        </div>
      ),
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
      render: (role: string, record: RealUser) => {
        const userRole = role || record.userRole || 'BUYER';
        return (
          <Tag color={userRole?.toLowerCase() === 'seller' ? 'purple' : 'blue'}>
            {userRole?.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: RealUser) => (
        <div className="space-y-1">
          <Tag color={status === 'active' ? 'success' : 'error'}>
            {status?.toUpperCase()}
          </Tag>
          <Tag color={record.isVerified ? 'green' : 'orange'}>
            {record.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
          </Tag>
        </div>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phone: string) => phone || '-',
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => date ? dayjs(date).format('MMM DD, YYYY') : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RealUser) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewUserDetails(record)}
            loading={userDetailsLoading}
          >
            View
          </Button>
          <Switch
            checkedChildren={<UnlockOutlined />}
            unCheckedChildren={<LockOutlined />}
            checked={record.status === 'active'}
            onChange={(checked) => handleToggleUserStatusAction(record, checked)}
            loading={loading}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">User Management</h2>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchUsers}
            loading={loading}
            size="small"
          >
            Refresh
          </Button>
        </div>
        <Input.Search
          placeholder="Search users by name, email, or role..."
          style={{ width: 400 }}
          allowClear
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <Alert
          message="Error Loading Users"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
        />
      )}

      <Spin spinning={loading}>
        <Tabs defaultActiveKey="unverified" type="card">
          <Tabs.TabPane 
            tab={`Unverified Users (${filteredUnverifiedUsers.length})`} 
            key="unverified"
          >
            <div className="space-y-4">
              {filteredUnverifiedUsers.length > 0 ? (
                <>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <UserOutlined className="text-orange-600 mr-2" />
                      <span className="text-sm font-medium text-orange-800">
                        {filteredUnverifiedUsers.length} unverified users requiring attention
                      </span>
                    </div>
                  </div>
                  
                  <Table 
                    dataSource={filteredUnverifiedUsers}
                    columns={pendingColumns}
                    rowKey={(record) => record.userId || record._id?.$oid || record.id || ''}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} unverified users`
                    }}
                    size="middle"
                    scroll={{ x: 'max-content' }}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <UserOutlined className="text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All Users Verified
                  </h3>
                  <p className="text-gray-600">
                    All users have been verified and approved.
                  </p>
                </div>
              )}
            </div>
          </Tabs.TabPane>
          
          <Tabs.TabPane 
            tab={`All Users (${filteredAllUsers.length})`} 
            key="all"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                  <Button type="primary" size="small">
                    Export Users
                  </Button>
                  <Button type="default" size="small">
                    Filter
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  Total: {filteredAllUsers.length} users (excluding admins)
                </div>
              </div>
              
              <Table 
                dataSource={filteredAllUsers}
                columns={allUsersColumns}
                rowKey={(record) => record.userId || record._id?.$oid || record.id || ''}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} users`
                }}
                size="middle"
                scroll={{ x: 'max-content' }}
              />
            </div>
          </Tabs.TabPane>
        </Tabs>
      </Spin>

      {/* User Details Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <UserOutlined className="text-blue-600" />
            <span>User Details</span>
          </div>
        }
        open={userDetailsVisible}
        onCancel={() => {
          setUserDetailsVisible(false);
          setSelectedUser(null);
        }}
        footer={[
          <Button key="close" onClick={() => setUserDetailsVisible(false)}>
            Close
          </Button>,
          selectedUser && !selectedUser.isVerified && (
            <Button
              key="verify"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                if (selectedUser) {
                  handleApproveUserAction(selectedUser);
                  setUserDetailsVisible(false);
                }
              }}
              loading={loading}
            >
              Verify User
            </Button>
          ),
          selectedUser && !selectedUser.isVerified && (
            <Button
              key="reject"
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                if (selectedUser) {
                  handleRejectUserAction(selectedUser);
                  setUserDetailsVisible(false);
                }
              }}
              loading={loading}
            >
              Reject User
            </Button>
          ),
        ].filter(Boolean)}
        width={800}
        style={{ top: 20 }}
      >
        <Spin spinning={userDetailsLoading} tip="Loading user details...">
          {selectedUser && (
            <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {selectedUser.profilePicture ? (
                    <Image
                      src={selectedUser.profilePicture}
                      alt={selectedUser.name}
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserOutlined className="text-3xl text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                  <div className="flex items-center space-x-4 mt-2">
                    <Tag color={selectedUser.role?.toLowerCase() === 'seller' ? 'purple' : 'blue'} className="text-sm">
                      {selectedUser.role?.toUpperCase() || 'BUYER'}
                    </Tag>
                    <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                      {selectedUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Tag>
                    <Tag color={selectedUser.isVerified ? 'green' : 'orange'}>
                      {selectedUser.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>

            {/* Personal Information */}
            <Card title="Personal Information">
              <Descriptions column={2} bordered>
                <Descriptions.Item label={<><MailOutlined className="mr-1" />Email</>}>
                  {selectedUser.email}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined className="mr-1" />Phone</>}>
                  {selectedUser.phoneNumber || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined className="mr-1" />Date of Birth</>}>
                  {selectedUser.dateOfBirth ? dayjs(selectedUser.dateOfBirth).format('MMM DD, YYYY') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<><IdcardOutlined className="mr-1" />NIC Number</>}>
                  {selectedUser.nicNumber || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<><HomeOutlined className="mr-1" />Address</>} span={2}>
                  {selectedUser.address || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Verification Information */}
            <Card title="Verification Status">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Face Verification">
                  <Tag color={selectedUser.isFaceVerified ? 'green' : 'red'}>
                    {selectedUser.isFaceVerified ? 'VERIFIED' : 'NOT VERIFIED'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="NIC Verification">
                  <Tag color={selectedUser.isNicVerified ? 'green' : 'red'}>
                    {selectedUser.isNicVerified ? 'VERIFIED' : 'NOT VERIFIED'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Overall Status">
                  <Tag color={selectedUser.verificationStatus === 'VERIFIED' ? 'green' : 'orange'}>
                    {selectedUser.verificationStatus || 'PENDING'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Account Status">
                  <Tag color={selectedUser.isLocked ? 'red' : 'green'}>
                    {selectedUser.isLocked ? 'LOCKED' : 'UNLOCKED'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Images Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Captured Face Image */}
              <Card title="Captured Face Image" size="small">
                <div className="text-center">
                  <Image
                    src={selectedUser.faceImagePath ? 
                      `http://localhost:8080/api/users/image/face/${selectedUser.userId || selectedUser.id}` :
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPk5vIEZhY2UgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo='
                    }
                    alt="Captured face verification photo"
                    width={180}
                    height={180}
                    className="rounded-lg object-cover"
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+Cg=="
                    preview={{
                      mask: (
                        <div className="flex flex-col items-center">
                          <EyeOutlined style={{ fontSize: '20px' }} />
                          <span>Preview</span>
                        </div>
                      ),
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Direct selfie capture
                  </p>
                </div>
              </Card>

              {/* Extracted Face from NIC */}
              <Card title="Extracted Face from NIC" size="small">
                <div className="text-center">
                  <Image
                    src={selectedUser.extractedNicImagePath ? 
                      `http://localhost:8080/api/users/image/extracted/${selectedUser.userId || selectedUser.id}` :
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPk5vIEV4dHJhY3RlZCBGYWNlPC90ZXh0Pgo8L3N2Zz4K'
                    }
                    alt="Face extracted from NIC"
                    width={180}
                    height={180}
                    className="rounded-lg object-cover"
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+Cg=="
                    preview={{
                      mask: (
                        <div className="flex flex-col items-center">
                          <EyeOutlined style={{ fontSize: '20px' }} />
                          <span>Preview</span>
                        </div>
                      ),
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Face extracted from NIC card
                  </p>
                </div>
              </Card>
            </div>

            {/* NIC Card Image */}
            <Card title="National Identity Card" size="small">
              <div className="text-center">
                <Image
                  src={selectedUser.nicImagePath ? 
                    `http://localhost:8080/api/users/image/nic/${selectedUser.userId || selectedUser.id}` :
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPk5vIE5JQyBJbWFnZTwvdGV4dD4KPC9zdmc+Cg=='
                  }
                  alt="National Identity Card"
                  width={300}
                  height={200}
                  className="rounded-lg object-cover"
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPkltYWdlIE5vdCBGb3VuZDwvdGV4dD4KPC9zdmc+Cg=="
                  preview={{
                    mask: (
                      <div className="flex flex-col items-center">
                        <EyeOutlined style={{ fontSize: '20px' }} />
                        <span>Preview</span>
                      </div>
                    ),
                  }}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Complete NIC document
                </p>
              </div>
            </Card>

            {/* Account Information */}
            <Card title="Account Information">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="User ID">
                  {selectedUser.userId}
                </Descriptions.Item>
                <Descriptions.Item label="Join Date">
                  {selectedUser.joinDate ? dayjs(selectedUser.joinDate).format('MMM DD, YYYY HH:mm') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Last Active">
                  {selectedUser.lastActive ? dayjs(selectedUser.lastActive).format('MMM DD, YYYY HH:mm') : 'Never'}
                </Descriptions.Item>
                <Descriptions.Item label="Account Age">
                  {selectedUser.joinDate ? dayjs().diff(dayjs(selectedUser.joinDate), 'day') + ' days' : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default UserManagement;
