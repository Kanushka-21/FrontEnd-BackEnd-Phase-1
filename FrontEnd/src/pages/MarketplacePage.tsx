import React, { useState, useEffect } from 'react';
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
import Header from '@/components/layout/Header';
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
  
  // Helper to convert backend GemListing to frontend DetailedGemstone format
  const convertToDetailedGemstone = (listing: any): DetailedGemstone => {
    // Extract all images from the backend listing
    const allImages: string[] = [];
    
    // Add primary image if it exists
    if (listing.primaryImageUrl) {
      allImages.push(constructImageUrl(listing.primaryImageUrl));
    }
    
    // Add all images from the images array
    if (listing.images && Array.isArray(listing.images)) {
      listing.images.forEach((img: any) => {
        let imageUrl = '';
        if (typeof img === 'string') {
          imageUrl = constructImageUrl(img);
        } else if (img && img.imageUrl) {
          imageUrl = constructImageUrl(img.imageUrl);
        } else if (img && img.url) {
          imageUrl = constructImageUrl(img.url);
        }
        
        if (imageUrl && !allImages.includes(imageUrl)) {
          allImages.push(imageUrl);
        }
      });
    }
    
    // Fallback to single image property if no images found
    if (allImages.length === 0 && listing.image) {
      allImages.push(constructImageUrl(listing.image));
    }
    
    // Use first image as primary, or placeholder if no images
    const primaryImage = allImages.length > 0 ? allImages[0] : 'https://via.placeholder.com/400x300?text=Gemstone';
    
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
      dimensions: {
        length: parseFloat(listing.measurements?.split('x')[0] || '0') || 0,
        width: parseFloat(listing.measurements?.split('x')[1] || '0') || 0,
        height: parseFloat(listing.measurements?.split('x')[2] || '0') || 0
      },
      transparency: 'transparent' as const,
      specifications: {
        species: listing.species || 'Unknown',
        variety: listing.variety || 'Unknown',
        transparency: listing.transparency || 'transparent',
        treatment: listing.treatment || listing.treatments || 'Unknown',
        refractiveIndex: listing.refractiveIndex || undefined,
        specificGravity: listing.specificGravity || undefined
      },
      certificate: listing.isCertified ? {
        issuingAuthority: listing.certifyingAuthority || 'Unknown',
        reportNumber: listing.certificateNumber || 'N/A',
        date: listing.issueDate || 'Unknown'
      } : undefined
    };
  };

  // Helper to construct proper image URL
  const constructImageUrl = (imagePath: string): string => {
    if (!imagePath) return 'https://via.placeholder.com/400x300?text=Gemstone';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    const baseUrl = 'http://localhost:9092';
    if (imagePath.startsWith('/')) {
      return `${baseUrl}${imagePath}`;
    }
    
    return `${baseUrl}/${imagePath}`;
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
          const convertedGemstones = listings.map(convertToDetailedGemstone);
          setGemstones(convertedGemstones);
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
      setError('Unable to connect to backend. Please ensure the backend server is running on localhost:9092 and connected to MongoDB (localhost:27017).');
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

  // Remove the old mock data loading effect
  // useEffect(() => {
  //   // Simulate loading gemstones from an API
  //   const mockGemstones: DetailedGemstone[] = Array(24).fill(null).map((_, i) => {
  //     ...
  //   });
  //   setGemstones(mockGemstones);
  // }, []);
  
  const handleViewDetails = (gemstoneId: string) => {
    console.log('View details clicked for gemstone:', gemstoneId);
    const gemstone = gemstones.find(g => g.id === gemstoneId);
    if (gemstone) {
      console.log('Setting selected gemstone:', gemstone);
      setSelectedGemstone(gemstone);
      setIsModalOpen(true);
    }
  };

  const handlePlaceBid = (amount: number) => {
    console.log('Placing bid:', amount);
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
                <Title level={3} type="secondary" className="!text-lg sm:!text-xl lg:!text-2xl">No Approved Listings in Database</Title>
                <Paragraph type="secondary" className="!text-sm sm:!text-base">
                  No approved gemstone listings found in gemnet_db.gem_listings collection. 
                  <br />Add some approved listings to the database or check your search filters.
                </Paragraph>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg text-left max-w-2xl mx-auto">
                  <Text strong className="block mb-2">Database Query:</Text>
                  <Text code className="text-sm">
                    gemnet_db.gem_listings.find({"{listingStatus: 'APPROVED', isActive: true}"})
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
          onClose={() => {
            console.log('Closing detail modal');
            setIsModalOpen(false);
            setSelectedGemstone(null);
          }}
          onPlaceBid={handlePlaceBid}
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
