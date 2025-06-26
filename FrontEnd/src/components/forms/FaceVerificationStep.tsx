import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle, XCircle, Camera as CameraIcon } from 'lucide-react';
import { useRegistration, useCamera } from '@/hooks';
import { VerificationStatus } from '@/types';
import Button from '@/components/ui/Button';
import Camera from '@/components/ui/Camera';
import Modal from '@/components/ui/Modal';

const FaceVerificationStep: React.FC = () => {
  const navigate = useNavigate();
  const { progress, verifyFace, loading, goToStep } = useRegistration();
  const { requestCameraPermission, isEnabled, error: cameraError } = useCamera();
  
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(VerificationStatus.PENDING);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [hasCheckedProgress, setHasCheckedProgress] = useState(false);
  const [isNavigatingToNIC, setIsNavigatingToNIC] = useState(false);

  useEffect(() => {
    // Give some time for the progress to be updated before checking
    const checkProgress = setTimeout(() => {
      console.log('Checking progress in FaceVerificationStep:', progress);
      console.log('Personal info completed:', progress.personalInfoCompleted);
      console.log('User ID:', progress.userId);
      
      // Only redirect if we're sure the user hasn't completed personal info
      // and we've given enough time for the state to update
      if (!progress.personalInfoCompleted && !progress.userId && hasCheckedProgress) {
        console.log('Redirecting to personal info step');
        navigate('/register');
      } else {
        console.log('Staying on face verification step');
      }
      
      setHasCheckedProgress(true);
    }, 1000); // Wait 1 second for state to update

    return () => clearTimeout(checkProgress);
  }, [progress, navigate, hasCheckedProgress]);

  // Watch for successful face verification and navigate accordingly
  useEffect(() => {
    if (isNavigatingToNIC && progress.faceVerificationCompleted) {
      console.log('Face verification completed, navigating to NIC step...');
      setTimeout(() => {
        navigate('/register/nic-verification');
      }, 500);
    }
  }, [progress.faceVerificationCompleted, isNavigatingToNIC, navigate]);

  const handleCameraPermission = async () => {
    const granted = await requestCameraPermission();
    if (granted) {
      setShowInstructions(false);
    }
  };

  const handleCapture = async (file: File) => {
    setCapturedImage(file);
    setVerificationStatus(VerificationStatus.IN_PROGRESS);

    if (progress.userId) {
      const success = await verifyFace(progress.userId, file);
      
      if (success) {
        setVerificationStatus(VerificationStatus.SUCCESS);
        setIsNavigatingToNIC(true);
        // Navigation will be handled by useEffect above after progress update
      } else {
        setVerificationStatus(VerificationStatus.FAILED);
      }
    } else {
      // If no userId, simulate success for testing
      console.log('No userId found, simulating success...');
      setVerificationStatus(VerificationStatus.SUCCESS);
      setTimeout(() => {
        navigate('/register/nic-verification');
      }, 2000);
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setVerificationStatus(VerificationStatus.PENDING);
    setIsNavigatingToNIC(false);
  };

  const handleSkipForTesting = () => {
    console.log('Skipping face verification for testing...');
    navigate('/register/nic-verification');
  };

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case VerificationStatus.IN_PROGRESS:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-16"
          >
            <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary-600 mb-8"></div>
            <h3 className="text-2xl font-bold text-secondary-900 mb-4">
              Processing Face Verification
            </h3>
            <p className="text-lg text-secondary-600 text-center max-w-md">
              Please wait while we analyze your face using advanced AI technology...
            </p>
          </motion.div>
        );

      case VerificationStatus.SUCCESS:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-16"
          >
            <div className="bg-green-100 p-8 rounded-full w-32 h-32 mb-8 flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-900 mb-4">
              Face Verification Successful!
            </h3>
            <p className="text-lg text-green-700 text-center max-w-md mb-6">
              Your face has been successfully verified using biometric authentication.
              {isNavigatingToNIC ? ' Redirecting to NIC verification...' : ''}
            </p>
            {isNavigatingToNIC && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-md">
                <p className="text-sm text-blue-800 text-center">
                  <strong>Processing...</strong> Face verification: {progress.faceVerificationCompleted ? 'Completed ✓' : 'Pending...'}
                </p>
              </div>
            )}
          </motion.div>
        );

      case VerificationStatus.FAILED:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-16"
          >
            <div className="bg-red-100 p-8 rounded-full w-32 h-32 mb-8 flex items-center justify-center">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-red-900 mb-4">
              Verification Failed
            </h3>
            <p className="text-lg text-red-700 mb-8 text-center max-w-md">
              We couldn't verify your face. Please ensure good lighting and try again.
            </p>
            <Button onClick={handleRetry} variant="outline" size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full p-8 flex flex-col">
      {/* Camera Section - Full Size */}
      <div className="flex-1 flex flex-col">
        {verificationStatus === VerificationStatus.PENDING && (
          <>
            {!isEnabled ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-12 rounded-full w-40 h-40 mb-12 flex items-center justify-center shadow-lg">
                  <CameraIcon className="w-20 h-20 text-primary-600" />
                </div>
                <h3 className="text-3xl font-bold text-secondary-900 mb-6 text-center">
                  Camera Access Required
                </h3>
                <p className="text-lg text-secondary-600 mb-12 text-center max-w-2xl leading-relaxed">
                  We need access to your camera to capture your face for secure biometric verification.
                  Your privacy is fully protected - images are encrypted and processed securely.
                </p>
                <div className="flex gap-6 justify-center">
                  <Button onClick={handleCameraPermission} size="lg" className="px-8">
                    <CameraIcon className="w-5 h-5 mr-2" />
                    Enable Camera Access
                  </Button>
                  <Button onClick={handleSkipForTesting} variant="outline" size="lg" className="px-8">
                    Skip for Testing
                  </Button>
                </div>
                {cameraError && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
                    <p className="text-red-600 text-center">{cameraError}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-full max-w-lg mb-8">
                  <Camera
                    onCapture={handleCapture}
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Verification Status - Full Size */}
        {verificationStatus !== VerificationStatus.PENDING && renderVerificationStatus()}
      </div>

      {/* Navigation Buttons - Full Width Layout */}
      <div className="flex justify-between items-center pt-8 border-t-2 border-secondary-100 mt-6">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => navigate('/register')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Personal Info</span>
        </Button>

        {verificationStatus === VerificationStatus.SUCCESS && !isNavigatingToNIC && (
          <Button
            onClick={() => navigate('/register/nic-verification')}
            size="md"
            className="flex items-center space-x-2 px-8"
          >
            <span>Continue to NIC Verification</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Instructions Modal */}
      <Modal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="Face Verification Instructions"
      >
        <div className="space-y-6">
          <p className="text-secondary-700 text-lg">
            For the best verification results, please follow these guidelines:
          </p>
          
          <ul className="space-y-4 text-secondary-600">
            <li className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Ensure your face is well-lit and clearly visible</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Look directly at the camera</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Remove sunglasses, hats, or masks</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Keep a neutral expression</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>Position your face within the oval guide</span>
            </li>
          </ul>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <p className="text-blue-800">
              <strong>Privacy Note:</strong> Your face image is encrypted and used only for 
              verification purposes. It will not be shared with third parties.
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowInstructions(false)} size="lg">
              I Understand
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FaceVerificationStep;
