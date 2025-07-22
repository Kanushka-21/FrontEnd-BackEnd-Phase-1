import React from 'react';
import { motion } from 'framer-motion';
import { Gem, Shield, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import { GemstoneCardProps } from '@/types';

// Helper function to format price in LKR
const formatLKR = (price: number) => {
  return new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const GemstoneCard: React.FC<GemstoneCardProps> = ({ gemstone, onViewDetails }) => {
  const [imageError, setImageError] = React.useState(false);

  const handleViewClick = () => {
    console.log('View details clicked for gemstone:', gemstone.id);
    if (onViewDetails) {
      onViewDetails(gemstone.id);
    }
  };

  const handleImageError = () => {
    console.error('❌ Failed to load image:', gemstone.image);
    console.error('🔍 Gemstone data:', gemstone);
    console.error('🔍 Gemstone ID:', gemstone.id);
    console.error('🔍 All images available:', gemstone.images);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', gemstone.image);
    console.log('🔍 Gemstone:', gemstone.name);
    setImageError(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.15), 0 4px 10px -5px rgba(59, 130, 246, 0.1)',
        borderColor: '#93c5fd'
      }}
      className="bg-white rounded-lg overflow-hidden border border-secondary-200 transition-all duration-300"
    >      <div className="relative overflow-hidden h-40 sm:h-48 bg-gray-100">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Gem className="w-8 h-8 mb-2" />
            <span className="text-xs text-center">{gemstone.name || 'Image Not Available'}</span>
          </div>
        ) : (
          <motion.img
            src={gemstone.image}
            alt={gemstone.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
        {gemstone.certified && (
          <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">Certified</span>
            <span className="sm:hidden">✓</span>
          </div>
        )}
      </div>
        <div className="p-3 sm:p-4">
        <div className="flex items-center space-x-2">
          <Gem className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-primary-800 text-sm sm:text-base line-clamp-1">{gemstone.name}</h3>
        </div>
        
        <div className="mt-2 space-y-1 sm:space-y-2">
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-secondary-800">
            {formatLKR(gemstone.price)}
          </p>
          
          {gemstone.predictedPriceRange && (
            <div className="flex flex-col text-secondary-600">
              <span className="text-sm sm:text-base font-semibold">Estimated Range:</span>
              <span className="text-sm sm:text-base lg:text-lg font-medium">
                {formatLKR(gemstone.predictedPriceRange.min)} - {formatLKR(gemstone.predictedPriceRange.max)}
              </span>
            </div>
          )}
          
          <p className="text-xs sm:text-sm text-secondary-600">
            {gemstone.weight} carats · {gemstone.color}
          </p>
          
          {gemstone.seller && gemstone.seller.name && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">Seller:</span>
                <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]" title={gemstone.seller.name}>
                  {gemstone.seller.name}
                </span>
              </div>
              {gemstone.seller.rating && gemstone.seller.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-yellow-500">★</span>
                  <span className="text-xs text-gray-600">{gemstone.seller.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-3 sm:mt-4">
          <Button 
            variant="primary"
            size="sm"
            onClick={handleViewClick}
            type="button"
            className="w-full text-sm sm:text-base"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GemstoneCard;
