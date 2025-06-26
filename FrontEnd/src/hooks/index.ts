import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, apiUtils } from '@/services/api';
import {
  UserRegistrationRequest,
  LoginRequest,
  AuthenticationResponse,
  RegistrationProgress,
  RegistrationStep
} from '@/types';
import { toast } from 'react-hot-toast';

// Authentication Hook is now in contexts/AuthContext.tsx
// This is just a re-export to maintain backward compatibility
import { useAuth as authHook } from '@/contexts/AuthContext';
export const useAuth = authHook;

// Registration Hook
export const useRegistration = () => {
  const [progress, setProgress] = useState<RegistrationProgress>({
    currentStep: RegistrationStep.PERSONAL_INFO,
    personalInfoCompleted: false,
    faceVerificationCompleted: false,
    nicVerificationCompleted: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedProgress = localStorage.getItem('registrationProgress');
    if (storedProgress) {
      try {
        const parsedProgress = JSON.parse(storedProgress);
        setProgress(parsedProgress);
      } catch (error) {
        console.error('Error parsing registration progress:', error);
      }
    }
  }, []);

  const saveProgress = (newProgress: RegistrationProgress) => {
    setProgress(newProgress);
    localStorage.setItem('registrationProgress', JSON.stringify(newProgress));
  };

  const registerUser = async (userData: UserRegistrationRequest): Promise<string | null> => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success && response.data) {
        const userId = response.data;
        const newProgress = {
          ...progress,
          currentStep: RegistrationStep.FACE_VERIFICATION,
          personalInfoCompleted: true,
          userId,
        };
        
        saveProgress(newProgress);
        toast.success('Registration successful! Please proceed to face verification.');
        return userId;
      } else {
        toast.error(response.message || 'Registration failed');
        return null;
      }
    } catch (error) {
      const errorMessage = apiUtils.formatErrorMessage(error);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const verifyFace = async (userId: string, faceImage: File): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authAPI.verifyFace(userId, faceImage);
      
      if (response.success) {
        const newProgress = {
          ...progress,
          currentStep: RegistrationStep.NIC_VERIFICATION,
          faceVerificationCompleted: true,
        };
        
        saveProgress(newProgress);
        toast.success('Face verification successful!');
        return true;
      } else {
        toast.error(response.message || 'Face verification failed');
        return false;
      }
    } catch (error) {
      const errorMessage = apiUtils.formatErrorMessage(error);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyNIC = async (userId: string, nicImage: File): Promise<any> => {
    try {
      setLoading(true);
      const response = await authAPI.verifyNIC(userId, nicImage);
      
      if (response.success) {
        const newProgress = {
          ...progress,
          currentStep: RegistrationStep.COMPLETE,
          nicVerificationCompleted: true,
        };
        
        saveProgress(newProgress);
        
        // Clear registration progress
        localStorage.removeItem('registrationProgress');
        
        return response;
      } else {
        return response;
      }
    } catch (error) {
      console.error('NIC verification error:', error);
      const errorMessage = apiUtils.formatErrorMessage(error);
      
      return {
        success: false,
        message: errorMessage,
        data: {
          error: 'SYSTEM_ERROR',
          userMessage: 'We encountered a technical issue while processing your verification.',
          suggestions: [
            'Check your internet connection and try again',
            'Try using a different image format (JPG or PNG)',
            'Contact support if the problem persists'
          ],
          technicalError: errorMessage
        }
      };
    } finally {
      setLoading(false);
    }
  };

  const goToStep = (step: RegistrationStep) => {
    const newProgress = { ...progress, currentStep: step };
    saveProgress(newProgress);
  };

  const resetRegistration = () => {
    const resetProgress = {
      currentStep: RegistrationStep.PERSONAL_INFO,
      personalInfoCompleted: false,
      faceVerificationCompleted: false,
      nicVerificationCompleted: false,
    };
    
    saveProgress(resetProgress);
    localStorage.removeItem('registrationProgress');
  };

  return {
    progress,
    loading,
    registerUser,
    verifyFace,
    verifyNIC,
    goToStep,
    resetRegistration,
  };
};

// Camera Hook
export const useCamera = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        setIsEnabled(videoDevices.length > 0);
      } catch (err) {
        setError('Camera access denied or not available');
      }
    };

    checkCameraPermission();
  }, []);

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setIsEnabled(true);
      setError(null);
      return true;
    } catch (err) {
      setError('Camera access denied');
      setIsEnabled(false);
      return false;
    }
  };

  return {
    isEnabled,
    error,
    devices,
    requestCameraPermission,
  };
};

// File Upload Hook
export const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return {
    file,
    preview,
    uploading,
    handleFileSelect,
    clearFile,
    setUploading,
  };
};

// Form Validation Hook
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | null>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const setTouched = (name: keyof T) => {
    setTouchedState(prev => ({ ...prev, [name]: true }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const fieldName = key as keyof T;
      const error = validationRules[fieldName](values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
    reset,
  };
};
