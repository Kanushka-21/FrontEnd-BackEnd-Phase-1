import React, { useState, useEffect } from 'react';
import { Modal, Button, Image, Typography, Tag, Space } from 'antd';
import { CloseOutlined, LeftOutlined, RightOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
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
  video?: string; // Optional video field
  approved: boolean;
  createdOn: string;
}

interface AdvertisementPopupProps {
  visible: boolean;
  advertisement: Advertisement | null;
  onClose: () => void;
}

const AdvertisementPopup: React.FC<AdvertisementPopupProps> = ({
  visible,
  advertisement,
  onClose
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Reset media index when advertisement changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [advertisement]);

  if (!advertisement) return null;

  // Create media array with video first (if exists), then images
  const mediaItems = [];
  if (advertisement.video) {
    mediaItems.push({ type: 'video', url: advertisement.video });
  }
  if (advertisement.images && advertisement.images.length > 0) {
    advertisement.images.forEach(image => {
      mediaItems.push({ type: 'image', url: image });
    });
  }

  console.log('Advertisement data:', advertisement);
  console.log('Media items:', mediaItems);
  console.log('Current media index:', currentMediaIndex);
  console.log('Current media:', mediaItems[currentMediaIndex]);

  const nextMedia = () => {
    if (mediaItems.length > 1) {
      setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length);
    }
  };

  const prevMedia = () => {
    if (mediaItems.length > 1) {
      setCurrentMediaIndex((prev) => 
        prev === 0 ? mediaItems.length - 1 : prev - 1
      );
    }
  };

  const currentMedia = mediaItems[currentMediaIndex];

  // Format image URL
  const formatImageUrl = (imagePath: string): string => {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const fileName = imagePath.split('/').pop() || imagePath.split('\\').pop();
    return `http://localhost:9092/uploads/advertisement-images/${fileName}`;
  };

  // Format video URL
  const formatVideoUrl = (videoPath: string): string => {
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
      console.log('Video URL (already formatted):', videoPath);
      return videoPath;
    }
    const fileName = videoPath.split('/').pop() || videoPath.split('\\').pop();
    const formattedUrl = `http://localhost:9092/uploads/advertisement-videos/${fileName}`;
    console.log('Video URL (formatted):', formattedUrl, 'from path:', videoPath);
    return formattedUrl;
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
      closable={false}
      className="advertisement-popup"
      maskClosable={true}
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Close Button */}
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full w-8 h-8 flex items-center justify-center"
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}
            />

            <div className="flex flex-col md:flex-row gap-6">
              {/* Media Section - Video First Slideshow */}
              <div className="flex-1 relative">
                {mediaItems.length > 0 ? (
                  <div className="relative">
                    {currentMedia?.type === 'video' ? (
                      <video
                        key={currentMedia.url}
                        src={formatVideoUrl(currentMedia.url)}
                        autoPlay
                        muted
                        loop
                        controls
                        playsInline
                        preload="metadata"
                        width="100%"
                        height={300}
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                        className="w-full"
                        onLoadStart={() => console.log('Video loading started')}
                        onCanPlay={() => console.log('Video can play')}
                        onPlay={() => console.log('Video started playing')}
                        onError={(e) => console.error('Video error:', e)}
                        onLoadedData={() => console.log('Video data loaded')}
                      />
                    ) : currentMedia?.type === 'image' ? (
                      <Image
                        src={formatImageUrl(currentMedia.url)}
                        alt={advertisement.title}
                        width="100%"
                        height={300}
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                        preview={false}
                      />
                    ) : null}
                    
                    {/* Navigation Controls */}
                    {mediaItems.length > 1 && (
                      <>
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<LeftOutlined />}
                          onClick={prevMedia}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 border-0 text-white hover:bg-opacity-70"
                          style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<RightOutlined />}
                          onClick={nextMedia}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 border-0 text-white hover:bg-opacity-70"
                          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                        />
                        
                        {/* Media Indicators */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {mediaItems.map((media, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                                index === currentMediaIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                              }`}
                              onClick={() => setCurrentMediaIndex(index)}
                              title={media.type === 'video' ? 'Video' : `Image ${advertisement.images ? index - (advertisement.video ? 1 : 0) + 1 : index + 1}`}
                            />
                          ))}
                        </div>

                        {/* Media Type Indicator */}
                        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {currentMedia?.type === 'video' ? 'Video' : `Image ${currentMediaIndex - (advertisement.video ? 1 : 0) + 1}/${advertisement.images?.length || 0}`}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Text type="secondary">No Media Available</Text>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="flex-1">
                <div className="space-y-4">
                  {/* Category Tag */}
                  <Tag color="blue" className="mb-2">
                    {advertisement.category}
                  </Tag>

                  {/* Title */}
                  <Title level={3} className="mb-2 text-gray-800">
                    {advertisement.title}
                  </Title>

                  {/* Price */}
                  <div className="mb-4">
                    <Text className="text-2xl font-bold text-green-600">
                      {advertisement.price}
                    </Text>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <Paragraph className="text-gray-600">
                      {advertisement.description}
                    </Paragraph>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <Title level={5} className="mb-2 text-gray-800">
                      Contact Information
                    </Title>
                    
                    <Space direction="vertical" size="small">
                      <div className="flex items-center gap-2">
                        <PhoneOutlined className="text-blue-500" />
                        <Text copyable className="text-gray-700">
                          {advertisement.mobileNo}
                        </Text>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MailOutlined className="text-blue-500" />
                        <Text copyable className="text-gray-700">
                          {advertisement.email}
                        </Text>
                      </div>
                    </Space>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6">
                    <Button
                      type="primary"
                      size="large"
                      href={`tel:${advertisement.mobileNo}`}
                      icon={<PhoneOutlined />}
                      className="flex-1"
                    >
                      Call Now
                    </Button>
                    
                    <Button
                      size="large"
                      href={`mailto:${advertisement.email}?subject=Interested in ${advertisement.title}`}
                      icon={<MailOutlined />}
                      className="flex-1"
                    >
                      Email
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

export default AdvertisementPopup;
