import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, FileText, Upload } from 'lucide-react';
import { useRegistration } from '@/hooks';
import Button from '@/components/ui/Button';
import FileUpload from '@/components/ui/FileUpload';
import Modal from '@/components/ui/Modal';

const NicVerificationStep: React.FC = () => {
  const navigate = useNavigate();
  const { progress, loading } = useRegistration();
  
  const [nicImage, setNicImage] = useState<File | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [hasCheckedProgress, setHasCheckedProgress] = useState(false);

  useEffect(() => {
    // Give some time for the progress to be updated before checking
    const checkProgress = setTimeout(() => {
      console.log('Checking progress in NicVerificationStep:', progress);
      console.log('Personal info completed:', progress.personalInfoCompleted);
      console.log('Face verification completed:', progress.faceVerificationCompleted);
      console.log('User ID:', progress.userId);
      
      // Only redirect if we're absolutely sure the user hasn't completed previous steps
      // and we've given enough time for the state to update
      if (!progress.personalInfoCompleted || !progress.userId) {
        if (hasCheckedProgress) {
          console.log('Redirecting to personal info step - missing personal info or userId');
          navigate('/register');
        }
      } else if (!progress.faceVerificationCompleted && hasCheckedProgress) {
        // Give more time for face verification status to update
        console.log('Face verification not completed yet, giving more time...');
        setTimeout(() => {
          if (!progress.faceVerificationCompleted) {
            console.log('Face verification still not completed, redirecting to face verification');
            navigate('/register/face-verification');
          }
        }, 2000);
      } else {
        console.log('All checks passed, staying on NIC verification step');
      }
      
      setHasCheckedProgress(true);
    }, 1500); // Wait 1.5 seconds for state to update

    return () => clearTimeout(checkProgress);
  }, [progress, navigate, hasCheckedProgress]);

  const handleFileSelect = (file: File) => {
    setNicImage(file);
  };

  const handleVerification = async () => {
    if (!nicImage || !progress.userId) return;

    // Redirect to verification progress page with the uploaded image
    navigate('/register/nic-verification-progress', { 
      state: { nicImage } 
    });
  };

  const handleSkipForTesting = () => {
    console.log('Skipping NIC verification for testing...');
    navigate('/register/complete');
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="p-8 min-h-full flex flex-col">
        {/* Content Area - Scrollable */}
        <div className="flex-1">
          <div className="text-center">
            {/* Header Section */}
            <div className="mb-12">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-12 rounded-full w-40 h-40 mx-auto mb-8 flex items-center justify-center shadow-lg">
                <FileText className="w-20 h-20 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-secondary-900 mb-4">
                Upload Your NIC Document
              </h3>
              <p className="text-lg text-secondary-600 max-w-md mx-auto">
                Take a clear photo of the front side of your National Identity Card
              </p>
            </div>

            {/* Upload Section */}
            <div className="w-full max-w-2xl mx-auto mb-12">
              <FileUpload
                onFileSelect={handleFileSelect}
                label="Upload NIC Image"
                description="Take a clear photo of the front side of your NIC"
                accept={['image/jpeg', 'image/jpg', 'image/png']}
              />
            </div>

            {/* Action Buttons */}
            {nicImage && (
              <div className="flex gap-6 justify-center mb-12">
                <Button
                  onClick={handleVerification}
                  disabled={!nicImage || loading}
                  loading={loading}
                  size="lg"
                  className="flex items-center space-x-2 px-8"
                >
                  <FileText className="w-5 h-5" />
                  <span>Verify NIC Document</span>
                </Button>
                
                <Button
                  onClick={handleSkipForTesting}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-2 px-8"
                >
                  <span>Skip for Testing</span>
                </Button>
              </div>
            )}

            {!nicImage && (
              <div className="mb-12 text-center">
                <Button
                  onClick={handleSkipForTesting}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-2 px-8"
                >
                  <span>Skip NIC Verification (Testing)</span>
                </Button>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 max-w-2xl mx-auto">
              <h4 className="text-lg font-bold text-blue-900 mb-6 text-center">
                Tips for Best Results:
              </h4>
              <div className="space-y-4 text-blue-800">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use good lighting - avoid shadows and glare</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Ensure all text is clearly readable</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Capture the entire NIC within the frame</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Keep the NIC flat and avoid tilted angles</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Make sure your photo in the NIC is visible</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons - Fixed at Bottom */}
        <div className="flex justify-between items-center pt-8 border-t-2 border-secondary-100 mt-8 flex-shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate('/register/face-verification')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Face Verification</span>
          </Button>
        </div>
      </div>

      {/* Instructions Modal */}
      <Modal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
        title="NIC Verification Instructions"
      >
        <div className="space-y-6">
          <p className="text-secondary-700 text-lg">
            Please follow these guidelines to ensure successful NIC verification:
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-secondary-900 text-lg">Document Quality</h4>
                <p className="text-secondary-600">
                  Ensure your NIC is clean, flat, and all details are clearly visible
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-lg flex-shrink-0">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h4 className="font-semibold text-secondary-900 text-lg">Photo Quality</h4>
                <p className="text-secondary-600">
                  Use good lighting and ensure the entire NIC fits within the frame
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-800">
              <strong>Important:</strong> We will verify that the NIC number matches your 
              registration details and that your face matches the photo on the NIC.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-green-800">
              <strong>Security:</strong> Your NIC image is processed securely and used only 
              for verification. It will not be stored or shared.
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

export default NicVerificationStep;
