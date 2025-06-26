import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, RefreshCw, Home, LogIn, AlertCircle } from 'lucide-react';
import { useRegistration } from '@/hooks';
import { VerificationStatus } from '@/types';
import Button from '@/components/ui/Button';

const NicVerificationProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { progress, verifyNIC } = useRegistration();
  
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(VerificationStatus.IN_PROGRESS);
  const [currentStep, setCurrentStep] = useState<string>('Validating User');
  const [stepMessage, setStepMessage] = useState<string>('Starting verification process...');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [nicImage, setNicImage] = useState<File | null>(null);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [currentStepNumber, setCurrentStepNumber] = useState<number>(1);
  const [totalSteps] = useState<number>(8);
  
  // Use ref to prevent re-running verification and track what caused the last run
  const hasStartedVerification = useRef<boolean>(false);
  const lastProgressUserId = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only process if we haven't started yet OR if userId just became available
    if (hasStartedVerification.current && progress.userId === lastProgressUserId.current) {
      return; // Already processed with this userId
    }

    const uploadedImage = location.state?.nicImage;
    
    console.log('=== NIC VERIFICATION DEBUG ===');
    console.log('Has started verification:', hasStartedVerification.current);
    console.log('Progress object:', progress);
    console.log('User ID:', progress.userId);
    console.log('Last progress userId:', lastProgressUserId.current);
    console.log('Location state:', location.state);
    
    if (!uploadedImage) {
      console.log('❌ No image found in location state, redirecting to NIC verification');
      navigate('/register/nic-verification');
      return;
    }

    setNicImage(uploadedImage);

    if (!progress.userId) {
      console.log('⏳ No userId found yet, waiting for progress to load...');
      // Don't show error immediately, wait for progress to load
      if (hasStartedVerification.current) {
        // Only show error if we've already tried and still no userId
        console.log('❌ Still no userId after waiting, showing setup error');
        setVerificationStatus(VerificationStatus.FAILED);
        setCurrentStep('Setup Error');
        setStepMessage('User registration not completed properly');
        setErrorMessage('Please complete the personal information step first.');
        setSuggestions([
          'Go back and complete personal information step',
          'Make sure you receive a "Registration successful!" message',
          'Try refreshing the page and starting over'
        ]);
      } else {
        // First time, just show loading
        setCurrentStep('Loading Registration Data');
        setStepMessage('Loading your registration information...');
        setProgressPercentage(5);
      }
      return;
    }

    // We have userId, start verification
    console.log('✅ Starting verification with userId:', progress.userId);
    console.log('✅ Image file:', uploadedImage.name, uploadedImage.size, 'bytes');
    
    hasStartedVerification.current = true;
    lastProgressUserId.current = progress.userId;
    startVerificationProcess(uploadedImage);
    
  }, [location.state, navigate, progress.userId]); // Only depend on userId, not the entire progress object

  const startVerificationProcess = async (imageFile: File) => {
    console.log('🚀 Starting NIC verification process...');
    setVerificationStatus(VerificationStatus.IN_PROGRESS);
    
    try {
      const steps = [
        { step: 'Validating User', message: 'Checking your account information...', delay: 1200, percentage: 12 },
        { step: 'Checking Image Quality', message: 'Analyzing image clarity and readability...', delay: 1800, percentage: 25 },
        { step: 'Securing Your Data', message: 'Safely storing your NIC image...', delay: 1000, percentage: 38 },
        { step: 'Reading NIC Number', message: 'Extracting text from your document...', delay: 2200, percentage: 55 },
        { step: 'Extracting Photo', message: 'Processing your photo from the NIC...', delay: 2000, percentage: 70 },
        { step: 'Verifying Details', message: 'Matching NIC number with registration info...', delay: 1400, percentage: 82 },
        { step: 'Face Verification', message: 'Comparing your face with NIC photo...', delay: 1800, percentage: 94 },
        { step: 'Completing Verification', message: 'Finalizing your identity verification...', delay: 1000, percentage: 100 }
      ];

      // Process each step
      for (let i = 0; i < steps.length; i++) {
        const stepData = steps[i];
        setCurrentStepNumber(i + 1);
        setCurrentStep(stepData.step);
        setStepMessage(stepData.message);
        setProgressPercentage(stepData.percentage);
        
        // Wait for the step delay
        await new Promise(resolve => setTimeout(resolve, stepData.delay));
        
        // If this is the last step, call the actual API
        if (i === steps.length - 1) {
          try {
            console.log('📡 Calling verifyNIC API...');
            console.log('API Endpoint: /api/auth/verify-nic/' + progress.userId);
            console.log('Image details:', {
              name: imageFile.name,
              size: imageFile.size,
              type: imageFile.type
            });

            const response = await verifyNIC(progress.userId, imageFile);
            
            console.log('📦 API Response:', response);
            
            if (response && response.success) {
              console.log('✅ Verification successful!');
              setVerificationStatus(VerificationStatus.SUCCESS);
              setCurrentStep('Verification Complete');
              setStepMessage('Your identity has been successfully verified!');
              setProgressPercentage(100);
              
              // Auto-redirect to complete page after showing success for 3 seconds
              setTimeout(() => {
                console.log('🔄 Redirecting to complete page...');
                navigate('/register/complete');
              }, 3000);
            } else {
              console.log('❌ Verification failed:', response);
              handleVerificationFailure(response);
            }
          } catch (apiError) {
            console.log('🔥 API Error:', apiError);
            handleVerificationFailure(null, apiError);
          }
        }
      }
    } catch (error) {
      console.log('💥 Process Error:', error);
      handleVerificationFailure(null, error);
    }
  };

  const handleVerificationFailure = (response: any, error?: any) => {
    console.log('🚨 Handling verification failure...');
    setVerificationStatus(VerificationStatus.FAILED);
    
    if (response && response.data) {
      console.log('Response error data:', response.data);
      setErrorMessage(response.data.userMessage || response.message || 'Verification failed');
      setSuggestions(response.data.suggestions || [
        'Ensure your NIC image is clear and well-lit',
        'Make sure all text on the NIC is readable',
        'Verify that your face is clearly visible in the NIC photo',
        'Try uploading a different image of your NIC'
      ]);
      
      switch (response.data.error) {
        case 'POOR_IMAGE_QUALITY':
          setCurrentStep('Image Quality Check Failed');
          setStepMessage('Image quality is not sufficient for verification');
          break;
        case 'NIC_NUMBER_MISMATCH':
          setCurrentStep('NIC Number Verification Failed');
          setStepMessage('NIC number does not match registration details');
          break;
        case 'FACE_MISMATCH':
          setCurrentStep('Face Verification Failed');
          setStepMessage('Face does not match NIC photo');
          break;
        case 'MISSING_FACE_IMAGE':
          setCurrentStep('Face Detection Failed');
          setStepMessage('Could not detect face in NIC photo');
          break;
        default:
          setCurrentStep('Verification Failed');
          setStepMessage('Unable to complete verification process');
      }
    } else {
      console.log('Generic/Network error:', error);
      setCurrentStep('Technical Error');
      setStepMessage('A technical issue occurred during verification');
      setErrorMessage('Network or server error occurred. Please try again.');
      setSuggestions([
        'Check your internet connection',
        'Make sure your backend server is running on port 9091',
        'Try again with a clearer image',
        'Contact support for assistance'
      ]);
    }
  };

  const handleRetryVerification = () => {
    navigate('/register/nic-verification');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToPersonalInfo = () => {
    navigate('/register');
  };

  const handleSkipToComplete = () => {
    navigate('/register/complete');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8 lg:p-12"
        >
          {/* Beautiful Success UI */}
          {verificationStatus === VerificationStatus.SUCCESS && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center"
            >
              {/* Success Icon Animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-8"
              >
                <div className="bg-gradient-to-r from-green-400 to-green-600 p-8 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center shadow-2xl">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
              </motion.div>

              {/* Success Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <h1 className="text-4xl font-bold text-green-900 mb-4">
                  🎉 Registration Complete!
                </h1>
                <p className="text-xl text-green-700 mb-6">
                  Your identity has been successfully verified
                </p>
                <p className="text-lg text-secondary-600">
                  Welcome to GemNet! You can now access all our services.
                </p>
              </motion.div>

              {/* Success Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
              >
                <h3 className="font-semibold text-green-900 mb-4 text-lg">
                  ✅ Verification Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800">Personal information verified</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800">Face recognition successful</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800">NIC document validated</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800">Identity verification complete</span>
                  </div>
                </div>
              </motion.div>

              {/* Auto-redirect Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
              >
                <div className="flex items-center justify-center space-x-2 text-blue-600 mb-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Redirecting to complete registration...</span>
                </div>
                <p className="text-xs text-blue-500">
                  You will be automatically redirected in a few seconds
                </p>
              </motion.div>

              {/* Manual Navigation Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={handleSkipToComplete}
                  size="lg"
                  className="flex items-center justify-center space-x-3 px-8 py-3 text-lg font-semibold"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Continue to Complete</span>
                </Button>

                <Button
                  onClick={handleGoToLogin}
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center space-x-3 px-8 py-3 text-lg"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Go to Login</span>
                </Button>
              </motion.div>

              {/* Celebration Animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-8 text-4xl"
              >
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🎊
                </motion.span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                  className="mx-4"
                >
                  ✨
                </motion.span>
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                >
                  🎉
                </motion.span>
              </motion.div>
            </motion.div>
          )}

          {/* In Progress UI */}
          {verificationStatus === VerificationStatus.IN_PROGRESS && (
            <>
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-secondary-900 mb-3">
                  NIC Document Verification
                </h1>
                <p className="text-lg text-secondary-600">
                  Processing your identity verification...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-secondary-700">
                    Progress
                  </span>
                  <span className="text-sm font-medium text-secondary-700">
                    Step {currentStepNumber} of {totalSteps}
                  </span>
                </div>
                <div className="w-full bg-secondary-200 rounded-full h-3 mb-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full flex items-center justify-end pr-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    {progressPercentage > 10 && (
                      <span className="text-xs text-white font-medium">
                        {progressPercentage}%
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Current Step Status */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-secondary-50 border border-secondary-200 rounded-lg p-6 mb-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <span className="font-semibold text-lg text-secondary-900">
                        {currentStep}
                      </span>
                    </div>
                    <span className="text-base text-blue-800 flex-1">
                      {stepMessage}
                    </span>
                  </div>
                  <div className="ml-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      Processing...
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Processing Animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-6"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <p className="text-blue-800 font-medium">
                    Please wait while we process your verification...
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    This process typically takes 30-60 seconds
                  </p>
                  <p className="text-xs text-blue-500 mt-2">
                    Check browser console (F12) for detailed logs
                  </p>
                </div>
              </motion.div>
            </>
          )}

          {/* Error UI */}
          {verificationStatus === VerificationStatus.FAILED && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-secondary-900 mb-3">
                  {currentStep === 'Setup Error' ? 'Registration Setup Required' : 'NIC Document Verification'}
                </h1>
              </div>

              {/* Current Step Status */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-3">
                      {currentStep === 'Setup Error' ? 
                        <AlertCircle className="w-5 h-5 text-red-600" /> :
                        <XCircle className="w-5 h-5 text-red-600" />
                      }
                      <span className="font-semibold text-lg text-secondary-900">
                        {currentStep}
                      </span>
                    </div>
                    <span className="text-base text-red-800 flex-1">
                      {stepMessage}
                    </span>
                  </div>
                  <div className="ml-4">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                      {currentStep === 'Setup Error' ? 'Setup Required' : 'Failed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8"
              >
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-red-800 mb-2">
                        {currentStep === 'Setup Error' ? 'Registration Incomplete' : 'Verification Failed'}
                      </h4>
                      <p className="text-red-700 mb-4">
                        {errorMessage || 'We encountered an issue while processing your verification.'}
                      </p>
                      
                      {suggestions && suggestions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-red-800 mb-2">
                            How to fix this:
                          </h5>
                          <ul className="text-sm text-red-700 space-y-1">
                            {suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-red-500 flex-shrink-0">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {currentStep === 'Setup Error' ? (
                    <>
                      <Button
                        onClick={handleGoToPersonalInfo}
                        className="flex items-center justify-center space-x-2 px-8 py-3"
                      >
                        <AlertCircle className="w-5 h-5" />
                        <span>Complete Personal Info</span>
                      </Button>
                      
                      <Button
                        onClick={handleSkipToComplete}
                        variant="outline"
                        className="flex items-center justify-center space-x-2 px-8 py-3"
                      >
                        <span>Skip for Testing</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleRetryVerification}
                        className="flex items-center justify-center space-x-2 px-8 py-3"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>Try Again</span>
                      </Button>
                      
                      <Button
                        onClick={handleSkipToComplete}
                        variant="outline"
                        className="flex items-center justify-center space-x-2 px-8 py-3"
                      >
                        <span>Skip for Testing</span>
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={handleGoToLogin}
                    variant="outline" 
                    className="flex items-center justify-center space-x-2 px-8 py-3"
                  >
                    <Home className="w-5 h-5" />
                    <span>Go to Login</span>
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-secondary-50 border border-secondary-200 rounded-xl p-6 mt-8"
        >
          <div className="text-center">
            <h4 className="font-semibold text-secondary-900 mb-2">
              🔒 Your Security Matters
            </h4>
            <p className="text-sm text-secondary-600">
              Your NIC document is processed securely using encrypted connections. 
              We use advanced AI technology to verify your identity while protecting your privacy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NicVerificationProgressPage;
