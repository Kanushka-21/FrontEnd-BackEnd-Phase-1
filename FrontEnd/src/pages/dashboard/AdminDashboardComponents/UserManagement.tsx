import React from 'react';
import { Table, Button, Tag, Space, Input, Tabs, Switch, Divider } from 'antd';
import { 
  EyeOutlined, CheckOutlined, CloseOutlined, 
  LockOutlined, UnlockOutlined, UserOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { AdminComponentProps, User, mockUsers, pendingUsers, ActionHandlers } from './shared';

const { TabPane } = Tabs;

interface UserManagementProps extends AdminComponentProps {
  actionHandlers: ActionHandlers;
}

const UserManagement: React.FC<UserManagementProps> = ({ actionHandlers }) => {
  const { 
    handleViewUser, 
    handleApproveUser, 
    handleRejectUser, 
    handleToggleUserStatus 
  } = actionHandlers;

  const pendingColumns = [
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
      render: (role: string) => (
        <Tag color={role === 'seller' ? 'purple' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewUser(record)}
          >
            View
          </Button>
          <Button 
            size="small" 
            icon={<CheckOutlined />} 
            type="primary" 
            onClick={() => handleApproveUser(record)}
          >
            Approve
          </Button>
          <Button 
            size="small" 
            icon={<CloseOutlined />} 
            danger 
            onClick={() => handleRejectUser(record)}
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
      render: (role: string) => (
        <Tag color={role === 'seller' ? 'purple' : 'blue'}>
          {role.toUpperCase()}
        </Tag>
      )
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
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Listings',
      dataIndex: 'listings',
      key: 'listings',
    },
    {
      title: 'Transactions',
      dataIndex: 'transactions',
      key: 'transactions',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Input.Search
          placeholder="Search users..."
          style={{ width: 300 }}
          allowClear
        />
      </div>

      <Tabs defaultActiveKey="pending" type="card">
        <TabPane tab={`Pending Approvals (${pendingUsers.length})`} key="pending">
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <UserOutlined className="text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  {pendingUsers.length} users waiting for approval
                </span>
              </div>
            </div>
            
            <Table 
              dataSource={pendingUsers}
              columns={pendingColumns}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </div>
        </TabPane>
        
        <TabPane tab={`All Users (${mockUsers.length})`} key="all">
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
                Total: {mockUsers.length} users
              </div>
            </div>
            
            <Table 
              dataSource={mockUsers}
              columns={allUsersColumns}
              rowKey="id"
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
        </TabPane>
      </Tabs>
    </div>
  );
};

export default UserManagement;
