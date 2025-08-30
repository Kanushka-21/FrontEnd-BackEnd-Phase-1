import React from 'react';
import { Card, Alert, Badge, Row, Col, Button } from 'antd';
import { UserOutlined, DatabaseOutlined, SecurityScanOutlined, ApiOutlined } from '@ant-design/icons';

const UserManagementDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <UserOutlined className="text-3xl text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Real Database User Management
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The User Management section now fetches real user data from the database and excludes admin users.
              Only buyers and sellers are displayed for management purposes.
            </p>
          </div>
        </Card>

        {/* Key Features */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={6}>
            <Card className="h-full">
              <div className="text-center space-y-3">
                <DatabaseOutlined className="text-3xl text-green-600" />
                <h3 className="font-semibold">Real Database Integration</h3>
                <p className="text-sm text-gray-600">
                  Fetches actual user data from the backend API instead of mock data
                </p>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card className="h-full">
              <div className="text-center space-y-3">
                <ShieldCheckOutlined className="text-3xl text-blue-600" />
                <h3 className="font-semibold">Admin Exclusion</h3>
                <p className="text-sm text-gray-600">
                  Automatically filters out admin users from the management interface
                </p>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card className="h-full">
              <div className="text-center space-y-3">
                <UserOutlined className="text-3xl text-purple-600" />
                <h3 className="font-semibold">User Verification</h3>
                <p className="text-sm text-gray-600">
                  Manage pending user approvals and verification status
                </p>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card className="h-full">
              <div className="text-center space-y-3">
                <ApiOutlined className="text-3xl text-orange-600" />
                <h3 className="font-semibold">Real-time Actions</h3>
                <p className="text-sm text-gray-600">
                  Approve/reject users and toggle status with API integration
                </p>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Implementation Details */}
        <Card title="🔧 Implementation Details" className="mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Badge status="processing" className="mr-2" />
                  Data Fetching
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Calls <code>api.getUsers()</code> to fetch all users</li>
                  <li>• Filters out users with role = 'admin'</li>
                  <li>• Transforms data for UI compatibility</li>
                  <li>• Handles loading states and error cases</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Badge status="success" className="mr-2" />
                  User Actions
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <code>updateVerificationStatus()</code> for approvals</li>
                  <li>• <code>updateUserStatus()</code> for activate/deactivate</li>
                  <li>• Real-time UI updates after actions</li>
                  <li>• Success/error message feedback</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* User Categories */}
        <Card title="👥 User Categories Managed" className="mb-6">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Alert
                message="Pending Approvals"
                description="Users who haven't been verified yet or have pending verification status"
                type="warning"
                showIcon
                className="h-full"
              />
            </Col>
            <Col xs={24} md={12}>
              <Alert
                message="All Users"
                description="Complete list of verified and unverified buyers and sellers (admins excluded)"
                type="info"
                showIcon
                className="h-full"
              />
            </Col>
          </Row>
        </Card>

        {/* Enhanced Features */}
        <Card title="✨ Enhanced Features" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Profile Pictures</h4>
              <p className="text-sm text-blue-700">
                Displays user profile pictures or default avatars in the user list
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Real-time Search</h4>
              <p className="text-sm text-green-700">
                Search users by name, email, or role with instant filtering
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Status Management</h4>
              <p className="text-sm text-purple-700">
                Visual indicators for active/inactive and verified/unverified status
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Phone Numbers</h4>
              <p className="text-sm text-orange-700">
                Display user contact information for better management
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Join Dates</h4>
              <p className="text-sm text-red-700">
                Track when users registered and last activity timestamps
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Refresh Control</h4>
              <p className="text-sm text-gray-700">
                Manual refresh button to update user data on demand
              </p>
            </div>
          </div>
        </Card>

        {/* API Integration */}
        <Card title="🔗 API Integration" className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">API Endpoints Used:</h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex items-center space-x-2">
                <Badge status="processing" />
                <code>GET /api/users</code>
                <span className="text-gray-600">- Fetch all users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge status="success" />
                <code>POST /api/admin/verifications/:userId</code>
                <span className="text-gray-600">- Approve/reject users</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge status="warning" />
                <code>POST /api/admin/users/:userId/:action</code>
                <span className="text-gray-600">- Activate/deactivate users</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Backend Requirements */}
        <Alert
          message="Backend Requirements"
          description={
            <div>
              <p className="mb-2">To use this feature, ensure your backend is running and has the following:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>User management API endpoints</li>
                <li>User verification system</li>
                <li>Admin role permissions</li>
                <li>Database with user data</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
        />

        {/* Navigation */}
        <div className="text-center">
          <Button type="primary" size="large" href="/admin/dashboard">
            Go to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementDemo;
