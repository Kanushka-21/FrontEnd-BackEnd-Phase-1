import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, MessageCircle, TrendingUp, Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import { DetailedGemstone } from '@/types';

// Helper function to format price in LKR
const formatLKR = (price: number) => {
  return new Intl.NumberFormat('si-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

interface GemstoneModalProps {
  isOpen: boolean;
  gemstone: DetailedGemstone | null;
  onClose: () => void;
  onPlaceBid: (amount: number) => void;
}

const GemstoneDetailModal: React.FC<GemstoneModalProps> = ({
  isOpen,
  gemstone,
  onClose,
  onPlaceBid
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidError, setBidError] = useState<string>('');

  const currentHighestBid = gemstone ? gemstone.price : 0;
  const minimumBid = currentHighestBid * 1.05; // 5% higher than current price
  
  // Mock multiple images for demonstration
  const images = gemstone 
    ? [gemstone.image, 
      'https://images.unsplash.com/photo-1583937443566-6fe1a1c6e400?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
    : [];

  const validateBid = (amount: number): boolean => {
    if (amount <= currentHighestBid) {
      setBidError(`Bid must be higher than current price ${formatLKR(currentHighestBid)}`);
      return false;
    }
    if (amount < minimumBid) {
      setBidError(`Minimum bid is ${formatLKR(minimumBid)} (5% higher than current price)`);
      return false;
    }
    setBidError('');
    return true;
  };
    
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    if (validateBid(amount)) {
      onPlaceBid(amount);
    }
  };

  if (!gemstone || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-[95%] md:w-[85%] lg:w-[75%] h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-semibold text-primary-800">{gemstone.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Images */}
              <div className="space-y-4">
                <div className="max-w-md mx-auto h-[300px] rounded-2xl overflow-hidden border bg-gray-50">
                  <img
                    src={images[currentImageIndex]}
                    alt={gemstone.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-primary-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt={`${gemstone.name} view ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Price Section */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="text-3xl font-bold text-primary-800">
                    {formatLKR(gemstone.price)}
                  </div>
                  {gemstone.predictedPriceRange && (
                    <div className="mt-2 flex items-center text-sm text-secondary-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>Estimated Range: </span>
                      <span className="font-medium ml-1">
                        {formatLKR(gemstone.predictedPriceRange.min)} - {formatLKR(gemstone.predictedPriceRange.max)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Specifications</h3>
                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
                    <div className="space-y-3">
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Weight:</span>
                        <span className="font-medium">{gemstone.weight} carats</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Color:</span>
                        <span className="font-medium">{gemstone.color}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Species:</span>
                        <span className="font-medium">{gemstone.species}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Variety:</span>
                        <span className="font-medium">{gemstone.variety}</span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Shape:</span>
                        <span className="font-medium">{gemstone.shape}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Cut:</span>
                        <span className="font-medium">{gemstone.cut}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Transparency:</span>
                        <span className="font-medium">{gemstone.transparency}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">Dimensions</h3>
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl">
                    <div className="text-center">
                      <div className="text-base text-secondary-600">Length</div>
                      <div className="font-medium text-lg">{gemstone.dimensions.length}mm</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base text-secondary-600">Width</div>
                      <div className="font-medium text-lg">{gemstone.dimensions.width}mm</div>
                    </div>
                    <div className="text-center">
                      <div className="text-base text-secondary-600">Height</div>
                      <div className="font-medium text-lg">{gemstone.dimensions.height}mm</div>
                    </div>
                  </div>
                </div>

                {/* Certificate Information */}
                {gemstone.certificate && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-primary-600" />
                      <h3 className="text-xl font-semibold">Certification</h3>
                    </div>
                    <div className="bg-primary-50 p-4 rounded-xl space-y-3">
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Authority:</span>
                        <span className="font-medium">{gemstone.certificate.issuingAuthority}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Report Number:</span>
                        <span className="font-medium">{gemstone.certificate.reportNumber}</span>
                      </p>
                      <p className="flex justify-between text-base">
                        <span className="text-secondary-600">Date:</span>
                        <span className="font-medium">{new Date(gemstone.certificate.date).toLocaleDateString()}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Bid Section */}
                <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-xl">
                  <div>
                    <label htmlFor="bidAmount" className="block text-base font-medium text-secondary-700">
                      Your Bid (Minimum: {formatLKR(minimumBid)})
                    </label>
                    <div className="mt-2">
                      <input
                        type="number"
                        id="bidAmount"
                        value={bidAmount}
                        onChange={(e) => {
                          setBidAmount(e.target.value);
                          if (e.target.value) validateBid(parseFloat(e.target.value));
                        }}
                        className="block w-full px-4 py-3 text-lg border border-secondary-300 rounded-xl shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        min={minimumBid}
                        step="100"
                        required
                      />
                    </div>
                    {bidError && (
                      <p className="mt-2 text-sm text-red-600">{bidError}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3 text-lg rounded-xl"
                    disabled={!!bidError || !bidAmount}
                  >
                    Place Bid
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemstoneDetailModal;
