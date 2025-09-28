import React, { useState, useEffect } from 'react';
import { Modal, Spin, message, Card, Row, Col, Divider, Tag, Button, Space, Avatar } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  HomeOutlined, 
  CalendarOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  MoneyCollectOutlined
} from '@ant-design/icons';
import { User, MapPin, Calendar, Phone, Mail, Shield, AlertTriangle, Clock } from 'lucide-react';
import { api } from '@/services/api';
import './AdvertisementViewModal.styles.css';

interface Advertisement {
  id: string;
  title: string;
  category: string;
  description: string;
  price: string;
  mobileNo: string;
  email: string;
  userId: string;
  images: string[];
  video?: string;
  approved: string;
  createdOn: string;
  modifiedOn: string;
  advertiser?: string;
}

interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  nicNumber: string;
  userRole: string;
  verificationStatus: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  faceImageUrl?: string;
  nicImageUrl?: string;
}

interface AdvertisementViewModalProps {
  advertisement: Advertisement | null;
  visible: boolean;
  onClose: () => void;
  onApprove?: (advertisement: Advertisement) => void;
  onReject?: (advertisement: Advertisement) => void;
}

const AdvertisementViewModal: React.FC<AdvertisementViewModalProps> = ({
  advertisement,
  visible,
  onClose,
  onApprove,
  onReject
}) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>({});

  // Fetch seller profile when advertisement changes
  useEffect(() => {
    if (advertisement && advertisement.userId) {
      console.log('Advertisement data:', advertisement);
      console.log('Advertisement video:', advertisement.video);
      console.log('Advertisement images:', advertisement.images);
      fetchSellerProfile(advertisement.userId);
    } else {
      setUserProfile(null);
    }
  }, [advertisement]);

  const fetchSellerProfile = async (userId: string) => {
    setLoadingProfile(true);
    try {
      const response = await api.getUserProfile(userId);
      if (response.success && response.data) {
        setUserProfile(response.data);
      } else {
        message.error('Failed to load seller information');
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
      message.error('Error loading seller information');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleImageLoad = (imageKey: string) => {
    setImageLoading(prev => ({ ...prev, [imageKey]: false }));
  };

  const handleImageError = (imageKey: string) => {
    setImageLoading(prev => ({ ...prev, [imageKey]: false }));
  };

  const nextImage = () => {
    if (advertisement?.images && advertisement.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === advertisement.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (advertisement?.images && advertisement.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? advertisement.images.length - 1 : prev - 1
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': default: return 'warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircleOutlined />;
      case 'rejected': return <CloseCircleOutlined />;
      case 'pending': default: return <ExclamationCircleOutlined />;
    }
  };

  const getVerificationIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircleOutlined style={{ color: '#52c41a' }} />
    ) : (
      <ExclamationCircleOutlined style={{ color: '#faad14' }} />
    );
  };

  const formatPrice = (price: string) => {
    // Remove any non-numeric characters except decimal point
    const numericPrice = price.replace(/[^\d.]/g, '');
    const parsedPrice = parseFloat(numericPrice);
    
    if (isNaN(parsedPrice)) return price;
    
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parsedPrice);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (!advertisement) return null;

  return (
    <Modal
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Advertisement Details</span>
          <Tag 
            color={getStatusColor(advertisement.approved)} 
            icon={getStatusIcon(advertisement.approved)}
            className="ml-2"
          >
            {advertisement.approved?.toUpperCase() || 'PENDING'}
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      style={{ top: 20 }}
      footer={
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button onClick={onClose}>Close</Button>
          </div>
          <div className="flex space-x-2">
            {advertisement.approved === 'pending' && (
              <>
                <Button 
                  danger 
                  icon={<CloseCircleOutlined />}
                  onClick={() => onReject?.(advertisement)}
                >
                  Reject
                </Button>
                <Button 
                  type="primary" 
                  icon={<CheckCircleOutlined />}
                  onClick={() => onApprove?.(advertisement)}
                >
                  Approve
                </Button>
              </>
            )}
            {advertisement.approved === 'approved' && (
              <Button 
                danger 
                icon={<CloseCircleOutlined />}
                onClick={() => onReject?.(advertisement)}
              >
                Reject
              </Button>
            )}
            {advertisement.approved === 'rejected' && (
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />}
                onClick={() => onApprove?.(advertisement)}
              >
                Approve
              </Button>
            )}
          </div>
        </div>
      }
      className="advertisement-view-modal"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        <Row gutter={[24, 24]}>
          {/* Left Column - Advertisement Details */}
          <Col xs={24} lg={14}>
            <Card title="Advertisement Information" className="mb-4">
              {/* Media Section - Always show for admin review */}
              <div className="mb-6 p-4 border-2 border-blue-100 rounded-lg bg-blue-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold flex items-center text-blue-800">
                    <EyeOutlined className="mr-2" />
                    Media Content Review
                  </h4>
                  <Button 
                    size="small" 
                    type="text"
                    onClick={() => {
                      console.log('=== ADVERTISEMENT DEBUG DATA ===');
                      console.log('Full advertisement object:', advertisement);
                      console.log('Video field:', advertisement.video);
                      console.log('Video type:', typeof advertisement.video);
                      console.log('Video truthy:', !!advertisement.video);
                      console.log('Video after trim:', advertisement.video?.trim());
                      console.log('Images field:', advertisement.images);
                      console.log('Images type:', typeof advertisement.images);
                      console.log('Images length:', advertisement.images?.length);
                      
                      // Test video URLs
                      if (advertisement.video) {
                        const finalUrl = advertisement.video.startsWith('http') 
                          ? advertisement.video 
                          : `http://localhost:9092/uploads/advertisement-videos/${advertisement.video}`;
                        
                        console.log('Video URL that will be used:', finalUrl);
                        console.log('Raw video field value:', `"${advertisement.video}"`);
                        
                        // Test the URL
                        fetch(finalUrl, { method: 'HEAD' })
                          .then(response => {
                            console.log(`Video URL test result: ${response.status} ${response.statusText}`);
                          })
                          .catch(err => {
                            console.log('Video URL test failed:', err.message);
                          });
                      }
                      
                      alert('Check console for detailed debug data!');
                    }}
                  >
                    🐛 Debug Data
                  </Button>
                </div>
                  
                  {/* Video First */}
                  {advertisement.video && advertisement.video.trim() !== '' ? (
                    <div className="mb-4">
                      <h5 className="text-md font-medium mb-2 flex items-center">
                        <span className="mr-2">🎥</span>
                        Advertisement Video:
                      </h5>
                      <div className="video-container bg-gray-100 rounded-lg overflow-hidden">
                        <video 
                          controls 
                          autoPlay
                          muted
                          className="w-full h-64 object-contain"
                          src={advertisement.video.startsWith('http') 
                            ? advertisement.video 
                            : `http://localhost:9092/uploads/advertisement-videos/${advertisement.video}`
                          }
                          onLoadStart={() => {
                            console.log('🎬 Admin dashboard video loading:', advertisement.video);
                          }}
                          onCanPlay={() => {
                            console.log('▶️ Admin dashboard video ready to play');
                          }}
                          onError={(e) => {
                            console.error('❌ Admin dashboard video error:', e);
                            console.error('Video source attempted:', advertisement.video);
                            const target = e.target as HTMLVideoElement;
                            target.style.display = 'none';
                            // Show error message
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'flex items-center justify-center h-64 bg-gray-100 text-gray-500 rounded-lg';
                            errorDiv.innerHTML = '<div class="text-center"><p>🚫 Video not available</p><small>Source: ' + (target.src || advertisement.video) + '</small></div>';
                            target.parentNode?.appendChild(errorDiv);
                          }}
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <h5 className="text-md font-medium mb-2 flex items-center text-gray-500">
                        <span className="mr-2">🎥</span>
                        Advertisement Video:
                      </h5>
                      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <p>No video uploaded</p>
                          <small>Video data: {JSON.stringify(advertisement.video)}</small>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Images */}
                  {advertisement.images && advertisement.images.length > 0 ? (
                    <div>
                      <h5 className="text-md font-medium mb-2 flex items-center">
                        <span className="mr-2">🖼️</span>
                        Advertisement Images:
                      </h5>
                      <div className="relative mb-4">
                        <img 
                          src={advertisement.images[currentImageIndex].startsWith('http') 
                            ? advertisement.images[currentImageIndex]
                            : `http://localhost:9092/uploads/${advertisement.images[currentImageIndex]}`
                          }
                          alt={`${advertisement.title} - Image ${currentImageIndex + 1}`}
                          className="w-full h-64 object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Image load error:', advertisement.images[currentImageIndex]);
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
                          }}
                        />
                        
                        {advertisement.images.length > 1 && (
                          <>
                            <button
                              onClick={prevImage}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                            >
                              ‹
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                            >
                              ›
                            </button>
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                              {currentImageIndex + 1} / {advertisement.images.length}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {advertisement.images.length > 1 && (
                        <div className="flex space-x-2 overflow-x-auto pb-2">
                          {advertisement.images.map((image, index) => (
                            <img
                              key={index}
                              src={image.startsWith('http') 
                                ? image
                                : `http://localhost:9092/uploads/${image}`
                              }
                              alt={`Thumbnail ${index + 1}`}
                              className={`w-16 h-16 object-cover rounded cursor-pointer flex-shrink-0 ${
                                currentImageIndex === index ? 'ring-2 ring-blue-500' : ''
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                              onError={(e) => {
                                console.error('Thumbnail load error:', image);
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=N/A';
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h5 className="text-md font-medium mb-2 flex items-center text-gray-500">
                        <span className="mr-2">🖼️</span>
                        Advertisement Images:
                      </h5>
                      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <p>No images uploaded</p>
                          <small>Images data: {JSON.stringify(advertisement.images)}</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{advertisement.title}</h3>
                  <div className="flex items-center space-x-4">
                    <Tag color="blue">{advertisement.category}</Tag>
                    <div className="flex items-center text-2xl font-bold text-green-600">
                      <MoneyCollectOutlined className="mr-2" />
                      {formatPrice(advertisement.price)}
                    </div>
                  </div>
                </div>

                {advertisement.description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{advertisement.description}</p>
                  </div>
                )}

                {/* Contact Information from Advertisement */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information (from Ad)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <PhoneOutlined className="text-blue-500" />
                      <span className="text-gray-900">{advertisement.mobileNo}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MailOutlined className="text-blue-500" />
                      <span className="text-gray-900">{advertisement.email}</span>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CalendarOutlined className="text-green-500" />
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-gray-900">{formatDate(advertisement.createdOn)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CalendarOutlined className="text-blue-500" />
                      <span className="text-sm text-gray-600">Modified:</span>
                      <span className="text-gray-900">{formatDate(advertisement.modifiedOn)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right Column - Seller Information */}
          <Col xs={24} lg={10}>
            <Card title="Seller Information" className="mb-4">
              {loadingProfile ? (
                <div className="text-center py-8">
                  <Spin size="large" />
                  <p className="mt-4 text-gray-500">Loading seller information...</p>
                </div>
              ) : userProfile ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                    <Avatar 
                      size={64}
                      icon={<UserOutlined />}
                      src={userProfile.faceImageUrl}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {userProfile.firstName} {userProfile.lastName}
                        </h3>
                        {getVerificationIcon(userProfile.isVerified)}
                      </div>
                      <p className="text-gray-600">{userProfile.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Tag color={userProfile.userRole === 'SELLER' ? 'green' : 'blue'}>
                          {userProfile.userRole}
                        </Tag>
                        <Tag color={userProfile.isActive ? 'success' : 'error'}>
                          {userProfile.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <UserOutlined className="mr-2" />
                      Personal Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <PhoneOutlined className="text-blue-500 w-4" />
                        <span className="text-sm text-gray-600 w-20">Phone:</span>
                        <span className="text-gray-900">{userProfile.phoneNumber}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <HomeOutlined className="text-blue-500 w-4 mt-0.5" />
                        <span className="text-sm text-gray-600 w-20">Address:</span>
                        <span className="text-gray-900">{userProfile.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarOutlined className="text-blue-500 w-4" />
                        <span className="text-sm text-gray-600 w-20">Birthday:</span>
                        <span className="text-gray-900">{userProfile.dateOfBirth}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <IdcardOutlined className="text-blue-500 w-4" />
                        <span className="text-sm text-gray-600 w-20">NIC:</span>
                        <span className="text-gray-900">{userProfile.nicNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Shield size={16} className="mr-2" />
                      Verification Status
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Account Verified:</span>
                        <Tag color={userProfile.isVerified ? 'success' : 'warning'}>
                          {userProfile.isVerified ? 'Verified' : 'Pending'}
                        </Tag>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Verification Status:</span>
                        <Tag color={userProfile.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}>
                          {userProfile.verificationStatus}
                        </Tag>
                      </div>
                    </div>
                  </div>

                  {/* Account Activity */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Clock size={16} className="mr-2" />
                      Account Activity
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CalendarOutlined className="text-green-500 w-4" />
                        <span className="text-sm text-gray-600">Joined:</span>
                        <span className="text-gray-900">{formatDate(userProfile.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CalendarOutlined className="text-blue-500 w-4" />
                        <span className="text-sm text-gray-600">Last Updated:</span>
                        <span className="text-gray-900">{formatDate(userProfile.updatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Communication Note */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-blue-900">Communication Required</h5>
                        <p className="text-sm text-blue-700 mt-1">
                          Contact the seller using the provided information before approving or rejecting this advertisement.
                          Verify the content meets platform guidelines and discuss any concerns directly.
                        </p>
                        <div className="mt-2 space-x-2">
                          <Button size="small" type="primary" ghost>
                            <PhoneOutlined /> Call {userProfile.phoneNumber}
                          </Button>
                          <Button size="small" type="primary" ghost>
                            <MailOutlined /> Email {userProfile.email}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ExclamationCircleOutlined className="text-gray-400 text-4xl mb-4" />
                  <p className="text-gray-500">Unable to load seller information</p>
                  <Button 
                    type="link" 
                    onClick={() => fetchSellerProfile(advertisement.userId)}
                  >
                    Retry
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default AdvertisementViewModal;