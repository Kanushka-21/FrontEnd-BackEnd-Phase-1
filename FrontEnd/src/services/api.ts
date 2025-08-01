import axios, { AxiosResponse } from 'axios';
import {
  ApiResponse,
  UserRegistrationRequest,
  LoginRequest,
  AuthenticationResponse,
  FaceVerificationResult,
  NicVerificationResult,
  DetailedGemstone,
  GemstoneFilters,
  PriceAttributes,
  PricePrediction,
  Bid,
  Meeting,
  MeetingData
} from '@/types';
import { AdminLoginRequest, AdminAuthenticationResponse } from '@/Admin/types/AdminTypes';

// API Configuration
const API_BASE_URL = 'http://localhost:9092';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Health check
  healthCheck: async (): Promise<ApiResponse> => {
    const response: AxiosResponse<ApiResponse> = await api.get('/api/auth/health');
    return response.data;
  },

  // Register new user
  register: async (userData: UserRegistrationRequest): Promise<ApiResponse<string>> => {
    const response: AxiosResponse<ApiResponse<string>> = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // User login
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthenticationResponse>> => {
    const response: AxiosResponse<ApiResponse<AuthenticationResponse>> = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // Face verification
  verifyFace: async (userId: string, faceImage: File): Promise<ApiResponse<string>> => {
    const formData = new FormData();
    formData.append('faceImage', faceImage);

    const response: AxiosResponse<ApiResponse<string>> = await api.post(
      `/api/auth/verify-face/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // NIC verification with enhanced error handling
  verifyNIC: async (userId: string, nicImage: File): Promise<ApiResponse<NicVerificationResult>> => {
    const formData = new FormData();
    formData.append('nicImage', nicImage);

    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.post(
        `/api/auth/verify-nic/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Transform the response to match our enhanced NIC verification result type
      const transformedResponse: ApiResponse<NicVerificationResult> = {
        success: response.data.success,
        message: response.data.message,
        data: {
          success: response.data.success,
          message: response.data.message,
          ...response.data.data // Spread all the detailed data from backend
        }
      };

      return transformedResponse;
    } catch (error: any) {
      console.error('NIC verification API error:', error);
      
      // Handle different types of errors
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || 'NIC verification failed',
          data: {
            success: false,
            message: error.response.data.message || 'NIC verification failed',
            error: 'SYSTEM_ERROR',
            userMessage: error.response.data.data?.userMessage || 'We encountered a technical issue while processing your verification.',
            suggestions: error.response.data.data?.suggestions || [
              'Check your internet connection and try again',
              'Make sure your image file is not corrupted',
              'Try using a different image format (JPG or PNG)',
              'Contact support if the problem persists'
            ],
            technicalError: error.response.data.data?.technicalError || error.message,
            ...error.response.data.data
          }
        };
      }
      
      // Network or other errors
      return {
        success: false,
        message: 'Network error occurred',
        data: {
          success: false,
          message: 'Network error occurred',
          error: 'SYSTEM_ERROR',
          userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
          suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Contact support if the problem persists'
          ],
          technicalError: error.message
        }
      };
    }
  },

  // Admin login
  adminLogin: async (credentials: AdminLoginRequest): Promise<ApiResponse<AdminAuthenticationResponse>> => {
    const response: AxiosResponse<ApiResponse<AdminAuthenticationResponse>> = await api.post('/api/auth/admin/login', credentials);
    return response.data;
  },
};

// Test API (for development/debugging)
export const testAPI = {
  // Complete NIC verification test
  verifyNICFull: async (nicImage: File, faceImage: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('nicImage', nicImage);
    formData.append('faceImage', faceImage);

    const response: AxiosResponse<ApiResponse> = await api.post(
      '/api/test/verify-nic-full',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Extract NIC number only
  extractNICNumber: async (nicImage: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('nicImage', nicImage);

    const response: AxiosResponse<ApiResponse> = await api.post(
      '/api/test/extract-nic-number',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Validate face only
  validateFace: async (faceImage: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('faceImage', faceImage);

    const response: AxiosResponse<ApiResponse> = await api.post(
      '/api/test/validate-face',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

// Gemstone API
export const gemstonesAPI = {
  // Get all gemstones with optional filtering
  getAll: async (filters?: GemstoneFilters): Promise<ApiResponse<DetailedGemstone[]>> => {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.species?.length) params.append('species', filters.species.join(','));
      if (filters.variety?.length) params.append('variety', filters.variety.join(','));
      if (filters.color?.length) params.append('color', filters.color.join(','));
      if (filters.cut?.length) params.append('cut', filters.cut.join(','));
      if (filters.shape?.length) params.append('shape', filters.shape.join(','));
      if (filters.transparency?.length) params.append('transparency', filters.transparency.join(','));
      if (filters.priceRange) {
        params.append('minPrice', filters.priceRange.min.toString());
        params.append('maxPrice', filters.priceRange.max.toString());
      }
      if (filters.weightRange) {
        params.append('minWeight', filters.weightRange.min.toString());
        params.append('maxWeight', filters.weightRange.max.toString());
      }
      if (filters.certified !== undefined) params.append('certified', filters.certified.toString());
    }

    const response: AxiosResponse<ApiResponse<DetailedGemstone[]>> = await api.get(
      `/api/marketplace/listings${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  // Get a single gemstone by ID
  getById: async (id: string): Promise<ApiResponse<DetailedGemstone>> => {
    const response: AxiosResponse<ApiResponse<DetailedGemstone>> = await api.get(`/api/marketplace/listings/${id}`);
    return response.data;
  },

  // Create a new gemstone listing
  create: async (data: FormData): Promise<ApiResponse<DetailedGemstone>> => {
    const response: AxiosResponse<ApiResponse<DetailedGemstone>> = await api.post('/api/gemstones', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update an existing gemstone listing
  update: async (id: string, data: FormData): Promise<ApiResponse<DetailedGemstone>> => {
    const response: AxiosResponse<ApiResponse<DetailedGemstone>> = await api.put(`/api/gemstones/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete a gemstone listing
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/api/gemstones/${id}`);
    return response.data;
  },

  // Get price prediction for a gemstone
  predictPrice: async (attributes: PriceAttributes): Promise<ApiResponse<PricePrediction>> => {
    const response: AxiosResponse<ApiResponse<PricePrediction>> = await api.post('/api/gemstones/predict-price', attributes);
    return response.data;
  },
};

// Bids API
export const bidsAPI = {
  // Place a new bid
  place: async (gemstoneId: string, amount: number): Promise<ApiResponse<Bid>> => {
    const response: AxiosResponse<ApiResponse<Bid>> = await api.post('/api/bids', { gemstoneId, amount });
    return response.data;
  },

  // Get user's bids
  getUserBids: async (): Promise<ApiResponse<Bid[]>> => {
    const response: AxiosResponse<ApiResponse<Bid[]>> = await api.get('/api/bids/user');
    return response.data;
  },

  // Get bids for a specific gemstone
  getByGemstoneId: async (gemstoneId: string): Promise<ApiResponse<Bid[]>> => {
    const response: AxiosResponse<ApiResponse<Bid[]>> = await api.get(`/api/bids/gemstone/${gemstoneId}`);
    return response.data;
  },

  // Withdraw a bid
  withdraw: async (bidId: string): Promise<ApiResponse<void>> => {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/api/bids/${bidId}`);
    return response.data;
  },

  // Confirm a winning bid (seller or admin action)
  confirm: async (bidId: string): Promise<ApiResponse<void>> => {
    const response: AxiosResponse<ApiResponse<void>> = await api.post(`/api/bids/${bidId}/confirm`);
    return response.data;
  },
};

// Meetings API
export const meetingsAPI = {
  // Schedule a new meeting
  schedule: async (data: MeetingData): Promise<ApiResponse<Meeting>> => {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.post('/api/meetings', data);
    return response.data;
  },

  // Get user's meetings
  getUserMeetings: async (): Promise<ApiResponse<Meeting[]>> => {
    const response: AxiosResponse<ApiResponse<Meeting[]>> = await api.get('/api/meetings/user');
    return response.data;
  },

  // Update meeting status
  updateStatus: async (id: string, status: string): Promise<ApiResponse<Meeting>> => {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.patch(`/api/meetings/${id}/status`, { status });
    return response.data;
  },

  // Update meeting details
  updateDetails: async (id: string, data: Partial<MeetingData>): Promise<ApiResponse<Meeting>> => {
    const response: AxiosResponse<ApiResponse<Meeting>> = await api.put(`/api/meetings/${id}`, data);
    return response.data;
  },

  // Delete a meeting
  delete: async (id: string): Promise<ApiResponse<void>> => {
    const response: AxiosResponse<ApiResponse<void>> = await api.delete(`/api/meetings/${id}`);
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Convert blob to file
  blobToFile: (blob: Blob, fileName: string): File => {
    return new File([blob], fileName, { type: blob.type });
  },

  // Check if API is available
  checkAPIHealth: async (): Promise<boolean> => {
    try {
      await authAPI.healthCheck();
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  },

  // Format error message
  formatErrorMessage: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
};

// Extended API with all dashboard endpoints
const extendedAPI = {
  // Auth methods
  ...authAPI,

  // Gemstone methods
  ...gemstonesAPI,

  // Bids methods
  ...bidsAPI,

  // Meetings methods
  ...meetingsAPI,

  // Dashboard-specific methods

  // Buyer Dashboard APIs
  getUserBids: async (userId: string, page = 0, size = 10): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/api/bidding/user/${userId}/bids?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user bids:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getUserMeetings: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/api/meetings/user');
    return response.data;
  },

  getUserWatchlist: async (): Promise<ApiResponse<DetailedGemstone[]>> => {
    const response = await api.get('/api/watchlist');
    return response.data;
  },

  withdrawBid: async (bidId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/bids/${bidId}`);
    return response.data;
  },

  submitReview: async (data: any): Promise<ApiResponse<void>> => {
    const response = await api.post('/api/reviews', data);
    return response.data;
  },

  // Seller Dashboard APIs
  getSellerListings: async (): Promise<ApiResponse<DetailedGemstone[]>> => {
    try {
      const response = await api.get('/seller/listings');
      return response.data;
    } catch (error) {
      console.error('Error fetching seller listings:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getSellerStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/seller/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching seller stats:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  createListing: async (formData: FormData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/seller/listings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating listing:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  updateListing: async (listingId: string, formData: FormData): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/seller/listings/${listingId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating listing:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  deleteListing: async (listingId: string): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/seller/listings/${listingId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting listing:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getSellerPendingConfirmations: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/seller/pending-confirmations');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending confirmations:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  confirmBuyer: async (listingId: string, buyerId: string): Promise<ApiResponse> => {
    try {
      const response = await api.post(`/seller/listings/${listingId}/confirm-buyer`, { buyerId });
      return response.data;
    } catch (error) {
      console.error('Error confirming buyer:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  updateSellerStore: async (formData: FormData): Promise<ApiResponse> => {
    try {
      const response = await api.put('/seller/store', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating store:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  // Admin Dashboard APIs
  getUsers: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getTransactions: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/admin/transactions');
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getAdminStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getPendingVerifications: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/admin/verifications/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  updateVerificationStatus: async (userId: string, approved: boolean): Promise<ApiResponse> => {
    try {
      const response = await api.post(`/admin/verifications/${userId}`, { approved });
      return response.data;
    } catch (error) {
      console.error('Error updating verification status:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  updateUserStatus: async (userId: string, action: string): Promise<ApiResponse> => {
    try {
      const response = await api.post(`/admin/users/${userId}/${action}`);
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getMeetings: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/admin/meetings');
      return response.data;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  scheduleMeeting: async (meetingData: MeetingData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/admin/meetings', meetingData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  updateMeetingStatus: async (meetingId: string, status: string): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/admin/meetings/${meetingId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating meeting status:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getCommissionSettings: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/admin/commission-settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching commission settings:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  createCommissionSetting: async (data: any): Promise<ApiResponse> => {
    try {
      const response = await api.post('/admin/commission-settings', data);
      return response.data;
    } catch (error) {
      console.error('Error creating commission setting:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  updateCommissionSetting: async (id: string, data: any): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/admin/commission-settings/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating commission setting:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getSystemAlerts: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/admin/system-alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  dismissSystemAlert: async (alertId: string): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/admin/system-alerts/${alertId}/dismiss`);
      return response.data;
    } catch (error) {
      console.error('Error dismissing system alert:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getAdvertisements: async (): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get('/admin/advertisements');
      return response.data;
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  updateAdStatus: async (adId: string, action: string): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/admin/advertisements/${adId}/${action}`);
      return response.data;
    } catch (error) {
      console.error('Error updating advertisement status:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  // Advertisements API (User)
  createAdvertisement: async (formData: FormData): Promise<ApiResponse> => {
    try {
      const response = await api.post('/api/advertisements', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating advertisement:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getUserAdvertisements: async (userId: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get(`/api/advertisements/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user advertisements:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getAllAdvertisements: async (approved?: String): Promise<ApiResponse<any[]>> => {
    try {
      const params = approved !== undefined ? `?approved=${approved}` : '';
      const response = await api.get(`/api/advertisements${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all advertisements:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getAdvertisementById: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await api.get(`/api/advertisements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching advertisement:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  updateAdvertisement: async (id: string, formData: FormData): Promise<ApiResponse> => {
    try {
      const response = await api.put(`/api/advertisements/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating advertisement:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  deleteAdvertisement: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/api/advertisements/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  getAdvertisementsByCategory: async (category: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await api.get(`/api/advertisements/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching advertisements by category:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  updateAdvertisementApproval: async (id: string, approve: string): Promise<ApiResponse> => {
    try {
      const response = await api.patch(`/api/advertisements/${id}/approval`, null, {
        params: { approve }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating advertisement approval:', error);
      return { success: false, message: apiUtils.formatErrorMessage(error) };
    }
  },

  // Machine Learning Price Prediction
  predictPrice: async (attributes: PriceAttributes): Promise<ApiResponse<PricePrediction>> => {
    const response = await api.post('/api/ml/predict-price', attributes);
    return response.data;
  },

  // Additional utility methods
  addToWatchlist: async (gemstoneId: string): Promise<ApiResponse<void>> => {
    const response = await api.post(`/api/watchlist/${gemstoneId}`);
    return response.data;
  },

  removeFromWatchlist: async (gemstoneId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/api/watchlist/${gemstoneId}`);
    return response.data;
  },

  // Utils
  ...apiUtils,

  // Admin Gemstone Listing Management
  admin: {
    // Get pending gemstone listings for admin approval
    getPendingListings: async (page: number = 0, size: number = 10): Promise<ApiResponse<any>> => {
      try {
        const response = await api.get(`/api/admin/pending-listings?page=${page}&size=${size}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching pending listings:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Update listing status (approve or reject)
    updateListingStatus: async (listingId: string, status: 'APPROVED' | 'REJECTED', adminComment?: string): Promise<ApiResponse<any>> => {
      try {
        const params = new URLSearchParams();
        params.append('status', status);
        if (adminComment) {
          params.append('adminComment', adminComment);
        }
        
        const response = await api.put(`/api/admin/listings/${listingId}/status?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Error updating listing status:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Get admin dashboard statistics
    getDashboardStats: async (): Promise<ApiResponse<any>> => {
      try {
        const response = await api.get('/api/admin/dashboard-stats');
        return response.data;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Get listing details for admin review
    getListingDetails: async (listingId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await api.get(`/api/admin/listings/${listingId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching listing details:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    }
  },

  // Marketplace APIs
  marketplace: {
    // Get marketplace listings (approved gemstones)
    getListings: async (params?: {
      page?: number,
      size?: number,
      sortBy?: string,
      sortDir?: string,
      search?: string,
      category?: string,
      minPrice?: number,
      maxPrice?: number,
      certifiedOnly?: boolean
    }): Promise<ApiResponse<any>> => {
      try {
        const queryParams = new URLSearchParams();
        
        if (params?.page !== undefined) queryParams.append('page', params.page.toString());
        if (params?.size !== undefined) queryParams.append('size', params.size.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params?.certifiedOnly) queryParams.append('certifiedOnly', params.certifiedOnly.toString());
        
        const response = await api.get(`/api/marketplace/listings?${queryParams.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching marketplace listings:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Get listing details
    getListingDetails: async (listingId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await api.get(`/api/marketplace/listings/${listingId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching listing details:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Search gemstones
    searchGemstones: async (query: string, limit?: number): Promise<ApiResponse<any>> => {
      try {
        const params = new URLSearchParams();
        params.append('q', query);
        if (limit) params.append('limit', limit.toString());
        
        const response = await api.get(`/api/marketplace/search?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Error searching gemstones:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Get marketplace statistics
    getStats: async (): Promise<ApiResponse<any>> => {
      try {
        const response = await api.get('/api/marketplace/stats');
        return response.data;
      } catch (error) {
        console.error('Error fetching marketplace stats:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    }
  },

  // Bidding API endpoints
  bidding: {
    // Place a bid
    placeBid: async (bidRequest: {
      listingId: string;
      bidderId: string;
      bidderName: string;
      bidAmount: number;
      bidType?: string;
    }): Promise<ApiResponse<any>> => {
      try {
        const response = await api.post('/api/bidding/place-bid', bidRequest);
        return response.data;
      } catch (error) {
        console.error('Error placing bid:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Get bid statistics for a listing
    getBidStats: async (listingId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await api.get(`/api/bidding/stats/${listingId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching bid stats:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Get bid history for a listing
    getBidHistory: async (listingId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await api.get(`/api/bidding/history/${listingId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching bid history:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Get user's notifications
    getNotifications: async (userId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await api.get(`/api/bidding/notifications/${userId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Mark notification as read
    markNotificationRead: async (notificationId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await api.put(`/api/bidding/notifications/${notificationId}/read`);
        return response.data;
      } catch (error) {
        console.error('Error marking notification as read:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    },

    // Get user's bids
    getUserBids: async (userId: string, page: number = 0, size: number = 10): Promise<ApiResponse<any>> => {
      try {
        const response = await api.get(`/api/bidding/user/${userId}/bids?page=${page}&size=${size}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching user bids:', error);
        return { success: false, message: apiUtils.formatErrorMessage(error) };
      }
    }
  },
};

export { extendedAPI as api };
export default extendedAPI;
