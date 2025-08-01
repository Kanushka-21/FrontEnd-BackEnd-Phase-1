import React, { useState, useEffect } from 'react';
import { ShoppingBag, Package, Star, Trophy, Clock, Calendar } from 'lucide-react';

interface PurchasesProps {
  user: any;
}

interface PurchaseItem {
  id: string;
  gemType: string;
  gemName: string;
  finalPrice: number;
  purchaseDate: string;
  sellerId: string;
  images: string[];
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

  // Fetch purchase history
  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('📋 Fetching purchase history for user:', user.id);
        setLoading(true);

        const response = await fetch(`http://localhost:9092/api/bidding/purchase-history/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Purchase history fetched successfully:', result);
          setPurchases(result.data || []);
        } else {
          console.error('❌ Failed to fetch purchase history:', response.statusText);
          setError('Failed to load purchase history');
        }
      } catch (error) {
        console.error('❌ Error fetching purchase history:', error);
        setError('Error loading purchase history');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, [user?.id]);

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get image URL
  const getImageUrl = (item: PurchaseItem) => {
    if (item.primaryImageUrl) {
      return `http://localhost:9092${item.primaryImageUrl}`;
    }
    if (item.images && item.images.length > 0) {
      return `http://localhost:9092/uploads/gems/${item.images[0]}`;
    }
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
        <div className="text-sm text-gray-500">
          Total purchases: {purchases.length}
        </div>
      </div>

      {purchases.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Bid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Won Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-12 w-12 rounded-lg object-cover border border-gray-200" 
                          src={getImageUrl(purchase)} 
                          alt={purchase.gemName}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=60&h=60&fit=crop';
                          }}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{purchase.gemName}</div>
                          <div className="text-xs text-gray-500">{purchase.gemType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {purchase.weight && <div><span className="font-medium">Weight:</span> {purchase.weight}</div>}
                        {purchase.color && <div><span className="font-medium">Color:</span> {purchase.color}</div>}
                        {purchase.clarity && <div><span className="font-medium">Clarity:</span> {purchase.clarity}</div>}
                        {purchase.cut && <div><span className="font-medium">Cut:</span> {purchase.cut}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(purchase.finalPrice)}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Trophy className="w-3 h-3 mr-1" />
                        Winning Bid
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(purchase.purchaseDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Trophy className="w-3 h-3 mr-1" />
                        Won
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="View Details"
                          onClick={() => {
                            // You can implement a detailed view modal here
                            console.log('View details for:', purchase.id);
                          }}
                        >
                          <Package size={16} />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                          title="Rate Purchase"
                          onClick={() => {
                            // You can implement rating functionality here
                            console.log('Rate purchase:', purchase.id);
                          }}
                        >
                          <Star size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases yet</h3>
          <p className="text-gray-500 mb-4">Your won bids and completed purchases will appear here.</p>
          <div className="bg-blue-50 rounded-lg p-4 mt-4">
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
