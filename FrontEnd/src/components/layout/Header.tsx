import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Menu,
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

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const { user, logout, isAuthenticated } = useAuth();
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
      label: 'Dashboard', 
      icon: <ShoppingBag className="w-5 h-5" />, 
      onClick: () => navigate('/dashboard') 
    }  ];

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
              >                {link.icon}
                <span className="text-base sm:text-lg">{link.label}</span>
              </button>
            ))}
          </div>

          {/* Auth Buttons or User Menu */}
          {isAuthenticated ? (
            <div className="relative">
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-full hover:bg-secondary-100"
                  >
                    <Bell className="w-5 h-5 text-secondary-700" />
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      2
                    </span>
                  </button>
                  
                  {/* Notifications dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg py-2 z-50 border border-secondary-200">
                      <div className="px-4 py-2 border-b border-secondary-200">
                        <h3 className="text-lg font-semibold text-secondary-900">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-2 hover:bg-secondary-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                          >
                            <p className="text-base text-secondary-900">{notification.text}</p>
                            <p className="text-sm text-secondary-500">{notification.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t border-secondary-200">                        <button className="text-base text-primary-600 hover:text-primary-800 font-medium">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* User menu button */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100"
                  >
                    <div className="bg-primary-100 p-1 rounded-full">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>                    <div className="hidden sm:block text-left">
                      <p className="text-base sm:text-lg font-medium text-secondary-900 line-clamp-1">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-secondary-500 line-clamp-1">{user?.email}</p>
                    </div>
                  </button>
                  
                  {/* User dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg py-2 z-50 border border-secondary-200">                      <div className="px-4 py-2 border-b border-secondary-200 sm:hidden">
                        <p className="text-base font-medium text-secondary-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-sm text-secondary-500">{user?.email}</p>
                      </div>                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full text-left px-4 py-2 text-base text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Dashboard
                      </button>                      <button
                        onClick={() => navigate('/settings')}
                        className="w-full text-left px-4 py-2 text-base text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <div className="border-t border-secondary-200 my-1"></div>                      <button
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
            <div className="flex items-center space-x-2">              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/login')}
                className="flex items-center space-x-2 text-base"
              >
                Sign In
              </Button>              <Button
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

export default Header;
