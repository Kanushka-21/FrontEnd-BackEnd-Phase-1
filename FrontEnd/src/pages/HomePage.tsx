import React, { useState } from 'react';
import { 
  Layout as AntLayout, Row, Col, Card, Button, Badge, Rate, Tag, Typography, 
  Space, Input, InputNumber, Statistic, Avatar, Drawer, Carousel
} from 'antd';
import { 
  EyeOutlined, HeartOutlined, CheckCircleOutlined, UserOutlined, 
  ShoppingCartOutlined, SearchOutlined, LoginOutlined, UserAddOutlined,
  GlobalOutlined, TeamOutlined, ShopOutlined, DollarOutlined,
  StarFilled, ClockCircleOutlined, SafetyOutlined, TrophyOutlined,
  CloseOutlined, MenuOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DetailedGemstone } from '@/types';
import Header from '@/components/layout/Header';
import GemstoneCard from '@/components/ui/GemstoneCard';
import GemstoneDetailModal from '@/components/home/GemstoneDetailModal';

const { Content } = AntLayout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGemstone, setSelectedGemstone] = useState<DetailedGemstone | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);  // Featured gemstones (top 4 most engaging items from the marketplace)
  const featuredGemstones = [
    {
      id: '1',
      name: 'Star Sapphire of Ceylon',
      price: 12500,
      image: 'https://images.unsplash.com/photo-1615654771169-65fde4070ade?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      certified: true,
      weight: 5.2,
      color: 'Blue',
      species: 'Corundum',
      variety: 'Star Sapphire',
      shape: 'Oval Cabochon',
      cut: 'Cabochon',
      dimensions: { length: 11.5, width: 9.3, height: 5.8 },
      transparency: 'translucent',
      certificate: {
        issuingAuthority: 'GIA',
        reportNumber: 'GIA2024102',
        date: '2024-05-15'
      },
      predictedPriceRange: {
        min: 11000,
        max: 14000
      }
    },
    {
      id: '2',
      name: 'Padparadscha Sapphire',
      price: 18950,
      image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      certified: true,
      weight: 3.8,
      color: 'Pinkish Orange',
      species: 'Corundum',
      variety: 'Padparadscha',
      shape: 'Cushion',
      cut: 'Mixed',
      dimensions: { length: 8.9, width: 8.2, height: 5.1 },
      transparency: 'transparent',
      certificate: {
        issuingAuthority: 'SSEF',
        reportNumber: 'SSEF202456',
        date: '2024-06-01'
      },
      predictedPriceRange: {
        min: 16500,
        max: 21000
      }
    },
    {
      id: '3',
      name: 'Royal Blue Sapphire',
      price: 15800,
      image: 'https://images.unsplash.com/photo-1612098662204-e95c76707dec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      certified: true,
      weight: 4.5,
      color: 'Royal Blue',
      species: 'Corundum',
      variety: 'Sapphire',
      shape: 'Oval',
      cut: 'Brilliant',
      dimensions: { length: 10.2, width: 8.1, height: 5.3 },
      transparency: 'transparent',
      certificate: {
        issuingAuthority: 'GRS',
        reportNumber: 'GRS2024158',
        date: '2024-05-28'
      },
      predictedPriceRange: {
        min: 14200,
        max: 17500
      }
    },
    {
      id: '4',
      name: 'Pigeon Blood Ruby',
      price: 22500,
      image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      certified: true,
      weight: 3.2,
      color: 'Pigeon Blood Red',
      species: 'Corundum',
      variety: 'Ruby',
      shape: 'Octagon',
      cut: 'Step',
      dimensions: { length: 8.5, width: 8.5, height: 4.9 },
      transparency: 'transparent',
      certificate: {
        issuingAuthority: 'Gubelin',
        reportNumber: 'GUB2024079',
        date: '2024-06-10'
      },
      predictedPriceRange: {
        min: 19800,
        max: 25200
      }
    }
  ];
  const statistics = [
    { title: 'Verified Gems', value: 2847, icon: <CheckCircleOutlined className="text-blue-500" /> },
    { title: 'Active Traders', value: 1230, icon: <UserOutlined className="text-green-500" /> },
    { title: 'Successful Sales', value: 892, icon: <TrophyOutlined className="text-orange-500" /> }
  ];  const testimonials = [
    {
      name: 'Sunil Jayasinghe',
      role: 'Gemstone Dealer',
      rating: 5,
      comment: 'GemNet has transformed my business. The secure platform and verification system brings trust to online gem sales.',
      avatar: ''
    },
    {
      name: 'Kumari Wijeratne',
      role: 'Gem Collector',
      rating: 5,
      comment: 'As a gem collector, I appreciate the detailed listings and certification information. GemNet makes it easy to find authentic stones.',
      avatar: ''
    },
    {
      name: 'Anura Perera',
      role: 'Jewelry Designer',
      rating: 5,
      comment: 'Finding quality gemstones for my designs used to be challenging. With GemNet, I can source verified gems with confidence.',
      avatar: ''
    }
  ];const handleViewDetails = (gemstoneId: string) => {
    console.log('View details clicked for gemstone:', gemstoneId);
    const gemstone = featuredGemstones.find(g => g.id === gemstoneId);
    if (gemstone) {
      console.log('Setting selected gemstone:', gemstone);
      setSelectedGemstone(gemstone as DetailedGemstone);
      setIsModalOpen(true);
      setBidAmount(gemstone.price);
    }
  };
  const handlePlaceBid = (amount: number) => {
    // Handle bid placement logic
    console.log(`Bid placed for ${amount}`);
    setIsModalOpen(false);
    setSelectedGemstone(null);
    setBidAmount(0);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  return (
    <AntLayout className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <Header transparent={false} />
      <Content>        {/* Enhanced Hero Section with Carousel */}
        <section className="relative text-white overflow-hidden min-h-[220px] sm:min-h-[250px] lg:min-h-[320px] xl:min-h-[360px]">
          {/* Blurred background image */}
          <div 
            className="absolute inset-0 blur-[12px]"
            style={{
              backgroundImage: `url('/src/gem32.webp')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.9
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-blue-800/60"></div>
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 20% 70%, rgba(66, 153, 225, 0.2) 0%, transparent 30%), radial-gradient(circle at 80% 20%, rgba(255, 188, 0, 0.2) 0%, transparent 30%)',
            mixBlendMode: 'overlay'
          }}></div>

          
          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 md:py-16 lg:py-24 xl:py-32">
            <Carousel 
              autoplay 
              effect="fade"
              dots={{ className: "custom-dots" }}
              className="hero-carousel rounded-3xl overflow-hidden shadow-2xl"
              autoplaySpeed={6000}
            >
              {/* Slide 1: Main intro */}
              <div className="overflow-hidden">
                <div className="bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-blue-700/70 backdrop-blur-xl p-6 sm:p-8 md:p-10 lg:p-12 border border-blue-400/10">
                  
                  <Row gutter={[16, 24]} align="middle" className="min-h-[170px] sm:min-h-[190px] lg:min-h-[240px] xl:min-h-[280px] relative z-30">
                  <Col xs={24}>
                    <div className="space-y-4 sm:space-y-6 lg:space-y-8 text-center">
                      <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600/40 to-blue-400/40 backdrop-blur-xl rounded-full mb-2 border border-blue-300/30 shadow-lg">
                        <Text className="text-yellow-300 text-xs sm:text-sm font-medium tracking-wider">✦ Sri Lanka's Premier Gemstone Marketplace ✦</Text>
                      </div>
                      <Title level={1} className="!text-white !text-2xl sm:!text-3xl lg:!text-5xl xl:!text-6xl !font-bold !leading-tight">
                        Discover Authentic
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 drop-shadow-md">Sri Lankan Gems</span>
                      </Title>
                      <Paragraph className="!text-blue-100 !text-sm sm:!text-base lg:!text-lg xl:!text-xl !leading-relaxed max-w-xl mx-auto">
                        Join the most trusted digital marketplace for authentic gemstones. 
                        Connect with verified sellers and discover rare gems with confidence.
                      </Paragraph>
                      <Space size="middle" className="flex flex-col sm:flex-row w-full sm:w-auto justify-center pt-4 sm:pt-6">
                        <Button 
                          size="large" 
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 border-0 text-gray-900 hover:from-amber-400 hover:to-yellow-400 font-semibold px-8 sm:px-10 h-12 sm:h-14 w-full sm:w-auto rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center space-x-1"
                          onClick={() => navigate('/marketplace')}
                        >
                          <span className="mr-2">Explore Marketplace</span>
                          <span>→</span>
                        </Button>
                        <Button 
                          size="large" 
                          ghost 
                          className="border-2 border-white/60 text-white hover:bg-white hover:text-blue-700 font-semibold px-8 sm:px-10 h-12 sm:h-14 w-full sm:w-auto rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm transition-all"
                          onClick={() => navigate('/register')}
                        >
                          Join GemNet
                        </Button>
                      </Space>
                    </div>
                  </Col>
                </Row>
                </div>
              </div>
              
              {/* Slide 2: Price Prediction */}
              <div className="overflow-hidden">
                <div className="bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-blue-700/70 backdrop-blur-xl p-6 sm:p-8 md:p-10 lg:p-12 border border-blue-400/10">
                  
                  <Row gutter={[16, 24]} align="middle" className="min-h-[170px] sm:min-h-[190px] lg:min-h-[240px] xl:min-h-[280px] relative z-30">
                  <Col xs={24} lg={12}>
                    <div className="space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
                      <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600/40 to-blue-400/40 backdrop-blur-xl rounded-full mb-2 border border-blue-300/30 shadow-lg">
                        <Text className="text-yellow-300 text-xs sm:text-sm font-medium tracking-wider">✦ AI-Powered Price Estimation ✦</Text>
                      </div>
                      <Title level={1} className="!text-white !text-2xl sm:!text-3xl lg:!text-5xl xl:!text-6xl !font-bold !leading-tight">
                        Smart Pricing
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 drop-shadow-md">For Fair Trading</span>
                      </Title>
                      <Paragraph className="!text-blue-100 !text-sm sm:!text-base lg:!text-lg xl:!text-xl !leading-relaxed max-w-xl mx-auto lg:mx-0">
                        Our machine learning technology analyzes gem attributes to provide estimated price ranges, 
                        helping both buyers and sellers make informed decisions.
                      </Paragraph>
                      <Space size="middle" className="flex flex-col sm:flex-row w-full sm:w-auto justify-center lg:justify-start pt-2 sm:pt-4">
                        <Button 
                          size="large" 
                          className="bg-yellow-500 border-yellow-500 text-gray-900 hover:bg-yellow-400 font-semibold px-6 sm:px-8 h-10 sm:h-12 w-full sm:w-auto"
                          onClick={() => navigate('/marketplace')}
                        >
                          Explore Marketplace
                        </Button>
                      </Space>
                    </div>
                  </Col>
                  <Col xs={24} lg={12}>
                    <div className="relative mx-auto max-w-xs sm:max-w-sm lg:max-w-none mt-6 lg:mt-0">
                      <div className="relative z-10 bg-gradient-to-br from-blue-900/80 via-blue-800/80 to-blue-700/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] border border-blue-500/20">
                        <div className="flex items-start mb-4 sm:mb-6">
                          <div className="w-1/3 pr-2">
                            <img 
                              src="https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                              alt="Sapphire"
                              className="w-full h-auto rounded-lg"
                            />
                          </div>
                          <div className="w-2/3 pl-2">
                            <Title level={4} className="!text-white !text-sm sm:!text-base lg:!text-lg !mb-1">Blue Sapphire</Title>
                            <Text className="text-blue-200 text-xs sm:text-sm block mb-2">5.2 Carats, Ceylon Origin</Text>
                            <div className="space-x-1">
                              <Tag color="blue" className="text-xs">Corundum</Tag>
                              <Tag color="green" className="text-xs">Certified</Tag>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-900/50 to-blue-950/70 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-blue-500/20 shadow-inner">
                          <Title level={5} className="!text-blue-200 !text-xs sm:!text-sm !mb-2 sm:!mb-3 flex items-center"><span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"></span>Price Prediction</Title>                          <Row gutter={16}>
                            <Col span={12}>
                              <Statistic 
                                title={<span className="text-blue-300 text-xs">Minimum</span>}
                                value="LKR 4,785,000"
                                valueStyle={{ color: '#7dd3fc', fontSize: '0.8rem' }}
                                className="mobile-statistic"
                              />
                            </Col>
                            <Col span={12}>
                              <Statistic 
                                title={<span className="text-blue-300 text-xs">Maximum</span>}
                                value="LKR 5,544,000"
                                valueStyle={{ color: '#7dd3fc', fontSize: '0.8rem' }}
                                className="mobile-statistic"
                              />
                            </Col>
                          </Row>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge status="processing" text={<span className="text-yellow-300 text-xs">AI Generated Estimate</span>} />
                          <Text className="text-blue-200 text-xs">Confidence: High</Text>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                </div>
              </div>
              
              {/* Slide 3: Verification Process */}
              <div className="overflow-hidden">
                <div className="bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-blue-700/70 backdrop-blur-xl p-6 sm:p-8 md:p-10 lg:p-12 border border-blue-400/10">
                  
                  <Row gutter={[16, 24]} align="middle" className="min-h-[170px] sm:min-h-[190px] lg:min-h-[240px] xl:min-h-[280px] relative z-30">
                  <Col xs={24} lg={12}>
                    <div className="space-y-4 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
                      <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600/40 to-blue-400/40 backdrop-blur-xl rounded-full mb-2 border border-blue-300/30 shadow-lg">
                        <Text className="text-yellow-300 text-xs sm:text-sm font-medium tracking-wider">✦ Trust & Verification ✦</Text>
                      </div>
                      <Title level={1} className="!text-white !text-2xl sm:!text-3xl lg:!text-5xl xl:!text-6xl !font-bold !leading-tight">
                        Safety First
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 drop-shadow-md">Verified Users Only</span>
                      </Title>
                      <Paragraph className="!text-blue-100 !text-sm sm:!text-base lg:!text-lg xl:!text-xl !leading-relaxed max-w-xl mx-auto lg:mx-0">
                        GemNet verifies all buyers and sellers through identity verification, 
                        creating a secure environment for gemstone trading.
                      </Paragraph>
                      <Space size="middle" className="flex flex-col sm:flex-row w-full sm:w-auto justify-center lg:justify-start pt-2 sm:pt-4">
                        <Button 
                          size="large" 
                          className="bg-yellow-500 border-yellow-500 text-gray-900 hover:bg-yellow-400 font-semibold px-6 sm:px-8 h-10 sm:h-12 w-full sm:w-auto"
                          onClick={() => navigate('/register')}
                        >
                          Get Verified Today
                        </Button>
                      </Space>
                    </div>
                  </Col>
                  <Col xs={24} lg={12}>
                    <div className="relative mx-auto max-w-xs sm:max-w-sm lg:max-w-none mt-6 lg:mt-0">
                      <div className="relative z-10 rounded-2xl overflow-hidden shadow-[0_15px_50px_-15px_rgba(0,0,0,0.3)]">
                        <div className="bg-gradient-to-br from-blue-900/90 via-blue-800/90 to-blue-700/95 backdrop-blur-xl p-4 sm:p-6 border border-blue-400/20">
                          <div className="flex flex-col space-y-3 sm:space-y-4">
                            <div className="bg-gradient-to-r from-blue-900/60 to-blue-950/70 rounded-lg p-3 sm:p-4 flex items-center border border-blue-500/20 shadow-sm mb-2">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-700 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                                <CheckCircleOutlined className="text-white text-sm sm:text-lg" />
                              </div>
                              <div>
                                <Text className="text-white font-medium block text-sm sm:text-base">Identity Verification</Text>
                                <Text className="text-blue-200 text-xs">Government ID validation & facial recognition</Text>
                              </div>
                            </div>
                            <div className="bg-blue-950/50 rounded-lg p-4 flex items-center">
                              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-4">
                                <SafetyOutlined className="text-white text-lg" />
                              </div>
                              <div>
                                <Text className="text-white font-medium block">Secure Transactions</Text>
                                <Text className="text-blue-200 text-xs">Escrow service & buyer protection</Text>
                              </div>
                            </div>
                            <div className="bg-blue-950/50 rounded-lg p-4 flex items-center">
                              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                                <StarFilled className="text-white text-lg" />
                              </div>
                              <div>
                                <Text className="text-white font-medium block">Seller Ratings</Text>
                                <Text className="text-blue-200 text-xs">Transparent feedback system</Text>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
                </div>
              </div>
            </Carousel>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50 rounded-full filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-yellow-50 rounded-full filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>
            <Row gutter={[16, 16]} align="middle" justify="center">
              {statistics.map((stat, index) => (
                <Col xs={24} sm={8} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="text-center border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full py-5 px-4 md:py-7 md:px-6 bg-gradient-to-br from-white to-gray-50 hover:translate-y-[-5px]">
                      <div className="flex flex-col items-center space-y-2 md:space-y-3">
                        <div className="text-3xl md:text-4xl">{stat.icon}</div>
                        <Statistic 
                          value={stat.value} 
                          className="!mb-0"
                          valueStyle={{
                            fontSize: '1.5rem', 
                            fontWeight: 'bold',
                            color: '#1f2937'
                          }}
                        />
                        <Text className="text-gray-600 font-medium text-sm md:text-base">{stat.title}</Text>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </section>        {/* Featured Gemstones */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-6 sm:mb-8 lg:mb-12"
            >
              <Title level={2} className="!text-xl sm:!text-2xl lg:!text-3xl xl:!text-4xl !font-bold !text-gray-800 !mb-2 sm:!mb-3 lg:!mb-4">
                Featured Gemstones
              </Title>
              <Paragraph className="!text-sm sm:!text-base lg:!text-lg !text-gray-600 max-w-2xl mx-auto">
                Discover our handpicked collection of premium gemstones from verified sellers
              </Paragraph>
            </motion.div>            <Row gutter={[12, 16]} className="sm:gutter-16 lg:gutter-24">
              {featuredGemstones.map((gemstone, index) => (
                <Col xs={24} sm={12} lg={6} key={gemstone.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="gemstone-card-motion-wrapper h-full"
                  >                    <GemstoneCard 
                      gemstone={gemstone}
                      onViewDetails={() => handleViewDetails(gemstone.id)}
                    />
                  </motion.div>
                </Col>
              ))}
            </Row>

            <div className="text-center mt-6 sm:mt-8 lg:mt-12">
              <Button 
                size="large" 
                type="primary"
                className="bg-blue-500 border-blue-500 hover:bg-blue-600 px-6 sm:px-8 h-10 sm:h-12 font-semibold"
                onClick={() => navigate('/marketplace')}
              >
                View All Gemstones
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose GemNet */}
        <section className="py-16 md:py-28 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
            <div className="absolute top-0 left-1/3 w-64 h-64 bg-blue-50 rounded-full filter blur-3xl opacity-70"></div>
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-yellow-50 rounded-full filter blur-3xl opacity-70"></div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-16"
            >
              <Title level={2} className="!text-2xl sm:!text-3xl lg:!text-5xl !font-bold !text-gray-800 !mb-3 md:!mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Why Choose</span> GemNet
              </Title>
              <Paragraph className="!text-base md:!text-lg !text-gray-600 max-w-2xl mx-auto">
                GemNet provides a secure, transparent marketplace for authentic gemstones
              </Paragraph>
            </motion.div>

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} lg={6}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="feature-card h-full text-center border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] bg-gradient-to-br from-white to-gray-50">
                    <div className="flex flex-col items-center space-y-2 md:space-y-4 p-3 md:p-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-md">
                        <CheckCircleOutlined className="text-blue-500 text-xl md:text-2xl" />
                      </div>
                      <Title level={4} className="!mb-1 md:!mb-2 !text-base md:!text-lg font-bold">Verified Authentication</Title>
                      <Text className="text-gray-600 text-center text-sm md:text-base">
                        Every gemstone undergoes rigorous authentication by certified gemologists
                      </Text>
                    </div>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <Card className="feature-card h-full text-center border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] bg-gradient-to-br from-white to-gray-50">
                    <div className="flex flex-col items-center space-y-2 md:space-y-4 p-3 md:p-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center shadow-md">
                        <GlobalOutlined className="text-green-500 text-xl md:text-2xl" />
                      </div>
                      <Title level={4} className="!mb-1 md:!mb-2 !text-base md:!text-lg font-bold">Global Marketplace</Title>
                      <Text className="text-gray-600 text-center text-sm md:text-base">
                        Connect with buyers and sellers from over 45 countries worldwide
                      </Text>
                    </div>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Card className="feature-card h-full text-center border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] bg-gradient-to-br from-white to-gray-50">
                    <div className="flex flex-col items-center space-y-2 md:space-y-4 p-3 md:p-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center shadow-md">
                        <ShopOutlined className="text-purple-500 text-xl md:text-2xl" />
                      </div>
                      <Title level={4} className="!mb-1 md:!mb-2 !text-base md:!text-lg font-bold">Premium Selection</Title>
                      <Text className="text-gray-600 text-center text-sm md:text-base">
                        Access to the finest gemstones sourced directly from mines and collectors
                      </Text>
                    </div>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} sm={12} lg={6}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                >
                  <Card className="feature-card h-full text-center border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px] bg-gradient-to-br from-white to-gray-50">
                    <div className="flex flex-col items-center space-y-2 md:space-y-4 p-3 md:p-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                        <SafetyOutlined className="text-white text-xl md:text-2xl" />
                      </div>
                      <Title level={4} className="!mb-1 md:!mb-2 !text-base md:!text-lg font-bold">Secure Transactions</Title>
                      <Text className="text-gray-600 text-center text-sm md:text-base">
                        Escrow services and payment protection for all marketplace transactions
                      </Text>
                    </div>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </div>
        </section>

        {/* How GemNet Works */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-16"
            >
              <Title level={2} className="!text-white !text-2xl sm:!text-3xl lg:!text-5xl !font-bold !mb-3 md:!mb-4 drop-shadow-md">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">How GemNet Works</span>
              </Title>
              <Paragraph className="!text-blue-100 !text-base md:!text-lg max-w-2xl mx-auto">
                Simple, secure, and transparent gemstone trading
              </Paragraph>
            </motion.div>

            <Row gutter={[24, 32]} align="middle">
              <Col xs={24} md={8}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="text-center md:text-left"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4 md:mb-6 shadow-lg shadow-yellow-500/30 relative">
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-700 rounded-full text-white flex items-center justify-center text-xs font-bold">1</span>
                    <UserAddOutlined className="text-blue-800 text-2xl md:text-3xl" />
                  </div>
                  <Title level={3} className="!text-white !mb-2 md:!mb-4 !text-lg md:!text-xl">Join the Network</Title>
                  <Paragraph className="!text-blue-100 !text-sm md:!text-lg">
                    Create an account as a buyer or seller and verify your identity
                  </Paragraph>
                </motion.div>
              </Col>

              <Col xs={24} md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg shadow-yellow-500/30 relative">
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-700 rounded-full text-white flex items-center justify-center text-xs font-bold">2</span>
                    <SearchOutlined className="text-blue-800 text-2xl md:text-3xl" />
                  </div>
                  <Title level={3} className="!text-white !mb-2 md:!mb-4 !text-lg md:!text-xl">Browse or List Gems</Title>
                  <Paragraph className="!text-blue-100 !text-sm md:!text-lg">
                    Explore verified gemstones or list your own for certification
                  </Paragraph>
                </motion.div>
              </Col>

              <Col xs={24} md={8}>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-center md:text-right"
                >
                  <div className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto md:ml-auto md:mr-0 mb-4 md:mb-6 shadow-lg shadow-yellow-500/30 relative">
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-700 rounded-full text-white flex items-center justify-center text-xs font-bold">3</span>
                    <SafetyOutlined className="text-blue-800 text-2xl md:text-3xl" />
                  </div>
                  <Title level={3} className="!text-white !mb-2 md:!mb-4 !text-lg md:!text-xl">Secure Transactions</Title>
                  <Paragraph className="!text-blue-100 !text-sm md:!text-lg">
                    Complete purchases through our secure escrow system
                  </Paragraph>
                </motion.div>
              </Col>
            </Row>

            <div className="text-center mt-8 md:mt-12">
              <Button 
                size="large"
                className="bg-yellow-500 border-yellow-500 text-blue-800 hover:bg-yellow-400 font-semibold px-6 md:px-8 h-10 md:h-12"
                onClick={() => navigate('/register')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-28 bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-blue-100 to-transparent rounded-full filter blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-l from-yellow-100 to-transparent rounded-full filter blur-3xl opacity-50"></div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-8 md:mb-16"
            >              <Title level={2} className="!text-2xl sm:!text-3xl lg:!text-5xl !font-bold !text-gray-800 !mb-3 md:!mb-4">
                What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Members Say</span>
              </Title>
              <Paragraph className="!text-base md:!text-lg !text-gray-600 max-w-2xl mx-auto">
                Join thousands of satisfied members in our growing gemstone community
              </Paragraph>
            </motion.div>

            <Row gutter={[16, 24]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} sm={12} md={8} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >                    <Card className="testimonial-card h-full border-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50 hover:translate-y-[-5px] overflow-hidden">
                      <div className="flex flex-col items-center text-center space-y-3 md:space-y-4 pt-4 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-md">
                          <UserOutlined className="text-blue-600 text-2xl" />
                        </div>                        <div>
                          <Title level={4} className="!mb-0 md:!mb-1 !text-lg md:!text-xl">{testimonial.name}</Title>
                          <Text className="text-gray-600 text-sm md:text-base">{testimonial.role}</Text>
                        </div>
                        <Rate disabled defaultValue={testimonial.rating} className="text-yellow-500 text-sm md:text-base" />                        <div className="bg-white p-6 rounded-xl border border-blue-100 mt-4 shadow-sm relative">
                          <div className="absolute -top-2 left-6 w-4 h-4 bg-white transform rotate-45 border-l border-t border-blue-100"></div>
                          <Paragraph className="!text-gray-700 italic text-sm md:text-base leading-relaxed mb-0 relative">
                            <span className="text-blue-400 text-2xl absolute -top-2 -left-2">"</span>
                            {testimonial.comment}
                            <span className="text-blue-400 text-2xl">"</span>
                          </Paragraph>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-4 md:space-y-8"
            >
              <Title level={2} className="!text-white !text-2xl sm:!text-3xl lg:!text-6xl !font-bold drop-shadow-lg">
                Ready to Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">GemNet?</span>
              </Title>
              <Paragraph className="!text-blue-100 !text-base md:!text-lg lg:!text-xl max-w-2xl mx-auto">
                Start buying and selling authentic gemstones in a secure digital marketplace
              </Paragraph>
              <Space size="middle" className="flex flex-col sm:flex-row justify-center">
                <Button 
                  size="large"
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 border-0 text-blue-800 hover:from-amber-400 hover:to-yellow-400 font-bold px-10 md:px-12 h-14 md:h-16 w-full sm:w-auto rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center space-x-2 transition-all"
                  onClick={() => navigate('/register')}
                >
                  <span>Create Account</span>
                  <span>✨</span>
                </Button>
                <Button 
                  size="large"
                  ghost
                  className="border-2 border-white/60 text-white hover:bg-white hover:text-blue-700 font-bold px-10 md:px-12 h-14 md:h-16 w-full sm:w-auto rounded-xl shadow-lg hover:shadow-xl backdrop-blur-sm transition-all"
                  onClick={() => navigate('/marketplace')}
                >
                  Learn More
                </Button>
              </Space>
            </motion.div>
          </div>
        </section>      </Content>      
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
    </AntLayout>
  );
};

export default HomePage;
