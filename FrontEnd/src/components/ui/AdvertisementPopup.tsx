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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when advertisement changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [advertisement]);

  if (!advertisement) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      (prev + 1) % advertisement.images.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? advertisement.images.length - 1 : prev - 1
    );
  };

  // Format image URL
  const formatImageUrl = (imagePath: string): string => {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const fileName = imagePath.split('/').pop() || imagePath.split('\\').pop();
    return `http://localhost:9092/uploads/advertisement-images/${fileName}`;
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
              {/* Image Section */}
              <div className="flex-1 relative">
                {advertisement.images && advertisement.images.length > 0 ? (
                  <div className="relative">
                    <Image
                      src={formatImageUrl(advertisement.images[currentImageIndex])}
                      alt={advertisement.title}
                      width="100%"
                      height={300}
                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                      preview={false}
                    />
                    
                    {/* Image Navigation */}
                    {advertisement.images.length > 1 && (
                      <>
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<LeftOutlined />}
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 border-0 text-white hover:bg-opacity-70"
                          style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}
                        />
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<RightOutlined />}
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 border-0 text-white hover:bg-opacity-70"
                          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                        />
                        
                        {/* Image Indicators */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {advertisement.images.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Text type="secondary">No Image Available</Text>
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
