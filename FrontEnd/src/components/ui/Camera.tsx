import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { cn } from '@/utils';
import Button from '@/components/ui/Button';
import { Camera as CameraIcon, RotateCcw, Check } from 'lucide-react';

interface CameraProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

const Camera: React.FC<CameraProps> = ({
  onCapture,
  disabled = false,
  className,
}) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  };

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsCapturing(true);
      setCapturedImage(imageSrc);
      
      // Convert base64 to blob then to file
      try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const file = new File([blob], 'face-capture.jpg', { type: 'image/jpeg' });
        
        setTimeout(() => {
          onCapture(file);
          setIsCapturing(false);
        }, 500);
      } catch (error) {
        console.error('Error converting image:', error);
        setIsCapturing(false);
      }
    }
  }, [webcamRef, onCapture]);

  const retake = useCallback(() => {
    setCapturedImage(null);
  }, []);

  return (
    <div className={cn('w-full max-w-md mx-auto', className)}>
      <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
        {!capturedImage ? (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-auto"
              mirrored={true}
            />
            
            {/* Face detection overlay */}
            <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-60">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-56 border-2 border-primary-400 rounded-full opacity-80" />
              </div>
            </div>
            
            {/* Instructions */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg text-center">
                <p className="text-sm">
                  Position your face within the oval and click capture
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured face"
              className="w-full h-auto"
            />
            
            {isCapturing && (
              <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                <div className="bg-green-500 text-white p-3 rounded-full">
                  <Check className="w-6 h-6" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div className="mt-6 flex justify-center space-x-4">
        {!capturedImage ? (
          <Button
            onClick={capture}
            disabled={disabled}
            className="flex items-center space-x-2"
          >
            <CameraIcon className="w-5 h-5" />
            <span>Capture Photo</span>
          </Button>
        ) : (
          <div className="flex space-x-3">
            <Button
              onClick={retake}
              variant="secondary"
              disabled={isCapturing}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake</span>
            </Button>
            
            <Button
              disabled={isCapturing}
              loading={isCapturing}
              className="flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>{isCapturing ? 'Processing...' : 'Use Photo'}</span>
            </Button>
          </div>
        )}
      </div>
      

  
    </div>
  );
};

export default Camera;
