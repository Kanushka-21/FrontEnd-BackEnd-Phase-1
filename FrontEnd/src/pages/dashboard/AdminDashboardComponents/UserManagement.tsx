import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Input, Tabs, Switch, message, Spin, Alert } from 'antd';
import { 
  EyeOutlined, CheckOutlined, CloseOutlined, 
  LockOutlined, UnlockOutlined, UserOutlined, ReloadOutlined 
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
  lastLoginAt?: string;
  phoneNumber?: string;
  profilePicture?: string;
  address?: string;
  dateOfBirth?: string;
  nicNumber?: string;
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
            onClick={() => handleViewUser({
              id: record.userId || record._id?.$oid || record.id || '',
              name: record.name || '',
              email: record.email,
              role: (record.role || record.userRole || 'buyer').toLowerCase() as 'admin' | 'seller' | 'buyer',
              status: (record.status || 'active') as 'active' | 'pending' | 'blocked',
              joinDate: record.joinDate || record.createdAt || '',
              lastActive: record.lastActive || record.lastLoginAt || '',
              listings: record.listings || 0,
              transactions: record.transactions || 0
            })}
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
            onClick={() => handleViewUser({
              id: record.userId || record._id?.$oid || record.id || '',
              name: record.name || '',
              email: record.email,
              role: (record.role || record.userRole || 'buyer').toLowerCase() as 'admin' | 'seller' | 'buyer',
              status: (record.status || 'active') as 'active' | 'pending' | 'blocked',
              joinDate: record.joinDate || record.createdAt || '',
              lastActive: record.lastActive || record.lastLoginAt || '',
              listings: record.listings || 0,
              transactions: record.transactions || 0
            })}
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
    </div>
  );
};

export default UserManagement;
