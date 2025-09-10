import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Tag, Modal, message, Card, Avatar, Statistic, Badge, Tooltip, Empty } from 'antd';
import { ClockCircleOutlined, TrophyOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { 
  formatLKR, 
  BID_STATUS_COLORS,
  EnhancedBid
} from './shared';
import { api } from '@/services/api';

dayjs.extend(relativeTime);

interface BidsProps {
  user?: {
    id: string;
    name?: string;
  };
}

interface CountdownTimerProps {
  endTime: string;
  isActive: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, isActive }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!isActive || !endTime) {
      setTimeRemaining('Bidding Closed');
      setIsExpired(true);
      return;
    }

    const updateTimer = () => {
      const now = dayjs();
      const end = dayjs(endTime);
      const diff = end.diff(now);

      if (diff <= 0) {
        setTimeRemaining('Expired');
        setIsExpired(true);
        return;
      }

      const duration = dayjs.duration(diff);
      const days = Math.floor(duration.asDays());
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
      
      setIsExpired(false);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, isActive]);

  return (
    <div className={`flex items-center space-x-1 ${isExpired ? 'text-red-500' : 'text-blue-600'}`}>
      <ClockCircleOutlined />
      <span className="font-mono text-sm font-medium">{timeRemaining}</span>
    </div>
  );
};

const Bids: React.FC<BidsProps> = ({ user }) => {
  const [bids, setBids] = useState<EnhancedBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<EnhancedBid | null>(null);
  const [isAcceptBidModalVisible, setIsAcceptBidModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    activeBids: 0,
    totalListingsWithBids: 0
  });

  // Fetch seller's received bids
  const fetchSellerBids = useCallback(async () => {
    console.log('fetchSellerBids called with user:', user);
    
    if (!user?.id) {
      console.log('No user ID available, skipping API call');
      setLoading(false);
      setBids([]);
      return;
    }

    console.log('Starting API call for seller bids...', { userId: user.id, currentPage, pageSize });
    setLoading(true);
    
    try {
      console.log('Calling api.bidding.getSellerReceivedBids...');
      const response = await api.bidding.getSellerReceivedBids(user.id, currentPage, pageSize);
      console.log('API response received:', response);
      
      if (response.success && response.data) {
        console.log('Processing successful response:', response.data);
        setBids(response.data.bids || []);
        setTotalElements(response.data.totalElements || 0);
        setTotalPages(response.data.totalPages || 0);
        setStats({
          activeBids: response.data.activeBids || 0,
          totalListingsWithBids: response.data.totalListingsWithBids || 0
        });
      } else {
        console.error('API response not successful:', response);
        message.error(response.message || 'Failed to fetch bids');
        setBids([]);
      }
    } catch (error) {
      console.error('Error fetching seller bids:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      
      // Show more specific error message
      if (error instanceof Error && error.message.includes('Network Error')) {
        message.error('Backend server is not running. Please start the backend first.');
      } else {
        message.error(`Failed to fetch bids: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      setBids([]);
    } finally {
      console.log('API call completed, setting loading to false');
      setLoading(false);
    }
  }, [user?.id, currentPage, pageSize]);

  useEffect(() => {
    fetchSellerBids();
    
    // Set up automatic refresh every 30 seconds to catch new bids
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing seller bids...');
      fetchSellerBids();
    }, 30000); // 30 seconds
    
    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchSellerBids]);

  // Handle opening accept bid modal
  const handleOpenAcceptBidModal = (bid: EnhancedBid) => {
    setSelectedBid(bid);
    setIsAcceptBidModalVisible(true);
  };

  // Handle accepting a bid
  const handleAcceptBid = async () => {
    if (!selectedBid) return;
    
    try {
      // TODO: Implement accept bid API call
      message.success('Bid accepted successfully');
      setIsAcceptBidModalVisible(false);
      fetchSellerBids(); // Refresh the list
    } catch (error) {
      message.error('Failed to accept bid');
    }
  };

  // Handle rejecting a bid
  const handleRejectBid = (bid: EnhancedBid) => {
    Modal.confirm({
      title: 'Reject Bid',
      content: `Are you sure you want to reject the bid of ${formatLKR(bid.bidAmount)} from ${bid.bidderName}?`,
      okText: 'Reject',
      okType: 'danger',
      onOk: async () => {
        try {
          // TODO: Implement reject bid API call
          message.success('Bid rejected successfully');
          fetchSellerBids(); // Refresh the list
        } catch (error) {
          message.error('Failed to reject bid');
        }
      }
    });
  };

  const columns = [
    {
      title: 'Gemstone',
      key: 'gemstone',
      width: 280,
      render: (_: any, record: EnhancedBid) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={48}
            src={record.images?.[0] || 'https://via.placeholder.com/50'} 
            alt={record.gemName}
            className="flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{record.gemName}</p>
            <p className="text-sm text-gray-500 truncate">{record.gemSpecies}</p>
            <p className="text-xs text-gray-400">Listed: {formatLKR(record.listingPrice)}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Bidder',
      key: 'bidder',
      width: 160,
      render: (_: any, record: EnhancedBid) => (
        <div className="flex items-center space-x-2">
          <UserOutlined className="text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">{record.bidderName}</p>
            <p className="text-xs text-gray-500 truncate">{record.bidderEmail}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Bid Details',
      key: 'bidDetails',
      width: 180,
      render: (_: any, record: EnhancedBid) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-lg text-green-600">
              {formatLKR(record.bidAmount)}
            </span>
            {record.isCurrentlyWinning && (
              <Tooltip title="Highest Bid">
                <TrophyOutlined className="text-yellow-500" />
              </Tooltip>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Current High: {formatLKR(record.currentHighestBid)}
          </p>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <EyeOutlined />
            <span>{record.totalBidsForListing} bids</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Countdown',
      key: 'countdown',
      width: 140,
      render: (_: any, record: EnhancedBid) => (
        <CountdownTimer 
          endTime={record.biddingEndTime}
          isActive={record.biddingActive}
        />
      ),
    },
    {
      title: 'Date',
      dataIndex: 'bidTime',
      key: 'bidTime',
      width: 120,
      render: (bidTime: string) => (
        <div>
          <p className="text-sm font-medium">{dayjs(bidTime).format('MMM DD')}</p>
          <p className="text-xs text-gray-500">{dayjs(bidTime).format('HH:mm')}</p>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={BID_STATUS_COLORS[status.toLowerCase()] || 'default'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: any, record: EnhancedBid) => (
        <div className="space-x-2">
          {record.status.toLowerCase() === 'active' && record.biddingActive && (
            <>
              <Button 
                size="small" 
                type="primary"
                onClick={() => handleOpenAcceptBidModal(record)}
              >
                Accept
              </Button>
              <Button 
                size="small" 
                danger
                onClick={() => handleRejectBid(record)}
              >
                Reject
              </Button>
            </>
          )}
          {record.status.toLowerCase() === 'accepted' && (
            <Button size="small" type="primary">
              Schedule Meeting
            </Button>
          )}
          {!record.biddingActive && (
            <span className="text-xs text-gray-400">Bidding Closed</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Bids</h2>
        <p className="text-gray-600">Manage bids received on your gemstone listings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <Statistic
            title="Active Bids"
            value={stats.activeBids}
            valueStyle={{ color: '#1890ff' }}
            prefix={<Badge status="processing" />}
          />
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <Statistic
            title="Listings with Bids"
            value={stats.totalListingsWithBids}
            valueStyle={{ color: '#52c41a' }}
            prefix={<TrophyOutlined />}
          />
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <Statistic
            title="Total Bids"
            value={totalElements}
            valueStyle={{ color: '#722ed1' }}
            prefix={<EyeOutlined />}
          />
        </Card>
      </div>

      {/* Bids Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Received Bids</h3>
              <p className="text-gray-600 mt-1">All bids on your gemstone listings with live countdown</p>
            </div>
          </div>
        </div>
        
        <div className="p-0">
          {bids.length === 0 && !loading ? (
            <div className="p-8">
              <Empty
                description="No bids received yet"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <p className="text-gray-500 mt-2">
                  Bids from buyers will appear here once they start bidding on your listings.
                </p>
              </Empty>
            </div>
          ) : (
            <Table 
              dataSource={bids}
              columns={columns}
              rowKey="bidId"
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{
                current: currentPage + 1,
                pageSize: pageSize,
                total: totalElements,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} bids`,
                onChange: (page, size) => {
                  setCurrentPage(page - 1);
                  setPageSize(size || 10);
                },
                onShowSizeChange: (_current, size) => {
                  setCurrentPage(0);
                  setPageSize(size);
                }
              }}
              className="rounded-none"
              bordered={false}
              size="middle"
            />
          )}
        </div>
      </div>

      {/* Accept Bid Modal */}
      <Modal
        open={isAcceptBidModalVisible}
        title="Accept Bid"
        onCancel={() => setIsAcceptBidModalVisible(false)}
        onOk={handleAcceptBid}
        okText="Accept Bid"
        cancelText="Cancel"
        width={600}
      >
        {selectedBid && (
          <div className="space-y-6">
            <p className="text-lg">
              Are you sure you want to accept the following bid?
            </p>
            
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-4">
                <Avatar 
                  size={64}
                  src={selectedBid.images?.[0] || 'https://via.placeholder.com/64'} 
                  alt={selectedBid.gemName}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedBid.gemName}</h3>
                  <p className="text-gray-600 mb-2">{selectedBid.gemSpecies}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Bidder:</p>
                      <p className="font-semibold">{selectedBid.bidderName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bid Amount:</p>
                      <p className="font-bold text-green-600 text-lg">{formatLKR(selectedBid.bidAmount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Listed Price:</p>
                      <p className="font-medium">{formatLKR(selectedBid.listingPrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date:</p>
                      <p className="font-medium">{dayjs(selectedBid.bidTime).format('MMMM D, YYYY HH:mm')}</p>
                    </div>
                  </div>

                  {selectedBid.biddingActive && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <p className="text-sm text-gray-600 flex items-center space-x-2">
                        <ClockCircleOutlined />
                        <span>Bidding ends: </span>
                        <CountdownTimer 
                          endTime={selectedBid.biddingEndTime}
                          isActive={selectedBid.biddingActive}
                        />
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>By accepting this bid, you agree to meet with the buyer to complete the transaction.</li>
                  <li>This action will close the bidding for this listing.</li>
                  <li>You will be able to schedule a meeting with the buyer after acceptance.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Bids;