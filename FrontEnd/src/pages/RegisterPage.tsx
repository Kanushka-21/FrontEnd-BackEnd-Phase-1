import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Registration Steps
import PersonalInfoStep from '@/components/forms/PersonalInfoStep';
import FaceVerificationStep from '@/components/forms/FaceVerificationStep';
import NicVerificationStep from '@/components/forms/NicVerificationStep';
import NicVerificationProgressPage from '@/components/forms/NicVerificationProgressPage';
import RegistrationComplete from '@/components/forms/RegistrationComplete';

// Components
import SidebarProgress from '@/components/ui/SidebarProgress';

// Hooks
import { useRegistration } from '@/hooks';
import { RegistrationStep } from '@/types';

const RegisterPage: React.FC = () => {
  const { progress } = useRegistration();
  const location = useLocation();
  const navigate = useNavigate();

  const steps = [
    'Personal Information',
    'Face Verification',
    'NIC Verification',
    'Complete'
  ];

  const getStepFromPath = (pathname: string): number => {
    if (pathname.includes('/face-verification')) return 2;
    if (pathname.includes('/nic-verification-progress')) return 3;
    if (pathname.includes('/nic-verification')) return 3;
    if (pathname.includes('/complete')) return 4;
    return 1;
  };

  const currentStepFromUrl = getStepFromPath(location.pathname);

  const handleCancel = () => {
    navigate('/login');
  };

  // Don't show sidebar and header for the progress page
  const isProgressPage = location.pathname.includes('/nic-verification-progress');
  if (isProgressPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
        <Routes>
          <Route
            path="nic-verification-progress"
            element={<NicVerificationProgressPage />}
          />
        </Routes>
      </div>
    );
  }
  return (    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* Left Sidebar - Progress with clean colors */}
      <div className="lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-gray-200">
        <SidebarProgress
          currentStep={Math.max(currentStepFromUrl, progress.currentStep)}
          totalSteps={4}
          steps={steps}
          onCancel={handleCancel}
        />
      </div>

      {/* Main Content Area - Full Width */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header - Clean style */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {steps[Math.max(currentStepFromUrl, progress.currentStep) - 1]}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {getStepDescription(Math.max(currentStepFromUrl, progress.currentStep) - 1)}
          </p>
        </div>        {/* Main Form Content - Maximum Available Space */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gray-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md border border-gray-200 h-full w-full max-w-4xl mx-auto"
          >
            <Routes>
              {/* Step 1: Personal Information */}
              <Route
                index
                element={<PersonalInfoStep />}
              />

              {/* Step 2: Face Verification */}
              <Route
                path="face-verification"
                element={<FaceVerificationStep />}
              />

              {/* Step 3: NIC Verification */}
              <Route
                path="nic-verification"
                element={<NicVerificationStep />}
              />

              {/* Step 3b: NIC Verification Progress */}
              <Route
                path="nic-verification-progress"
                element={<NicVerificationProgressPage />}
              />

              {/* Step 4: Registration Complete */}
              <Route
                path="complete"
                element={<RegistrationComplete />}
              />

              {/* Catch all - redirect to first step */}
              <Route
                path="*"
                element={<Navigate to="/register" replace />}
              />
            </Routes>
          </motion.div>
        </div>        {/* Footer - Clean style */}
        <div className="bg-white border-t border-gray-200 px-4 sm:px-8 py-4 flex-shrink-0">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at{' '}
              <a
                href="mailto:support@gemnet.com"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                support@gemnet.com
              </a>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Your data is encrypted and secured with industry-standard protocols
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStepDescription = (index: number): string => {
  switch (index) {
    case 0: return 'Please provide your basic personal information to get started';
    case 1: return 'We need to verify your identity through facial recognition';
    case 2: return 'Upload and verify your National Identity Card';
    case 3: return 'Your registration has been completed successfully';
    default: return '';
  }
};

export default RegisterPage;
