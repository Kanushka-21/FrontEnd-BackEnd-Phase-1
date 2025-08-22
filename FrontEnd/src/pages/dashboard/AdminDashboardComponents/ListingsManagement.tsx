import React, { useState, useEffect } from 'react';
import { Card, Input, Table, Button, Modal, message, Tag, Image } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { AdminComponentProps } from './shared';
import { api } from '@/services/api';
import dayjs from 'dayjs';

interface PendingListing {
  id: string;
  gemName: string;
  userName: string;
  price: number;
  createdAt: string;
  listingStatus: string;
  primaryImageUrl?: string;
  images?: string[];
  category?: string;
  weight?: number;
  certification?: string;
}

const ListingsManagement: React.FC<AdminComponentProps> = () => {
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Fetch pending listings
  const fetchPendingListings = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const response = await api.admin.getPendingListings(page, size);
      
      if (response.success && response.data) {
        setPendingListings(response.data.listings || []);
        setCurrentPage(response.data.currentPage || 0);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        message.error('Failed to fetch pending listings');
      }
    } catch (error) {
      console.error('Error fetching pending listings:', error);
      message.error('An error occurred while fetching pending listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingListings();
  }, []);

  // Approve listing
  const handleApproveListing = (listing: PendingListing) => {
    Modal.confirm({
      title: 'Approve Listing',
      icon: <CheckCircleOutlined style={{ color: 'green' }} />,
      content: `Are you sure you want to approve "${listing.gemName}" listing by ${listing.userName}?`,
      onOk: async () => {
        try {
          const response = await api.admin.updateListingStatus(listing.id, 'APPROVED');
          
          if (response.success) {
            message.success('Listing approved successfully');
            fetchPendingListings(currentPage); // Refresh current page
          } else {
            message.error(response.message || 'Failed to approve listing');
          }
        } catch (error) {
          console.error('Error approving listing:', error);
          message.error('An error occurred while approving the listing');
        }
      }
    });
  };

  // Reject listing
  const handleRejectListing = (listing: PendingListing) => {
    Modal.confirm({
      title: 'Reject Listing',
      icon: <CloseCircleOutlined style={{ color: 'red' }} />,
      content: `Are you sure you want to reject "${listing.gemName}" listing by ${listing.userName}?`,
      onOk: async () => {
        try {
          const response = await api.admin.updateListingStatus(listing.id, 'REJECTED');
          
          if (response.success) {
            message.success('Listing rejected successfully');
            fetchPendingListings(currentPage); // Refresh current page
          } else {
            message.error(response.message || 'Failed to reject listing');
          }
        } catch (error) {
          console.error('Error rejecting listing:', error);
          message.error('An error occurred while rejecting the listing');
        }
      }
    });
  };

  // View listing details
  const handleViewListing = (listing: PendingListing) => {
    setSelectedListing(listing);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'primaryImageUrl',
      key: 'image',
      width: 80,
      render: (imageUrl: string, record: PendingListing) => (
        <Image
          src={imageUrl || (record.images && record.images[0]) || '/placeholder-gem.jpg'}
          alt={record.gemName}
          width={50}
          height={50}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback="/placeholder-gem.jpg"
        />
      ),
    },
    {
      title: 'Gem Name',
      dataIndex: 'gemName',
      key: 'gemName',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Seller',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Price (LKR)',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price?.toLocaleString() || 'N/A'}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => category || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'listingStatus',
      key: 'status',
      render: (status: string) => (
        <Tag color="orange">{status}</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PendingListing) => (
        <div className="space-x-2">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewListing(record)}
          >
            View
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApproveListing(record)}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseCircleOutlined />}
            onClick={() => handleRejectListing(record)}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Listings Management</h2>
        <Input.Search
          placeholder="Search listings..."
          style={{ width: 300 }}
          allowClear
          onSearch={(value) => {
            // TODO: Implement search functionality
            console.log('Search:', value);
          }}
        />
      </div>
      
      <Card>
        {pendingListings.length === 0 && !loading ? (
          <div className="text-center py-12">
            <FileTextOutlined style={{ fontSize: '48px', color: '#ccc' }} />
            <h3 className="mt-4 text-lg font-medium">No Pending Listings</h3>
            <p className="text-gray-500">All listings have been reviewed</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={pendingListings}
            loading={loading}
            rowKey="id"
            pagination={{
              current: currentPage + 1, // Ant Design pagination is 1-based
              pageSize: 10,
              total: totalElements,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} listings`,
              onChange: (page) => {
                fetchPendingListings(page - 1, 10); // Convert to 0-based for API
              },
            }}
          />
        )}
      </Card>

      {/* Listing Details Modal */}
      <Modal
        title="Listing Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="approve"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              if (selectedListing) {
                setIsModalVisible(false);
                handleApproveListing(selectedListing);
              }
            }}
          >
            Approve
          </Button>,
          <Button
            key="reject"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => {
              if (selectedListing) {
                setIsModalVisible(false);
                handleRejectListing(selectedListing);
              }
            }}
          >
            Reject
          </Button>,
        ]}
        width={700}
      >
        {selectedListing && (
          <div className="space-y-4">
            {(selectedListing.primaryImageUrl || (selectedListing.images && selectedListing.images.length > 0)) && (
              <div>
                <Image
                  src={selectedListing.primaryImageUrl || (selectedListing.images && selectedListing.images[0])}
                  alt={selectedListing.gemName}
                  width="100%"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Gem Name:</strong> {selectedListing.gemName}
              </div>
              <div>
                <strong>Seller:</strong> {selectedListing.userName}
              </div>
              <div>
                <strong>Price:</strong> LKR {selectedListing.price?.toLocaleString()}
              </div>
              <div>
                <strong>Category:</strong> {selectedListing.category || 'N/A'}
              </div>
              <div>
                <strong>Weight:</strong> {selectedListing.weight || 'N/A'} carats
              </div>
              <div>
                <strong>Certification:</strong> {selectedListing.certification || 'N/A'}
              </div>
              <div>
                <strong>Status:</strong> <Tag color="orange">{selectedListing.listingStatus}</Tag>
              </div>
              <div>
                <strong>Created:</strong> {dayjs(selectedListing.createdAt).format('MMMM DD, YYYY [at] h:mm A')}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListingsManagement;
