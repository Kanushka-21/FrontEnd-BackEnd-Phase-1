import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, FileText, TrendingUp, ShoppingBag, Package,
  Eye, Edit, Trash2
} from 'lucide-react';
import { StatsCard, MOCK_STATS, formatLKR, Advertisement } from './shared';
import { api } from '@/services/api';
import { authUtils } from '@/utils';
import toast from 'react-hot-toast';

interface OverviewProps {
  user: any;
  onTabChange: (tab: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ user, onTabChange }) => {
  const [latestAds, setLatestAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest advertisements
  const fetchLatestAdvertisements = async () => {
    try {
      setLoading(true);
      const userId = authUtils.getCurrentUserId();
      
      if (!userId) {
        console.error('User ID not found in localStorage');
        return;
      }
      
      console.log('Fetching latest advertisements for user:', userId);
      
      const response = await api.getUserAdvertisements(userId);
      console.log('Overview - Fetch response:', response);
      
      if (response.success && response.data) {
        // Transform backend data to match UI expectations
        const transformedData = response.data.map(ad => ({
          ...ad,
          status: ad.approved ? 'Approved' : 'Pending Review',
          dateCreated: new Date(ad.createdOn).toLocaleDateString(),
          views: 0, // Default values for now
          inquiries: 0,
          // Transform image paths if needed
          images: ad.images ? ad.images.map(imagePath => {
            // Check if it's already a web URL
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
              return imagePath;
            }
            // If it's still a file system path, convert it
            const fileName = imagePath.split('/').pop() || imagePath.split('\\').pop();
            return `http://localhost:9092/uploads/advertisement-images/${fileName}`;
          }) : []
        }));
        
        // Sort by creation date (newest first) and take only the latest 3
        const sortedAds = transformedData.sort((a, b) => 
          new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
        );
        
        setLatestAds(sortedAds.slice(0, 3));
        console.log('Overview - Latest 3 advertisements:', sortedAds.slice(0, 3));
      } else {
        console.warn('Failed to fetch advertisements:', response);
        setLatestAds([]);
      }
    } catch (error) {
      console.error('Error fetching latest advertisements:', error);
      setLatestAds([]);
    } finally {
      setLoading(false);
    }
  };

  // Load advertisements on component mount
  useEffect(() => {
    fetchLatestAdvertisements();
  }, []);
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || 'User'}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your advertisements today</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <CheckCircle size={16} className="mr-1" />
              Verified Buyer
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Advertisements"
          value={MOCK_STATS.myAdvertisements}
          change="+2 from last month"
          icon={<FileText className="w-6 h-6 text-blue-600" />}
          iconBgColor="bg-blue-100"
          textColor="text-blue-600"
        />

        <StatsCard
          title="Active Bids"
          value={MOCK_STATS.activeBids}
          change="+1 from last month"
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          iconBgColor="bg-green-100"
          textColor="text-green-600"
        />

        <StatsCard
          title="Total Purchases"
          value={MOCK_STATS.totalPurchases}
          change="+156 from last month"
          icon={<ShoppingBag className="w-6 h-6 text-purple-600" />}
          iconBgColor="bg-purple-100"
          textColor="text-purple-600"
        />

        <StatsCard
          title="Total Spent"
          value={formatLKR(MOCK_STATS.totalSpent)}
          change="+12% from last month"
          icon={<Package className="w-6 h-6 text-orange-600" />}
          iconBgColor="bg-orange-100"
          textColor="text-orange-600"
        />
      </div>

      {/* Latest Advertisements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Latest Advertisements</h2>
          <button 
            onClick={() => onTabChange('advertisements')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Advertisement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading latest advertisements...</p>
                  </td>
                </tr>
              ) : latestAds.length > 0 ? (
                latestAds.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {ad.images && ad.images.length > 0 ? (
                          <img 
                            className="h-10 w-10 rounded-lg object-cover" 
                            src={ad.images[0]} 
                            alt={ad.title}
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjk5OTkgMjUuMzEzNyAxMy45OTk5IDIyQzEzLjk5OTkgMTguNjg2MyAxNi42ODYzIDE2IDIwIDE2QzIzLjMxMzcgMTYgMjYgMTguNjg2MyAyNiAyMkMyNiAyNS4zMTM3IDIzLjMxMzcgMjggMjAgMjhaTTIwIDI0QzIxLjEwNDYgMjQgMjIgMjMuMTA0NiAyMiAyMkMyMiAyMC44OTU0IDIxLjEwNDYgMjAgMjAgMjBDMTguODk1NCAyMCAxOCAyMC44OTU0IDE4IDIyQzE4IDIzLjEwNDYgMTguODk1NCAyNCAyMCAyNFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                          <div className="text-sm text-gray-500">
                            {ad.description ? 
                              (ad.description.length > 50 ? 
                                ad.description.substring(0, 50) + '...' : 
                                ad.description
                              ) : 
                              'No description'
                            }
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {ad.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      LKR {ad.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ad.approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ad.approved ? 'Approved' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ad.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ad.createdOn).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => onTabChange('advertisements')}
                        title="View in Advertisements"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => onTabChange('advertisements')}
                        title="Edit in Advertisements"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => onTabChange('advertisements')}
                        title="Delete in Advertisements"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No advertisements yet</p>
                      <button
                        onClick={() => onTabChange('advertisements')}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Create your first advertisement
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
