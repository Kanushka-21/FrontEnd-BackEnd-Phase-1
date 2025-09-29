import React, { useState, useEffect } from 'react';
import { X, Shield, TrendingUp, Clock, Users, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import { DetailedGemstone, BidInfo } from '@/types';
import CountdownTimer from '../CountdownTimer';
import AIPricePrediction from '@/components/common/AIPricePrediction';

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
  currentUser?: any; // Add current user to check seller status
  onClose: () => void;
  onPlaceBid: (amount: number) => void;
  onCountdownUpdated?: () => void; // New callback for countdown updates
}

const GemstoneDetailModal: React.FC<GemstoneModalProps> = ({
  isOpen,
  gemstone,
  currentUser,
  onClose,
  onPlaceBid,
  onCountdownUpdated
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
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
    isExpired: false,
    biddingEndTime: undefined as string | undefined
  });
  const [loadingBids, setLoadingBids] = useState(false);

  // Get current highest bid from props or fetched data
  const currentHighestBid = gemstone?.currentBid || bidStats.highestBid || (gemstone ? gemstone.price : 0);
  const minimumBid = currentHighestBid * 1.02; // 2% higher than current price
  
  // Check if current user is the seller of this gemstone
  const isCurrentUserSeller = currentUser && gemstone?.seller?.userId && 
    currentUser.userId === gemstone.seller.userId;
  
  // Check if bidding is closed (countdown expired or item sold)
  // Only consider bidding closed if:
  // 1. Item is sold, OR
  // 2. Item has expired status, OR  
  // 3. Countdown has expired AND there have been bids (bidding was active)
  const isBiddingClosed = 
    gemstone?.listingStatus === 'sold' || 
    gemstone?.listingStatus === 'expired_no_bids' ||
    String(gemstone?.listingStatus).toLowerCase() === 'sold' ||
    (countdownData.isExpired && (bidStats.totalBids > 0 || (gemstone?.totalBids || 0) > 0)) ||
    (countdownData.remainingTimeSeconds <= 0 && countdownData.biddingActive && (bidStats.totalBids > 0 || (gemstone?.totalBids || 0) > 0));
  
  // Check if waiting for first bid (no bids yet and not expired)
  const isWaitingForFirstBid = !isBiddingClosed && 
    (bidStats.totalBids === 0 && (gemstone?.totalBids === 0 || !gemstone?.totalBids)) &&
    !countdownData.biddingActive;
  
  console.log('🔐 Seller check:', {
    currentUserId: currentUser?.userId,
    sellerUserId: gemstone?.seller?.userId,
    sellerName: gemstone?.seller?.name,
    isCurrentUserSeller
  });
  
  console.log('🕐 Bidding status check:', {
    isExpired: countdownData.isExpired,
    listingStatus: gemstone?.listingStatus,
    remainingSeconds: countdownData.remainingTimeSeconds,
    biddingActive: countdownData.biddingActive,
    totalBids: bidStats.totalBids,
    gemstoneTotalBids: gemstone?.totalBids,
    isBiddingClosed,
    isWaitingForFirstBid
  });
  
  // Use actual uploaded images from the gemstone data, including certificate images
  const rawGemstoneImages = gemstone?.images && gemstone.images.length > 0 
    ? gemstone.images 
    : gemstone?.image 
      ? [gemstone.image] 
      : [];
  
  // DEBUG: Check if images array contains video data
  console.log('🔍 DETAILED IMAGE INSPECTION:');
  if (gemstone?.images) {
    gemstone.images.forEach((img, index) => {
      console.log(`🔍 Image ${index}:`, img);
      if (typeof img === 'object') {
        console.log(`🔍 Image ${index} type:`, typeof img);
        console.log(`🔍 Image ${index} keys:`, Object.keys(img));
        console.log(`🔍 Image ${index} has videoUrl:`, 'videoUrl' in img);
        console.log(`🔍 Image ${index} has mediaType:`, 'mediaType' in img);
      }
    });
  }
  
  // Extract actual image URLs (handle both string URLs and GemImage objects)
  const gemstoneImages = rawGemstoneImages.map((img: any) => {
    if (typeof img === 'string') return img;
    if (img && typeof img === 'object') {
      // For GemImage objects that are images (not videos)
      if (img.mediaType === 'IMAGE' || !img.mediaType) {
        return img.imageUrl || img.url || img;
      }
    }
    return null;
  }).filter(url => url && typeof url === 'string');
  
  console.log('🖼️ Processed gemstone images:', gemstoneImages);
  
  // Add videos from gemstone data
  const gemstoneVideos = gemstone?.videos || [];
  
  // CRITICAL FIX: Handle enhanced backend response with explicit video data
  console.log('🔧 CRITICAL FIX: Checking for enhanced video response from backend');
  
  // Check if the response has the new enhanced format
  let enhancedVideos: string[] = [];
  if (gemstone && typeof gemstone === 'object' && 'videos' in gemstone && Array.isArray(gemstone.videos)) {
    enhancedVideos = gemstone.videos;
    console.log('🎬 Found enhanced videos from backend:', enhancedVideos);
  }
  
  // Check if gemstone data has hasVideos flag
  if (gemstone && typeof gemstone === 'object' && 'hasVideos' in gemstone && gemstone.hasVideos) {
    console.log('🎬 Backend confirms videos are available: hasVideos = true');
  }
  
  // IMPORTANT: Extract videos from GemImage objects in images array
  const videosFromImages = rawGemstoneImages?.filter((img: any) => 
    img && typeof img === 'object' && (
      img.mediaType === 'VIDEO' || 
      img.videoUrl || 
      (img.isVideo && img.isVideo()) ||
      (typeof img.isVideo === 'function' && img.isVideo())
    )
  ).map((img: any) => img.videoUrl || img.url) || [];
  
  console.log('🎬 Videos from images array:', videosFromImages);
  
  // Handle media array if available
  const mediaItems = gemstone?.media || [];
  const mediaImages = mediaItems.filter(m => m.type === 'IMAGE').map(m => m.url);
  const mediaVideos = mediaItems.filter(m => m.type === 'VIDEO').map(m => m.url);
  
  // Combine all images and videos with deduplication
  const allImages = [...gemstoneImages, ...mediaImages];
  
  // 🔧 DEDUPLICATION FIX: Remove duplicate videos by creating a Set
  const combinedVideos = [...gemstoneVideos, ...videosFromImages, ...mediaVideos, ...enhancedVideos];
  const allVideos = [...new Set(combinedVideos.filter(video => video && video.trim() !== ''))];
  
  console.log('🔧 CRITICAL FIX: Enhanced video combination with deduplication:');
  console.log('  - Original gemstone videos:', gemstoneVideos.length);
  console.log('  - Videos from images:', videosFromImages.length);
  console.log('  - Media videos:', mediaVideos.length);
  console.log('  - Enhanced backend videos:', enhancedVideos.length);
  console.log('  - Combined videos (before dedup):', combinedVideos.length);
  console.log('  - Final videos (after dedup):', allVideos.length);
  console.log('  - Deduplicated videos:', allVideos);
  
  // Add certificate images if available
  const certificateImages = gemstone?.certificateImages || [];
  
  // Create unified media array with type information
  const mediaArray = [
    ...allImages.map(url => ({ url, type: 'image' as const, category: 'gemstone' as const })),
    ...allVideos.map(url => ({ url, type: 'video' as const, category: 'gemstone' as const })),
    ...certificateImages.map(url => ({ url, type: 'image' as const, category: 'certificate' as const }))
  ];
  
  // Fallback to placeholder if no media
  const finalMediaArray = mediaArray.length > 0 
    ? mediaArray 
    : [{ url: 'https://via.placeholder.com/400x300?text=No+Media+Available', type: 'image' as const, category: 'gemstone' as const }];
  
  // Legacy images array for backward compatibility
  const images = [...allImages, ...certificateImages];
  if (images.length === 0) {
    images.push('https://via.placeholder.com/400x300?text=No+Image+Available');
  }

  // Media availability flags
  const hasVideos = allVideos.length > 0;
  const hasMedia = mediaItems.length > 0;

  // Function to determine media type and category
  const getMediaInfo = (index: number) => {
    return finalMediaArray[index] || { url: '', type: 'image', category: 'gemstone' };
  };

  // Function to get media label
  const getMediaLabel = (index: number) => {
    const mediaInfo = getMediaInfo(index);
    const mediaType = mediaInfo.type === 'video' ? 'Video' : 'Image';
    const category = mediaInfo.category === 'certificate' ? 'Certificate' : 'Gemstone';
    
    if (mediaInfo.category === 'gemstone') {
      const sameTypeIndex = finalMediaArray
        .slice(0, index)
        .filter(m => m.type === mediaInfo.type && m.category === mediaInfo.category)
        .length + 1;
      return `${category} ${mediaType} ${sameTypeIndex}`;
    } else {
      const certIndex = finalMediaArray
        .slice(0, index)
        .filter(m => m.category === 'certificate')
        .length + 1;
      return `${category} ${mediaType} ${certIndex}`;
    }
  };

  console.log('🖼️ Modal Images Debug Info:');
  console.log('🖼️ Gemstone object:', gemstone);
  console.log('🖼️ Gemstone.images:', gemstone?.images);
  console.log('🖼️ Gemstone.image:', gemstone?.image);
  console.log('🖼️ Certificate images:', certificateImages);
  console.log('🖼️ Final combined images array:', images);
  console.log('🖼️ Total images count:', images.length);

  console.log('🎬 Modal Video Debug Info:');
  console.log('🎬 Gemstone.videos:', gemstone?.videos);
  console.log('🎬 Gemstone.media:', gemstone?.media);
  console.log('🎬 All videos combined:', allVideos);
  console.log('🎬 Media videos:', mediaVideos);
  console.log('🎬 Has videos flag:', hasVideos);
  console.log('🎬 Has media flag:', hasMedia);
  console.log('🎬 Final media array:', finalMediaArray);
  console.log('🎬 Final media array length:', finalMediaArray.length);
  console.log('🎬 Current media index:', currentMediaIndex);
  if (finalMediaArray.length > 0) {
    console.log('🎬 Current media item:', getMediaInfo(currentMediaIndex));
  }

  // EMERGENCY TEST: Force show a test video to verify the UI works
  console.log('🚨 EMERGENCY TEST: Adding a test video to see if UI works');
  if (finalMediaArray.length === 1 && finalMediaArray[0].url.includes('placeholder')) {
    finalMediaArray.push({
      url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      type: 'video' as const,
      category: 'gemstone' as const
    });
    console.log('🚨 Added test video. New media array:', finalMediaArray);
  }

  // Load bid data when modal opens
  useEffect(() => {
    if (isOpen && gemstone?.id) {
      console.log('🔄 Modal opened, loading bid data for gemstone:', gemstone.id);
      loadBidData();
    }
  }, [isOpen, gemstone?.id]);

  // Reset media index when gemstone changes
  useEffect(() => {
    if (gemstone) {
      setCurrentMediaIndex(0);
      console.log('🖼️ Gemstone changed, reset media index to 0');
    }
  }, [gemstone?.id]);

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
          isExpired: countdownResult.data.isExpired || false,
          biddingEndTime: countdownResult.data.biddingEndTime
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
              {/* Left Column - Media (Images & Videos) */}
              <div className="space-y-4">
                <div className="max-w-md mx-auto h-[300px] rounded-2xl overflow-hidden border bg-gray-50 relative">
                  {/* Media Type Badge */}
                  {finalMediaArray.length > 1 && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        getMediaInfo(currentMediaIndex).category === 'gemstone' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {getMediaLabel(currentMediaIndex)}
                      </span>
                    </div>
                  )}

                  {/* Video Display */}
                  {getMediaInfo(currentMediaIndex).type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={getMediaInfo(currentMediaIndex).url}
                        className="w-full h-full object-contain"
                        controls
                        poster={
                          gemstone?.media?.find(m => m.url === getMediaInfo(currentMediaIndex).url)?.thumbnailUrl
                        }
                        onError={(e) => {
                          console.error('🚫 Failed to load video:', getMediaInfo(currentMediaIndex).url);
                          console.error('🚫 Error event:', e);
                          
                          // Try fallback video URL
                          const currentSrc = e.currentTarget.src;
                          if (!currentSrc.includes('placeholder')) {
                            const originalPath = getMediaInfo(currentMediaIndex).url;
                            let fallbackUrl = originalPath;
                            
                            if (!originalPath.startsWith('http')) {
                              if (originalPath.startsWith('/uploads/')) {
                                fallbackUrl = `http://localhost:9092${originalPath}`;
                              } else if (originalPath.startsWith('uploads/')) {
                                fallbackUrl = `http://localhost:9092/${originalPath}`;
                              } else {
                                fallbackUrl = `http://localhost:9092/uploads/gem-videos/${originalPath}`;
                              }
                            }
                            
                            console.log('🔄 Trying fallback video URL:', fallbackUrl);
                            e.currentTarget.src = fallbackUrl;
                          }
                        }}
                        onLoadedData={() => {
                          console.log('✅ Successfully loaded video:', getMediaInfo(currentMediaIndex).url);
                        }}
                      />
                    </div>
                  ) : (
                    /* Image Display */
                    <img
                      src={getMediaInfo(currentMediaIndex).url}
                      alt={getMediaLabel(currentMediaIndex)}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error('🚫 Failed to load image:', getMediaInfo(currentMediaIndex).url);
                        console.error('🚫 Error event:', e);
                        
                        // Try to construct a different URL format as fallback
                        const currentSrc = e.currentTarget.src;
                        if (!currentSrc.includes('placeholder') && !currentSrc.includes('Not+Found')) {
                          const originalPath = getMediaInfo(currentMediaIndex).url;
                          let fallbackUrl = originalPath;
                          
                          if (!originalPath.startsWith('http')) {
                            if (originalPath.startsWith('/uploads/')) {
                              fallbackUrl = `http://localhost:9092${originalPath}`;
                            } else if (originalPath.startsWith('uploads/')) {
                              fallbackUrl = `http://localhost:9092/${originalPath}`;
                            } else {
                              fallbackUrl = `http://localhost:9092/uploads/${originalPath}`;
                            }
                          }
                          
                          console.log('🔄 Trying fallback URL:', fallbackUrl);
                          e.currentTarget.src = fallbackUrl;
                        } else {
                          console.log('🔄 Using final placeholder fallback');
                          e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                        }
                      }}
                      onLoad={() => {
                        console.log('✅ Successfully loaded image:', getMediaInfo(currentMediaIndex).url);
                      }}
                    />
                  )}
                </div>
                
                {/* Only show thumbnails if there are multiple media items */}
                {finalMediaArray.length > 1 && (
                  <div className={`grid gap-3 max-w-md mx-auto ${
                    finalMediaArray.length <= 3 ? 'grid-cols-3' : 
                    finalMediaArray.length <= 4 ? 'grid-cols-4' : 
                    'grid-cols-5'
                  }`}>
                    {finalMediaArray.map((mediaItem, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMediaIndex(index)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all relative ${
                          index === currentMediaIndex 
                            ? 'border-primary-500 ring-2 ring-primary-200' 
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        {/* Media type indicator */}
                        <div className="absolute top-1 right-1 z-10">
                          <span className="text-xs bg-white bg-opacity-75 px-1 rounded">
                            {mediaItem.type === 'video' ? '▶' : 
                             mediaItem.category === 'gemstone' ? 'G' : 'C'}
                          </span>
                        </div>
                        
                        {mediaItem.type === 'video' ? (
                          <div className="relative w-full h-full bg-gray-900 flex items-center justify-center">
                            {/* Video thumbnail or preview */}
                            <video 
                              src={mediaItem.url} 
                              className="w-full h-full object-cover"
                              muted
                              poster={
                                gemstone?.media?.find(m => m.url === mediaItem.url)?.thumbnailUrl
                              }
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white opacity-80" />
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={mediaItem.url} 
                            alt={getMediaLabel(index)} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('🚫 Failed to load thumbnail:', mediaItem.url);
                              
                              // Try alternative URL formats for thumbnails too
                              const currentSrc = e.currentTarget.src;
                              if (!currentSrc.includes('placeholder') && !currentSrc.includes('Error')) {
                                let fallbackUrl = mediaItem.url;
                                
                                if (!mediaItem.url.startsWith('http')) {
                                  if (mediaItem.url.startsWith('/uploads/')) {
                                    fallbackUrl = `http://localhost:9092${mediaItem.url}`;
                                  } else if (mediaItem.url.startsWith('uploads/')) {
                                    fallbackUrl = `http://localhost:9092/${mediaItem.url}`;
                                  } else {
                                    fallbackUrl = `http://localhost:9092/uploads/${mediaItem.url}`;
                                  }
                                }
                                
                                console.log('🔄 Trying thumbnail fallback URL:', fallbackUrl);
                                e.currentTarget.src = fallbackUrl;
                              } else {
                                e.currentTarget.src = 'https://via.placeholder.com/100x100?text=No+Image';
                              }
                            }}
                            onLoad={() => {
                              console.log('✅ Successfully loaded thumbnail:', mediaItem.url);
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Media counter with detailed info */}
                <div className="text-center text-sm text-gray-500 space-y-1">
                  <div>{getMediaLabel(currentMediaIndex)}</div>
                  {images.length > 1 && (
                    <div className="flex items-center justify-center space-x-2 text-xs">
                      <span>{gemstoneImages.length} gemstone</span>
                      {certificateImages.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{certificateImages.length} certificate</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{currentMediaIndex + 1} of {finalMediaArray.length} total</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Price Section */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="mb-2 text-sm text-secondary-600 font-medium">
                    Started price
                  </div>
                  <div className="text-3xl font-bold text-primary-800">
                    {formatLKR(gemstone.price)}
                  </div>
                </div>

                {/* AI Price Prediction with Item-Specific Accuracy - Only for Certified Gemstones */}
                {gemstone.certificate && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">AI Price Analysis</h3>
                    <AIPricePrediction 
                      gemData={{
                        weight: gemstone.weight || '1.0',
                        color: gemstone.color || 'Blue',
                        cut: gemstone.cut || 'Good',
                        clarity: gemstone.clarity || 'SI1',
                        species: gemstone.species || gemstone.variety || 'Sapphire',
                        isCertified: true, // Only shown for certified gemstones
                        shape: gemstone.shape || 'Round',
                        treatment: gemstone.specifications?.treatment || 'Heat Treatment'
                      }}
                      showDetails={true}
                      className="shadow-lg border-2 border-indigo-300"
                    />
                  </div>
                )}

                {/* Specifications */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
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
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Shape:</span>
                        <span className="font-medium">{gemstone.shape}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Cut:</span>
                        <span className="font-medium">{gemstone.cut}</span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Clarity:</span>
                        <span className="font-medium">{gemstone.clarity}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Transparency:</span>
                        <span className="font-medium">{gemstone.transparency}</span>
                      </p>
                      {gemstone.specifications?.treatment && (
                        <p className="flex justify-between text-base">
                          <span className="text-secondary-600">Treatment:</span>
                          <span className="font-medium">{gemstone.specifications.treatment}</span>
                        </p>
                      )}
                      {gemstone.specifications?.refractiveIndex && (
                        <p className="flex justify-between text-base">
                          <span className="text-secondary-600">Refractive Index:</span>
                          <span className="font-medium">{gemstone.specifications.refractiveIndex}</span>
                        </p>
                      )}
                      {gemstone.specifications?.specificGravity && (
                        <p className="flex justify-between text-base">
                          <span className="text-secondary-600">Specific Gravity:</span>
                          <span className="font-medium">{gemstone.specifications.specificGravity}</span>
                        </p>
                      )}
                      {/* Show origin if available */}
                      {gemstone.origin && gemstone.origin !== 'Unknown' && (
                        <p className="flex justify-between text-base">
                          <span className="text-secondary-600">Origin:</span>
                          <span className="font-medium">{gemstone.origin}</span>
                        </p>
                      )}
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
                      listingStatus={gemstone.listingStatus}
                      className="text-center"
                      showIcon={true}
                      showTester={true}  // Enable testing tools
                      biddingEndTime={countdownData.biddingEndTime}
                      onCountdownUpdate={onCountdownUpdated} // Pass the callback to notify marketplace
                      onCountdownComplete={() => {
                        // Refresh modal data when countdown completes
                        console.log('🏁 Countdown completed in modal - refreshing data');
                        loadModalData();
                      }}
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
                {isCurrentUserSeller ? (
                  /* Show message for sellers - they cannot bid on their own items */
                  <div className="space-y-4 bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Shield className="w-5 h-5 text-orange-600" />
                      <h3 className="text-xl font-semibold text-orange-800">Your Listing</h3>
                    </div>
                    
                    <div className="text-center space-y-3">
                      <div className="text-lg font-medium text-orange-700">
                        This is your gemstone listing
                      </div>
                      <p className="text-orange-600">
                        As the seller, you cannot place bids on your own items. Other buyers can bid on this gemstone.
                      </p>
                      
                      <div className="mt-4 p-4 bg-orange-100 rounded-lg">
                        <div className="text-sm text-orange-700">
                          <strong>Current Status:</strong>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="font-bold text-lg text-orange-800">
                                {bidStats.totalBids || gemstone.totalBids || 0}
                              </div>
                              <div className="text-xs text-orange-600">Total Bids</div>
                            </div>
                            <div>
                              <div className="font-bold text-lg text-orange-800">
                                {formatLKR(currentHighestBid)}
                              </div>
                              <div className="text-xs text-orange-600">Highest Bid</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {bidStats.highestBidder && (
                        <div className="text-sm text-orange-600">
                          <strong>Leading Bidder:</strong> {bidStats.highestBidder}
                        </div>
                      )}
                    </div>
                  </div>
                ) : isBiddingClosed ? (
                  /* Show bidding closed message when countdown has ended AND there were bids, or item is sold */
                  <div className="space-y-4 bg-gradient-to-br from-gray-50 to-red-50 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Clock className="w-5 h-5 text-red-600" />
                      <h3 className="text-xl font-semibold text-red-800">Bidding Closed</h3>
                    </div>
                    
                    <div className="text-center space-y-3">
                      <div className="text-lg font-medium text-red-700">
                        {gemstone?.listingStatus === 'sold' || String(gemstone?.listingStatus).toLowerCase() === 'sold' 
                          ? 'This item has been sold!' 
                          : countdownData.isExpired || countdownData.remainingTimeSeconds <= 0
                          ? 'Bidding time has expired'
                          : 'Bidding is no longer available'
                        }
                      </div>
                      
                      <p className="text-red-600">
                        {gemstone?.listingStatus === 'sold' || String(gemstone?.listingStatus).toLowerCase() === 'sold'
                          ? 'This gemstone has been successfully purchased and is no longer available for bidding.'
                          : 'The bidding period for this gemstone has ended. No new bids can be placed.'
                        }
                      </p>
                      
                      <div className="mt-4 p-4 bg-red-100 rounded-lg">
                        <div className="text-sm text-red-700">
                          <strong>Final Results:</strong>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="font-bold text-lg text-red-800">
                                {bidStats.totalBids || gemstone.totalBids || 0}
                              </div>
                              <div className="text-xs text-red-600">Total Bids</div>
                            </div>
                            <div>
                              <div className="font-bold text-lg text-red-800">
                                {formatLKR(currentHighestBid)}
                              </div>
                              <div className="text-xs text-red-600">
                                {gemstone?.listingStatus === 'sold' || String(gemstone?.listingStatus).toLowerCase() === 'sold'
                                  ? 'Final Price' 
                                  : 'Highest Bid'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {bidStats.highestBidder && (
                        <div className="text-sm text-red-600">
                          <strong>
                            {gemstone?.listingStatus === 'sold' || String(gemstone?.listingStatus).toLowerCase() === 'sold'
                              ? 'Winner:' 
                              : 'Highest Bidder:'
                            }
                          </strong> {bidStats.highestBidder}
                        </div>
                      )}
                      
                      {(gemstone?.listingStatus === 'expired_no_bids' || bidStats.totalBids === 0) && (
                        <div className="text-sm text-gray-600 mt-2">
                          This item did not receive any bids during the auction period.
                        </div>
                      )}
                    </div>
                  </div>
                ) : isWaitingForFirstBid ? (
                  /* Show waiting for first bid message when no bids have been placed yet */
                  <div className="space-y-4 bg-gradient-to-br from-primary-50 to-blue-50 p-6 rounded-xl border border-primary-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <h3 className="text-xl font-semibold text-primary-800">Waiting for First Bid</h3>
                    </div>
                    
                    <div className="text-center space-y-3">
                      <div className="text-lg font-medium text-primary-700">
                        Be the first to bid on this gemstone!
                      </div>
                      <p className="text-secondary-600">
                        Once the first bid is placed, the countdown timer will start and other buyers can compete.
                      </p>
                      
                      <div className="mt-4 p-4 bg-primary-100 rounded-lg">
                        <div className="text-sm text-primary-700">
                          <strong>Starting Information:</strong>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-center">
                            <div>
                              <div className="font-bold text-lg text-primary-800">
                                {formatLKR(gemstone.price)}
                              </div>
                              <div className="text-xs text-primary-600">Starting Price</div>
                            </div>
                            <div>
                              <div className="font-bold text-lg text-primary-800">
                                {formatLKR(minimumBid)}
                              </div>
                              <div className="text-xs text-primary-600">Minimum First Bid</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* First bid form */}
                    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg border border-primary-200">
                      <div>
                        <label htmlFor="bidAmount" className="block text-base font-medium text-primary-700 mb-2">
                          Place the First Bid
                        </label>
                        <div className="text-sm text-secondary-600 mb-3">
                          Minimum bid: <span className="font-semibold text-primary-600">{formatLKR(minimumBid)}</span>
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
                            placeholder={`Enter amount (min: ${formatLKR(minimumBid)})`}
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
                        Place First Bid & Start Auction
                      </Button>
                    </form>
                  </div>
                ) : (
                  /* Normal bid form for non-sellers when bidding is active (after first bid) */
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemstoneDetailModal;
