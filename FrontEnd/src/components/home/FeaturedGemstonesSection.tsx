import React from 'react';
import { motion } from 'framer-motion';
import GemstoneCard from '@/components/ui/GemstoneCard';
import { DetailedGemstone } from '@/types';

interface FeaturedGemstonesSectionProps {
  onViewDetails: (gemstone: DetailedGemstone) => void;
}

const FeaturedGemstonesSection: React.FC<FeaturedGemstonesSectionProps> = ({
  onViewDetails
}) => {
  // Sample featured gemstones data
  const featuredGemstones: DetailedGemstone[] = [
    {
      id: '1',
      name: 'Blue Ceylon Sapphire',
      price: 12500,
      image: 'https://images.unsplash.com/photo-1612098662204-e95c76707dec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      certified: true,
      weight: 3.2,
      color: 'Royal Blue',
      species: 'Corundum',
      variety: 'Sapphire',
      shape: 'Oval',
      cut: 'Brilliant',
      dimensions: {
        length: 9.5,
        width: 7.3,
        height: 4.8
      },
      transparency: 'transparent',
      certificate: {
        issuingAuthority: 'GIA',
        reportNumber: 'GIA24587963',
        date: '2024-03-15'
      }
    },
    {
      id: '2',
      name: 'Ceylon Ruby',
      price: 8950,
      image: 'https://images.unsplash.com/photo-1518831696311-1722e86a471e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      certified: true,
      weight: 2.1,
      color: 'Pigeon Blood Red',
      species: 'Corundum',
      variety: 'Ruby',
      shape: 'Cushion',
      cut: 'Mixed',
      dimensions: {
        length: 7.2,
        width: 6.8,
        height: 4.2
      },
      transparency: 'transparent',
      certificate: {
        issuingAuthority: 'GRS',
        reportNumber: 'GRS2023-058793',
        date: '2023-11-20'
      }
    },
    {
      id: '3',
      name: 'Natural Emerald',
      price: 7500,
      image: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      certified: false,
      weight: 1.8,
      color: 'Vivid Green',
      species: 'Beryl',
      variety: 'Emerald',
      shape: 'Rectangular',
      cut: 'Step Cut',
      dimensions: {
        length: 8.5,
        width: 6.3,
        height: 4.1
      },
      transparency: 'translucent'
    },
    {
      id: '4',
      name: 'Star Sapphire',
      price: 5200,
      image: 'https://images.unsplash.com/photo-1613843351058-1dd06fda7c02?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      certified: true,
      weight: 4.7,
      color: 'Blue-Gray',
      species: 'Corundum',
      variety: 'Star Sapphire',
      shape: 'Oval Cabochon',
      cut: 'Cabochon',
      dimensions: {
        length: 10.2,
        width: 8.7,
        height: 5.3
      },
      transparency: 'translucent',
      certificate: {
        issuingAuthority: 'SSEF',
        reportNumber: 'SSEF108743',
        date: '2024-01-05'
      }
    }
  ];

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section className="py-16 bg-secondary-50">
      <div className="container mx-auto px-4">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900">
            Featured Gemstones
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto my-4"></div>
          <p className="text-secondary-600 max-w-2xl mx-auto">
            Discover our curated selection of exceptional gemstones from Sri Lanka's finest mines.
          </p>
        </motion.div>

        {/* Gemstone Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {featuredGemstones.map(gemstone => (
            <GemstoneCard 
              key={gemstone.id} 
              gemstone={gemstone} 
              onViewDetails={() => onViewDetails(gemstone)} 
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedGemstonesSection;
