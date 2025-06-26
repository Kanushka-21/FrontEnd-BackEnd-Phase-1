// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// User Registration Types
export interface UserRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  nicNumber: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  verificationStatus: string;
  role: 'buyer' | 'seller' | 'admin';
}

// Registration Steps
export enum RegistrationStep {
  PERSONAL_INFO = 1,
  FACE_VERIFICATION = 2,
  NIC_VERIFICATION = 3,
  COMPLETE = 4
}

export interface RegistrationProgress {
  currentStep: RegistrationStep;
  personalInfoCompleted: boolean;
  faceVerificationCompleted: boolean;
  nicVerificationCompleted: boolean;
  userId?: string;
}

// Verification Status
export enum VerificationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED'
}

// Face Verification Types
export interface FaceVerificationResult {
  success: boolean;
  message: string;
  userId?: string;
  confidence?: number;
}

// Enhanced NIC Verification Types with detailed error handling
export interface NicVerificationResult {
  success: boolean;
  message: string;
  data?: {
    userId?: string;
    extractedNicNumber?: string;
    facesMatch?: boolean;
    currentStep?: string;
    stepMessage?: string;
    progress?: number;
    error?: 'POOR_IMAGE_QUALITY' | 'NIC_NUMBER_MISMATCH' | 'FACE_MISMATCH' | 'MISSING_FACE_IMAGE' | 'SYSTEM_ERROR' | 'USER_NOT_FOUND';
    userMessage?: string;
    suggestions?: string[];
    verificationComplete?: boolean;
    verificationStatus?: string;
    isVerified?: boolean;
    isFaceVerified?: boolean;
    isNicVerified?: boolean;
    successMessage?: string;
    // Additional verification details
    imageQualityValid?: boolean;
    nicNumberMatches?: boolean;
    faceComparisonSkipped?: boolean;
    nicImagePath?: string;
    extractedNicImagePath?: string;
    expectedNic?: string;
    extractedNic?: string;
    technicalError?: string;
  };
}

// Verification Step Status
export enum VerificationStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Verification Steps for NIC Process
export interface VerificationStepInfo {
  id: string;
  title: string;
  description: string;
  status: VerificationStepStatus;
  errorMessage?: string;
  suggestions?: string[];
}

// Form Validation Types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Camera Types
export interface CameraSettings {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
}

// File Upload Types
export interface FileUploadProps {
  file: File | null;
  preview?: string;
}

// Toast Message Types
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning'
}

// Navigation Types
export interface RouteParams {
  userId?: string;
  step?: string;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export interface InputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Gemstone Types
export interface Gemstone {
  id: string;
  name: string;
  price: number;
  image: string;
  certified: boolean;
  weight: number;
  color: string;
  species?: string;
  variety?: string;
  shape?: string;
  cut?: string;
  clarity?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  transparency?: string;
  certificate?: Certificate;
  predictedPriceRange?: GemPriceRange;
  description?: string;
  seller?: {
    name: string;
    rating: number;
  };
}

export interface Dimension {
  length: number;
  width: number;
  height: number;
}

export interface Certificate {
  issuingAuthority: string;
  reportNumber: string;
  date: string;
}

export interface DetailedGemstone extends Gemstone {
  species: string;
  variety: string;
  shape: string;
  cut: string;
  clarity: string;
  transparency: string;
  specifications: {
    species: string;
    variety: string;
    transparency: string;
    treatment?: string;
    refractiveIndex?: string;
    specificGravity?: string;
  };
}

// Gemstone Price Prediction
export interface PriceAttributes {
  variety: string;
  weight: number;
  color: string;
  clarity: string;
  cut: string;
  origin?: string;
}

export interface PricePrediction {
  price: number;
  confidenceInterval?: number;
  minPrice?: number;
  maxPrice?: number;
  factors?: {
    [key: string]: number;
  };
}

export interface GemPriceRange {
  min: number;
  max: number;
}

// Gemstone Card Props
export interface GemstoneCardProps {
  gemstone: Gemstone;
  onViewDetails?: (id: string) => void;
}

export interface DetailedGemstone extends GemstoneCardProps['gemstone'] {
  species: string;
  variety: string;
  shape: string;
  cut: string;
  clarity: string;
  transparency: string;
  specifications: {
    species: string;
    variety: string;
    transparency: string;
    treatment?: string;
    refractiveIndex?: string;
    specificGravity?: string;
  };
  certification?: {
    authority: string;
    number: string;
    date: string;
    link?: string;
  };
}

// Gemstone Listing Form
export interface GemstoneListingForm {
  // Basic Information
  gemstoneType: 'certified' | 'non-certified';
  images: File[];
  certificate?: File;
  
  // Certificate Details (conditional)
  issuingAuthority?: string;
  reportNumber?: string;
  certificateDate?: Date;
  
  // Gemstone Identification
  species: string;
  variety: string;
  
  // Physical Attributes
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  color: string;
  transparency: 'transparent' | 'translucent' | 'opaque';
  cut: string;
  shape: string;
  
  // Optical Properties
  refractiveIndex: {
    min: number;
    max: number;
  };
  polariscopeTest: string;
  pleochroism: 'strong' | 'moderate' | 'weak' | 'none';
  
  // Fluorescence
  fluorescence: {
    longWaveUV: 'strong' | 'moderate' | 'weak' | 'inert';
    shortWaveUV: 'strong' | 'moderate' | 'weak' | 'inert';
  };
  
  // Additional Properties
  specificGravity?: number;
  microscopeExamination?: string;
  absorptionSpectrum?: string;
  additionalComments?: string;
  
  // Pricing & Listing
  listingType: 'fixed' | 'auction';
  startingPrice: number;
  listingDuration: 7 | 14 | 30;
}
