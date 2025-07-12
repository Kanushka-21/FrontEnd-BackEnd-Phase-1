import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Tag, Space, Input, Statistic, Spin, message, Tabs, Modal } from 'antd';
import { 
  EyeOutlined, CheckOutlined, CloseOutlined, 
  NotificationOutlined, CheckCircleOutlined,
  ClockCircleOutlined, StopOutlined,ExclamationCircleOutlined
} from '@ant-design/icons';
import { AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import { api } from '@/services/api';

const { TabPane } = Tabs;
import { 
  AdminComponentProps, 
  Advertisement, 
  formatLKR, 
  mapApprovalToStatus,
  getAdvertiserFromEmail,
  parsePrice,
  ActionHandlers 
} from './shared';

interface AdvertisementsManagementProps extends AdminComponentProps {
  actionHandlers: ActionHandlers;
}

const AdvertisementsManagement: React.FC<AdvertisementsManagementProps> = ({ actionHandlers }) => {
  const { handleViewAdvertisement, handleToggleAdvertisementStatus } = actionHandlers;
  
  // State management
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [allAdvertisements, setAllAdvertisements] = useState<Advertisement[]>([]); // Store all advertisements for counts
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedAdvertisements, setSelectedAdvertisements] = useState<Advertisement[]>([]);
  const [processingBulkAction, setProcessingBulkAction] = useState(false);
  
  // Confirmation dialog state
  const [confirmationVisible, setConfirmationVisible] = useState(false);
  const [confirmationLoading, setConfirmationLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    advertisement: Advertisement;
    action: 'approved' | 'rejected';
    actionText: string;
  } | null>(null);

  // Define tab types
  type TabType = 'all' | 'pending' | 'approved' | 'rejected';

  // Calculate statistics from all advertisements (not just current tab)
  const stats = {
    totalAdvertisements: allAdvertisements.length,
    activeAdvertisements: allAdvertisements.filter(ad => ad.approved === 'approved').length,
    pendingAdvertisements: allAdvertisements.filter(ad => ad.approved === 'pending' || ad.approved === null || ad.approved === undefined).length,
    rejectedAdvertisements: allAdvertisements.filter(ad => ad.approved === 'rejected').length
  };

  // Get counts for tab badges from all advertisements
  const getTabCounts = () => {
    return {
      all: allAdvertisements.length,
      pending: allAdvertisements.filter(ad => ad.approved === 'pending' || ad.approved === null || ad.approved === undefined).length,
      approved: allAdvertisements.filter(ad => ad.approved === 'approved').length,
      rejected: allAdvertisements.filter(ad => ad.approved === 'rejected').length
    };
  };

  const tabCounts = getTabCounts();

  // Fetch advertisements from API and filter based on tab
  const fetchAdvertisements = async (tab: TabType = activeTab as TabType) => {
    try {
      setLoading(true);
      
      // Always fetch all advertisements to maintain consistent counts
      const response = await api.getAllAdvertisements();
      
      console.log(`API response for ${tab} tab:`, response);
      console.log('Response type:', typeof response);
      console.log('Is array:', Array.isArray(response));
      
      if (Array.isArray(response)) {
        // Transform all data first
        const transformedData: Advertisement[] = response.map((ad: any) => ({
          // Direct mapping from API response
          id: ad.id || ad._id,
          title: ad.title,
          category: ad.category,
          description: ad.description,
          price: ad.price,
          mobileNo: ad.mobileNo,
          email: ad.email,
          userId: ad.userId,
          images: ad.images || [],
          approved: ad.approved,
          createdOn: ad.createdOn,
          modifiedOn: ad.modifiedOn,
          validForSave: ad.validForSave,
          
          // Computed fields for display
          status: mapApprovalToStatus(ad.approved),
          advertiser: getAdvertiserFromEmail(ad.email),
          type: ad.category ? 'product' : 'general',
          startDate: ad.createdOn,
          endDate: ad.modifiedOn,
          budget: parsePrice(ad.price),
          spent: 0,
          clicks: 0,
          impressions: 0,
          location: 'marketplace'
        }));
        
        // Store all advertisements for counts
        setAllAdvertisements(transformedData);
        
        // Filter data based on active tab for display
        let filteredData = transformedData;
        switch (tab) {
          case 'pending':
            filteredData = transformedData.filter(ad => 
              ad.approved === 'pending' || ad.approved === null || ad.approved === undefined
            );
            break;
          case 'approved':
            filteredData = transformedData.filter(ad => ad.approved === 'approved');
            break;
          case 'rejected':
            filteredData = transformedData.filter(ad => ad.approved === 'rejected');
            break;
          case 'all':
          default:
            filteredData = transformedData;
            break;
        }
        
        console.log(`Filtered data for ${tab}:`, filteredData);
        setAdvertisements(filteredData);
        setLastUpdated(new Date());
      } else if (response && response.success === false) {
        // Handle error response
        console.error('API error:', response.message);
        message.error(response.message || 'Failed to fetch advertisements');
        setAdvertisements([]);
        setAllAdvertisements([]);
      } else {
        console.warn('Unexpected response structure:', response);
        message.warning('Received unexpected response format');
        setAdvertisements([]);
        setAllAdvertisements([]);
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      message.error('Failed to load advertisements. Please try again.');
      setAdvertisements([]);
      setAllAdvertisements([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    fetchAdvertisements(tab as TabType);
  };

  // Refresh advertisements for current tab
  const refreshAdvertisements = async () => {
    setRefreshing(true);
    await fetchAdvertisements(activeTab as TabType);
    setRefreshing(false);
    message.success('Advertisements refreshed successfully');
  };

  // Load data on component mount
  useEffect(() => {
    fetchAdvertisements('pending');
  }, []);

  // Filter advertisements based on search term
  const filteredAdvertisements = advertisements.filter(ad =>
    ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.advertiser?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.mobileNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // Also search by status labels
    (ad.status === 'approved' && 'approved'.includes(searchTerm.toLowerCase())) ||
    (ad.status === 'pending' && 'pending approval'.includes(searchTerm.toLowerCase())) ||
    (ad.status === 'rejected' && 'rejected'.includes(searchTerm.toLowerCase()))
  );

  // Handle bulk approve/reject actions
  const handleBulkAction = async (approve: boolean) => {
    if (selectedAdvertisements.length === 0) {
      message.warning('Please select advertisements to perform bulk action');
      return;
    }

    setProcessingBulkAction(true);
    const actionText = approve ? 'approve' : 'reject';
    const statusValue = approve ? 'approved' : 'rejected';
    
    try {
      // Process each selected advertisement
      const promises = selectedAdvertisements.map(advertisement => 
        api.updateAdvertisementApproval(advertisement.id, statusValue)
      );
      
      const results = await Promise.all(promises);
      
      // Check if all requests were successful
      const successfulUpdates = results.filter(result => result.success);
      const failedUpdates = results.filter(result => !result.success);
      
      if (successfulUpdates.length > 0) {
        message.success(`Successfully ${actionText}d ${successfulUpdates.length} advertisement(s)`);
      }
      
      if (failedUpdates.length > 0) {
        message.error(`Failed to ${actionText} ${failedUpdates.length} advertisement(s)`);
      }
      
      // Clear selection and refresh data
      setSelectedRowKeys([]);
      setSelectedAdvertisements([]);
      await fetchAdvertisements(activeTab as TabType);
      
    } catch (error) {
      console.error(`Error during bulk ${actionText}:`, error);
      message.error(`Failed to ${actionText} selected advertisements. Please try again.`);
    } finally {
      setProcessingBulkAction(false);
    }
  };

  // Handle row selection
  const handleRowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[], newSelectedRows: Advertisement[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedAdvertisements(newSelectedRows);
    },
    getCheckboxProps: (record: Advertisement) => ({
      disabled: false, // Allow selection for all advertisements
      name: record.title,
    }),
  };

  // Show confirmation dialog for individual advertisement actions
  const showConfirmationDialog = (advertisement: Advertisement, action: 'approved' | 'rejected') => {
    const actionText = action === 'approved' ? 'approve' : 'reject';
    setPendingAction({ advertisement, action, actionText });
    setConfirmationVisible(true);
  };

  // Handle confirmation dialog OK
  const handleConfirmationOk = async () => {
    if (!pendingAction) return;
    
    setConfirmationLoading(true);
    try {
      await handleAdvertisementAction(pendingAction.advertisement, pendingAction.action);
    } finally {
      setConfirmationLoading(false);
      setConfirmationVisible(false);
      setPendingAction(null);
    }
  };

  // Handle confirmation dialog Cancel
  const handleConfirmationCancel = () => {
    setConfirmationVisible(false);
    setPendingAction(null);
  };

  // Handle advertisement approval/rejection with API update
  const handleAdvertisementAction = async (advertisement: Advertisement, newStatus: string) => {
    try {
      // Call the API to update advertisement status with string value
      const response = await api.updateAdvertisementApproval(advertisement.id, newStatus);
      
      // Debug logging to see the actual response
      console.log('API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'No response');
      
      // More flexible response handling - check for various success indicators
      let isSuccess = false;
      let errorMessage = '';

      if (response) {
        // Check multiple possible success conditions
        if (
          response.success === true ||           // { success: true }
          response.status === 'success' ||       // { status: 'success' }
          response.status === 200 ||             // { status: 200 }
          response.statusCode === 200 ||         // { statusCode: 200 }
          response.code === 200 ||               // { code: 200 }
          (response.data && !response.error) ||  // { data: {...} } without error
          (response.message && !response.error && response.success !== false) || // { message: '...' } without error
          (!response.error && response.success !== false && response.id) || // Direct data with id
          (!response.error && response.success !== false && Object.keys(response).length > 0) // Any non-error response with data
        ) {
          isSuccess = true;
        } else if (
          response.success === false ||
          response.status === 'error' ||
          response.error ||
          (response.status && response.status >= 400)
        ) {
          // Explicit failure cases
          isSuccess = false;
          errorMessage = response.message || response.error || response.errorMessage || 'Unknown error occurred';
        } else {
          // Default to success if response exists and doesn't indicate failure
          isSuccess = true;
          console.log('Defaulting to success for response:', response);
        }
      } else {
        isSuccess = false;
        errorMessage = 'No response received from server';
      }

      console.log('Response evaluation - isSuccess:', isSuccess, 'errorMessage:', errorMessage);

      if (isSuccess) {
        // Success case
        const actionText = newStatus === 'approved' ? 'approved' : 'rejected';
        message.success(`Advertisement ${actionText} successfully`);
        
        // Refresh the current tab to get updated data
        await fetchAdvertisements(activeTab as TabType);
      } else {
        // Error case
        console.error('API Error:', errorMessage);
        message.error(errorMessage || 'Failed to update advertisement status');
      }
    } catch (error) {
      console.error('Error updating advertisement status:', error);
      
      // Handle different error types
      let errorMessage = 'An error occurred while updating advertisement status';
      
      if (error.response) {
        // Server responded with an error status
        console.error('Server error response:', error.response);
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Other error
        console.error('Other error:', error.message);
        errorMessage = error.message || errorMessage;
      }
      
      message.error(errorMessage);
    }
  };

  // Override the action handler to show confirmation dialog
  const enhancedHandleToggleAdvertisementStatus = (advertisement: Advertisement, status: string) => {
    // Show confirmation dialog instead of directly calling API
    showConfirmationDialog(advertisement, status as 'approved' | 'rejected');
  };

  const columns = [
    {
      title: 'Advertisement',
      key: 'advertisement',
      render: (_: any, record: Advertisement) => (
        <div className="flex items-center space-x-3">
          {record.images && record.images.length > 0 && (
            <img 
              src={record.images[0]} 
              alt={record.title}
              className="w-12 h-12 object-cover rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48';
              }}
            />
          )}
          <div>
            <span className="font-medium block">{record.title}</span>
            <span className="text-xs text-gray-500">{record.category}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Advertiser',
      key: 'advertiser',
      render: (_: any, record: Advertisement) => (
        <div>
          <div className="font-medium">{record.advertiser}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: string) => (
        <span className="font-semibold">{formatLKR(parsePrice(price))}</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; label: string }> = {
          approved: { color: 'success', label: 'Approved' },
          pending: { color: 'warning', label: 'Pending Approval' },
          rejected: { color: 'error', label: 'Rejected' }
        };
        
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      }
    },
   
    {
      title: 'Created',
      dataIndex: 'createdOn',
      key: 'createdOn',
      render: (date: string) => (
        <div className="text-sm">
          <div>{dayjs(date).format('MMM DD, YYYY')}</div>
          <div className="text-xs text-gray-500">{dayjs(date).format('HH:mm')}</div>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Advertisement) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewAdvertisement(record)}
          >
            View
          </Button>
          {/* Show approve/reject buttons for pending advertisements */}
          {(record.approved === null || record.approved === undefined || record.status === 'pending') && (
            <>
              <Button 
                size="small" 
                icon={<CheckOutlined />} 
                type="primary"
                onClick={() => enhancedHandleToggleAdvertisementStatus(record, 'approved')}
              >
                Approve
              </Button>
              <Button 
                size="small" 
                icon={<CloseOutlined />} 
                danger
                onClick={() => enhancedHandleToggleAdvertisementStatus(record, 'rejected')}
              >
                Reject
              </Button>
            </>
          )}
          {/* Show deactivate button for approved advertisements */}
          {(record.approved === true || record.status === 'approved') && (
            <Button 
              size="small" 
              icon={<CloseOutlined />} 
              danger
              onClick={() => enhancedHandleToggleAdvertisementStatus(record, 'rejected')}
            >
              Reject
            </Button>
          )}
          {/* Show reactivate button for rejected advertisements */}
          {(record.approved === false || record.status === 'rejected') && (
            <Button 
              size="small" 
              icon={<CheckOutlined />} 
              type="primary"
              onClick={() => enhancedHandleToggleAdvertisementStatus(record, 'approved')}
            >
              Approve
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
    
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Total Advertisements" 
              value={stats.totalAdvertisements}
              prefix={<NotificationOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Pending Approval" 
              value={stats.pendingAdvertisements}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Active Ads" 
              value={stats.activeAdvertisements}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic 
              title="Rejected Ads" 
              value={stats.rejectedAdvertisements}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Pending Approvals Alert - Only show if there are pending advertisements */}
      {stats.pendingAdvertisements > 0 && (
        <Card className="bg-yellow-50 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="text-yellow-600 mr-2" size={20} />
              <div>
                <h4 className="font-semibold text-yellow-800">Pending Advertisements</h4>
                <p className="text-sm text-yellow-700">
                  {stats.pendingAdvertisements} advertisements are waiting for your approval
                </p>
              </div>
            </div>
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleTabChange('pending')}
            >
              Review All
            </Button>
          </div>
        </Card>
      )}

      {/* Advertisements Table with Tabs */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Advertisements Management</h3>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button size="small" type="default">
              Export
            </Button>
            <Button size="small" type="default">
              Filter
            </Button>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs 
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          className="mb-4"
          items={[
            {
              key: 'pending',
              label: (
                <span className="flex items-center space-x-2">
                  <ClockCircleOutlined />
                  <span>Pending Approval</span>
                  {tabCounts.pending > 0 && (
                    <Tag color="orange" style={{ marginLeft: '8px' }}>
                      {tabCounts.pending}
                    </Tag>
                  )}
                </span>
              ),
            },
            
            {
              key: 'approved',
              label: (
                <span className="flex items-center space-x-2">
                  <CheckCircleOutlined />
                  <span>Approved Ads</span>
                  {tabCounts.approved > 0 && (
                    <Tag color="green" style={{ marginLeft: '8px' }}>
                      {tabCounts.approved}
                    </Tag>
                  )}
                </span>
              ),
            },
            {
              key: 'rejected',
              label: (
                <span className="flex items-center space-x-2">
                  <StopOutlined />
                  <span>Rejected Ads</span>
                  {tabCounts.rejected > 0 && (
                    <Tag color="red" style={{ marginLeft: '8px' }}>
                      {tabCounts.rejected}
                    </Tag>
                  )}
                </span>
              ),
            },
            {
              key: 'all',
              label: (
                <span className="flex items-center space-x-2">
                  <NotificationOutlined />
                  <span>All Advertisements</span>
                  {tabCounts.all > 0 && (
                    <Tag color="blue" style={{ marginLeft: '8px' }}>
                      {tabCounts.all}
                    </Tag>
                  )}
                </span>
              ),
            },
          ]}
        />
        
        {/* Selection Info */}
        {selectedAdvertisements.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedAdvertisements.length} advertisement(s) selected
              </span>
              <Button 
                type="link" 
                size="small"
                onClick={() => {
                  setSelectedRowKeys([]);
                  setSelectedAdvertisements([]);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <Spin size="large" />
            <p className="mt-4 text-gray-500">Loading {activeTab} advertisements...</p>
          </div>
        ) : filteredAdvertisements.length === 0 ? (
          <div className="text-center py-12">
            <NotificationOutlined style={{ fontSize: '48px', color: '#ccc' }} />
            <h3 className="mt-4 text-lg font-medium">
              {searchTerm ? `No ${activeTab} advertisements match your search` : `No ${activeTab} advertisements found`}
            </h3>
            <p className="text-gray-500 mt-2">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : `There are currently no ${activeTab} advertisements in the system`
              }
            </p>
            {searchTerm && (
              <Button 
                type="link" 
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <Table 
            dataSource={filteredAdvertisements}
            columns={columns}
            rowKey="id"
            rowSelection={handleRowSelection}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} ${activeTab} advertisements`
            }}
            scroll={{ x: 'max-content' }}
            locale={{
              emptyText: `No ${activeTab} advertisements available`
            }}
          />
        )}
      </Card>

      {/* Confirmation Dialog */}
      <Modal
        title={
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-orange-500 mr-2" />
            <span>Confirm Action</span>
          </div>
        }
        open={confirmationVisible}
        onOk={handleConfirmationOk}
        onCancel={handleConfirmationCancel}
        confirmLoading={confirmationLoading}
        okText="Yes, Confirm"
        cancelText="Cancel"
        centered
      >
        {pendingAction && (
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to <strong>{pendingAction.actionText}</strong> this advertisement?
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                {pendingAction.advertisement.images && pendingAction.advertisement.images.length > 0 && (
                  <img 
                    src={pendingAction.advertisement.images[0]} 
                    alt={pendingAction.advertisement.title}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64';
                    }}
                  />
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{pendingAction.advertisement.title}</h4>
                  <p className="text-sm text-gray-600">{pendingAction.advertisement.category}</p>
                  <p className="text-sm text-gray-600">Price: LKR {pendingAction.advertisement.price}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              This action will {pendingAction.action === 'approved' ? 'approve' : 'reject'} the advertisement and notify the advertiser.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdvertisementsManagement;
