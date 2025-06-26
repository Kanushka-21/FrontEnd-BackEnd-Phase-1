import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Menu,
  ChevronDown,
  User,
  Bell,
  Home,
  Search,
  ShoppingBag,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks';
import Button from '@/components/ui/Button';
import logoImage from '@/logo-new.gif';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Mock notifications data
  const notifications = [
    { id: 1, text: 'Your bid was accepted', time: '5 minutes ago', read: false },
    { id: 2, text: 'New gemstone listing available', time: '2 hours ago', read: false },
    { id: 3, text: 'Meeting confirmed for tomorrow', time: '1 day ago', read: true }
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/');
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
    <div className="min-h-screen bg-secondary-50 flex flex-col overflow-hidden">      {/* Header */}
      <header className="bg-white shadow-md border-b border-secondary-200 sticky top-0 z-30 h-20">
        <div className="container mx-auto px-4 sm:px-6 py-0 flex items-center justify-between h-full">
          <div className="flex items-center">            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate('/')} 
                className="flex items-center space-x-2 focus:outline-none hover:opacity-80 transition-opacity"
                aria-label="Go to homepage"
              >                <div className="rounded-lg overflow-hidden w-28 h-28 -my-4">
                  <img src={logoImage} alt="GemNet Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-primary-800">GemNet</h1>
                </div>
              </button>
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
            <div className="hidden md:flex items-center space-x-1">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="p-2 rounded-full hover:bg-secondary-100 text-secondary-600 flex items-center justify-center"
                  title={link.label}
                >
                  {link.icon}
                </button>
              ))}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setUserMenuOpen(false);
                }}
                className="relative p-2 rounded-full hover:bg-secondary-100 text-secondary-600"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full"></span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white border border-secondary-200 rounded-lg shadow-lg z-10"
                  >
                    <div className="px-4 py-2 border-b border-secondary-200">
                      <h3 className="text-lg font-semibold text-secondary-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-2 border-b border-secondary-100 hover:bg-secondary-50 ${
                              !notification.read ? 'bg-primary-50' : ''
                            }`}
                          >                            <p className="text-base text-secondary-800">{notification.text}</p>
                            <p className="text-sm text-secondary-500 mt-1">{notification.time}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="text-base text-secondary-500">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-secondary-200">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-sm"
                      >
                        Mark all as read
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center space-x-2"
              >                <div className="bg-primary-100 rounded-full p-2">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-base sm:text-lg font-medium text-secondary-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-secondary-500">{user?.role || 'User'}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-secondary-500" />
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
