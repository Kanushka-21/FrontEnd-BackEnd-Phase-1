import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, Star, Trophy, Clock, Calendar, RefreshCw, Users, MessageSquare } from 'lucide-react';
import MeetingScheduler from '../../../components/scheduling/MeetingScheduler';

interface PurchasesProps {
  user: any;
}

interface GemImage {
  imageId: string;
  originalName: string;
  contentType: string;
  size: number;
  imageUrl: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  description?: string;
  uploadedAt: string;
}

interface PurchaseItem {
  id: string;
  gemType: string;
  gemName: string;
  finalPrice: number;
  purchaseDate: string;
  sellerId: string;
  images: (string | GemImage)[]; // Support both old string format and new object format
  primaryImageUrl: string;
  weight?: string;
  clarity?: string;
  color?: string;
  cut?: string;
}

const Purchases: React.FC<PurchasesProps> = ({ user }) => {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<{[key: string]: number}>({});
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseItem | null>(null);
  const [meetingScheduled, setMeetingScheduled] = useState<{[key: string]: boolean}>({});

  // Check if meetings exist for purchases
  useEffect(() => {
    const checkExistingMeetings = async () => {
      if (purchases.length === 0) return;
      
      try {
        const userId = user?.userId || user?.id;
        const response = await fetch(`http://localhost:9092/api/meetings/user/${userId}`);
        const data = await response.json();
        
        if (data.success && data.meetings) {
          const scheduled = {};
          data.meetings.forEach((meeting: any) => {
            scheduled[meeting.purchaseId] = true;
          });
          setMeetingScheduled(scheduled);
        }
      } catch (error) {
        console.error('Error checking existing meetings:', error);
      }
    };

    checkExistingMeetings();
  }, [purchases, user]);

  // Fetch purchase history
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      // Use userId (the correct database field) instead of id
      const userId = user?.userId || user?.id;
      if (!userId) {
        console.log('🛒 No user ID available for purchase history');
        setLoading(false);
        return;
      }

      try {
        console.log('🛒 Fetching purchase history for user ID:', userId);
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:9092/api/bidding/purchase-history/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('🛒 Purchase history API response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('🛒 Purchase history API response data:', result);
          
          if (result.success && result.data) {
            setPurchases(result.data);
            console.log('🛒 Purchase history loaded successfully:', result.data.length, 'items');
            
            // Debug: Log each purchase item
            result.data.forEach((purchase: any, index: number) => {
              console.log(`🛒 Purchase ${index + 1}:`, {
                id: purchase.id,
                gemName: purchase.gemName,
                finalPrice: purchase.finalPrice,
                purchaseDate: purchase.purchaseDate,
                primaryImageUrl: purchase.primaryImageUrl,
                imagesCount: purchase.images?.length || 0,
                images: purchase.images?.map((img: any) => ({
                  url: img.imageUrl,
                  isPrimary: img.isPrimary,
                  originalName: img.originalName
                }))
              });
            });
          } else {
            console.log('🛒 Purchase history API returned unsuccessful response:', result);
            setPurchases([]);
            setError(result.message || 'Failed to load purchase history');
          }
        } else {
          console.error('🛒 Failed to fetch purchase history - HTTP Status:', response.status, response.statusText);
          setError(`Failed to load purchase history: ${response.status} ${response.statusText}`);
          setPurchases([]);
        }
      } catch (error) {
        console.error('🛒 Error fetching purchase history:', error);
        setError(error instanceof Error ? error.message : 'Error loading purchase history');
        setPurchases([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchPurchaseHistory();
  }, [user?.userId, user?.id]);

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    const userId = user?.userId || user?.id;
    if (!userId) {
      setRefreshing(false);
      return;
    }

    console.log('🔄 Manually refreshing purchase history for user:', userId);

    fetch(`http://localhost:9092/api/bidding/purchase-history/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      console.log('🔄 Refresh response status:', response.status);
      return response.json();
    })
    .then(result => {
      console.log('🔄 Refresh response data:', result);
      if (result.success && result.data) {
        setPurchases(result.data);
        setError(null);
        console.log('🔄 Purchase history refreshed:', result.data.length, 'items');
      } else {
        setError(result.message || 'Failed to refresh purchase history');
      }
    })
    .catch(error => {
      console.error('🔄 Refresh error:', error);
      setError(error instanceof Error ? error.message : 'Error refreshing purchase history');
    })
    .finally(() => setRefreshing(false));
  };

  // Create test purchase data (for development)
  const createTestData = async () => {
    const userId = user?.userId || user?.id;
    if (!userId) return;
    
    setRefreshing(true);
    try {
      console.log('🧪 Creating test purchase data for user:', userId);
      
      const response = await fetch(`http://localhost:9092/api/bidding/testing/create-test-purchases/${userId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🧪 Test data creation result:', result);
        
        if (result.success) {
          // Refresh purchase history after creating test data
          setTimeout(() => {
            handleRefresh();
          }, 1000);
        }
      } else {
        console.log('🧪 Test endpoint not available (expected during development)');
      }
    } catch (error) {
      console.log('🧪 Test data creation not available:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency in LKR
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  // Get all valid images for an item
  const getItemImages = (item: PurchaseItem) => {
    if (!item.images || item.images.length === 0) return [];
    
    return item.images
      .filter((img: any) => typeof img === 'object' && img.imageUrl)
      .map((img: any) => ({
        url: `http://localhost:9092${img.imageUrl}`,
        isPrimary: img.isPrimary || false,
        description: img.description || '',
        originalName: img.originalName || ''
      }));
  };

  // Get current image URL for display with fallback handling
  const getCurrentImageUrl = (item: PurchaseItem) => {
    const images = getItemImages(item);
    if (images.length === 0) {
      // Try primaryImageUrl as fallback
      if (item.primaryImageUrl) {
        return `http://localhost:9092${item.primaryImageUrl}`;
      }
      // Ultimate fallback
      return 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=300&h=200&fit=crop';
    }
    
    const currentIndex = selectedImageIndex[item.id] || 0;
    return images[currentIndex]?.url || images[0]?.url;
  };

  // Test if an image URL is accessible
  const testImageUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Get working image URL with real-time testing
  const getWorkingImageUrl = async (item: PurchaseItem): Promise<string> => {
    const allImages = getItemImages(item);
    
    // Add primary image to the list if it exists
    if (item.primaryImageUrl) {
      allImages.unshift({
        url: `http://localhost:9092${item.primaryImageUrl}`,
        isPrimary: true,
        description: 'Primary Image',
        originalName: 'Primary'
      });
    }
    
    // Test each image URL
    for (const image of allImages) {
      const isWorking = await testImageUrl(image.url);
      if (isWorking) {
        return image.url;
      }
    }
    
    // If no images work, return fallback
    return 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=300&h=200&fit=crop';
  };

  // Navigate between images
  const nextImage = (item: PurchaseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const images = getItemImages(item);
    if (images.length <= 1) return;
    
    const currentIndex = selectedImageIndex[item.id] || 0;
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImageIndex(prev => ({ ...prev, [item.id]: nextIndex }));
  };

  const prevImage = (item: PurchaseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const images = getItemImages(item);
    if (images.length <= 1) return;
    
    const currentIndex = selectedImageIndex[item.id] || 0;
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setSelectedImageIndex(prev => ({ ...prev, [item.id]: prevIndex }));
  };

  // Get image URL with proper handling for the actual API structure
  const getImageUrl = (item: PurchaseItem) => {
    return getCurrentImageUrl(item);
  };

  // Handle scheduling meeting
  const handleScheduleMeeting = (purchase: PurchaseItem) => {
    setSelectedPurchase(purchase);
    setShowScheduler(true);
  };

  // Handle successful scheduling
  const handleMeetingScheduled = () => {
    if (selectedPurchase) {
      setMeetingScheduled(prev => ({
        ...prev,
        [selectedPurchase.id]: true
      }));
    }
    setShowScheduler(false);
    setSelectedPurchase(null);
  };

  // Handle back from scheduler
  const handleBackFromScheduler = () => {
    setShowScheduler(false);
    setSelectedPurchase(null);
  };

  // If showing scheduler, render it
  if (showScheduler && selectedPurchase) {
    return (
      <MeetingScheduler
        purchase={selectedPurchase}
        user={user}
        onBack={handleBackFromScheduler}
        onScheduled={handleMeetingScheduled}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Purchase History</h2>
          <div className="text-sm text-gray-500">Loading...</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">Loading your purchase history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Purchase History</h2>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading purchases</h3>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Purchase History</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total purchases: {purchases.length}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {purchases.length > 0 ? (
        <>
          {/* Statistics Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Trophy className="w-5 h-5 text-green-600 mr-2" />
                  Your Winning Bids & Purchases
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Congratulations! You have successfully won {purchases.length} bid{purchases.length !== 1 ? 's' : ''} and can now schedule meetings with sellers.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {purchases.length}
                </div>
                <div className="text-xs text-gray-500">Total Wins</div>
                <div className="text-xs text-blue-600 mt-1">
                  {Object.keys(meetingScheduled).filter(id => meetingScheduled[id]).length} Meetings Scheduled
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-green-200">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {formatCurrency(purchases.reduce((total, p) => total + p.finalPrice, 0))}
                </div>
                <div className="text-xs text-gray-500">Total Spent</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {purchases.length > 0 ? formatCurrency(purchases.reduce((total, p) => total + p.finalPrice, 0) / purchases.length) : formatCurrency(0)}
                </div>
                <div className="text-xs text-gray-500">Avg. Purchase</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {Object.keys(meetingScheduled).filter(id => meetingScheduled[id]).length}
                </div>
                <div className="text-xs text-gray-500">Meetings Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">
                  {purchases.length - Object.keys(meetingScheduled).filter(id => meetingScheduled[id]).length}
                </div>
                <div className="text-xs text-gray-500">Pending Meetings</div>
              </div>
            </div>
          </div>

          {/* Card Layout for Purchases */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Enhanced Image with navigation */}
                <div className="relative h-48 bg-gray-100 group">
                  <img 
                    className="w-full h-full object-cover transition-opacity duration-200"
                    src={getImageUrl(purchase)} 
                    alt={purchase.gemName}
                    loading="lazy"
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '1';
                      // Hide loading indicator
                      const loadingDiv = (e.target as HTMLImageElement).nextElementSibling;
                      if (loadingDiv) {
                        (loadingDiv as HTMLElement).style.display = 'none';
                      }
                    }}
                    onError={(e) => {
                      console.warn(`Failed to load image for ${purchase.gemName}:`, getImageUrl(purchase));
                      // Hide loading indicator
                      const loadingDiv = (e.target as HTMLImageElement).nextElementSibling;
                      if (loadingDiv) {
                        (loadingDiv as HTMLElement).style.display = 'none';
                      }
                      
                      // Try alternative image URLs
                      const currentSrc = (e.target as HTMLImageElement).src;
                      const images = getItemImages(purchase);
                      
                      // Find an alternative image that hasn't been tried yet
                      const alternativeImage = images.find(img => img.url !== currentSrc);
                      if (alternativeImage) {
                        (e.target as HTMLImageElement).src = alternativeImage.url;
                        return;
                      }
                      
                      // If all item images fail, use fallback
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=300&h=200&fit=crop';
                    }}
                    style={{ opacity: 0 }}
                  />
                  
                  {/* Loading indicator */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                  
                  {/* Image navigation buttons */}
                  {getItemImages(purchase).length > 1 && (
                    <>
                      <button
                        onClick={(e) => prevImage(purchase, e)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => nextImage(purchase, e)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-70"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Image indicators */}
                  {getItemImages(purchase).length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                      {getItemImages(purchase).map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            (selectedImageIndex[purchase.id] || 0) === index 
                              ? 'bg-white' 
                              : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Trophy className="w-3 h-3 mr-1" />
                      Won
                    </span>
                  </div>
                  
                  {/* Image count badge */}
                  {getItemImages(purchase).length > 1 && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-black bg-opacity-50 text-white">
                        {(selectedImageIndex[purchase.id] || 0) + 1} / {getItemImages(purchase).length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Gem Name and Type */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {purchase.gemName}
                    </h3>
                    <p className="text-sm text-gray-500">{purchase.gemType}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {purchase.weight && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{purchase.weight}</span>
                      </div>
                    )}
                    {purchase.color && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Color:</span>
                        <span className="font-medium">{purchase.color}</span>
                      </div>
                    )}
                    {purchase.clarity && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Clarity:</span>
                        <span className="font-medium">{purchase.clarity}</span>
                      </div>
                    )}
                    {purchase.cut && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Cut:</span>
                        <span className="font-medium">{purchase.cut}</span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Winning Bid</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(purchase.finalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Date and Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(purchase.purchaseDate)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {purchase.id.substring(0, 8)}...
                    </div>
                  </div>

                  {/* Purchase Actions - Enhanced */}
                  <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                        title="View Full Details"
                        onClick={() => {
                          console.log('View full details for:', purchase.id);
                        }}
                      >
                        <Package size={16} />
                      </button>
                      <button 
                        className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded transition-colors"
                        title="Rate Purchase & Seller"
                        onClick={() => {
                          console.log('Rate purchase:', purchase.id);
                        }}
                      >
                        <Star size={16} />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                        title="Download Receipt"
                        onClick={() => {
                          console.log('Download receipt for:', purchase.id);
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Actions
                    </div>
                  </div>

                  {/* Meeting Scheduling Section - Enhanced */}
                  <div className="border-t border-gray-100 pt-3">
                    {meetingScheduled[purchase.id] ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center p-2 bg-green-50 border border-green-200 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm text-green-700 font-medium">Meeting Requested</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Status: Pending seller confirmation</span>
                          <button 
                            className="text-blue-600 hover:text-blue-800 underline"
                            onClick={() => {
                              console.log('View meeting details for:', purchase.id);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleScheduleMeeting(purchase)}
                          className="w-full flex items-center justify-center space-x-2 p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
                        >
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">Schedule Meeting with Seller</span>
                        </button>
                        <div className="text-xs text-center text-gray-500">
                          Coordinate delivery & payment securely
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
          <p className="text-gray-500 mb-4">Your won bids and completed purchases will appear here.</p>
          
          {/* Enhanced Development debug info */}
          {(user?.userId || user?.id) && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>User ID: {user.userId || user.id}</p>
              <p>User Email: {user.email}</p>
              <p>API Endpoint: /api/bidding/purchase-history/{user.userId || user.id}</p>
              <p>Looking for items where winningBidderId = "{user.userId || user.id}" and listingStatus = "sold"</p>
              
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="font-semibold text-yellow-800">🔧 Need to fix Purchase History?</p>
                <p className="text-yellow-700 text-xs mt-1">
                  If you should have purchases but they're not showing, there might be SOLD items in the database 
                  that aren't linked to your account. Use the Purchase History Fix Tool to resolve this.
                </p>
                <div className="mt-2 space-x-2">
                  <button 
                    onClick={() => {
                      window.open('http://localhost:9092/urgent-purchase-fix.html', '_blank');
                    }}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                  >
                    🔧 Open Fix Tool
                  </button>
                  <button 
                    onClick={createTestData}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                  >
                    🧪 Create Test Data
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced guidance section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-2">
                <Trophy className="w-4 h-4 inline mr-1" />
                <strong>How to make purchases:</strong>
              </p>
              <ul className="text-xs text-blue-600 space-y-1 text-left">
                <li>• Browse the marketplace</li>
                <li>• Place bids on gemstones</li>
                <li>• Win auctions to complete purchases</li>
                <li>• Schedule meetings with sellers</li>
              </ul>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                <strong>After winning bids:</strong>
              </p>
              <ul className="text-xs text-green-600 space-y-1 text-left">
                <li>• Schedule meetings with sellers</li>
                <li>• Arrange secure payment & delivery</li>
                <li>• Rate your purchase experience</li>
                <li>• Download receipts for records</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
