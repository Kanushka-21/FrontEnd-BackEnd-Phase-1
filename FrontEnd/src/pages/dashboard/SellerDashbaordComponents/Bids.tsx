import React, { useState } from 'react';
import { Table, Button, Tag, Modal, message } from 'antd';
import dayjs from 'dayjs';
import { 
  mockBids, 
  formatLKR, 
  BID_STATUS_COLORS,
  Bid 
} from './shared';

interface BidsProps {
  user?: any;
}

const Bids: React.FC<BidsProps> = ({ user }) => {
  const [bids, setBids] = useState<Bid[]>(mockBids);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [isAcceptBidModalVisible, setIsAcceptBidModalVisible] = useState(false);

  // Handle opening accept bid modal
  const handleOpenAcceptBidModal = (bid: Bid) => {
    setSelectedBid(bid);
    setIsAcceptBidModalVisible(true);
  };

  // Handle accepting a bid
  const handleAcceptBid = () => {
    if (!selectedBid) return;
    
    const updatedBids = bids.map(bid => 
      bid.id === selectedBid.id 
        ? { ...bid, status: 'accepted' as const }
        : bid
    );
    setBids(updatedBids);
    message.success('Bid accepted successfully');
    setIsAcceptBidModalVisible(false);
  };
  // Handle rejecting a bid
  const handleRejectBid = (bidId: string) => {
    Modal.confirm({
      title: 'Reject Bid',
      content: 'Are you sure you want to reject this bid?',
      okText: 'Reject',
      okType: 'danger',
      onOk: () => {
        const updatedBids = bids.map(bid => 
          bid.id === bidId 
            ? { ...bid, status: 'rejected' as const }
            : bid
        );
        setBids(updatedBids);
        message.success('Bid rejected successfully');
      }
    });
  };

  const columns = [
    {
      title: 'Gemstone',
      key: 'gemstone',
      render: (_: any, record: Bid) => (
        <div className="flex items-center space-x-3">
          <img 
            src={record.image} 
            alt={record.gemstone}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <span className="font-medium">{record.gemstone}</span>
        </div>
      ),
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer',
      key: 'buyer',
    },
    {
      title: 'Bid Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatLKR(amount)
    },    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={BID_STATUS_COLORS[status] || 'default'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Bid) => (
        <div className="space-x-2">
          {record.status === 'pending' && (
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
                onClick={() => handleRejectBid(record.id)}
              >
                Reject
              </Button>
            </>
          )}
          {record.status === 'accepted' && (
            <Button size="small" type="primary">
              Schedule Meeting
            </Button>
          )}
        </div>
      )
    }
  ];
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bids</h2>
        <p className="text-gray-600">Manage bids on your gemstones</p>
      </div>

      {/* Bids Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Received Bids</h3>
              <p className="text-gray-600 mt-1">All bids on your gemstone listings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bids Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-0">
          <Table 
            dataSource={bids}
            columns={columns}
            rowKey="id"
            responsive
            scroll={{ x: 'max-content' }}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} bids`
            }}
            className="rounded-none"
            bordered={false}
          />
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
      >
        {selectedBid && (
          <div className="space-y-4">
            <p>
              Are you sure you want to accept the following bid?
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p><strong>Gemstone:</strong> {selectedBid.gemstone}</p>
              <p><strong>Buyer:</strong> {selectedBid.buyer}</p>
              <p><strong>Bid Amount:</strong> {formatLKR(selectedBid.amount)}</p>
              <p><strong>Date:</strong> {dayjs(selectedBid.date).format('MMMM D, YYYY')}</p>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>By accepting this bid, you agree to meet with the buyer to complete the transaction.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Bids;