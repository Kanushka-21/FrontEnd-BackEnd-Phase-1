import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Menu,
  ChevronDown,
  User,
  Home,
  Search,
  ShoppingBag,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks';
import NotificationComponent from '@/components/ui/NotificationComponent';
import logoImage from '@/logo-new.gif';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const handleLogout = () => {
    console.log('🚪 DashboardLayout: Logout button clicked');
    logout(); // Let the logout function handle the redirect
  };

  const quickLinks = [
    { 
      label: 'Home', 
      icon: <Home className="w-5 h-5" />, 
      onClick: () => navigate('/') 
    },
    { 
      label: 'Marketplace', 
      icon: <Search className="w-5 h-5" />, 
      onClick: () => navigate('/marketplace') 
    },
    { 
      label: 'Purchases', 
      icon: <ShoppingBag className="w-5 h-5" />, 
      onClick: () => navigate('/buyer/purchases') 
    },
    { 
      label: 'Settings', 
      icon: <Settings className="w-5 h-5" />, 
      onClick: () => navigate('/settings') 
    }
  ];
  
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">      {/* Header */}
      <header className="bg-white shadow-md border-b border-secondary-200 sticky top-0 z-30 h-20">
        <div className="h-full flex items-center justify-between">
          {/* Left Section - Aligned to common vertical line */}
          <div className="flex items-center  ">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')} 
                className="flex items-center space-x-1 focus:outline-none hover:opacity-80 transition-opacity"
                aria-label="Go to homepage"
              >
                <div className="rounded-lg overflow-hidden w-24 h-29 flex-shrink-0">
                  <img src={logoImage} alt="GemNet Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 whitespace-nowrap">GemNet</h1>
                </div>
              </button>
            </div>
          </div>

          {/* Right Section - Aligned to common vertical line */}
          <div className="flex items-center pr-6">
            <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-5">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-full text-secondary-600 hover:bg-secondary-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick links - Desktop only */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="p-2 lg:p-3 rounded-full hover:bg-secondary-100 text-secondary-600 flex items-center justify-center transition-colors"
                  title={link.label}
                >
                  {link.icon}
                </button>
              ))}
            </div>

            {/* Notifications Component */}
            <NotificationComponent userId={user?.userId || ''} />

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                }}
                className="flex items-center space-x-2 lg:space-x-3 hover:bg-secondary-50 rounded-lg p-2 transition-colors"
              >
                <div className="bg-primary-100 rounded-full p-2">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="hidden md:block text-left min-w-0">
                  <p className="text-base sm:text-lg font-medium text-secondary-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-secondary-500 truncate">{user?.role || 'User'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-secondary-500 flex-shrink-0 ml-1" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-secondary-200 rounded-lg shadow-lg z-10"
                  >
                    <div className="py-1">
                      <button                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/profile');
                        }}
                        className="px-4 py-2 text-base text-secondary-700 hover:bg-secondary-100 w-full text-left"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          navigate('/settings');
                        }}
                        className="px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 w-full text-left"
                      >
                        Account Settings
                      </button>
                      <div className="border-t border-secondary-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100 w-full text-left"
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 bg-white shadow-lg rounded-b-lg z-40 md:hidden"
          >
            <div className="py-2">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => {
                    link.onClick();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center w-full px-4 py-3 hover:bg-secondary-100"
                >
                  <span className="mr-3">{link.icon}</span>
                  <span>{link.label}</span>
                </button>
              ))}
              <div className="border-t border-secondary-200 my-1"></div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 hover:bg-secondary-100 text-secondary-700"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
