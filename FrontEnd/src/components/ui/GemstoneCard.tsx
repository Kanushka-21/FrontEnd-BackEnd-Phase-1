import React from 'react';
import { motion } from 'framer-motion';
import { Gem, Shield, User, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import CountdownTimer from '@/components/CountdownTimer';
import AIPricePrediction from '@/components/common/AIPricePrediction';
import { GemstoneCardProps } from '@/types';

// Helper function to format price in LKR
const formatLKR = (price: number) => {
  return new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const GemstoneCard: React.FC<GemstoneCardProps> = ({ gemstone, onViewDetails, onCountdownComplete }) => {
  const [imageError, setImageError] = React.useState(false);
  const [showVideo, setShowVideo] = React.useState(false);
  
  // Check for available media
  const hasImages = gemstone.images && gemstone.images.length > 0;
  const hasVideos = gemstone.videos && gemstone.videos.length > 0;
  const hasMedia = gemstone.media && Array.isArray(gemstone.media) && gemstone.media.length > 0;
  
  // Get current display items
  const currentImage = hasImages ? gemstone.images![0] : null;
  const currentVideo = React.useMemo(() => {
    if (hasVideos && gemstone.videos) return gemstone.videos[0];
    if (hasMedia && gemstone.media) {
      const videoMedia = gemstone.media.find(m => m.type === 'VIDEO');
      return videoMedia?.url;
    }
    return null;
  }, [hasVideos, hasMedia, gemstone.videos, gemstone.media]);
  
  // Check if we have multiple media types to toggle
  const hasMultipleMediaTypes = (hasImages || (hasMedia && gemstone.media?.some(m => m.type === 'IMAGE'))) && 
                               (hasVideos || (hasMedia && gemstone.media?.some(m => m.type === 'VIDEO')));
  
  // Determine what to display
  const canShowVideo = currentVideo && showVideo;
  
  const toggleMediaType = () => {
    if (hasMultipleMediaTypes) {
      setShowVideo(!showVideo);
    }
  };
  
  // Log the gemstone data when the component renders to verify bid price
  React.useEffect(() => {
    console.log(`🔍 GemstoneCard rendered for ${gemstone.name}:`, gemstone);
    console.log(`💰 Gemstone ${gemstone.name} latestBidPrice:`, gemstone.latestBidPrice);
    console.log(`🏷️ Gemstone ${gemstone.name} listingStatus:`, gemstone.listingStatus);
    console.log(`⏰ Gemstone ${gemstone.name} countdown data:`, {
      biddingActive: gemstone.biddingActive,
      remainingTimeSeconds: gemstone.remainingTimeSeconds,
      isExpired: gemstone.isExpired,
      listingStatus: gemstone.listingStatus
    });
  }, [gemstone]);

  const handleViewClick = () => {
    console.log('View details clicked for gemstone:', gemstone.id);
    if (onViewDetails) {
      onViewDetails(gemstone.id);
    }
  };

  const handleImageError = () => {
    console.error('❌ Failed to load image:', currentImage);
    console.error('🔍 Gemstone data:', gemstone);
    console.error('🔍 Gemstone ID:', gemstone.id);
    console.error('🔍 All images available:', gemstone.images);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', currentImage);
    console.log('🔍 Gemstone:', gemstone.name);
    setImageError(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.15), 0 4px 10px -5px rgba(59, 130, 246, 0.1)',
        borderColor: '#93c5fd'
      }}
      className="bg-white rounded-lg overflow-hidden border border-secondary-200 transition-all duration-300"
    >      <div className="relative overflow-hidden h-40 sm:h-48 bg-gray-100">
        {/* Media Toggle Button */}
        {hasMultipleMediaTypes && (
          <button
            onClick={toggleMediaType}
            className="absolute top-2 left-2 z-10 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium hover:bg-black/70 transition-colors"
          >
            {showVideo ? 'Show Image' : 'Show Video'}
          </button>
        )}

        {/* Video Display */}
        {canShowVideo ? (
          <div className="relative w-full h-full">
            <video
              src={currentVideo}
              className="w-full h-full object-cover"
              controls
              poster={hasMedia ? gemstone.media?.find(m => m.url === currentVideo)?.thumbnailUrl : undefined}
              onError={() => {
                console.error('❌ Failed to load video:', currentVideo);
                setShowVideo(false); // Fall back to image if video fails
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Play className="w-12 h-12 text-white opacity-70" />
            </div>
          </div>
        ) : imageError || !currentImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Gem className="w-8 h-8 mb-2" />
            <span className="text-xs text-center">{gemstone.name || 'Media Not Available'}</span>
          </div>
        ) : (
          <motion.img
            src={currentImage}
            alt={gemstone.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}

        {/* Status badges */}
        <div className="absolute top-2 right-2 flex flex-col space-y-1">
          {gemstone.certified && (
            <div className="bg-primary-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Certified</span>
              <span className="sm:hidden">✓</span>
            </div>
          )}
          {gemstone.listingStatus === 'sold' && (
            <div className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
              <span>SOLD</span>
            </div>
          )}
          {gemstone.listingStatus === 'expired_no_bids' && (
            <div className="bg-gray-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center">
              <span>EXPIRED</span>
            </div>
          )}
        </div>
      </div>
        <div className="p-3 sm:p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Gem className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-primary-800 text-sm sm:text-base line-clamp-1">{gemstone.name}</h3>
        </div>
        
        <div className="space-y-2">
          <div>
            <p className="text-sm text-secondary-600">
              Starting price:
            </p>
            <p className="text-lg sm:text-xl font-bold text-secondary-800">
              {formatLKR(gemstone.price)}
            </p>
          </div>
          
          {/* Show highest bid section */}
          <div className="mt-1">
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary-600">
                Highest bid:
              </p>
              {gemstone.totalBids && gemstone.totalBids > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {gemstone.totalBids} {gemstone.totalBids === 1 ? 'bid' : 'bids'}
                </span>
              )}
            </div>
            
            {gemstone.latestBidPrice ? (
              <p className="font-bold text-blue-600">
                {formatLKR(gemstone.latestBidPrice)}
              </p>
            ) : (
              <p className="font-medium text-gray-500 italic">
                No bids yet
              </p>
            )}
          </div>
          
          {/* Countdown Timer */}
          <div className={`mt-3 p-2 rounded-lg border ${
            gemstone.listingStatus === 'sold' 
              ? 'bg-gray-50 border-gray-200' 
              : gemstone.listingStatus === 'expired_no_bids'
              ? 'bg-gray-50 border-gray-300'
              : 'bg-red-50 border-red-200'
          }`}>
            <CountdownTimer
              listingId={gemstone.id}
              initialRemainingSeconds={gemstone.remainingTimeSeconds}
              biddingActive={gemstone.biddingActive}
              isExpired={gemstone.isExpired}
              listingStatus={gemstone.listingStatus}
              className="justify-center"
              showIcon={true}
              onCountdownComplete={onCountdownComplete} // Pass callback to refresh marketplace data
            />
          </div>
          
          {/* AI-Powered Dynamic Price Prediction */}
          <div className="mt-2">
            <AIPricePrediction 
              gemData={{
                weight: gemstone.weight || '1.0',
                color: gemstone.color || 'Blue',
                cut: gemstone.cut || 'Good',
                clarity: gemstone.clarity || 'SI1',
                species: gemstone.species || gemstone.name?.split(' ')[0] || 'Sapphire',
                isCertified: gemstone.certified || false,
                shape: gemstone.shape || 'Round',
                treatment: gemstone.treatment || 'Heat Treatment'
              }}
              showDetails={false}
              className="transform transition-all duration-300 hover:scale-102 text-sm p-2"
            />
          </div>
          
          <p className="text-sm text-secondary-600 mt-2 line-clamp-2">
            {gemstone.weight} carats · {gemstone.color} · {gemstone.shape}
          </p>
          
          {gemstone.seller && gemstone.seller.name && (
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Seller:</span>
                <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]" title={gemstone.seller.name}>
                  {gemstone.seller.name}
                </span>
              </div>
              {gemstone.seller.rating && gemstone.seller.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-yellow-500">★</span>
                  <span className="text-xs text-gray-600">{gemstone.seller.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-3 sm:mt-4">
          <Button 
            variant={
              gemstone.listingStatus === 'sold' || gemstone.listingStatus === 'expired_no_bids' 
                ? 'secondary' 
                : 'primary'
            }
            size="sm"
            onClick={handleViewClick}
            type="button"
            className="w-full text-sm sm:text-base"
            disabled={gemstone.listingStatus === 'sold' || gemstone.listingStatus === 'expired_no_bids'}
          >
            {gemstone.listingStatus === 'sold' 
              ? 'Sold Item' 
              : gemstone.listingStatus === 'expired_no_bids'
              ? 'Expired Item'
              : 'View Details'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GemstoneCard;
