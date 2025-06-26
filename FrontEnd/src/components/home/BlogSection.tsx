import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const BlogSection: React.FC = () => {
  // Sample blog posts data
  const blogPosts = [
    {
      id: 1,
      title: 'Understanding Gemstone Certification',
      excerpt: 'Learn how gemstone certification works and why it matters when buying precious stones.',
      image: 'https://images.unsplash.com/photo-1551740916-7d262d9afb72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Education'
    },
    {
      id: 2,
      title: 'The Art of Gemstone Cutting',
      excerpt: 'Discover the ancient techniques and modern technology behind transforming rough gems into dazzling treasures.',
      image: 'https://images.unsplash.com/photo-1565294124524-200bb738cdb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Craftsmanship'
    },
    {
      id: 3,
      title: 'Investment Guide: Precious vs Semi-Precious',
      excerpt: 'A comprehensive comparison to help you make informed decisions when investing in gemstones.',
      image: 'https://images.unsplash.com/photo-1615655114865-4cc85948102b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Investment'
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

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <section className="py-16 bg-white">
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
            Discover the World of Gemstones
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto my-4"></div>
          <p className="text-secondary-600 max-w-2xl mx-auto">
            Explore our educational articles to enhance your knowledge about gemstones, their origins, properties, and value.
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {blogPosts.map(post => (
            <motion.div
              key={post.id}
              variants={itemVariants}
              className="bg-white rounded-lg overflow-hidden border border-secondary-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <motion.img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute top-4 left-4 bg-primary-600 text-white text-xs font-medium py-1 px-2 rounded">
                  {post.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary-800 mb-2">
                  {post.title}
                </h3>
                <p className="text-secondary-600 mb-4">
                  {post.excerpt}
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  Read More 
                  <BookOpen className="w-4 h-4 ml-2" />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;
