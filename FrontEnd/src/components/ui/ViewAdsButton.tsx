import React, { useState } from 'react';
import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface ViewAdsButtonProps {
  visible: boolean;
  onClick: () => void;
}

const ViewAdsButton: React.FC<ViewAdsButtonProps> = ({ visible, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed top-20 right-6 z-50"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            animate={{ 
              x: [-8, 0, -8],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex items-center space-x-2"
          >
            {/* Hover text that appears on the left */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-800 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap shadow-lg"
                >
                  View Advertisements
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button
              type="primary"
              size="large"
              shape="circle"
              icon={<LeftOutlined />}
              onClick={onClick}
              className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 w-12 h-12 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                fontSize: '16px',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ViewAdsButton;
