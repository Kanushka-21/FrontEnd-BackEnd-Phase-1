import React, { useState, useEffect } from 'react';
import { Eye, Clock, CheckCircle, XCircle, Calendar, DollarSign } from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

interface Bid {
  id: string;
  gemListingId: string;
  amount: number;
  status: 'ACTIVE' | 'WON' | 'LOST' | 'OUTBID';
  bidTime: string;
  gemListing?: {
    id: string;
    title: string;
    species: string;
    carat: number;
    currentPrice: number;
    imageUrl?: string;
    auctionEndTime?: string;
  };
}

const Bids: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const bidsPerPage = 6;

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
      const response = await api.bidding.getUserBids(user.userId);
      
      if (response && response.success && Array.isArray(response.data)) {
        setBids(response.data);
        setTotalPages(Math.ceil(response.data.length / bidsPerPage));
      } else {
        setBids([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching user bids:', err);
      setError('Failed to load your bids. Please try again later.');
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'WON':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'LOST':
      case 'OUTBID':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getPaginatedBids = () => {
    const startIndex = (currentPage - 1) * bidsPerPage;
    const endIndex = startIndex + bidsPerPage;
    return bids.slice(startIndex, endIndex);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
      <h3 className="text-lg font-semibold text-gray-800 mb-6">My Bids</h3>
      
      {bids.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No bids placed yet</p>
          <p className="text-sm text-gray-500">
            Start bidding on gemstones to see your bids here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getPaginatedBids().map((bid) => (
              <div
                key={bid.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Gemstone Image */}
                <div className="aspect-square mb-3 overflow-hidden rounded-md bg-gray-100">
                  {bid.gemListing?.imageUrl ? (
                    <img
                      src={bid.gemListing.imageUrl}
                      alt={bid.gemListing.title || 'Gemstone'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Eye className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Gemstone Info */}
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                    {bid.gemListing?.title || 'Unknown Gemstone'}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {bid.gemListing?.species} • {bid.gemListing?.carat} ct
                  </p>
                </div>

                {/* Bid Info */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Your Bid:</span>
                    <span className="font-semibold text-sm">
                      {formatCurrency(bid.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Current Price:</span>
                    <span className="text-sm">
                      {formatCurrency(bid.gemListing?.currentPrice || 0)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(bid.status)}`}>
                    {getStatusIcon(bid.status)}
                    <span className="capitalize">{bid.status.toLowerCase()}</span>
                  </div>
                </div>

                {/* Bid Time */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(bid.bidTime)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
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
