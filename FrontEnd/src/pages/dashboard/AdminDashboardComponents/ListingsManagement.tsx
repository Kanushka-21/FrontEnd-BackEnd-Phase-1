import React, { useState, useEffect } from 'react';
import { Card, Input, Table, Button, Modal, message, Tag, Image, Row, Col, Divider, Spin, Typography } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
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

interface GemImage {
  imageId: string;
  originalName: string;
  contentType: string;
  size: number;
  imageUrl: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  displayOrder?: number;
  description?: string;
  imageType: 'GEMSTONE' | 'CERTIFICATE';
  uploadedAt: string;
  
  // Video support fields
  mediaType?: 'IMAGE' | 'VIDEO';
  videoUrl?: string;
  videoThumbnailUrl?: string;
  videoDurationSeconds?: number;
  videoFormat?: string;
}

interface DetailedGemListing {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  
  // Certification Status
  isCertified: boolean;
  
  // CSL Certificate Information (for certified stones)
  cslMemoNo?: string;
  issueDate?: string;
  authority?: string;
  giaAlumniMember?: boolean;
  
  // Gem Identification Details
  color: string;
  shape: string;
  weight: string;
  measurements: string;
  variety: string;
  species: string;
  treatment: string;
  comments?: string;
  
  // Listing Specific Information
  price: number;
  currency: string;
  gemName: string;
  category: string;
  description?: string;
  
  // Additional fields for certified gemstones
  certificateNumber?: string;
  certifyingAuthority?: string;
  clarity?: string;
  cut?: string;
  origin?: string;
  
  // Images
  images?: GemImage[];
  primaryImageUrl?: string;
  
  // Metadata
  listingStatus: string;
  isActive: boolean;
  views: number;
  favorites: number;
  inquiries: number;
  createdAt: string;
  updatedAt: string;
  
  // Bidding fields
  biddingStartTime?: string;
  biddingEndTime?: string;
  biddingActive?: boolean;
  biddingCompletedAt?: string;
  winningBidderId?: string;
  finalPrice?: number;
  sellerId?: string;
}

const { Title, Text } = Typography;

const ListingsManagement: React.FC<AdminComponentProps> = () => {
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null);
  const [detailedListing, setDetailedListing] = useState<DetailedGemListing | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Helper function to construct image URLs
  const constructImageUrl = (imagePath: string): string => {
    if (!imagePath) return '/placeholder-gem.jpg';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it starts with /uploads, construct full URL
    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:9092${imagePath}`;
    }
    
    // If it's a Windows path, convert to URL
    if (imagePath.includes('\\')) {
      const relativePath = imagePath.split('uploads\\')[1];
      if (relativePath) {
        const urlPath = relativePath.replace(/\\/g, '/');
        return `http://localhost:9092/uploads/${urlPath}`;
      }
    }
    
    // Fallback
    return '/placeholder-gem.jpg';
  };

  // Helper function to construct video URLs
  const constructVideoUrl = (videoPath: string): string => {
    if (!videoPath) return '';
    
    // If it's already a full URL, return as is
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
      return videoPath;
    }
    
    // If it starts with /uploads, construct full URL
    if (videoPath.startsWith('/uploads')) {
      return `http://localhost:9092${videoPath}`;
    }
    
    // If it's a Windows path, convert to URL
    if (videoPath.includes('\\')) {
      const relativePath = videoPath.split('uploads\\')[1];
      if (relativePath) {
        const urlPath = relativePath.replace(/\\/g, '/');
        return `http://localhost:9092/uploads/${urlPath}`;
      }
    }
    
    return videoPath;
  };

  // Helper function to format LKR currency
  const formatLKR = (amount: number): string => {
    return `LKR ${amount?.toLocaleString() || '0'}`;
  };

  // Fetch pending listings
  const fetchPendingListings = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const response = await api.admin.getPendingListings(page, size);
      
      if (response.success && response.data) {
        setPendingListings(response.data.listings || []);
        setCurrentPage(response.data.currentPage || 0);
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
  const handleViewListing = async (listing: PendingListing) => {
    setSelectedListing(listing);
    setIsModalVisible(true);
    setDetailsLoading(true);
    setDetailedListing(null);

    try {
      console.log('🔍 Fetching detailed information for listing:', listing.id);
      const response = await api.admin.getListingDetails(listing.id);
      
      if (response.success && response.data) {
        console.log('✅ Detailed listing data received:', response.data);
        setDetailedListing(response.data);
      } else {
        console.error('❌ Failed to fetch detailed listing:', response.message);
        message.error('Failed to load detailed information');
      }
    } catch (error) {
      console.error('❌ Error fetching detailed listing:', error);
      message.error('An error occurred while loading detailed information');
    } finally {
      setDetailsLoading(false);
    }
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

      {/* Enhanced Listing Details Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <EyeOutlined className="mr-2" />
            Listing Details - {selectedListing?.gemName || 'Loading...'}
          </div>
        }
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
            disabled={detailsLoading}
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
            disabled={detailsLoading}
          >
            Reject
          </Button>,
        ]}
        width={1000}
        style={{ top: 20 }}
      >
        {detailsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
            <span className="ml-3">Loading detailed information...</span>
          </div>
        ) : detailedListing ? (
          <div className="space-y-6">
            {/* Images Section */}
            <div>
              <Title level={4} className="text-blue-600 mb-4">
                Gemstone Images
              </Title>
              
              {detailedListing.images && detailedListing.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Primary Image Display */}
                  <div className="flex justify-center">
                    <Image.PreviewGroup>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {detailedListing.images
                          .filter(img => img.imageType === 'GEMSTONE')
                          .map((image, index) => (
                          <div key={image.imageId} className="relative">
                            <Image
                              src={constructImageUrl(image.imageUrl)}
                              alt={`Gemstone ${index + 1}`}
                              width={150}
                              height={150}
                              style={{ objectFit: 'cover', borderRadius: '8px' }}
                              fallback="/placeholder-gem.jpg"
                            />
                            {image.isPrimary && (
                              <div className="absolute top-2 right-2">
                                <Tag color="gold" className="text-xs">Primary</Tag>
                              </div>
                            )}
                            <div className="absolute bottom-2 left-2">
                              <Tag color="blue" className="text-xs">💎</Tag>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Image.PreviewGroup>
                  </div>
                  
                  {/* Certificate Images */}
                  {detailedListing.images.some(img => img.imageType === 'CERTIFICATE') && (
                    <div>
                      <Title level={5} className="text-green-600 mb-3">
                        Certificate Images
                      </Title>
                      <Image.PreviewGroup>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {detailedListing.images
                            .filter(img => img.imageType === 'CERTIFICATE')
                            .map((image, index) => (
                            <div key={image.imageId} className="relative">
                              <Image
                                src={constructImageUrl(image.imageUrl)}
                                alt={`Certificate ${index + 1}`}
                                width={150}
                                height={150}
                                style={{ objectFit: 'cover', borderRadius: '8px' }}
                                fallback="/placeholder-gem.jpg"
                              />
                              <div className="absolute bottom-2 left-2">
                                <Tag color="green" className="text-xs">📜</Tag>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Image.PreviewGroup>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Text type="secondary">No images available for this listing</Text>
                </div>
              )}
            </div>

            {/* Videos Section */}
            <div>
              <Title level={4} className="text-purple-600 mb-4">
                Gemstone Videos
              </Title>
              
              {detailedListing.images && detailedListing.images.filter(media => media.mediaType === 'VIDEO').length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {detailedListing.images
                      .filter(media => media.mediaType === 'VIDEO' && media.imageType === 'GEMSTONE')
                      .map((video, index) => (
                      <div key={video.imageId} className="relative bg-gray-100 rounded-lg overflow-hidden">
                        <video
                          controls
                          width="100%"
                          height="200"
                          style={{ objectFit: 'cover' }}
                          poster={video.videoThumbnailUrl ? constructVideoUrl(video.videoThumbnailUrl) : undefined}
                        >
                          <source src={constructVideoUrl(video.videoUrl || video.imageUrl)} type={`video/${video.videoFormat || 'mp4'}`} />
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute top-2 left-2">
                          <Tag color="purple" className="text-xs">🎬 Video {index + 1}</Tag>
                        </div>
                        {video.originalName && (
                          <div className="absolute bottom-2 left-2">
                            <Tag color="blue" className="text-xs">{video.originalName}</Tag>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Text type="secondary">No videos available for this listing</Text>
                </div>
              )}
            </div>

            <Divider />

            {/* Basic Information */}
            <div>
              <Title level={4} className="text-blue-600 mb-4">
                Basic Information
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong>Gem Name:</Text>
                  <br />
                  <Text>{detailedListing.gemName}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Category:</Text>
                  <br />
                  <Text>{detailedListing.category}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Price:</Text>
                  <br />
                  <Text className="text-lg font-semibold text-green-600">
                    {formatLKR(detailedListing.price)}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Weight:</Text>
                  <br />
                  <Text>{detailedListing.weight} carats</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Seller:</Text>
                  <br />
                  <Text>{detailedListing.userName}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Status:</Text>
                  <br />
                  <Tag color="orange">{detailedListing.listingStatus}</Tag>
                </Col>
              </Row>
            </div>

            <Divider />

            {/* Gemstone Details */}
            <div>
              <Title level={4} className="text-blue-600 mb-4">
                Gemstone Specifications
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Text strong>Color:</Text>
                  <br />
                  <Text>{detailedListing.color}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Shape:</Text>
                  <br />
                  <Text>{detailedListing.shape}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Measurements:</Text>
                  <br />
                  <Text>{detailedListing.measurements}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Variety:</Text>
                  <br />
                  <Text>{detailedListing.variety}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Species:</Text>
                  <br />
                  <Text>{detailedListing.species}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Treatment:</Text>
                  <br />
                  <Text>{detailedListing.treatment}</Text>
                </Col>
                {detailedListing.clarity && (
                  <Col span={8}>
                    <Text strong>Clarity:</Text>
                    <br />
                    <Text>{detailedListing.clarity}</Text>
                  </Col>
                )}
                {detailedListing.cut && (
                  <Col span={8}>
                    <Text strong>Cut:</Text>
                    <br />
                    <Text>{detailedListing.cut}</Text>
                  </Col>
                )}
                {detailedListing.origin && (
                  <Col span={8}>
                    <Text strong>Origin:</Text>
                    <br />
                    <Text>{detailedListing.origin}</Text>
                  </Col>
                )}
              </Row>
            </div>

            {/* Certification Information */}
            {detailedListing.isCertified && (
              <>
                <Divider />
                <div>
                  <Title level={4} className="text-green-600 mb-4">
                    <SafetyCertificateOutlined className="mr-2" />
                    Certification Details
                  </Title>
                  <Row gutter={[16, 16]}>
                    {detailedListing.cslMemoNo && (
                      <Col span={12}>
                        <Text strong>CSL Memo No:</Text>
                        <br />
                        <Text>{detailedListing.cslMemoNo}</Text>
                      </Col>
                    )}
                    {detailedListing.issueDate && (
                      <Col span={12}>
                        <Text strong>Issue Date:</Text>
                        <br />
                        <Text>{detailedListing.issueDate}</Text>
                      </Col>
                    )}
                    {detailedListing.authority && (
                      <Col span={12}>
                        <Text strong>Authority:</Text>
                        <br />
                        <Text>{detailedListing.authority}</Text>
                      </Col>
                    )}
                    {detailedListing.certificateNumber && (
                      <Col span={12}>
                        <Text strong>Certificate Number:</Text>
                        <br />
                        <Text>{detailedListing.certificateNumber}</Text>
                      </Col>
                    )}
                    {detailedListing.certifyingAuthority && (
                      <Col span={12}>
                        <Text strong>Certifying Authority:</Text>
                        <br />
                        <Text>{detailedListing.certifyingAuthority}</Text>
                      </Col>
                    )}
                    {detailedListing.giaAlumniMember !== undefined && (
                      <Col span={12}>
                        <Text strong>GIA Alumni Member:</Text>
                        <br />
                        <Tag color={detailedListing.giaAlumniMember ? 'green' : 'red'}>
                          {detailedListing.giaAlumniMember ? 'Yes' : 'No'}
                        </Tag>
                      </Col>
                    )}
                  </Row>
                </div>
              </>
            )}

            {/* Additional Information */}
            {detailedListing.description && (
              <>
                <Divider />
                <div>
                  <Title level={4} className="text-blue-600 mb-4">
                    Description
                  </Title>
                  <Text>{detailedListing.description}</Text>
                </div>
              </>
            )}

            {detailedListing.comments && (
              <>
                <Divider />
                <div>
                  <Title level={4} className="text-blue-600 mb-4">
                    Additional Comments
                  </Title>
                  <Text>{detailedListing.comments}</Text>
                </div>
              </>
            )}

            <Divider />

            {/* Metadata */}
            <div>
              <Title level={4} className="text-gray-600 mb-4">
                Listing Metadata
              </Title>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Text strong>Views:</Text>
                  <br />
                  <Text>{detailedListing.views || 0}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Favorites:</Text>
                  <br />
                  <Text>{detailedListing.favorites || 0}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Inquiries:</Text>
                  <br />
                  <Text>{detailedListing.inquiries || 0}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Created:</Text>
                  <br />
                  <Text>{dayjs(detailedListing.createdAt).format('MMMM DD, YYYY [at] h:mm A')}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Last Updated:</Text>
                  <br />
                  <Text>{dayjs(detailedListing.updatedAt).format('MMMM DD, YYYY [at] h:mm A')}</Text>
                </Col>
              </Row>
            </div>
          </div>
        ) : selectedListing ? (
          // Fallback to basic information if detailed data failed to load
          <div className="space-y-4">
            <div className="text-center py-4">
              <Text type="warning">
                Failed to load detailed information. Showing basic details:
              </Text>
            </div>
            
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
        ) : null}
      </Modal>
    </div>
  );
};

export default ListingsManagement;
