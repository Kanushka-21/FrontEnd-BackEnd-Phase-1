import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';

interface HeroSectionProps {
  onExploreClick: () => void;
  onStartSellingClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreClick,
  onStartSellingClick,
}) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary-800 to-primary-600 overflow-hidden">
      {/* White overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-10" />

      {/* Floating gemstone animations */}
      <FloatingGems />

      <div className="relative z-10 container mx-auto px-4 h-screen flex flex-col items-center justify-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-3xl"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Welcome to GemNet
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white text-opacity-90">
            Sri Lanka's Premier Digital Gemstone Marketplace
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={onExploreClick}
              className="bg-white text-primary-600 hover:bg-secondary-50 shadow-lg"
            >
              Explore Marketplace
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onStartSellingClick}
              className="border-white text-white hover:bg-white hover:bg-opacity-10"
            >
              Start Selling
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <motion.div
              whileHover={{ y: -5 }}
              className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3"
            >
              <ShieldCheck className="w-5 h-5 mr-2" />
              <span className="font-medium">Verified Dealers</span>
            </motion.div>
            <motion.div
              whileHover={{ y: -5 }}
              className="flex items-center bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3"
            >
              <Lock className="w-5 h-5 mr-2" />
              <span className="font-medium">Secure Transactions</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
      >
        <div className="w-8 h-12 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </div>
  );
};

// Floating gem animations component
const FloatingGems: React.FC = () => {
  const gems = [
    { id: 1, size: 'w-16 h-16', color: 'bg-blue-300', delay: 0 },
    { id: 2, size: 'w-12 h-12', color: 'bg-primary-400', delay: 0.5 },
    { id: 3, size: 'w-24 h-24', color: 'bg-blue-200', delay: 1 },
    { id: 4, size: 'w-10 h-10', color: 'bg-primary-300', delay: 1.5 },
    { id: 5, size: 'w-20 h-20', color: 'bg-blue-400', delay: 2 },
    { id: 6, size: 'w-16 h-16', color: 'bg-primary-200', delay: 2.5 },
    { id: 7, size: 'w-8 h-8', color: 'bg-blue-500', delay: 3 },
  ];

  return (
    <>
      {gems.map((gem) => (
        <motion.div
          key={gem.id}
          className={`absolute opacity-20 ${gem.size} ${gem.color} rounded-lg`}
          style={{
            left: `${Math.random() * 85 + 5}%`,
            top: `${Math.random() * 60 + 20}%`,
          }}
          animate={{
            x: [0, Math.random() * 40 - 20, 0],
            y: [0, Math.random() * 40 - 20, 0],
            rotate: [0, Math.random() * 60 - 30, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: gem.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
};

export default HeroSection;
