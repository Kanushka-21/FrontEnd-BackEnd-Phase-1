import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, Phone, CreditCard, Shield, ArrowRight } from 'lucide-react';
import { useRegistration } from '@/hooks';
import Button from '@/components/ui/Button';

const RegistrationComplete: React.FC = () => {
  const navigate = useNavigate();
  const { progress, resetRegistration } = useRegistration();



  const handleGoToLogin = () => {
    resetRegistration();
    navigate('/login');
  };

  const completedSteps = [
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: 'Personal Information',
      description: 'Your personal details have been recorded',
      status: 'Completed'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Face Verification',
      description: 'Your identity has been verified using facial recognition',
      status: 'Verified'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'NIC Verification',
      description: 'Your National Identity Card has been validated',
      status: 'Validated'
    }
  ];

  return (
  
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-secondary-200 p-6 w-full h-full overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Success Header */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-center mb-6"
          >
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Registration Complete!
            </h2>
            
            <p className="text-green-700 text-sm">
              Your identity verification has been successfully completed
            </p>
          </motion.div>

          {/* Completed Steps Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-2 mb-5"
          >
            {completedSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  {step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-green-900 text-sm">{step.title}</h3>
                  <p className="text-green-700 text-xs truncate">{step.description}</p>
                </div>
                <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {step.status}
                </div>
              </motion.div>
            ))}
          </motion.div>

        

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-14"
          >
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-yellow-600 mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-900 text-sm mb-1">
                  Keep Your Information Secure
                </h4>
                <p className="text-yellow-800 text-xs">
                  Your data is encrypted and secure. Never share credentials with anyone.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Bottom Section - Actions & Support */}
          <div className="mt-auto">
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="mb-4"
            >
              <Button
                onClick={handleGoToLogin}
                className="flex items-center justify-center space-x-2 w-full mb-2"
              >
                <span>Continue to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
             
            </motion.div>

    
          </div>
        </div>
      </motion.div>
 
  );
};

export default RegistrationComplete;
