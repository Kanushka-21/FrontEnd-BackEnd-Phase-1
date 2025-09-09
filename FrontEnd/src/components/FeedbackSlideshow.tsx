import React, { useState, useEffect } from 'react';
import { Card, Rate, Carousel, Spin, Alert, Typography } from 'antd';
import { StarFilled, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';

const { Text, Paragraph } = Typography;

interface Feedback {
  id: string;
  name: string;
  title: string;
  message: string;
  rating: number;
  created_at: string;
  from_role: string;
  to_role: string;
}

interface FeedbackSlideshowProps {
  autoplay?: boolean;
  showTitle?: boolean;
  limit?: number;
  className?: string;
}

const FeedbackSlideshow: React.FC<FeedbackSlideshowProps> = ({
  autoplay = true,
  showTitle = true,
  limit = 20,
  className = ""
}) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy fallback data that matches the existing testimonial structure
  const dummyFeedbacks: Feedback[] = [
    {
      id: "dummy1",
      name: "Rajesh Kumar",
      title: "Gemstone Collector",
      message: "GemNet has completely transformed how I buy gemstones. The face verification gives me confidence that I'm dealing with genuine sellers, and the quality of gems I've purchased has been exceptional.",
      rating: 5,
      created_at: new Date().toISOString(),
      from_role: "BUYER",
      to_role: "SELLER"
    },
    {
      id: "dummy2",
      name: "Priya Mendis",
      title: "Jewelry Designer",
      message: "As a jewelry designer, finding authentic, high-quality gemstones is crucial for my work. GemNet's verification system and detailed gem listings have made sourcing materials so much easier and more reliable.",
      rating: 5,
      created_at: new Date().toISOString(),
      from_role: "BUYER",
      to_role: "SELLER"
    },
    {
      id: "dummy3",
      name: "Sunil Jayasinghe",
      title: "Gemstone Dealer",
      message: "The platform has opened up new markets for my gemstone business. The face verification builds trust with international buyers, and the secure transaction system gives everyone peace of mind.",
      rating: 5,
      created_at: new Date().toISOString(),
      from_role: "SELLER",
      to_role: "BUYER"
    },
    {
      id: "dummy4",
      name: "Amanda Silva",
      title: "Gemstone Enthusiast",
      message: "I love how transparent the entire process is. From verification to purchase, everything is clear and secure. The gem certificates and detailed descriptions help me make informed decisions.",
      rating: 4,
      created_at: new Date().toISOString(),
      from_role: "BUYER",
      to_role: "SELLER"
    },
    {
      id: "dummy5",
      name: "Michael Fernando",
      title: "Gem Trader",
      message: "The bidding system is fantastic! It's created a fair marketplace where the best gems get the recognition they deserve. The countdown timers add excitement to the process.",
      rating: 5,
      created_at: new Date().toISOString(),
      from_role: "BUYER",
      to_role: "SELLER"
    }
  ];

  useEffect(() => {
    fetchFeedbacks();
  }, [limit]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the API service to fetch feedbacks for homepage
      const result = await api.getFeedbacksForHomepage(limit);
      
      if (result.success && result.data && Array.isArray(result.data)) {
        if (result.data.length > 0) {
          setFeedbacks(result.data);
          console.log(`✅ Loaded ${result.data.length} real feedbacks from database`);
        } else {
          // Fallback to dummy data if no real feedbacks exist
          setFeedbacks(dummyFeedbacks);
          console.log('📝 No real feedbacks found, using dummy feedbacks as fallback');
        }
      } else {
        // Fallback to dummy data if response format is unexpected
        setFeedbacks(dummyFeedbacks);
        console.log('⚠️ Unexpected response format, using dummy feedbacks');
        console.log('Response:', result);
      }
    } catch (error) {
      console.error('❌ Error fetching feedbacks:', error);
      setError('Failed to load testimonials');
      // Fallback to dummy data on error
      setFeedbacks(dummyFeedbacks);
      console.log('🔄 Using dummy feedbacks due to error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className={`text-center p-8 ${className}`}>
        {showTitle && (
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            What Our Members Say
          </h2>
        )}
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Loading testimonials...</p>
      </div>
    );
  }

  if (error && feedbacks.length === 0) {
    return (
      <div className={`text-center p-8 ${className}`}>
        {showTitle && (
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            What Our Members Say
          </h2>
        )}
        <Alert
          message="Unable to load testimonials"
          description="Please try again later"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className={`py-12 ${className}`}>
      {showTitle && (
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center text-gray-900 mb-12"
        >
          What Our Members Say
          <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded"></div>
        </motion.h2>
      )}
      
      <div className="max-w-6xl mx-auto px-4">
        <Carousel
          autoplay={autoplay}
          autoplaySpeed={5000}
          dots={true}
          infinite={true}
          slidesToShow={3}
          slidesToScroll={1}
          responsive={[
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1,
              }
            },
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1,
              }
            }
          ]}
          className="feedback-carousel"
        >
          {feedbacks.map((feedback, index) => (
            <div key={feedback.id} className="px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="h-auto min-h-[280px] shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50"
                  bodyStyle={{ padding: '24px' }}
                >
                  <div className="flex flex-col h-full">
                    {/* Rating */}
                    <div className="mb-4">
                      <Rate 
                        disabled 
                        defaultValue={feedback.rating} 
                        className="text-yellow-500"
                        character={<StarFilled className="text-lg" />}
                      />
                    </div>
                    
                    {/* Message */}
                    <div className="flex-1 mb-6">
                      <Paragraph 
                        className="text-gray-700 text-base italic leading-relaxed mb-0"
                        ellipsis={{ rows: 4, expandable: false }}
                      >
                        "{feedback.message}"
                      </Paragraph>
                    </div>
                    
                    {/* Author Info */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <UserOutlined className="text-blue-600 text-lg" />
                          </div>
                          <div>
                            <Text className="font-semibold text-gray-900 block">
                              {feedback.name}
                            </Text>
                            <Text className="text-sm text-blue-600">
                              {feedback.title}
                            </Text>
                          </div>
                        </div>
                        
                        {/* Date */}
                        <div className="text-right">
                          <div className="flex items-center text-gray-500 text-xs">
                            <ClockCircleOutlined className="mr-1" />
                            {formatDate(feedback.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          ))}
        </Carousel>
      </div>
      
      {/* Statistics */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8"
      >
        <Text className="text-gray-600">
          Showing {feedbacks.length} of our member testimonials
        </Text>
        {feedbacks.length > 0 && (
          <div className="flex justify-center items-center mt-2 space-x-4">
            <div className="flex items-center">
              <Rate disabled defaultValue={5} className="text-yellow-500 text-sm" />
              <Text className="ml-2 text-sm text-gray-600">
                Average: {(feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)} stars
              </Text>
            </div>
          </div>
        )}
      </motion.div>

      {/* Custom styles for the carousel */}
      <style jsx global>{`
        .feedback-carousel .slick-dots {
          bottom: -50px;
        }
        
        .feedback-carousel .slick-dots li button {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #d1d5db;
        }
        
        .feedback-carousel .slick-dots li.slick-active button {
          background: #2563eb;
        }
        
        .feedback-carousel .slick-prev,
        .feedback-carousel .slick-next {
          width: 40px;
          height: 40px;
          z-index: 1;
        }
        
        .feedback-carousel .slick-prev:before,
        .feedback-carousel .slick-next:before {
          font-size: 20px;
          color: #2563eb;
        }
        
        .feedback-carousel .slick-prev {
          left: -50px;
        }
        
        .feedback-carousel .slick-next {
          right: -50px;
        }
      `}</style>
    </div>
  );
};

export default FeedbackSlideshow;