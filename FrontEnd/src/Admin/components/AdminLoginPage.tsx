import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, User, Lock, Settings, UserCheck } from 'lucide-react';
import { useFormValidation } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { validators } from '@/utils';
import { AdminLoginRequest } from '@/Admin/types/AdminTypes';
import Button from '@/components/ui/Button';
import AdminLogo from './AdminLogo';
import logoImage from '@/logo-new.gif';
import { toast } from 'react-hot-toast';

const AdminLoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { adminLogin } = useAuth(); // Use the new adminLogin function

  const initialValues: AdminLoginRequest = {
    username: '',
    password: '',
  };

  const validationRules = {
    username: (value: string) => {
      const required = validators.required(value);
      if (required) return required;
      if (value.length < 3) return 'Username must be at least 3 characters';
      if (value.length > 20) return 'Username must not exceed 20 characters';
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, underscores, and hyphens';
      return '';
    },
    password: validators.required,
  };

  const {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
  } = useFormValidation(initialValues, validationRules);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent scrolling when component mounts
  useEffect(() => {
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    // Cleanup function to restore scrolling
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      const success = await adminLogin(values);
      
      if (success) {
        // Navigation is handled by the adminLogin function in AuthContext
        console.log('✅ Admin login successful - redirecting to dashboard');
      }
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AdminLoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue(field, e.target.value);
  };

  const handleInputBlur = (field: keyof AdminLoginRequest) => () => {
    setTouched(field);
  };
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 px-4 sm:px-6 lg:px-8 overflow-hidden fixed inset-0">      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-y-12"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/3 to-transparent transform skew-x-12"></div>
        </div>
      </div>

      {/* Main Content */}      
      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-6"
        >
          {/* Admin Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center"
          >
            <div className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 shadow-lg">
              <Shield className="w-4 h-4" />
              <span>ADMIN ACCESS</span>
            </div>
          </motion.div>

          {/* Welcome Section */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}              
              className="mx-auto rounded-2xl w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center shadow-2xl overflow-hidden bg-white border-4 border-white/50 backdrop-blur-sm p-2 relative"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              <AdminLogo 
                logoSrc={logoImage} 
                className="w-full h-full relative z-10" 
              />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-2xl sm:text-3xl font-bold text-white"
            >
              Admin Portal
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-base text-gray-300"
            >
              Administrative Access to GemNet Platform
            </motion.p>
          </div>
          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 border border-white/20"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Username Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Admin Username"
                    value={values.username}
                    onChange={handleInputChange('username')}
                    onBlur={handleInputBlur('username')}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 border-white/30 ${
                      errors.username && touched.username
                        ? 'focus:border-red-400 focus:ring-red-400'
                        : 'focus:border-purple-400 focus:ring-purple-400'
                    }`}
                  />
                  {errors.username && touched.username && (
                    <p className="mt-2 text-sm text-red-300">{errors.username}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Admin Password"
                    value={values.password}
                    onChange={handleInputChange('password')}
                    onBlur={handleInputBlur('password')}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 border-white/30 ${
                      errors.password && touched.password
                        ? 'focus:border-red-400 focus:ring-red-400'
                        : 'focus:border-purple-400 focus:ring-purple-400'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-300 hover:text-white" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-300 hover:text-white" />
                    )}
                  </button>
                  {errors.password && touched.password && (
                    <p className="mt-2 text-sm text-red-300">{errors.password}</p>
                  )}
                </div>
              </div>
              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 py-3 text-lg font-semibold text-white rounded-lg transition-all duration-200 transform hover:translate-y-[-1px] shadow-lg"
              >
                <div className="flex items-center justify-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>{isSubmitting ? 'Authenticating...' : 'Access Admin Panel'}</span>
                </div>
              </Button>
            </form>            

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2 text-yellow-300">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Authorized Personnel Only</span>
                </div>
                <p className="text-xs text-yellow-200 mt-1">
                  This area is restricted to administrators only
                </p>
              </div>
            </div>
          </motion.div>

          {/* Security Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center space-x-8"
          >
            <div className="flex items-center text-gray-300">
              <Shield className="w-5 h-5 mr-2 text-red-400" />
              <span className="text-sm">Secure</span>
            </div>
            <div className="flex items-center text-gray-300">
              <Lock className="w-5 h-5 mr-2 text-red-400" />
              <span className="text-sm">Encrypted</span>
            </div>
            <div className="flex items-center text-gray-300">
              <UserCheck className="w-5 h-5 mr-2 text-red-400" />
              <span className="text-sm">Verified</span>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center"
          >
            <p className="text-sm text-gray-400">
              Protected by enterprise-grade security
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLoginPage;