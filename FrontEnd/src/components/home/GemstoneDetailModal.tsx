import React, { useState, useEffect } from 'react';
import { X, Shield, TrendingUp, Clock, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import { DetailedGemstone, BidInfo } from '@/types';
import CountdownTimer from '../CountdownTimer';

// Helper function to format price in LKR
const formatLKR = (price: number) => {
  return new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

interface GemstoneModalProps {
  isOpen: boolean;
  gemstone: DetailedGemstone | null;
  onClose: () => void;
  onPlaceBid: (amount: number) => void;
}

const GemstoneDetailModal: React.FC<GemstoneModalProps> = ({
  isOpen,
  gemstone,
  onClose,
  onPlaceBid
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidError, setBidError] = useState<string>('');
  const [bids, setBids] = useState<BidInfo[]>([]);
  const [bidStats, setBidStats] = useState({
    totalBids: 0,
    highestBid: 0,
    highestBidder: ''
  });
  const [countdownData, setCountdownData] = useState({
    remainingTimeSeconds: 0,
    biddingActive: false,
    isExpired: false
  });
  const [loadingBids, setLoadingBids] = useState(false);

  // Get current highest bid from props or fetched data
  const currentHighestBid = gemstone?.currentBid || bidStats.highestBid || (gemstone ? gemstone.price : 0);
  const minimumBid = currentHighestBid * 1.02; // 2% higher than current price
  
  // Use actual uploaded images from the gemstone data
  const images = gemstone?.images && gemstone.images.length > 0 
    ? gemstone.images 
    : gemstone?.image 
      ? [gemstone.image] 
      : ['https://via.placeholder.com/400x300?text=No+Image+Available'];

  // Load bid data when modal opens
  useEffect(() => {
    if (isOpen && gemstone?.id) {
      loadBidData();
    }
  }, [isOpen, gemstone?.id]);

  const loadBidData = async () => {
    if (!gemstone?.id) return;
    
    setLoadingBids(true);
    try {
      // Load bid statistics
      const statsResponse = await fetch(`/api/bidding/listing/${gemstone.id}/stats`);
      const statsResult = await statsResponse.json();
      
      if (statsResult.success) {
        setBidStats({
          totalBids: statsResult.data.totalBids || 0,
          highestBid: statsResult.data.highestBid || 0,
          highestBidder: statsResult.data.highestBidder || ''
        });
      }

      // Load countdown data
      const countdownResponse = await fetch(`/api/bidding/listing/${gemstone.id}/countdown`);
      const countdownResult = await countdownResponse.json();
      
      if (countdownResult.success) {
        setCountdownData({
          remainingTimeSeconds: countdownResult.data.remainingTimeSeconds || 0,
          biddingActive: countdownResult.data.biddingActive || false,
          isExpired: countdownResult.data.isExpired || false
        });
      }

      // Load recent bids
      const bidsResponse = await fetch(`/api/bidding/listing/${gemstone.id}/bids?page=0&size=5`);
      const bidsResult = await bidsResponse.json();
      
      if (bidsResult.success) {
        setBids(bidsResult.data.bids || []);
      }
    } catch (error) {
      console.error('Error loading bid data:', error);
    } finally {
      setLoadingBids(false);
    }
  };

  const validateBid = (amount: number): boolean => {
    if (amount <= currentHighestBid) {
      setBidError(`Bid must be higher than current highest bid ${formatLKR(currentHighestBid)}`);
      return false;
    }
    if (amount < minimumBid) {
      setBidError(`Minimum bid is ${formatLKR(minimumBid)} (2% higher than current highest bid)`);
      return false;
    }
    setBidError('');
    return true;
  };
    
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (validateBid(amount)) {
      onPlaceBid(amount);
      setBidAmount(''); // Clear the form
      loadBidData(); // Reload bid data
    }
  };

  if (!gemstone || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[95%] md:w-[85%] lg:w-[75%] h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-semibold text-primary-800">{gemstone.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Images */}
              <div className="space-y-4">
                <div className="max-w-md mx-auto h-[300px] rounded-2xl overflow-hidden border bg-gray-50">
                  <img
                    src={images[currentImageIndex]}
                    alt={gemstone.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.error('Failed to load image:', images[currentImageIndex]);
                      e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                </div>
                
                {/* Only show thumbnails if there are multiple images */}
                {images.length > 1 && (
                  <div className={`grid gap-3 max-w-md mx-auto ${
                    images.length <= 3 ? 'grid-cols-3' : 
                    images.length <= 4 ? 'grid-cols-4' : 
                    'grid-cols-5'
                  }`}>
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          index === currentImageIndex 
                            ? 'border-primary-500 ring-2 ring-primary-200' 
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`${gemstone.name} view ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Failed to load thumbnail:', img);
                            e.currentTarget.src = 'https://via.placeholder.com/100x100?text=Error';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Image counter */}
                <div className="text-center text-sm text-gray-500">
                  {images.length > 1 ? `${currentImageIndex + 1} of ${images.length} images` : '1 image'}
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Price Section */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-primary-800">
                    {formatLKR(gemstone.price)}
                  </div>
                  {gemstone.predictedPriceRange && (
                    <div className="mt-2 flex items-center text-sm text-secondary-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Estimated Range: </span>
                      <span className="font-medium ml-1">
                        {formatLKR(gemstone.predictedPriceRange.min)} - {formatLKR(gemstone.predictedPriceRange.max)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Specifications</h3>
                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
                    <div className="space-y-3">
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Weight:</span>
                        <span className="font-medium">{gemstone.weight} carats</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Color:</span>
                        <span className="font-medium">{gemstone.color}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Species:</span>
                        <span className="font-medium">{gemstone.species}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Variety:</span>
                        <span className="font-medium">{gemstone.variety}</span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Shape:</span>
                        <span className="font-medium">{gemstone.shape}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Cut:</span>
                        <span className="font-medium">{gemstone.cut}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Transparency:</span>
                        <span className="font-medium">{gemstone.transparency}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                {gemstone.dimensions && (
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">Dimensions</h3>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                      <div className="text-center">
                        <div className="text-base text-secondary-600">Length</div>
                        <div className="font-medium text-lg">{gemstone.dimensions.length}mm</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base text-secondary-600">Width</div>
                        <div className="font-medium text-lg">{gemstone.dimensions.width}mm</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base text-secondary-600">Height</div>
                        <div className="font-medium text-lg">{gemstone.dimensions.height}mm</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Certificate Information */}
                {gemstone.certificate && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-primary-600" />
                      <h3 className="text-xl font-semibold">Certification</h3>
                    </div>
                    <div className="bg-primary-50 p-4 rounded-xl space-y-3">
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Authority:</span>
                        <span className="font-medium">{gemstone.certificate.issuingAuthority}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Report Number:</span>
                        <span className="font-medium">{gemstone.certificate.reportNumber}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Date:</span>
                        <span className="font-medium">{new Date(gemstone.certificate.date).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Current Bidding Status */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <h3 className="text-xl font-semibold">Bidding Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {bidStats.totalBids || gemstone.totalBids || 0}
                      </div>
                      <div className="text-sm text-blue-700">Total Bids</div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatLKR(currentHighestBid)}
                      </div>
                      <div className="text-sm text-green-700">Current Highest</div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {bidStats.highestBidder || gemstone.highestBidder || 'No bids yet'}
                      </div>
                      <div className="text-sm text-purple-700">Highest Bidder</div>
                    </div>
                  </div>
                  
                  {/* Countdown Timer */}
                  <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Clock className="w-5 h-5 text-red-600" />
                      <h4 className="text-lg font-semibold text-red-800">Bidding Ends In</h4>
                    </div>
                    <CountdownTimer 
                      listingId={gemstone.id}
                      initialRemainingSeconds={countdownData.remainingTimeSeconds}
                      biddingActive={countdownData.biddingActive}
                      isExpired={countdownData.isExpired}
                      className="text-center"
                      showIcon={true}
                    />
                  </div>
                </div>

                {/* Recent Bids */}
                {bids.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <h3 className="text-xl font-semibold">Recent Bids</h3>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto">
                      {loadingBids ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Loading bids...</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bids.map((bid, index) => (
                            <div 
                              key={bid.id} 
                              className={`flex justify-between items-center p-3 rounded-lg ${
                                index === 0 ? 'bg-green-100' : 'bg-white'
                              }`}
                            >
                              <div>
                                <div className="font-medium">{bid.bidderName}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(bid.bidTime).toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg">
                                  {formatLKR(bid.bidAmount)}
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full ${
                                  bid.status === 'ACTIVE' ? 'bg-green-200 text-green-800' :
                                  bid.status === 'OUTBID' ? 'bg-red-200 text-red-800' :
                                  'bg-gray-200 text-gray-800'
                                }`}>
                                  {bid.status}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bid Section */}
                <form onSubmit={handleSubmit} className="space-y-4 bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-xl border border-primary-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="w-5 h-5 text-primary-600" />
                    <h3 className="text-xl font-semibold text-primary-800">Place Your Bid</h3>
                  </div>
                  
                  <div>
                    <label htmlFor="bidAmount" className="block text-base font-medium text-secondary-700 mb-2">
                      Your Bid Amount
                    </label>
                    <div className="text-sm text-gray-600 mb-3">
                      Minimum bid: <span className="font-semibold text-primary-600">{formatLKR(minimumBid)}</span>
                      {currentHighestBid > gemstone.price && (
                        <span className="ml-2">
                          (2% above current highest: <span className="font-semibold">{formatLKR(currentHighestBid)}</span>)
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <input
                        type="number"
                        id="bidAmount"
                        value={bidAmount}
                        onChange={(e) => {
                          setBidAmount(e.target.value);
                          if (e.target.value) validateBid(parseFloat(e.target.value));
                        }}
                        className="block w-full px-4 py-3 text-lg border border-secondary-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        min={minimumBid}
                        step="any"
                        required
                      />
                    </div>
                    {bidError && (
                      <p className="mt-2 text-sm text-red-600">{bidError}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 text-lg rounded-xl"
                    disabled={!!bidError || !bidAmount}
                  >
                    Place Bid
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemstoneDetailModal;
