import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Menu,
  User,
  Home,
  Search,
  ShoppingBag,
  Settings,
  Shield,
  Gem,
  FileText,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks';
import Button from '@/components/ui/Button';
import NotificationComponent from '@/components/ui/NotificationComponent';
import logoImage from '@/logo-new.gif';

interface RoleAwareHeaderProps {
  transparent?: boolean;
}

const RoleAwareHeader: React.FC<RoleAwareHeaderProps> = ({ transparent = false }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Get user display name with fallbacks based on role
  const getUserDisplayInfo = () => {
    const firstName = user?.firstName;
    const lastName = user?.lastName;
    
    if (firstName && lastName) {
      return {
        name: `${firstName} ${lastName}`,
        email: user?.email || ''
      };
    }
    
    // Fallbacks based on role
    switch (user?.role) {
      case 'admin':
        return {
          name: 'Admin User',
          email: user?.email || 'admin@gemnet.lk'
        };
      case 'seller':
        return {
          name: 'Kamal Silva',
          email: user?.email || 'kamal.silva@example.com'
        };
      case 'buyer':
        return {
          name: 'Pasindu Perera',
          email: user?.email || 'pasindu.perera@example.com'
        };
      default:
        return {
          name: 'User',
          email: user?.email || ''
        };
    }
  };

  const userDisplayInfo = getUserDisplayInfo();
  
  const handleLogout = () => {
    console.log('🚪 RoleAwareHeader: Logout button clicked');
    logout(); // Let the logout function handle the redirect
  };

  // Role-specific quick links
  const getQuickLinks = () => {
    const baseLinks = [
      { 
        label: 'Home', 
        icon: <Home className="w-5 h-5" />, 
        onClick: () => navigate('/') 
      }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseLinks,
        { 
          label: 'Dashboard', 
          icon: <BarChart3 className="w-5 h-5" />, 
          onClick: () => navigate('/admin/dashboard') 
        }
      ];
    } else if (user?.role === 'seller') {
      return [
        ...baseLinks,
        { 
          label: 'Marketplace', 
          icon: <Search className="w-5 h-5" />, 
          onClick: () => navigate('/marketplace') 
        },
        { 
          label: 'Dashboard', 
          icon: <BarChart3 className="w-5 h-5" />, 
          onClick: () => navigate('/seller/dashboard') 
        }
      ];
    } else if (user?.role === 'buyer') {
      return [
        ...baseLinks,
        { 
          label: 'Marketplace', 
          icon: <Search className="w-5 h-5" />, 
          onClick: () => navigate('/marketplace') 
        },
        { 
          label: 'Dashboard', 
          icon: <ShoppingBag className="w-5 h-5" />, 
          onClick: () => navigate('/buyer/dashboard') 
        }
      ];
    }

    // Default for non-authenticated users
    return [
      ...baseLinks,
      { 
        label: 'Marketplace', 
        icon: <Search className="w-5 h-5" />, 
        onClick: () => navigate('/marketplace') 
      }
    ];
  };

  const quickLinks = getQuickLinks();

  // Role-specific user menu items
  const getUserMenuItems = () => {
    const baseItems = [
      {
        label: 'Profile',
        icon: <User className="w-4 h-4" />,
        onClick: () => navigate('/profile')
      },
      {
        label: 'Settings',
        icon: <Settings className="w-4 h-4" />,
        onClick: () => navigate('/settings')
      }
    ];

    if (user?.role === 'admin') {
      return [
        {
          label: 'Admin Dashboard',
          icon: <Shield className="w-4 h-4" />,
          onClick: () => navigate('/admin/dashboard')
        },
        ...baseItems
      ];
    } else if (user?.role === 'seller') {
      return [
        {
          label: 'Seller Dashboard',
          icon: <Gem className="w-4 h-4" />,
          onClick: () => navigate('/seller/dashboard')
        },
        {
          label: 'My Listings',
          icon: <FileText className="w-4 h-4" />,
          onClick: () => navigate('/seller/listings')
        },
        ...baseItems
      ];
    } else if (user?.role === 'buyer') {
      return [
        {
          label: 'Buyer Dashboard',
          icon: <ShoppingBag className="w-4 h-4" />,
          onClick: () => navigate('/buyer/dashboard')
        },
        {
          label: 'My Purchases',
          icon: <ShoppingBag className="w-4 h-4" />,
          onClick: () => navigate('/buyer/purchases')
        },
        ...baseItems
      ];
    }

    return baseItems;
  };

  const userMenuItems = getUserMenuItems();

  // Role-specific badge/indicator
  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">Admin</span>;
      case 'seller':
        return <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">Seller</span>;
      case 'buyer':
        return <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Buyer</span>;
      default:
        return null;
    }
  };

  return (
    <header className={`${transparent ? 'bg-transparent' : 'bg-white'} shadow-md border-b border-secondary-200 sticky top-0 z-30 h-20`}>
      <div className="container-fluid px-4 sm:px-6 py-0 flex items-center justify-between h-full">
        {/* Logo */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="rounded-lg overflow-hidden w-20 h-20 sm:w-28 sm:h-28 -my-1 sm:-my-2">
              <img src={logoImage} alt="GemNet Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-primary-800">GemNet</h1>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 rounded-full text-secondary-600 hover:bg-secondary-100 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick links - Desktop only */}
          <div className="hidden md:flex items-center space-x-4">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={link.onClick}
                className="px-3 py-2 rounded-md hover:bg-secondary-100 text-secondary-700 flex items-center gap-2"
                title={link.label}
              >
                {link.icon}
                <span className="text-base sm:text-lg">{link.label}</span>
              </button>
            ))}
          </div>

          {/* Auth Buttons or User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                {isAuthenticated && user?.userId && (
                  <NotificationComponent 
                    userId={user.userId}
                    context={user.role === 'seller' ? 'seller' : user.role === 'buyer' ? 'buyer' : user.role === 'admin' ? 'admin' : undefined}
                    maxNotifications={5}
                    user={user}
                  />
                )}
                
                {/* User menu button */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100"
                  >
                    <div className="bg-primary-100 p-1 rounded-full">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="flex items-center">
                        <p className="text-base sm:text-lg font-medium text-secondary-900 line-clamp-1">
                          {userDisplayInfo.name}
                        </p>
                        {getRoleBadge()}
                      </div>
                      <p className="text-sm text-secondary-500 line-clamp-1">{userDisplayInfo.email}</p>
                    </div>
                  </button>
                  
                  {/* User dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50 border border-secondary-200">
                      <div className="px-4 py-2 border-b border-secondary-200 sm:hidden">
                        <div className="flex items-center">
                          <p className="text-base font-medium text-secondary-900">{userDisplayInfo.name}</p>
                          {getRoleBadge()}
                        </div>
                        <p className="text-sm text-secondary-500">{userDisplayInfo.email}</p>
                      </div>
                      
                      {userMenuItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={item.onClick}
                          className="w-full text-left px-4 py-2 text-base text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                        >
                          {item.icon}
                          {item.label}
                        </button>
                      ))}
                      
                      <div className="border-t border-secondary-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-base text-red-600 hover:bg-secondary-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 text-base"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/register')}
                className="flex items-center space-x-2 text-base"
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu - slides in from the right */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-40 flex flex-col md:hidden"
          >
            <div className="p-4 border-b border-secondary-200 flex justify-between items-center">
              <h2 className="font-bold text-2xl text-primary-800">GemNet</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-full hover:bg-secondary-100"
              >
                <Menu className="w-5 h-5 text-secondary-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      link.onClick();
                      setShowMobileMenu(false);
                    }}
                    className="w-full py-2 px-3 rounded-md flex items-center space-x-3 hover:bg-secondary-100"
                  >
                    <div className="text-primary-700">{link.icon}</div>
                    <span className="text-secondary-800 text-lg">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {isAuthenticated && (
              <div className="border-t border-secondary-200 p-4">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-md flex items-center space-x-3 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-lg">Sign out</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowMobileMenu(false)}
          className="fixed inset-0 bg-black z-30 md:hidden"
        />
      )}
    </header>
  );
};

export default RoleAwareHeader;
