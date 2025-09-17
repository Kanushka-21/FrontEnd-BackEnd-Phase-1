import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Card, Image, Typography, Tag, Space, Carousel } from 'antd';
import { CloseOutlined, PhoneOutlined, MailOutlined, LeftOutlined, RightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  mobileNo: string;
  email: string;
  images: string[];
  video?: string; // Optional video URL
  approved: boolean;
  createdOn: string;
}

interface HomepageAdPopupProps {
  advertisements: Advertisement[];
  onClose: () => void;
  onFirstClose?: () => void; // Called when popup is closed for the first time
  shouldShow?: boolean; // External control for showing popup
}

const HomepageAdPopup: React.FC<HomepageAdPopupProps> = ({
  advertisements,
  onClose,
  onFirstClose,
  shouldShow = false
}) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0); // Changed from currentImageIndex
  const [visible, setVisible] = useState(false);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null); // Ref to control video playback

  // Helper function to create media array (video first, then images)
  const createMediaArray = (ad: Advertisement) => {
    const media: Array<{ type: 'video' | 'image'; url: string }> = [];
    
    // Add video first if available
    if (ad.video) {
      // Format video URL to use full backend URL
      const videoUrl = ad.video.startsWith('http') 
        ? ad.video 
        : `http://localhost:8080/advertisements/videos/${ad.video}`;
      media.push({ type: 'video', url: videoUrl });
      console.log('📹 Video added to media array:', videoUrl);
    }
    
    // Add images after video
    ad.images.forEach(image => {
      media.push({ type: 'image', url: image });
    });
    
    console.log('🎬 Media array created:', media.length, 'items');
    return media;
  };

  // Show popup after a short delay when advertisements are available
  useEffect(() => {
    console.log('🎯 HomepageAdPopup received advertisements:', advertisements.length);
    
    if (advertisements.length > 0) {
      console.log('⏰ Setting timer to show advertisement popup in 500ms...');
      const timer = setTimeout(() => {
        console.log('✨ Showing advertisement popup now!');
        setVisible(true);
      }, 500); // Show popup after 500ms for faster loading

      return () => clearTimeout(timer);
    } else {
      console.log('❌ No advertisements to show');
    }
  }, [advertisements]);

  // Show popup immediately when shouldShow is true
  useEffect(() => {
    if (shouldShow && advertisements.length > 0) {
      console.log('🔄 Reopening advertisement popup via shouldShow prop');
      setVisible(true);
    }
  }, [shouldShow, advertisements.length]);

  // Reset media index when advertisement changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [currentAdIndex]);

  // Stop video when switching media or when modal becomes invisible
  useEffect(() => {
    if (!visible && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      console.log('🛑 Video stopped due to modal close');
    }
  }, [visible]);

  // Stop video when switching to different media
  useEffect(() => {
    if (videoRef.current && currentMedia?.type !== 'video') {
      videoRef.current.pause();
      console.log('🛑 Video stopped due to media switch');
    }
  }, [currentMediaIndex]);

  console.log('🔍 HomepageAdPopup render - advertisements length:', advertisements.length, 'visible:', visible);

  if (!advertisements.length) {
    console.log('🚫 HomepageAdPopup returning null - no advertisements');
    return null;
  }

  const currentAd = advertisements[currentAdIndex];
  const mediaArray = createMediaArray(currentAd);
  const currentMedia = mediaArray[currentMediaIndex];

  const handleClose = () => {
    // Stop video playback if video is currently playing
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset video to beginning
      console.log('🛑 Video stopped and reset');
    }
    
    setVisible(false);
    
    // If this is the first time closing, call onFirstClose
    if (!hasBeenClosed && onFirstClose) {
      setHasBeenClosed(true);
      onFirstClose();
    }
    
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % advertisements.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => 
      prev === 0 ? advertisements.length - 1 : prev - 1
    );
  };

  const nextMedia = () => {
    setCurrentMediaIndex((prev) => 
      (prev + 1) % mediaArray.length
    );
  };

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => 
      prev === 0 ? mediaArray.length - 1 : prev - 1
    );
  };

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={800}
      centered
      className="advertisement-popup"
      styles={{
        body: { padding: 0, overflow: 'hidden' },
        mask: { backdropFilter: 'blur(4px)' }
      }}
      closable={false}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative bg-gradient-to-br from-white to-gray-50 rounded-lg overflow-hidden"
          >
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white relative">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold mb-1">🎯 Featured Advertisement</h4>
                  <p className="text-blue-100 text-sm">Limited Time Offer - Don't Miss Out!</p>
                </div>
                <div className="text-right">
                  {advertisements.length > 1 && (
                    <div className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium mb-2">
                      {currentAdIndex + 1} of {advertisements.length}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Close Button */}
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 border-0 rounded-full w-8 h-8 flex items-center justify-center"
                size="small"
              />
            </div>

            {/* Main Content - Horizontal Layout */}
            <div className="flex flex-col md:flex-row">
              {/* Media Section */}
              <div className="md:w-1/2 relative bg-gray-100">
                {mediaArray.length > 0 ? (
                  <div className="relative group">
                    <div className="aspect-square overflow-hidden">
                      {currentMedia?.type === 'video' ? (
                        <video
                          ref={videoRef}
                          src={currentMedia.url}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                          controls
                          onLoadStart={() => console.log('🎬 Video loading started:', currentMedia.url)}
                          onCanPlay={() => console.log('▶️ Video can play:', currentMedia.url)}
                          onError={(e) => console.error('❌ Video error:', e, currentMedia.url)}
                          onPause={() => console.log('⏸️ Video paused')}
                          onPlay={() => console.log('▶️ Video playing')}
                          style={{ maxWidth: '100%', maxHeight: '100%' }}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <Image
                          src={currentMedia?.url || ''}
                          alt={currentAd.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                        />
                      )}
                      
                      {/* Sale Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold transform -rotate-12 shadow-lg">
                          {currentMedia?.type === 'video' ? '🎬 VIDEO!' : 'HOT DEAL!'}
                        </div>
                      </div>
                    </div>

                    {/* Media Navigation */}
                    {mediaArray.length > 1 && (
                      <>
                        <Button
                          type="text"
                          icon={<LeftOutlined />}
                          onClick={prevMedia}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        <Button
                          type="text"
                          icon={<RightOutlined />}
                          onClick={nextMedia}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-10 h-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        />

                        {/* Media Dots */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                          <div className="flex space-x-2">
                            {mediaArray.map((media, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentMediaIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentMediaIndex 
                                    ? 'bg-white scale-125' 
                                    : 'bg-white/60 hover:bg-white/80'
                                }`}
                                title={media.type === 'video' ? '🎬 Video' : '📷 Image'}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">📷</div>
                      <Text>No Media Available</Text>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Details Section */}
              <div className="md:w-1/2 p-6 flex flex-col justify-between">
                <div>
                  {/* Category & Title */}
                  <div className="mb-4">
                    <Tag color="processing" className="mb-2 px-3 py-1 text-xs uppercase tracking-wide">
                      {currentAd.category}
                    </Tag>
                    <Title level={2} className="mb-2 text-gray-800 leading-tight">
                      {currentAd.title}
                    </Title>
                  </div>

                  {/* Price with original price effect */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-3">
                      <Text className="text-3xl font-bold text-green-600">
                        {currentAd.price}
                      </Text>
                      <Text className="text-lg text-gray-400 line-through">
                        {/* Simulate original price */}
                        {currentAd.price.replace(/[\d.]/g, (d) => String(Math.min(9, parseInt(d) + 2)))}
                      </Text>
                      <Tag color="volcano" className="font-semibold">
                        25% OFF
                      </Tag>
                    </div>
                    <Text className="text-sm text-green-600 font-medium">
                      💰 Best Price Guaranteed • Free Shipping Available
                    </Text>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <Paragraph 
                      className="text-gray-600 leading-relaxed" 
                      ellipsis={{ 
                        rows: 3, 
                        expandable: true, 
                        symbol: '• Show more details' 
                      }}
                    >
                      {currentAd.description}
                    </Paragraph>
                  </div>

                  {/* Key Features */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircleOutlined />
                        <span>Verified Seller</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircleOutlined />
                        <span>Quality Guaranteed</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircleOutlined />
                        <span>Secure Payment</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircleOutlined />
                        <span>Fast Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Action Section */}
                <div>
                  {/* Contact Info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <Title level={5} className="mb-2 text-blue-800">
                      💬 Contact Seller
                    </Title>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <PhoneOutlined className="text-blue-500" />
                        <Text copyable={{ text: currentAd.mobileNo }} className="text-blue-700 font-medium">
                          {currentAd.mobileNo}
                        </Text>
                      </div>
                      <div className="flex items-center gap-2">
                        <MailOutlined className="text-blue-500" />
                        <Text copyable={{ text: currentAd.email }} className="text-sm text-blue-700">
                          {currentAd.email}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Button
                        type="primary"
                        size="large"
                        href={`tel:${currentAd.mobileNo}`}
                        icon={<PhoneOutlined />}
                        className="flex-1 bg-green-600 hover:bg-green-700 border-green-600 font-semibold h-12"
                      >
                        📞 Call Now
                      </Button>
                      
                      <Button
                        size="large"
                        href={`mailto:${currentAd.email}?subject=Interested in ${currentAd.title}`}
                        icon={<MailOutlined />}
                        className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold h-12"
                      >
                        ✉️ Email
                      </Button>
                    </div>

                    {/* Advertisement Navigation */}
                    {advertisements.length > 1 && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={prevAd} 
                          className="flex-1 border-gray-300 text-gray-600 hover:border-gray-400"
                          icon={<LeftOutlined />}
                        >
                          Previous
                        </Button>
                        <Button 
                          onClick={nextAd}
                          className="flex-1 border-gray-300 text-gray-600 hover:border-gray-400"
                          icon={<RightOutlined />}
                        >
                          Next
                        </Button>
                      </div>
                    )}

                    {/* Dismiss Button */}
                    <Button 
                      onClick={handleClose} 
                      className="w-full border-0 text-gray-500 hover:text-gray-700 bg-transparent hover:bg-gray-100"
                      type="text"
                    >
                      Maybe Later • Continue Browsing
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default HomepageAdPopup;
