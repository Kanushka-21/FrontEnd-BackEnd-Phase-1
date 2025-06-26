import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Form validation utilities
export const validators = {
  required: (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return null;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (value: string) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return null;
  },

  phone: (value: string) => {
    const phoneRegex = /^\+94[0-9]{9}$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid Sri Lankan phone number (+94xxxxxxxxx)';
    }
    return null;
  },

  nic: (value: string) => {
    // Sri Lankan NIC validation (old format: 9 digits + V, new format: 12 digits)
    const oldNicRegex = /^[0-9]{9}[vVxX]$/;
    const newNicRegex = /^[0-9]{12}$/;
    
    if (!oldNicRegex.test(value) && !newNicRegex.test(value)) {
      return 'Please enter a valid NIC number (123456789V or 123456789123)';
    }
    return null;
  },

  minLength: (min: number) => (value: string) => {
    if (value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (max: number) => (value: string) => {
    if (value.length > max) {
      return `Must be no more than ${max} characters long`;
    }
    return null;
  },

  dateOfBirth: (value: string) => {
    const date = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    
    if (age < 18) {
      return 'You must be at least 18 years old';
    }
    if (age > 100) {
      return 'Please enter a valid date of birth';
    }
    return null;
  },
};

// File validation utilities
export const fileValidators = {
  image: (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a JPEG or PNG image';
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'Image size must be less than 10MB';
    }
    
    return null;
  },

  faceImage: (file: File) => {
    const imageError = fileValidators.image(file);
    if (imageError) return imageError;
    
    // Additional face image specific validation can be added here
    return null;
  },

  nicImage: (file: File) => {
    const imageError = fileValidators.image(file);
    if (imageError) return imageError;
    
    // Additional NIC image specific validation can be added here
    return null;
  },
};

// Date utilities
export const dateUtils = {
  formatDate: (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  },

  formatDateTime: (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  getAge: (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  isValidDate: (dateString: string) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  },
};

// String utilities
export const stringUtils = {
  capitalize: (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  formatName: (firstName: string, lastName: string) => {
    return `${stringUtils.capitalize(firstName)} ${stringUtils.capitalize(lastName)}`;
  },

  truncate: (str: string, length: number) => {
    if (str.length <= length) return str;
    return str.slice(0, length) + '...';
  },

  slugify: (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  },

  generateInitials: (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  },
};

// Storage utilities
export const storageUtils = {
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Image utilities
export const imageUtils = {
  resizeImage: (
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.8
  ): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  },

  createImagePreview: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  blobToFile: (blob: Blob, fileName: string): File => {
    return new File([blob], fileName, { type: blob.type });
  },
};

// Camera utilities
export const cameraUtils = {
  captureFromWebcam: (videoElement: HTMLVideoElement): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      ctx.drawImage(videoElement, 0, 0);
      
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
  },

  getDevices: async (): Promise<MediaDeviceInfo[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting camera devices:', error);
      return [];
    }
  },
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Color utilities
export const colorUtils = {
  getStatusColor: (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
      case 'failed':
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info':
      case 'in-progress':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  },
};

// Environment utilities
export const envUtils = {
  isDevelopment: () => import.meta.env.DEV,
  isProduction: () => import.meta.env.PROD,
  getApiUrl: () => import.meta.env.VITE_API_URL || 'http://localhost:9091',
};
