import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Modal, message, Badge, Divider, Alert } from 'antd';
import { 
  LockOutlined, UnlockOutlined, CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { 
  Home, Users, FileText, DollarSign, TrendingUp, 
  Settings, Bell, LogOut, Shield, Database, 
  BarChart3, UserCheck, MessageSquare, Calendar,
  Award, Search, Menu as MenuIcon, Activity,
  Megaphone, Eye, CheckCircle, AlertTriangle
} from 'lucide-react';
import dayjs from 'dayjs';

// Import modular components
import {
  Overview,
  UserManagement,
  ListingsManagement,
  AdvertisementsManagement,
  Transactions,
  Meetings,
  Analytics,
  SystemSettings,
  SecurityAudit,
  // Import shared types and data
  SidebarItem,
  User,
  Advertisement,
  Meeting,
  ModalState,
  ActionHandlers,
  pendingUsers,
  pendingMeetings,
  generateStats,
  formatLKR
} from './AdminDashboardComponents';

const AdminDashboard: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Modal states
  const [modalState, setModalState] = useState<ModalState>({
    isUserModalVisible: false,
    isListingModalVisible: false,
    isMeetingModalVisible: false,
    isAdvertisementModalVisible: false,
    selectedUser: null,
    selectedListing: null,
    selectedMeeting: null,
    selectedAdvertisement: null,
  });

  const stats = generateStats();

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Sidebar navigation items
  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: <Home size={20} />, count: stats.pendingApprovals },
    { id: 'users', label: 'User Management', icon: <Users size={20} />, count: pendingUsers.length },
    { id: 'listings', label: 'Listings Management', icon: <FileText size={20} /> },
    { id: 'advertisements', label: 'Manage Advertisements', icon: <Megaphone size={20} />, count: stats.pendingAdvertisements },
    { id: 'transactions', label: 'Transactions', icon: <DollarSign size={20} /> },
    { id: 'meetings', label: 'Meeting Requests', icon: <Calendar size={20} />, count: pendingMeetings.length },
    { id: 'analytics', label: 'Analytics & Reports', icon: <BarChart3 size={20} /> },
    { id: 'system', label: 'System Settings', icon: <Settings size={20} /> },
    { id: 'security', label: 'Security & Audit', icon: <Shield size={20} /> }
  ];

  // Action handlers
  const actionHandlers: ActionHandlers = {
    handleViewUser: (user: User) => {
      setModalState(prev => ({ ...prev, selectedUser: user, isUserModalVisible: true }));
    },
    handleViewListing: (listing: any) => {
      setModalState(prev => ({ ...prev, selectedListing: listing, isListingModalVisible: true }));
    },
    handleViewMeeting: (meeting: Meeting) => {
      setModalState(prev => ({ ...prev, selectedMeeting: meeting, isMeetingModalVisible: true }));
    },
    handleViewAdvertisement: (advertisement: Advertisement) => {
      setModalState(prev => ({ ...prev, selectedAdvertisement: advertisement, isAdvertisementModalVisible: true }));
    },
    handleToggleUserStatus: (user: User, active: boolean) => {
      const action = active ? 'unblock' : 'block';
      Modal.confirm({
        title: `Confirm ${action} user`,
        icon: active ? <UnlockOutlined className="text-green-500" /> : <LockOutlined className="text-red-500" />,
        content: `Are you sure you want to ${action} ${user.name}?`,
        okText: 'Yes',
        okType: active ? 'primary' : 'danger',
        cancelText: 'No',
        onOk() {
          message.success(`User has been ${action}ed successfully`);
        },
      });
    },
    handleApproveUser: (user: User) => {
      Modal.confirm({
        title: 'Approve User',
        icon: <CheckCircleOutlined style={{ color: 'green' }} />,
        content: `Are you sure you want to approve ${user.name} as a ${user.role}?`,
        onOk() {
          message.success('User approved successfully');
        }
      });
    },
    handleRejectUser: (user: User) => {
      Modal.confirm({
        title: 'Reject User',
        icon: <ExclamationCircleOutlined style={{ color: 'red' }} />,
        content: `Are you sure you want to reject ${user.name}'s ${user.role} application?`,
        onOk() {
          message.success('User rejected successfully');
        }
      });
    },
    handleApproveListing: (listing: any) => {
      Modal.confirm({
        title: 'Approve Listing',
        icon: <CheckCircleOutlined style={{ color: 'green' }} />,
        content: `Are you sure you want to approve this listing?`,
        onOk() {
          message.success('Listing approved successfully');
        }
      });
    },
    handleApproveMeeting: (meeting: Meeting) => {
      Modal.confirm({
        title: 'Approve Meeting',
        icon: <CheckCircleOutlined style={{ color: 'green' }} />,
        content: `Are you sure you want to approve the meeting between ${meeting.buyer} and ${meeting.seller}?`,
        onOk() {
          message.success('Meeting approved successfully');
        }
      });
    },
    handleToggleAdvertisementStatus: (advertisement: Advertisement, status: string) => {
      Modal.confirm({
        title: `${status === 'active' ? 'Activate' : 'Deactivate'} Advertisement`,
        icon: status === 'active' ? <CheckCircleOutlined style={{ color: 'green' }} /> : <ExclamationCircleOutlined style={{ color: 'red' }} />,
        content: `Are you sure you want to ${status === 'active' ? 'activate' : 'deactivate'} "${advertisement.title}"?`,
        onOk() {
          message.success(`Advertisement ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
        }
      });
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    const commonProps = {
      user,
      onTabChange: setActiveTab,
      actionHandlers
    };

    switch (activeTab) {
      case 'overview':
        return <Overview {...commonProps} />;
      case 'users':
        return <UserManagement {...commonProps} />;
      case 'listings':
        return <ListingsManagement {...commonProps} />;
      case 'advertisements':
        return <AdvertisementsManagement {...commonProps} />;
      case 'transactions':
        return <Transactions {...commonProps} />;
      case 'meetings':
        return <Meetings {...commonProps} />;
      case 'analytics':
        return <Analytics {...commonProps} />;
      case 'system':
        return <SystemSettings {...commonProps} />;
      case 'security':
        return <SecurityAudit {...commonProps} />;
      default:
        return <Overview {...commonProps} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-72'
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-gray-900">GemNet Admin</span>
            )}
          </div>
        </div>

        {/* Admin Profile */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-blue-600">System Administrator</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </div>
              {!sidebarCollapsed && item.count && item.count > 0 && (
                <Badge count={item.count} size="small" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <MenuIcon size={20} />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Admin Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Bell size={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>

      {/* User Details Modal */}
      <Modal
        open={modalState.isUserModalVisible}
        title="User Details"
        onCancel={() => setModalState(prev => ({ ...prev, isUserModalVisible: false }))}
        footer={null}
        width={600}
      >
        {modalState.selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{modalState.selectedUser.name}</h3>
                  <p className="text-gray-500">{modalState.selectedUser.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  modalState.selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {modalState.selectedUser.status.toUpperCase()}
                </span>
              </div>
              
              <Divider />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium">{modalState.selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Active</p>
                  <p className="font-medium">{dayjs(modalState.selectedUser.lastActive).format('MMMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Listings</p>
                  <p className="font-medium">{modalState.selectedUser.listings}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="font-medium">{modalState.selectedUser.transactions}</p>
                </div>
              </div>
            </div>
            
            {modalState.selectedUser.status === 'blocked' && (
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

      {/* Meeting Details Modal */}
      <Modal
        open={modalState.isMeetingModalVisible}
        title="Meeting Request Details"
        onCancel={() => setModalState(prev => ({ ...prev, isMeetingModalVisible: false }))}
        footer={null}
        width={600}
      >
        {modalState.selectedMeeting && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-4">
                <img 
                  src={modalState.selectedMeeting.image} 
                  alt={modalState.selectedMeeting.gemstone}
                  className="w-16 h-16 object-cover rounded-lg mr-4"
                />
                <div>
                  <h3 className="text-xl font-bold">{modalState.selectedMeeting.gemstone}</h3>
                  <p className="text-gray-600">Meeting ID: #M{modalState.selectedMeeting.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Buyer</p>
                  <p className="font-medium">{modalState.selectedMeeting.buyer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Seller</p>
                  <p className="font-medium">{modalState.selectedMeeting.seller}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested Date</p>
                  <p className="font-medium">{dayjs(modalState.selectedMeeting.requestedDate).format('MMMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Requested Time</p>
                  <p className="font-medium">{modalState.selectedMeeting.requestedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{modalState.selectedMeeting.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    {modalState.selectedMeeting.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Advertisement Details Modal */}
      <Modal
        open={modalState.isAdvertisementModalVisible}
        title="Advertisement Details"
        onCancel={() => setModalState(prev => ({ ...prev, isAdvertisementModalVisible: false }))}
        footer={null}
        width={700}
      >
        {modalState.selectedAdvertisement && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{modalState.selectedAdvertisement.title}</h3>
                  <p className="text-gray-500">{modalState.selectedAdvertisement.advertiser}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  modalState.selectedAdvertisement.status === 'active' ? 'bg-green-100 text-green-800' : 
                  modalState.selectedAdvertisement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {modalState.selectedAdvertisement.status.toUpperCase()}
                </span>
              </div>
              
              <Divider />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{modalState.selectedAdvertisement.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">{formatLKR(parseFloat(modalState.selectedAdvertisement.price) || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{modalState.selectedAdvertisement.mobileNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{modalState.selectedAdvertisement.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{dayjs(modalState.selectedAdvertisement.createdOn).format('MMMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Modified</p>
                  <p className="font-medium">{dayjs(modalState.selectedAdvertisement.modifiedOn).format('MMMM D, YYYY')}</p>
                </div>
              </div>

              <Divider />

              <div>
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-700">{modalState.selectedAdvertisement.description}</p>
              </div>

              {modalState.selectedAdvertisement.images && modalState.selectedAdvertisement.images.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Images</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {modalState.selectedAdvertisement.images.map((image, index) => (
                        <img 
                          key={index}
                          src={image} 
                          alt={`${modalState.selectedAdvertisement.title} - ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;