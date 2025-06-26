import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useFormValidation } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { validators } from '@/utils';
import { LoginRequest } from '@/types';
import Button from '@/components/ui/Button';
import logoImage from '@/logo-new.gif';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const initialValues: LoginRequest = {
    email: '',
    password: '',
  };

  const validationRules = {
    email: (value: string) => {
      const required = validators.required(value);
      if (required) return required;
      return validators.email(value);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    const success = await login(values);
    
    if (success) {
      navigate('/dashboard');
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof LoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValue(field, e.target.value);
  };

  const handleInputBlur = (field: keyof LoginRequest) => () => {
    setTouched(field);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">      
      {/* Main Content */}      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-8"
        >
          {/* Welcome Section */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}              className="mx-auto rounded-2xl w-48 h-48 flex items-center justify-center shadow-lg overflow-hidden"
            >
              <img src={logoImage} alt="GemNet Logo" className="w-full h-full object-contain" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-3xl sm:text-4xl font-bold text-gray-900"
            >
              Welcome to GemNet
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-2 text-lg text-gray-600"
            >
              The Premier Destination for Authenticated Gemstones
            </motion.p>
          </div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Email Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={values.email}
                    onChange={handleInputChange('email')}
                    onBlur={handleInputBlur('email')}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      errors.email && touched.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                    }`}
                  />
                  {errors.email && touched.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={values.password}
                    onChange={handleInputChange('password')}
                    onBlur={handleInputBlur('password')}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                      errors.password && touched.password
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  {errors.password && touched.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:opacity-90 py-3 text-lg font-semibold text-white rounded-lg transition-all duration-200 transform hover:translate-y-[-1px]"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>            {/* Register Link & Navigation */}
            <div className="mt-6 text-center space-y-3">
              <p className="text-base text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Create your account
                </Link>
              </p>
              <p className="text-sm text-gray-500">
                <Link
                  to="/"
                  className="font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  ← Return to Home
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center space-x-8"
          >
            <div className="flex items-center text-gray-600">
              <Shield className="w-5 h-5 mr-2 text-primary-600" />
              <span className="text-sm">Secure</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Lock className="w-5 h-5 mr-2 text-primary-600" />
              <span className="text-sm">Encrypted</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-2 text-primary-600" />
              <span className="text-sm">Verified</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
