import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Layout as AntLayout, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Typography, 
  Slider, 
  Checkbox, 
  Pagination,
  Drawer,
  Modal,
  message,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  SortAscendingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { DetailedGemstone } from '@/types';
import Header from '@/components/layout/RoleAwareHeader';
import GemstoneCard from '@/components/ui/GemstoneCard';
import GemstoneDetailModal from '@/components/home/GemstoneDetailModal';
import { api } from '@/services/api';
import extendedAPI from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const { Content } = AntLayout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const MarketplacePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGemstone, setSelectedGemstone] = useState<DetailedGemstone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(320);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [pendingBidAmount, setPendingBidAmount] = useState<number>(0);
  
  // Real data states
  const [gemstones, setGemstones] = useState<DetailedGemstone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('price_asc');
  
  // Handle responsive drawer width
  useEffect(() => {
    const handleResize = () => {
      setDrawerWidth(window.innerWidth > 576 ? 320 : window.innerWidth * 0.8);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const itemsPerPage = 12;
  
  // Helper to construct proper image URL
  const constructImageUrl = (imagePath: string): string => {
    console.log('🖼️ Constructing image URL for path:', imagePath);
    
    if (!imagePath || imagePath.trim() === '') {
      console.log('🚫 No image path provided, using placeholder');
      return 'https://via.placeholder.com/400x300?text=Gemstone';
    }
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      console.log('✅ Image path is already a full URL:', imagePath);
      return imagePath;
    }
    
    const baseUrl = 'http://localhost:9092';
    let constructedUrl;
    
    if (imagePath.startsWith('/')) {
      constructedUrl = `${baseUrl}${imagePath}`;
    } else {
      constructedUrl = `${baseUrl}/${imagePath}`;
    }
    
    console.log('🔗 Constructed image URL:', constructedUrl);
    return constructedUrl;
  };
  
  // Helper to convert backend GemListing to frontend DetailedGemstone format
  const convertToDetailedGemstone = (listing: any): DetailedGemstone => {
    console.log('🔄 Converting listing to DetailedGemstone:', listing);
    
    // Extract all images from the backend listing
    const allImages: string[] = [];
    let primaryImage = '';
    
    // First, prioritize images from the images array (which are more reliable)
    if (listing.images && Array.isArray(listing.images)) {
      console.log('📷 Found images array:', listing.images);
      
      // Sort images by displayOrder and find primary image
      const sortedImages = listing.images.sort((a: any, b: any) => {
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
      
      sortedImages.forEach((img: any, index: number) => {
        console.log(`📷 Processing image ${index + 1}:`, img);
        let imageUrl = '';
        
        // Extract imageUrl from the image object
        if (img && img.imageUrl) {
          imageUrl = constructImageUrl(img.imageUrl);
        } else if (img && img.url) {
          imageUrl = constructImageUrl(img.url);
        } else if (img && img.imagePath) {
          imageUrl = constructImageUrl(img.imagePath);
        } else if (img && img.path) {
          imageUrl = constructImageUrl(img.path);
        } else if (typeof img === 'string') {
          imageUrl = constructImageUrl(img);
        } else {
          console.log('❓ Unknown image format:', img);
        }
        
        if (imageUrl) {
          allImages.push(imageUrl);
          console.log('✅ Added image URL:', imageUrl);
          
          // Set as primary if it's marked as primary or if it's the first image
          if ((img.isPrimary === true || index === 0) && !primaryImage) {
            primaryImage = imageUrl;
            console.log('🏆 Set as primary image:', imageUrl);
          }
        }
      });
    }
    
    // Fallback to primaryImageUrl only if no images found in array
    if (allImages.length === 0 && listing.primaryImageUrl) {
      console.log('📷 Using fallback primaryImageUrl:', listing.primaryImageUrl);
      const fallbackUrl = constructImageUrl(listing.primaryImageUrl);
      allImages.push(fallbackUrl);
      primaryImage = fallbackUrl;
    }
    
    // Fallback to single image property if no images found
    if (allImages.length === 0 && listing.image) {
      console.log('📷 Using fallback image property:', listing.image);
      const fallbackUrl = constructImageUrl(listing.image);
      allImages.push(fallbackUrl);
      primaryImage = fallbackUrl;
    }
    
    // Check for other possible image fields if still no images
    if (allImages.length === 0) {
      const possibleImageFields = ['imageUrl', 'imagePath', 'photo', 'picture'];
      for (const field of possibleImageFields) {
        if (listing[field]) {
          console.log(`📷 Found image in field '${field}':`, listing[field]);
          const fallbackUrl = constructImageUrl(listing[field]);
          allImages.push(fallbackUrl);
          primaryImage = fallbackUrl;
          break;
        }
      }
    }
    
    // Use primary image or first image, or placeholder if no images
    if (!primaryImage && allImages.length > 0) {
      primaryImage = allImages[0];
    }
    
    if (!primaryImage) {
      primaryImage = 'https://via.placeholder.com/400x300?text=Gemstone';
    }
    
    console.log('🏆 Primary image selected:', primaryImage);
    console.log('📚 All images:', allImages);
    console.log('👤 Seller information - userName:', listing.userName);
    
    return {
      id: listing.id || listing._id,
      name: listing.gemName || 'Unknown Gemstone',
      price: listing.price ? Number(listing.price) : 0,
      predictedPriceRange: {
        min: listing.price ? Math.floor(Number(listing.price) * 0.9) : 0,
        max: listing.price ? Math.floor(Number(listing.price) * 1.2) : 0
      },
      image: primaryImage,
      images: allImages, // Include all uploaded images
      certified: listing.isCertified || false,
      weight: listing.weight ? parseFloat(listing.weight) : 0,
      color: listing.color || 'Unknown',
      species: listing.species || 'Unknown',
      variety: listing.variety || 'Unknown', 
      shape: listing.shape || 'Unknown',
      cut: listing.cut || 'Unknown',
      clarity: listing.clarity || 'Unknown',
      origin: listing.origin || undefined, // Add origin field
      treatment: listing.treatment || listing.treatments || 'Unknown', // Add treatment field
      dimensions: {
        length: parseFloat(listing.measurements?.split('x')[0]?.trim() || '0') || 0,
        width: parseFloat(listing.measurements?.split('x')[1]?.trim() || '0') || 0,
        height: parseFloat(listing.measurements?.split('x')[2]?.trim() || '0') || 0
      },
      transparency: listing.clarity || 'transparent' as const,
      specifications: {
        species: listing.species || 'Unknown',
        variety: listing.variety || 'Unknown',
        transparency: listing.clarity || 'transparent',
        treatment: listing.treatment || listing.treatments || 'Unknown',
        refractiveIndex: listing.refractiveIndex || undefined,
        specificGravity: listing.specificGravity || undefined
      },
      certificate: listing.isCertified ? {
        issuingAuthority: listing.certifyingAuthority || listing.authority || 'Unknown',
        reportNumber: listing.certificateNumber || 'N/A',
        date: listing.issueDate || 'Unknown'
      } : undefined,
      seller: {
        name: listing.userName || 'Unknown Seller',
        rating: 5, // Default rating - can be enhanced later with real rating data
        userId: listing.userId // Add seller userId for bidding restriction
      }
    };
  };

  // Function to refresh countdown data for all current gemstones
  const refreshAllCountdowns = async () => {
    try {
      console.log('🔄 Refreshing countdown data for all marketplace items...');
      
      // Update countdown data for all gemstones in parallel
      const updatedGemstones = await Promise.all(
        gemstones.map(async (gemstone) => {
          try {
            const countdownResponse = await fetch(`/api/bidding/listing/${gemstone.id}/countdown`);
            const countdownResult = await countdownResponse.json();
            
            if (countdownResponse.ok && countdownResult.success && countdownResult.data) {
              console.log(`⏰ Updated countdown for ${gemstone.name}:`, countdownResult.data);
              
              return {
                ...gemstone,
                biddingActive: countdownResult.data.biddingActive,
                biddingStartTime: countdownResult.data.biddingStartTime,
                biddingEndTime: countdownResult.data.biddingEndTime,
                remainingTimeSeconds: countdownResult.data.remainingTimeSeconds,
                remainingDays: countdownResult.data.remainingDays,
                remainingHours: countdownResult.data.remainingHours,
                remainingMinutes: countdownResult.data.remainingMinutes,
                remainingSeconds: countdownResult.data.remainingSeconds,
                isExpired: countdownResult.data.isExpired
              };
            }
          } catch (error) {
            console.warn(`⚠️ Failed to refresh countdown for ${gemstone.name}:`, error);
          }
          
          return gemstone; // Return unchanged if refresh failed
        })
      );
      
      setGemstones(updatedGemstones);
      console.log('✅ All countdown data refreshed');
    } catch (error) {
      console.error('❌ Error refreshing countdown data:', error);
    }
  };

  // Function to fetch marketplace listings from real database
  const fetchMarketplaceListings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage - 1, // API is 0-indexed
        size: itemsPerPage,
        sortBy: getSortField(),
        sortDir: getSortDirection(),
        search: searchTerm || undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
        certifiedOnly: certifiedOnly || undefined
      };

      console.log('🔍 Fetching real approved listings from gemnet_db.gem_listings with params:', params);
      const response = await api.marketplace.getListings(params);
      
      if (response.success && response.data) {
        console.log('✅ Successfully fetched real marketplace listings:', response.data);
        const listings = response.data.listings || [];
        
        if (listings.length === 0) {
          console.log('📋 No approved listings found in database');
          setGemstones([]);
          setTotalItems(0);
          setError(null);
          message.info('No approved gemstone listings found in the database');
        } else {
          // Convert listings to detailed gemstones
          const convertedGemstones = listings.map(convertToDetailedGemstone);
          
          // Fetch latest bid for each gemstone
          try {
            // Fetch latest bids and countdown data for all gemstones in parallel
            const bidPromises = convertedGemstones.map(async (gemstone: DetailedGemstone) => {
              try {
                console.log(`🔍 Fetching bids and countdown for gemstone ${gemstone.id} (${gemstone.name})`);
                
                let gemstoneWithBids = gemstone;
                
                try {
                  // First try to get detailed bid stats which includes highest bid
                  const statsResponse = await fetch(`/api/bidding/listing/${gemstone.id}/stats`);
                  const statsResult = await statsResponse.json();
                  
                  if (statsResponse.ok && statsResult.success && statsResult.data) {
                    console.log(`📊 Bid stats for ${gemstone.name}:`, statsResult.data);
                    
                    // Get the highest bid from stats if available
                    if (statsResult.data.highestBid && statsResult.data.highestBid > 0) {
                      console.log(`💰 Highest bid for ${gemstone.name} from stats:`, statsResult.data.highestBid);
                      gemstoneWithBids = {
                        ...gemstoneWithBids,
                        latestBidPrice: statsResult.data.highestBid,
                        totalBids: statsResult.data.totalBids || 0
                      };
                    }
                  }
                  
                  // Fallback to getting individual bids if stats aren't available
                  if (!gemstoneWithBids.latestBidPrice) {
                    const bidResponse = await api.getByGemstoneId(gemstone.id);
                    console.log(`📊 Bid response for ${gemstone.name}:`, bidResponse);
                    
                    if (bidResponse.success && bidResponse.data && bidResponse.data.length > 0) {
                      // Get highest bid amount
                      const highestBid = bidResponse.data.reduce((highest: any, current: any) => 
                        current.amount > highest.amount ? current : highest, bidResponse.data[0]);
                      
                      console.log(`💰 Highest bid for ${gemstone.name}:`, highestBid.amount);
                      
                      gemstoneWithBids = {
                        ...gemstoneWithBids,
                        latestBidPrice: highestBid.amount,
                        totalBids: bidResponse.data.length
                      };
                    }
                  }
                  
                  // Fetch countdown data
                  try {
                    const countdownResponse = await fetch(`/api/bidding/listing/${gemstone.id}/countdown`);
                    const countdownResult = await countdownResponse.json();
                    
                    if (countdownResponse.ok && countdownResult.success && countdownResult.data) {
                      console.log(`⏰ Countdown data for ${gemstone.name}:`, countdownResult.data);
                      
                      gemstoneWithBids = {
                        ...gemstoneWithBids,
                        biddingActive: countdownResult.data.biddingActive,
                        biddingStartTime: countdownResult.data.biddingStartTime,
                        biddingEndTime: countdownResult.data.biddingEndTime,
                        remainingTimeSeconds: countdownResult.data.remainingTimeSeconds,
                        remainingDays: countdownResult.data.remainingDays,
                        remainingHours: countdownResult.data.remainingHours,
                        remainingMinutes: countdownResult.data.remainingMinutes,
                        remainingSeconds: countdownResult.data.remainingSeconds,
                        isExpired: countdownResult.data.isExpired
                      };
                    }
                  } catch (countdownError) {
                    console.warn(`⚠️ Failed to fetch countdown for ${gemstone.name}:`, countdownError);
                  }
                  
                  console.log(`ℹ️ Final data for ${gemstone.name}:`, gemstoneWithBids);
                  return gemstoneWithBids;
                } catch (error) {
                  console.error(`Error fetching bids for ${gemstone.name}:`, error);
                  return gemstone;
                }
              } catch (err) {
                console.error(`Error fetching bids for gemstone ${gemstone.id}:`, err);
                return gemstone;
              }
            });
            
            // Wait for all bid requests to complete
            const gemstonesWithBids = await Promise.all(bidPromises);
            console.log('✨ Gemstones with bids data:', gemstonesWithBids);
            
            // Verify that latestBidPrice is properly set
            const hasBidData = gemstonesWithBids.some(g => g.latestBidPrice !== undefined);
            console.log(`🔍 Bid data available: ${hasBidData ? 'Yes' : 'No'}`);
            
            if (hasBidData) {
              console.log('💰 Sample bid price:', gemstonesWithBids[0].latestBidPrice);
            }
            
            setGemstones(gemstonesWithBids);
          } catch (bidError) {
            console.error('Error fetching bids:', bidError);
            // Still display gemstones even if bids couldn't be fetched
            setGemstones(convertedGemstones);
          }
          
          setTotalItems(response.data.totalElements || listings.length);
          setError(null);
          console.log(`✅ Displaying ${listings.length} real approved listings from database`);
          message.success(`Loaded ${listings.length} approved listings from database`);
        }
      } else {
        console.error('❌ Backend API error:', response.message || 'Unknown error');
        setError(`Backend error: ${response.message || 'Failed to fetch approved listings'}`);
        setGemstones([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('❌ Failed to connect to backend database:', error);
      
      // Check if it's a network error
      const isNetworkError = error instanceof Error && 
        (error.message.includes('Network Error') || error.message.includes('Failed to fetch'));
      
      if (isNetworkError) {
        setError('Cannot Connect to Database\nBackend error: Network Error\n\nTo see real approved gemstone listings:\n1. Make sure MongoDB and Backend server are running\n2. Use the "Fix Connection" button below to automatically fix the issue');
      } else {
        setError('Unable to connect to backend. Please ensure the backend server is running on localhost:9092 and connected to MongoDB (localhost:27017).');
      }
      
      // Try to check backend health to get more specific error
      fetch('http://localhost:9092/api/system/db-status')
        .then(response => response.json())
        .then(data => {
          if (!data.connected) {
            setError(`MongoDB Connection Error: ${data.error || 'Unable to connect to database'}\n\nPlease use the "Fix Connection" button below to resolve this issue.`);
          }
        })
        .catch(() => {
          // Backend not even running
          console.log('Backend server does not appear to be running');
        });
        
      setGemstones([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to convert sortBy to API format
  const getSortField = () => {
    switch (sortBy) {
      case 'price_asc':
      case 'price_desc':
        return 'price';
      case 'weight_asc':
      case 'weight_desc':
        return 'weight';
      case 'name_asc':
      case 'name_desc':
        return 'gemName';
      default:
        return 'createdAt';
    }
  };

  const getSortDirection = () => {
    return sortBy.includes('_desc') ? 'desc' : 'asc';
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchMarketplaceListings();
  }, [currentPage, sortBy, searchTerm, priceRange, selectedTypes, selectedColors, certifiedOnly]);

  // Handle URL parameters for direct navigation to specific items from HomePage or notifications
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const gemstoneid = urlParams.get('viewGemstone') || urlParams.get('item'); // Support both parameters for compatibility
    
    if (gemstoneid && gemstones.length > 0) {
      console.log('🔍 Looking for gemstone with ID:', gemstoneid);
      // Find the specific gemstone and open its modal
      const targetGemstone = gemstones.find(g => g.id === gemstoneid);
      if (targetGemstone) {
        console.log('✅ Found gemstone, opening modal:', targetGemstone);
        setSelectedGemstone(targetGemstone);
        setIsModalOpen(true);
        
        // Clean up URL by removing both possible parameters
        let newUrl = window.location.pathname + window.location.search;
        newUrl = newUrl.replace(/[?&]viewGemstone=[^&]+/, '');
        newUrl = newUrl.replace(/[?&]item=[^&]+/, '');
        newUrl = newUrl.replace(/^&/, '?'); // Fix leading & if query starts with it
        if (newUrl.endsWith('?')) newUrl = newUrl.slice(0, -1); // Remove trailing ?
        navigate(newUrl || window.location.pathname, { replace: true });
      } else {
        console.log('❌ Gemstone not found with ID:', gemstoneid);
      }
    }
  }, [gemstones, location.search, navigate]); // Trigger when gemstones are loaded or URL changes

  // Remove the old mock data loading effect
  // useEffect(() => {
  //   // Simulate loading gemstones from an API
  //   const mockGemstones: DetailedGemstone[] = Array(24).fill(null).map((_, i) => {
  //     ...
  //   });
  //   setGemstones(mockGemstones);
  // }, []);
  
  const handleViewDetails = async (gemstoneId: string) => {
    console.log('🔍 View details clicked for gemstone:', gemstoneId);
    
    try {
      setLoading(true);
      
      // First get the basic gemstone from our current list for fallback
      const basicGemstone = gemstones.find(g => g.id === gemstoneId);
      if (!basicGemstone) {
        message.error('Gemstone not found');
        return;
      }
      
      console.log('📋 Found basic gemstone data:', basicGemstone);
      
      // Fetch detailed information from backend
      console.log('🔍 Fetching detailed information from backend...');
      const detailResponse = await fetch(`/api/marketplace/listings/${gemstoneId}`);
      
      if (!detailResponse.ok) {
        console.warn('⚠️ Failed to fetch detailed info from backend, using basic data');
        // Fallback to basic gemstone if backend fails
        setSelectedGemstone(basicGemstone);
        setIsModalOpen(true);
        return;
      }
      
      const detailResult = await detailResponse.json();
      console.log('📋 Backend detail response:', detailResult);
      
      if (detailResult.success && detailResult.data) {
        // Convert the detailed backend data to DetailedGemstone format
        console.log('🔄 Converting detailed backend data to modal format...');
        
        let rawListingData = detailResult.data;
        let videoData = null;
        
        // 🎬 CRITICAL FIX: Handle enhanced backend response with videos
        if (detailResult.data && typeof detailResult.data === 'object' && 'gemstone' in detailResult.data) {
          console.log('🎬 DETECTED: Enhanced backend response with videos!');
          rawListingData = detailResult.data.gemstone;
          videoData = {
            videos: detailResult.data.videos || [],
            hasVideos: detailResult.data.hasVideos || false,
            videoCount: detailResult.data.videoCount || 0
          };
          console.log('🎬 Extracted video data:', videoData);
        }
        
        const detailedGemstone = convertToDetailedGemstone(rawListingData);
        
        // 🎬 CRITICAL FIX: Merge video data into gemstone object
        let gemstoneData = detailedGemstone;
        if (videoData && videoData.videos.length > 0) {
          console.log('🎬 MERGING videos into gemstone data:', videoData.videos);
          gemstoneData.videos = videoData.videos;
          gemstoneData.hasVideos = videoData.hasVideos;
          gemstoneData.videoCount = videoData.videoCount;
        }
        const enhancedGemstone = {
          ...gemstoneData,
          // Preserve current bid information from marketplace data
          currentBid: basicGemstone.currentBid || gemstoneData.price,
          latestBidPrice: basicGemstone.latestBidPrice,
          totalBids: basicGemstone.totalBids,
          highestBidder: basicGemstone.highestBidder,
          biddingActive: basicGemstone.biddingActive,
          biddingStartTime: basicGemstone.biddingStartTime,
          biddingEndTime: basicGemstone.biddingEndTime,
          remainingTimeSeconds: basicGemstone.remainingTimeSeconds
        };
        console.log('✅ Enhanced gemstone with detailed backend data:', enhancedGemstone);
        console.log('📷 Total images available:', enhancedGemstone.images?.length || 0);
        setSelectedGemstone(enhancedGemstone);
      } else {
        console.warn('⚠️ Backend returned unsuccessful response, using basic data');
        setSelectedGemstone(basicGemstone);
      }
      
    } catch (error) {
      console.error('❌ Error fetching detailed gemstone info:', error);
      
      // Fallback to basic gemstone data if there's an error
      const basicGemstone = gemstones.find(g => g.id === gemstoneId);
      if (basicGemstone) {
        console.log('🔄 Using fallback basic gemstone data');
        setSelectedGemstone(basicGemstone);
      } else {
        message.error('Failed to load gemstone details');
        return;
      }
    } finally {
      setLoading(false);
      setIsModalOpen(true);
    }
  };

  const handlePlaceBid = (amount: number) => {
    console.log('Placing bid:', amount);
    
    // Check if user is admin - admins cannot place bids
    if (user?.role?.toLowerCase() === 'admin' || user?.userRole?.toLowerCase() === 'admin') {
      message.error('Admin users cannot place bids on items. This feature is restricted to buyers only.');
      return;
    }
    
    setPendingBidAmount(amount);
    setIsTermsModalOpen(true);
  };

  const handleConfirmBid = async () => {
    console.log('Confirming bid:', pendingBidAmount);
    
    if (!selectedGemstone) {
      message.error('No gemstone selected');
      return;
    }

    if (!isAuthenticated || !user) {
      message.error('Please log in to place a bid');
      return;
    }

    // Check if user is admin - admins cannot place bids
    if (user.role?.toLowerCase() === 'admin' || user.userRole?.toLowerCase() === 'admin') {
      message.error('Admin users cannot place bids on items. This feature is restricted to buyers only.');
      setIsTermsModalOpen(false);
      setPendingBidAmount(0);
      return;
    }

    try {
      setLoading(true);
      
      const bidRequest = {
        listingId: selectedGemstone.id,
        bidderId: user.userId,
        bidderName: `${user.firstName} ${user.lastName}`,
        bidderEmail: user.email,
        bidAmount: pendingBidAmount,
        currency: 'LKR',
        message: `Bid placed for ${selectedGemstone.name}`
      };

      console.log('Sending bid request:', bidRequest);

      const result = await extendedAPI.bidding.placeBid(bidRequest);

      if (result.success) {
        message.success('Bid placed successfully!');
        
        // Update the gemstone with new bid information
        if (selectedGemstone) {
          const updatedGemstone = {
            ...selectedGemstone,
            currentBid: pendingBidAmount,
            totalBids: (selectedGemstone.totalBids || 0) + 1
          };
          setSelectedGemstone(updatedGemstone);
        }
        
        // Refresh the listings to show updated bid counts
        fetchMarketplaceListings();
        
        setIsTermsModalOpen(false);
        setIsModalOpen(false);
        setPendingBidAmount(0);
      } else {
        message.error(result.message || 'Failed to place bid');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      message.error('Failed to place bid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format helper function
  const formatLKR = (price: number) => {
    return new Intl.NumberFormat('si-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Filter Panel Component
  const FilterPanel = () => (
    <div style={{ padding: '20px 0' }}>
      <Title level={4}>Filters</Title>
      
      <div style={{ marginBottom: 24 }}>
        <Text strong>Price Range</Text>
        <Slider
          range
          min={0}
          max={500000}
          value={priceRange}
          onChange={(value) => setPriceRange(value as [number, number])}
          tooltip={{ formatter: (value) => `LKR ${value?.toLocaleString()}` }}
          style={{ marginTop: 16 }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <Text type="secondary">LKR {priceRange[0].toLocaleString()}</Text>
          <Text type="secondary">LKR {priceRange[1].toLocaleString()}</Text>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Text strong>Gemstone Type</Text>
        <Checkbox.Group
          options={['Sapphire', 'Ruby', 'Emerald', 'Topaz', 'Aquamarine']}
          value={selectedTypes}
          onChange={setSelectedTypes}
          style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <Text strong>Color</Text>
        <Checkbox.Group
          options={['Blue', 'Red', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange']}
          value={selectedColors}
          onChange={setSelectedColors}
          style={{ display: 'flex', flexDirection: 'column', marginTop: 12 }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <Checkbox
          checked={certifiedOnly}
          onChange={(e) => setCertifiedOnly(e.target.checked)}
        >
          <Text strong>Certified Only</Text>
        </Checkbox>
      </div>

      <Button        block 
        onClick={() => {
          setPriceRange([0, 500000]);
          setSelectedTypes([]);
          setSelectedColors([]);
          setCertifiedOnly(false);
        }}
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <AntLayout className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header transparent={false} />      <Content>        {/* Search & Filters Bar */}
        <div className="bg-white border-b border-gray-200 py-3 sm:py-4">
          <div className="container-fluid px-3 sm:px-4">
              <div className="marketplace-search-container">
                <Row gutter={[8, 12]} align="middle" className="marketplace-header">
                  <Col xs={24} sm={24} md={14} lg={12} xl={10} xxl={8}>
                    <Input
                      size="middle"
                      placeholder="Search gemstones..."
                      prefix={<SearchOutlined style={{ color: '#2871FA' }} />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      allowClear
                      className="search-input"
                    />
                  </Col>
                  <Col xs={24} sm={12} md={6} lg={6} xl={5} xxl={4}>
                    <Select
                      size="middle"
                      value={sortBy}
                      onChange={setSortBy}
                      style={{ width: '100%' }}
                      suffixIcon={<SortAscendingOutlined />}
                      className="sort-select"
                      dropdownMatchSelectWidth={false}
                    >
                      <Option value="price_asc">Price ↑</Option>
                      <Option value="price_desc">Price ↓</Option>
                      <Option value="weight_asc">Weight ↑</Option>
                      <Option value="weight_desc">Weight ↓</Option>
                      <Option value="name_asc">Name A-Z</Option>
                      <Option value="name_desc">Name Z-A</Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={4} lg={6} xl={5} xxl={4}>
                    <div className="marketplace-controls flex gap-2 justify-between sm:justify-end">
                      <Button
                        size="middle"
                        icon={<FilterOutlined />}
                        onClick={() => setIsFilterDrawerOpen(true)}
                        className="filter-button flex-1 sm:flex-none"
                      >
                        <span className="hidden sm:inline">Filters</span>
                        <span className="sm:hidden">Filter</span>
                      </Button>
                      <Button.Group className="view-mode-buttons hidden sm:flex">
                      <Button 
                        size="middle"
                        icon={<AppstoreOutlined />}
                        type={viewMode === 'grid' ? 'primary' : 'default'}
                        onClick={() => setViewMode('grid')}
                      />
                      <Button 
                        size="middle"
                        icon={<BarsOutlined />}
                        type={viewMode === 'list' ? 'primary' : 'default'}
                        onClick={() => setViewMode('list')}
                      />
                    </Button.Group>
                    </div>
                </Col>              </Row>
              </div>
            </div>
        </div>        {/* Main Content */}
        <section className="py-3 sm:py-4 lg:py-6">
          <div className="container-fluid px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-16">
            {/* Results Summary */}
            <div className="mb-3 sm:mb-4 lg:mb-6">
              <Title level={3} className="!mb-1 !text-base sm:!text-lg lg:!text-xl xl:!text-2xl">Gemstone Marketplace</Title>
              <Paragraph className="!text-xs sm:!text-sm !mb-0 text-secondary-600">
                Browse available and recently sold gemstones
              </Paragraph>
              <Text type="secondary" className="text-xs sm:text-sm lg:text-base">
                {loading ? 'Loading from gemnet_db.gem_listings...' : `Showing ${totalItems > 0 ? Math.min(totalItems, (currentPage - 1) * itemsPerPage + 1) : 0}-${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems} approved listings from database`}
              </Text>
            </div>
            
            {/* Gemstones Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
                <span className="ml-3">Loading gemstones...</span>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <Title level={3} type="danger">Cannot Connect to Database</Title>
                <Paragraph type="secondary" className="mb-4">
                  {error}
                </Paragraph>
                <div className="mb-4 p-4 bg-red-50 rounded-lg text-left max-w-2xl mx-auto">
                  <Text strong className="block mb-2">To see real approved gemstone listings:</Text>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Start MongoDB: <code>mongod --port 27017</code></li>
                    <li>Start Backend Server: Navigate to BackEnd folder and run <code>start-windows.bat</code></li>
                    <li>Ensure gemnet_db.gem_listings collection has approved entries</li>
                    <li>Backend should be running on <code>localhost:9092</code></li>
                  </ol>
                </div>
                <Button type="primary" onClick={() => fetchMarketplaceListings()}>
                  Retry Connection
                </Button>
              </div>
            ) : gemstones.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                  {gemstones.map((gemstone) => (
                    <GemstoneCard
                      key={gemstone.id}
                      gemstone={gemstone}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>

                {/* Debug info */}
                <div style={{ display: 'none' }}>
                  Modal open: {String(isModalOpen)}, 
                  Selected gemstone: {selectedGemstone?.name || 'none'}
                </div>
                
                {/* Pagination */}
                <div className="flex justify-center mt-6 sm:mt-8 lg:mt-10">
                  <Pagination
                    current={currentPage}
                    total={totalItems}
                    pageSize={itemsPerPage}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    showQuickJumper={false}
                    showTotal={(total, range) => 
                      `${range[0]}-${range[1]} of ${total} items`
                    }
                    size="small"
                    className="mobile-pagination"
                  />
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0 60px' }}>
                <Title level={3} type="secondary" className="!text-lg sm:!text-xl lg:!text-2xl">No Listings Found</Title>
                <Paragraph type="secondary" className="!text-sm sm:!text-base">
                  No approved or sold gemstone listings found in the database. 
                  <br />Add some listings to the database or adjust your search filters.
                </Paragraph>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg text-left max-w-2xl mx-auto">
                  <Text strong className="block mb-2">Database Query:</Text>
                  <Text code className="text-sm">
                    gemnet_db.gem_listings.find({"{listingStatus: {$in: ['APPROVED', 'sold']}, isActive: true}"})
                  </Text>
                </div>
                <Button type="primary" onClick={() => fetchMarketplaceListings()}>
                  Refresh from Database
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Mobile Filter Drawer */}
      <Drawer
        title={
          <div className="drawer-title">
            <span>Filters</span>
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={() => setIsFilterDrawerOpen(false)}
              className="close-drawer-button" 
            />
          </div>
        }
        placement="left"
        onClose={() => setIsFilterDrawerOpen(false)}
        open={isFilterDrawerOpen}
        width={drawerWidth}
        className="marketplace-filter-drawer"
        closeIcon={null}
      >
        <FilterPanel />
      </Drawer>
      
      {/* Gemstone Detail Modal */}
      {selectedGemstone && (
        <GemstoneDetailModal
          isOpen={isModalOpen}
          gemstone={selectedGemstone}
          currentUser={user} // Pass current user to check if they're the seller
          onClose={() => {
            console.log('Closing detail modal');
            setIsModalOpen(false);
            setSelectedGemstone(null);
          }}
          onPlaceBid={handlePlaceBid}
          onCountdownUpdated={refreshAllCountdowns} // Pass countdown refresh callback
        />
      )}

      {/* Terms and Conditions Modal */}
      <Modal
        title="Terms and Conditions"
        open={isTermsModalOpen}
        onCancel={() => setIsTermsModalOpen(false)}
        footer={[
          <Button
            key="cancel"
            type="default"
            onClick={() => setIsTermsModalOpen(false)}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleConfirmBid}
          >
            I Agree & Place Bid
          </Button>
        ]}
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Before placing your bid, please agree to the following terms:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Your bid is legally binding and cannot be retracted</li>
            <li>If you win, you agree to complete the purchase within 48 hours</li>
            <li>You must verify your identity and payment method before the bid is accepted</li>
            <li>All transactions are subject to GemNet's marketplace policies</li>
            <li>Bidding amount: {formatLKR(pendingBidAmount)}</li>
          </ul>
          <p className="text-secondary-600 mt-4">
            By clicking "I Agree & Place Bid", you acknowledge that you have read and agree to these terms.
          </p>
        </div>
      </Modal>
        <style>
        {`
          /* Search bar and filters styling */
          .marketplace-search-container {
            padding: 4px 0;
          }
          
          .search-input .ant-input {
            border-radius: 8px;
            border-color: #e6e8eb;
            height: 40px;
          }
          
          .search-input .ant-input:hover,
          .search-input .ant-input:focus {
            border-color: #2871FA;
            box-shadow: 0 0 0 2px rgba(40, 113, 250, 0.1);
          }
          
          .sort-select .ant-select-selector {
            border-radius: 8px !important;
            border-color: #e6e8eb !important;
            height: 40px !important;
          }
          
          .sort-select .ant-select-selector:hover,
          .sort-select.ant-select-focused .ant-select-selector {
            border-color: #2871FA !important;
            box-shadow: 0 0 0 2px rgba(40, 113, 250, 0.1) !important;
          }
          
          .filter-button {
            border-radius: 8px;
            border-color: #e6e8eb;
            display: flex;
            align-items: center;
            height: 40px;
            min-width: 80px;
          }
          
          .filter-button:hover {
            border-color: #2871FA;
            color: #2871FA;
          }
          
          .view-mode-buttons .ant-btn:first-child {
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
          }
          
          .view-mode-buttons .ant-btn:last-child {
            border-top-right-radius: 8px;
            border-bottom-right-radius: 8px;
          }
          
          .marketplace-controls {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 100%;
          }
          
          /* Mobile pagination */
          .mobile-pagination .ant-pagination-item {
            margin: 0 3px !important;
            min-width: 32px !important;
            height: 32px !important;
            line-height: 30px !important;
          }
          
          .mobile-pagination .ant-pagination-prev,
          .mobile-pagination .ant-pagination-next {
            min-width: 32px !important;
            height: 32px !important;
            line-height: 30px !important;
          }
          
          .mobile-pagination .ant-pagination-total-text {
            font-size: 12px !important;
          }
          
          /* Drawer styling */
          .drawer-title {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            font-weight: 600;
            font-size: 18px;
          }
          
          .close-drawer-button {
            margin-right: -8px;
            padding: 4px 8px;
            color: #666;
          }
          
          .marketplace-filter-drawer .ant-drawer-body {
            padding-top: 0;
          }

          /* Mobile responsive breakpoints */
          @media (max-width: 576px) {
            .marketplace-search-container {
              padding: 6px 0;
            }
            
            .marketplace-header .ant-col {
              margin-bottom: 8px;
            }
            
            .marketplace-header .ant-col:last-child {
              margin-bottom: 0;
            }
            
            .filter-button {
              font-size: 14px;
              padding: 0 12px;
              height: 36px;
            }
            
            .search-input .ant-input,
            .sort-select .ant-select-selector {
              height: 36px !important;
              font-size: 14px;
            }
            
            .marketplace-controls {
              justify-content: space-between;
            }
            
            .filter-button {
              flex: 1;
              max-width: calc(50% - 4px);
            }
            
            .mobile-pagination {
              transform: scale(0.9);
              margin: 0 -5%;
            }
            
            .mobile-pagination .ant-pagination-total-text {
              display: none;
            }
            
            /* Hide some pagination items on very small screens */
            .mobile-pagination .ant-pagination-item:nth-child(n+6) {
              display: none;
            }
          }
          
          @media (max-width: 480px) {
            .marketplace-controls {
              flex-direction: column;
              gap: 8px;
            }
            
            .filter-button {
              max-width: 100%;
            }
            
            .mobile-pagination .ant-pagination-item:nth-child(n+4) {
              display: none;
            }
          }
          
          @media (max-width: 412px) {
            .container-fluid {
              padding-left: 12px !important;
              padding-right: 12px !important;
            }
            
            .marketplace-search-container {
              padding: 4px 0;
            }
            
            .search-input .ant-input::placeholder {
              font-size: 13px;
            }
            
            .sort-select .ant-select-selection-item {
              font-size: 13px;
            }
            
            .filter-button {
              font-size: 13px;
              height: 34px;
              padding: 0 10px;
            }
          }
          
          @media (max-width: 992px) {
            .marketplace-header .ant-row {
              margin-bottom: 0 !important;
            }
          }
          
          @media (max-width: 768px) {
            .marketplace-controls {
              justify-content: flex-start;
            }
          }
        `}</style>
      </Content>
    </AntLayout>
  );
};

export default MarketplacePage;
