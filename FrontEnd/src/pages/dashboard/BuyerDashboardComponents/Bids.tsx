import React, { useState, useEffect } from 'react';
import { Filter, CheckCircle, XCircle, Calendar, DollarSign, Trophy, TrendingUp, Activity, Clock } from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface BidInfo {
  bidId: string;
  listingId: string;
  bidAmount: number;
  currency: string;
  bidTime: string;
  status: string;
  message?: string;
  gemName: string;
  gemSpecies: string;
  listingPrice: number;
  sellerName: string;
  images: string[];
  currentHighestBid: number;
  isCurrentlyWinning: boolean;
}

interface BidsResponse {
  bids: BidInfo[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  activeBids: number;
  winningBids: number;
}

const Bids: React.FC = () => {
  const [bidsData, setBidsData] = useState<BidsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const pageSize = 6;

  useEffect(() => {
    fetchUserBids();
  }, [currentPage]);

  const fetchUserBids = async () => {
    if (!user?.userId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching bids for user:', user.userId, 'page:', currentPage);
      
      const response = await api.getUserBids(user.userId, currentPage, pageSize);
      
      if (response && response.success && response.data) {
        setBidsData(response.data);
        console.log('✅ Bids loaded:', response.data);
      } else {
        setError('Failed to load bids: ' + (response?.message || 'Unknown error'));
        setBidsData(null);
      }
    } catch (err) {
      console.error('❌ Error fetching user bids:', err);
      setError('Failed to load your bids. Please try again later.');
      setBidsData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status: string, isWinning: boolean = false) => {
    if (isWinning) {
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    }
    
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'WON':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'LOST':
      case 'OUTBID':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string, isWinning: boolean = false) => {
    if (isWinning) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'WON':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LOST':
      case 'OUTBID':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filteredBids = () => {
    if (!bidsData || !bidsData.bids) return [];
    
    if (!activeFilter) return bidsData.bids;
    
    return bidsData.bids.filter(bid => {
      switch (activeFilter) {
        case 'ACTIVE':
          return bid.status.toUpperCase() === 'ACTIVE';
        case 'WINNING':
          return bid.isCurrentlyWinning;
        case 'OUTBID':
          return bid.status.toUpperCase() === 'OUTBID';
        case 'WON':
          return bid.status.toUpperCase() === 'WON';
        case 'LOST':
          return bid.status.toUpperCase() === 'LOST';
        default:
          return true;
      }
    });
  };

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(activeFilter === filter ? null : filter);
  };

  const navigateToItemDetails = (listingId: string) => {
    // Navigate to the marketplace page with the specific item ID
    // Using the 'viewGemstone' parameter which the MarketplacePage checks for
    navigate(`/marketplace?viewGemstone=${listingId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">My Bids</h3>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading your bids...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">My Bids</h3>
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUserBids}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">My Bids</h3>
        <button
          onClick={fetchUserBids}
          className="px-3 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {bidsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Bids</p>
                <p className="text-2xl font-bold text-blue-800">{bidsData.totalElements}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Trophy className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-green-600 font-medium">Currently Winning</p>
                <p className="text-2xl font-bold text-green-800">{bidsData.winningBids}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-yellow-600 font-medium">Active Bids</p>
                <p className="text-2xl font-bold text-yellow-800">{bidsData.activeBids}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Options */}
      {bidsData && bidsData.bids.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <button
            onClick={() => handleFilterChange('ACTIVE')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeFilter === 'ACTIVE'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            Active Bids
          </button>
          <button
            onClick={() => handleFilterChange('WINNING')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeFilter === 'WINNING'
                ? 'bg-yellow-600 text-white'
                : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
            }`}
          >
            Winning Bids
          </button>
          <button
            onClick={() => handleFilterChange('OUTBID')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeFilter === 'OUTBID'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            Outbid
          </button>
          <button
            onClick={() => handleFilterChange('WON')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeFilter === 'WON'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            Won Bids
          </button>
          <button
            onClick={() => handleFilterChange('LOST')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              activeFilter === 'LOST'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Lost Bids
          </button>
          {activeFilter && (
            <button
              onClick={() => handleFilterChange(null)}
              className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}
      
      {!bidsData || filteredBids().length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            {bidsData && bidsData.bids.length > 0 
              ? 'No bids match the selected filter'
              : 'No bids placed yet'}
          </p>
          <p className="text-sm text-gray-500">
            {bidsData && bidsData.bids.length > 0 
              ? 'Try changing or clearing the filter'
              : 'Start bidding on gemstones to see your bids here.'}
          </p>
          {activeFilter && (
            <button
              onClick={() => handleFilterChange(null)}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBids().map((bidInfo) => (
              <div
                key={bidInfo.bidId}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigateToItemDetails(bidInfo.listingId)}
              >
                {/* Gemstone Info */}
                <div className="mb-3 border-b pb-2">
                  <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                    {bidInfo.gemName || 'Unknown Gemstone'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {bidInfo.gemSpecies} • Seller: {bidInfo.sellerName}
                  </p>
                </div>

                {/* Bid Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Your Bid:</span>
                    <span className="font-semibold text-sm text-blue-600">
                      {bidInfo.currency} {formatCurrency(bidInfo.bidAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Current Highest:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {bidInfo.currency} {formatCurrency(bidInfo.currentHighestBid)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Starting Price:</span>
                    <span className="text-sm text-gray-600">
                      {bidInfo.currency} {formatCurrency(bidInfo.listingPrice)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(bidInfo.status, bidInfo.isCurrentlyWinning)}`}>
                    {getStatusIcon(bidInfo.status, bidInfo.isCurrentlyWinning)}
                    <span className="capitalize">
                      {bidInfo.isCurrentlyWinning ? 'Winning' : bidInfo.status?.toLowerCase()}
                    </span>
                  </div>
                  {bidInfo.isCurrentlyWinning && (
                    <div className="flex items-center text-xs text-yellow-600">
                      <Trophy className="w-3 h-3 mr-1" />
                      <span>Leading!</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-t pt-2 mt-2">
                  {/* Bid Time */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(bidInfo.bidTime)}</span>
                  </div>
                  
                  {/* View Details Hint */}
                  <div className="text-xs text-blue-600 font-medium">
                    Click to view details
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {bidsData.totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: bidsData.totalPages }, (_, i) => i).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === bidsData.totalPages - 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Bids;
