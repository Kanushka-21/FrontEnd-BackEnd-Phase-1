import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, Star, Trophy, Clock, Calendar, RefreshCw } from 'lucide-react';

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

  // Fetch purchase history
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!user?.id) {
        console.log('🛒 No user ID available for purchase history');
        setLoading(false);
        return;
      }

      try {
        console.log('🛒 Fetching purchase history for user ID:', user.id);
        setLoading(true);
        setError(null);

        const response = await fetch(`http://localhost:9092/api/bidding/purchase-history/${user.id}`, {
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
                purchaseDate: purchase.purchaseDate
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
  }, [user?.id]);

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    if (!user?.id) {
      setRefreshing(false);
      return;
    }

    console.log('🔄 Manually refreshing purchase history for user:', user.id);

    fetch(`http://localhost:9092/api/bidding/purchase-history/${user.id}`, {
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
    if (!user?.id) return;
    
    setRefreshing(true);
    try {
      console.log('🧪 Creating test purchase data for user:', user.id);
      
      const response = await fetch(`http://localhost:9092/api/bidding/testing/create-test-purchases/${user.id}`, {
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

  // Get image URL with improved handling for the new data structure
  const getImageUrl = (item: PurchaseItem) => {
    // First try primaryImageUrl
    if (item.primaryImageUrl) {
      return `http://localhost:9092${item.primaryImageUrl}`;
    }
    
    // Then try to get first image from images array (new structure with objects)
    if (item.images && item.images.length > 0) {
      const firstImage = item.images[0];
      // Handle both old string format and new object format
      if (typeof firstImage === 'string') {
        return `http://localhost:9092/uploads/gems/${firstImage}`;
      } else if (firstImage && firstImage.imageUrl) {
        return `http://localhost:9092${firstImage.imageUrl}`;
      }
    }
    
    // Fallback to default image
    return 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=60&h=60&fit=crop';
  };

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
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Trophy className="w-5 h-5 text-green-600 mr-2" />
                  Your Winning Bids
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Congratulations! You have successfully won {purchases.length} bid{purchases.length !== 1 ? 's' : ''}.
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {purchases.length}
                </div>
                <div className="text-xs text-gray-500">Total Wins</div>
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
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  <img 
                    className="w-full h-full object-cover"
                    src={getImageUrl(purchase)} 
                    alt={purchase.gemName}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=300&h=200&fit=crop';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Trophy className="w-3 h-3 mr-1" />
                      Won
                    </span>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{formatDate(purchase.purchaseDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        title="View Details"
                        onClick={() => {
                          console.log('View details for:', purchase.id);
                        }}
                      >
                        <Package size={16} />
                      </button>
                      <button 
                        className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
                        title="Rate Purchase"
                        onClick={() => {
                          console.log('Rate purchase:', purchase.id);
                        }}
                      >
                        <Star size={16} />
                      </button>
                    </div>
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
          
          {/* Development debug info */}
          {user?.id && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-600">
              <p><strong>Debug Info:</strong></p>
              <p>User ID: {user.id}</p>
              <p>API Endpoint: /api/bidding/purchase-history/{user.id}</p>
              <p>Looking for items where winningBidderId = "{user.id}" and listingStatus = "sold"</p>
            </div>
          )}
          
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <Trophy className="w-4 h-4 inline mr-1" />
              Win a bid in the marketplace to see your first purchase here!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
