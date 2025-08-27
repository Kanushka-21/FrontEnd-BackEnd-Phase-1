import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications, NotificationBadge } from '@/contexts/NotificationContext';
import { Modal, Divider, Alert } from 'antd';
import dayjs from 'dayjs';
import RoleAwareDashboardLayout from '@/components/layout/RoleAwareDashboardLayout';
import { BarChart3, Users, Package, Clock, Settings, Menu as MenuIcon, Shield, Bell, Search } from 'lucide-react';
import AdminNotificationComponent from '@/components/ui/AdminNotificationComponent';

// Import modular components
import {
  Overview,
  UserManagement,
  ListingsManagement,
  Meetings,
  SystemSettings,
  ModalState,
  AdvertisementsManagement,
  formatLKR
} from './AdminDashboardComponents';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { notifications, totalNotifications, refreshNotifications } = useNotifications();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [modalState, setModalState] = useState<ModalState>({
    isUserModalVisible: false,
    isMeetingModalVisible: false,
    isAdvertisementModalVisible: false,
    isListingModalVisible: false,
    selectedUser: null,
    selectedMeeting: null,
    selectedAdvertisement: null,
    selectedListing: null,
  });

  // Sidebar items for admin with notification badges
  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Dashboard Overview', 
      icon: <BarChart3 size={24} />,
      notificationCount: 0
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: <Users size={24} />,
      notificationCount: notifications.userManagement
    },
    { 
      id: 'listings', 
      label: 'Listing Management', 
      icon: <Package size={24} />,
      notificationCount: notifications.listingManagement
    },
    { 
      id: 'advertisements', 
      label: 'Manage Advertisement', 
      icon: <Package size={24} />,
      notificationCount: notifications.advertisements
    },
    { 
      id: 'meetings', 
      label: 'Meeting Requests', 
      icon: <Clock size={24} />,
      notificationCount: notifications.meetingRequests
    },
    { 
      id: 'settings', 
      label: 'System Settings', 
      icon: <Settings size={24} />,
      notificationCount: notifications.systemAlerts
    }
  ];

  // Define all required action handlers
  const actionHandlers = {
    handleViewUser: () => {},
    handleViewListing: () => {},
    handleViewMeeting: () => {},
    handleViewAdvertisement: () => {},
    handleApproveUser: () => {},
    handleRejectUser: () => {},
    handleApproveListing: () => {},
    handleRejectListing: () => {},
    handleApproveMeeting: () => {},
    handleRejectMeeting: () => {},
    handleApproveAdvertisement: () => {},
    handleRejectAdvertisement: () => {},
  };

  // Render main content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview user={user} onTabChange={setActiveTab} />;
      case 'users':
        return <UserManagement actionHandlers={actionHandlers} />;
      case 'listings':
        return <ListingsManagement />;
      case 'advertisements':
        return <AdvertisementsManagement actionHandlers={actionHandlers} />;
      case 'meetings':
        return <Meetings actionHandlers={actionHandlers} />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <Overview user={user} onTabChange={setActiveTab} />;
    }
  };

  return (
    <RoleAwareDashboardLayout>
      <div className="flex bg-gray-50 h-screen overflow-hidden">
        {/* Sidebar */}
        <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'} h-full`}>
          {/* User Profile */}
          <div className={`border-b border-gray-200 ${sidebarCollapsed ? 'p-3' : 'p-6'} flex-shrink-0`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`bg-blue-100 rounded-full flex items-center justify-center ${sidebarCollapsed ? 'w-8 h-8' : 'w-12 h-12'}`}> 
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`text-blue-600 ${sidebarCollapsed ? 'w-5 h-5' : 'w-8 h-8'}`}> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75v-.75z" /></svg>
                  </span>
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-gray-900 truncate">
                      {user?.firstName || 'Admin User'}
                    </p>
                    <p className="text-sm text-blue-600 font-medium">Administrator</p>
                  </div>
                )}
              </div>
              {/* Collapse/Expand button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <MenuIcon size={18} />
              </button>
            </div>
          </div>
          {/* Navigation */}
          <nav className={`space-y-2 ${sidebarCollapsed ? 'p-2' : 'p-6'} flex-1 overflow-y-auto`}>
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors relative ${
                  activeTab === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 relative">
                  {item.icon}
                  {item.notificationCount > 0 && (
                    <NotificationBadge 
                      count={item.notificationCount} 
                      size="small"
                      color="red"
                    />
                  )}
                </span>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium flex-1">{item.label}</span>
                )}
                {!sidebarCollapsed && item.notificationCount > 0 && (
                  <span className="ml-auto">
                    <NotificationBadge 
                      count={item.notificationCount} 
                      size="small"
                      color="red"
                    />
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Welcome back, {user?.firstName || 'Admin'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Admin Notification Component */}
                {user?.userId && (
                  <AdminNotificationComponent 
                    userId={user.userId}
                    maxNotifications={10}
                    onSectionChange={(section) => setActiveTab(section)}
                  />
                )}
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {user?.firstName?.[0] || 'A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-auto bg-gray-50 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
      {/* Modals below main layout */}
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
                  modalState.selectedAdvertisement.status === 'approved' ? 'bg-green-100 text-green-800' : 
                  modalState.selectedAdvertisement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  modalState.selectedAdvertisement.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {modalState.selectedAdvertisement.status ? modalState.selectedAdvertisement.status.toUpperCase() : ''}
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
                  <p className="font-medium">{formatLKR(parseFloat(modalState.selectedAdvertisement.price || '0'))}</p>
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
                  <p className="font-medium">{modalState.selectedAdvertisement.createdOn ? dayjs(modalState.selectedAdvertisement.createdOn).format('MMMM D, YYYY') : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Modified</p>
                  <p className="font-medium">{modalState.selectedAdvertisement.modifiedOn ? dayjs(modalState.selectedAdvertisement.modifiedOn).format('MMMM D, YYYY') : ''}</p>
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
                          alt={`${modalState.selectedAdvertisement?.title || 'Advertisement'} - ${index + 1}`}
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
    </RoleAwareDashboardLayout>
  );
};

export default AdminDashboard;