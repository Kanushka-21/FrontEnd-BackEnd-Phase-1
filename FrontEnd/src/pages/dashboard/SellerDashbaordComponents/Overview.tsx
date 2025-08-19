import React, { useState, useEffect } from 'react';
import { Row, Col } from 'antd';
import { 
  ShopOutlined, DollarOutlined,
  CalendarOutlined, TrophyOutlined
} from '@ant-design/icons';
import { 
  FileText, Eye, Edit, Trash2
} from 'lucide-react';
import { StatsCard, mockStats, formatLKR } from './shared';
import { authUtils } from '@/utils';
import axios from 'axios';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = 'http://localhost:9092';

// Define Advertisement type
interface Advertisement {
  _id: string;
  id: string;
  title: string;
  category: string;
  description: string;
  price: string;
  images: string[];
  approved: boolean;
  createdOn: string;
  views?: number;
}

interface OverviewProps {
  user?: any;
  onTabChange: (tab: string) => void;
}

const Overview: React.FC<OverviewProps> = ({ user, onTabChange }) => {
  const [latestAds, setLatestAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch latest advertisements
  const fetchLatestAdvertisements = async () => {
    try {
      setLoading(true);
      const token = authUtils.getAuthToken();
      const userId = authUtils.getCurrentUserId();
      
      if (!token || !userId) {
        console.error('User ID or token not found in localStorage');
        return;
      }
      
      console.log('Fetching latest advertisements for seller:', userId);
      
      const response = await axios.get(`${API_BASE_URL}/api/advertisements/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.data) {
        // Transform backend data to match UI expectations
        const transformedData = response.data.data.map((ad: any) => ({
          ...ad,
          id: ad._id,
          status: ad.approved ? 'Approved' : 'Pending Review',
          dateCreated: new Date(ad.createdOn).toLocaleDateString(),
          views: 0, // Default values for now
          inquiries: 0,
          // Transform image paths if needed
          images: ad.images ? ad.images.map((imagePath: any) => {
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
        const sortedAds = transformedData.sort((a: any, b: any) => 
          new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
        );
        
        setLatestAds(sortedAds.slice(0, 3));
        console.log('Overview - Latest 3 seller advertisements:', sortedAds.slice(0, 3));
      } else {
        console.warn('Failed to fetch advertisements:', response);
        setLatestAds([]);
      }
    } catch (error) {
      console.error('Error fetching latest advertisements:', error);
      toast.error('Failed to load advertisements');
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-100 p-6 rounded-xl shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10" 
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%237c3aed\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          }}
        ></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10">
          <div className="mb-4 md:mb-0">
            <div className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-2">
              Seller Dashboard
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back, {user?.firstName || 'Seller'}
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-md">
              Manage your gemstone listings, bids, and schedule meetings
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Active Listings"
            value={mockStats.activeListings}
            icon={<ShopOutlined />}
            color="#7c3aed"
            gradient="linear-gradient(135deg, #7c3aed11 0%, #7c3aed22 100%)"
            subtitle={mockStats.activeListings > 0 ? `${mockStats.activeListings} gems for sale` : 'Add your first listing'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Total Bids"
            value={mockStats.totalBids}
            icon={<TrophyOutlined />}
            color="#06b6d4"
            gradient="linear-gradient(135deg, #06b6d411 0%, #06b6d422 100%)"
            subtitle={mockStats.totalBids > 0 ? `${mockStats.totalBids} active bids` : 'No bids yet'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Revenue"
            value={formatLKR(mockStats.totalRevenue)}
            icon={<DollarOutlined />}
            color="#10b981"
            gradient="linear-gradient(135deg, #10b98111 0%, #10b98122 100%)"
            subtitle={mockStats.totalRevenue > 0 ? 'Total earnings' : 'No earnings yet'}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Upcoming Meetings"
            value={mockStats.upcomingMeetings}
            icon={<CalendarOutlined />}
            color="#f59725"
            gradient="linear-gradient(135deg, #f5972511 0%, #f5972522 100%)"
            subtitle={mockStats.upcomingMeetings > 0 ? 'View your schedule' : 'No meetings yet'}
          />
        </Col>
      </Row>

      {/* Latest Advertisements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Latest Advertisements</h2>
          <button 
            onClick={() => onTabChange('advertisements')}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
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
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {ad.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      LKR {parseFloat(ad.price).toLocaleString()}
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
                        className="text-purple-600 hover:text-purple-900"
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
                        className="mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
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