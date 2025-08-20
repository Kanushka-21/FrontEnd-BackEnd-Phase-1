import React, { useState, useEffect } from 'react';
import { Plus, X, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { authUtils } from '@/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:9092';

// Define Advertisement type
interface Advertisement {
  _id?: string;
  id?: string;
  title: string;
  category: string;
  description: string;
  price: string;
  mobileNo: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Helper function to get advertisement ID (handles both _id and id)
const getAdvertisementId = (ad: Advertisement): string => {
  return ad._id || ad.id || '';
};

// Define form data type
interface AdvertisementFormData {
  title: string;
  category: string;
  description: string;
  price: string;
  mobileNo: string;
}

// Categories for advertisements
const CATEGORIES = [
  'Electronics',
  'Jewelry',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Automotive',
  'Other'
];

interface AdvertisementsProps {
  user?: any;
}

// Helper function to get status styling and display text
const getStatusConfig = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return {
        className: 'bg-green-100 text-green-800',
        displayText: 'Approved',
        canEdit: true // Allow editing even for approved advertisements
      };
    case 'rejected':
      return {
        className: 'bg-red-100 text-red-800',
        displayText: 'Rejected',
        canEdit: true
      };
    case 'pending':
    default:
      return {
        className: 'bg-yellow-100 text-yellow-800',
        displayText: 'Pending Review',
        canEdit: true
      };
  }
};

const Advertisements: React.FC<AdvertisementsProps> = ({ user }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [viewingAd, setViewingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<AdvertisementFormData>({
    title: '',
    category: '',
    description: '',
    price: '',
    mobileNo: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Fetch user's advertisements
  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const token = authUtils.getAuthToken();
      const userId = authUtils.getCurrentUserId();
      
      console.log('🔍 Fetching advertisements...');
      console.log('Token exists:', !!token);
      console.log('User ID:', userId);
      
      if (!token || !userId) {
        toast.error('Please login to view your advertisements');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/advertisements/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Advertisements response:', response.data);
      console.log('Response structure check:');
      console.log('- response.data type:', typeof response.data);
      console.log('- response.data.data exists:', !!response.data.data);
      console.log('- response.data is array:', Array.isArray(response.data));

      let adsToSet = [];
      if (response.data && response.data.data) {
        adsToSet = response.data.data;
        console.log('✅ Using response.data.data format');
      } else if (Array.isArray(response.data)) {
        adsToSet = response.data;
        console.log('✅ Using direct array format');
      } else {
        console.warn('⚠️ Unexpected response format:', response.data);
        setAdvertisements([]);
        return;
      }

      // Debug each advertisement structure
      console.log('🔍 Advertisement structures:');
      adsToSet.forEach((ad, index) => {
        console.log(`Advertisement ${index + 1}:`, {
          rawAd: ad,
          id: ad.id,
          _id: ad._id,
          hasId: !!ad.id,
          has_id: !!ad._id,
          keys: Object.keys(ad)
        });
      });

      setAdvertisements(adsToSet);
      console.log('✅ Loaded advertisements:', adsToSet.length, adsToSet);
    } catch (error: any) {
      console.error('❌ Error fetching advertisements:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch advertisements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image selection
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 5) {
      toast.error('You can only upload up to 5 images');
      return;
    }

    setSelectedImages(files);

    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
  };

  // Remove selected image
  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviewUrls.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviews);
  };

  // Submit new advertisement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🆕 CREATE: Starting advertisement creation...');
    console.log('Form data:', formData);
    console.log('Selected images:', selectedImages);
    
    if (!formData.title || !formData.category || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedImages.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    try {
      setLoading(true);
      const token = authUtils.getAuthToken();
      const userId = authUtils.getCurrentUserId();
      
      console.log('🔐 CREATE authentication check:');
      console.log('Token exists:', !!token);
      console.log('User ID:', userId);
      
      if (!token || !userId) {
        toast.error('Please login to create advertisements');
        return;
      }

      const submitFormData = new FormData();
      submitFormData.append('title', formData.title.trim());
      submitFormData.append('category', formData.category.trim());
      submitFormData.append('description', formData.description.trim());
      submitFormData.append('price', formData.price.trim());
      submitFormData.append('mobileNo', formData.mobileNo.trim());
      submitFormData.append('userId', userId);
      submitFormData.append('email', user?.email || '');

      // Add images
      selectedImages.forEach((image, index) => {
        console.log(`Adding image ${index + 1}:`, image.name);
        submitFormData.append('images', image);
      });

      console.log('🚀 Sending CREATE request to:', `${API_BASE_URL}/api/advertisements`);
      console.log('Form data entries:');
      for (let [key, value] of submitFormData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const response = await axios.post(`${API_BASE_URL}/api/advertisements`, submitFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ CREATE response:', response.data);
      if (response.data) {
        console.log('🎉 Advertisement created successfully!');
        toast.success('Advertisement created successfully! It will be reviewed by admins.');
        setShowAddForm(false);
        resetForm();
        fetchAdvertisements(); // Refresh the list
      }
    } catch (error: any) {
      console.error('❌ Error creating advertisement:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Invalid data provided.');
      } else if (error.response?.status === 413) {
        toast.error('File size too large. Please use smaller images.');
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to create advertisement';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      price: '',
      mobileNo: '',
    });
    setSelectedImages([]);
    setImagePreviewUrls([]);
  };

  // Handle edit advertisement
  const handleEdit = (advertisement: Advertisement) => {
    const adId = getAdvertisementId(advertisement);
    console.log('✏️ Edit button clicked for advertisement:', advertisement);
    console.log('Advertisement ID:', adId);
    console.log('Advertisement Title:', advertisement.title);
    console.log('Advertisement Status:', advertisement.status);
    
    const userId = authUtils.getCurrentUserId();
    console.log('Current user ID:', userId);
    console.log('Advertisement seller ID:', advertisement.sellerId);
    
    // Check if user owns this advertisement
    if (userId && advertisement.sellerId && userId !== advertisement.sellerId) {
      toast.error('You can only edit your own advertisements');
      console.log('❌ User ID mismatch - cannot edit');
      return;
    }
    
    setEditingAd(advertisement);
    setFormData({
      title: advertisement.title,
      category: advertisement.category,
      description: advertisement.description,
      price: advertisement.price,
      mobileNo: advertisement.mobileNo,
    });
    // Clear any existing image selections when editing
    setSelectedImages([]);
    setImagePreviewUrls([]);
    
    console.log('📝 Edit modal opened with data:', {
      title: advertisement.title,
      category: advertisement.category,
      description: advertisement.description,
      price: advertisement.price,
      mobileNo: advertisement.mobileNo,
    });
  };

  // Submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAd) return;

    try {
      console.log('🔄 Starting edit submission...');
      const editingAdId = getAdvertisementId(editingAd);
      console.log('Editing advertisement ID:', editingAdId);
      
      setEditLoading(true);
      const token = authUtils.getAuthToken();
      const userId = authUtils.getCurrentUserId();
      
      console.log('🔐 Edit authentication check:');
      console.log('Token exists:', !!token);
      console.log('User ID:', userId);
      
      if (!token || !userId) {
        toast.error('Please login to update advertisements');
        return;
      }
      
      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('category', formData.category);
      submitFormData.append('description', formData.description);
      submitFormData.append('price', formData.price);
      submitFormData.append('mobileNo', formData.mobileNo);
      submitFormData.append('userId', userId);
      submitFormData.append('email', user?.email || '');

      // Add new images if any, otherwise keep existing images
      if (selectedImages.length > 0) {
        console.log('📷 Adding new images:', selectedImages.length);
        selectedImages.forEach((image) => {
          submitFormData.append('images', image);
        });
      } else {
        console.log('📷 No new images selected, keeping existing');
        // If no new images selected, we need to handle existing images
        // For now, we'll create a minimal placeholder since the backend requires images
        // In production, you'd modify the backend to handle image updates better
        const blob = new Blob(['existing'], { type: 'text/plain' });
        const file = new File([blob], 'keep-existing.txt', { type: 'text/plain' });
        submitFormData.append('images', file);
      }

      console.log('🚀 Sending PUT request to:', `${API_BASE_URL}/api/advertisements/${editingAdId}`);
      console.log('Form data contents:');
      for (let [key, value] of submitFormData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }

      const response = await axios.put(`${API_BASE_URL}/api/advertisements/${editingAdId}`, submitFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Edit response:', response.data);
      if (response.data) {
        console.log('Advertisement updated successfully:', response.data);
        toast.success('Advertisement updated successfully!');
        setEditingAd(null);
        resetForm();
        fetchAdvertisements();
      }
    } catch (error: any) {
      console.error('❌ Error updating advertisement:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error('Advertisement not found. It may have been deleted.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Invalid data provided.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to edit this advertisement.');
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to update advertisement';
        toast.error(errorMessage);
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete advertisement
  const handleDelete = async (advertisement: Advertisement) => {
    const adId = getAdvertisementId(advertisement);
    console.log('🗑️ Delete button clicked for advertisement:', advertisement);
    console.log('Advertisement ID:', adId);
    console.log('Advertisement Title:', advertisement.title);
    
    if (window.confirm(`Are you sure you want to delete the advertisement "${advertisement.title}"?`)) {
      try {
        const token = authUtils.getAuthToken();
        const userId = authUtils.getCurrentUserId();
        
        console.log('🔐 Delete authentication check:');
        console.log('Token exists:', !!token);
        console.log('User ID:', userId);
        console.log('Advertisement seller ID:', advertisement.sellerId);
        
        if (!token) {
          toast.error('Please login to delete advertisements');
          return;
        }

        // Check if user owns this advertisement
        if (userId && advertisement.sellerId && userId !== advertisement.sellerId) {
          toast.error('You can only delete your own advertisements');
          console.log('❌ User ID mismatch - cannot delete');
          return;
        }

        console.log('🚀 Attempting to delete advertisement:', adId);
        console.log('API URL:', `${API_BASE_URL}/api/advertisements/${adId}`);

        const response = await axios.delete(`${API_BASE_URL}/api/advertisements/${adId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Delete response:', response.data);
        toast.success('Advertisement deleted successfully');
        fetchAdvertisements(); // Refresh the list
      } catch (error: any) {
        console.error('❌ Error deleting advertisement:', error);
        console.error('Error response:', error.response);
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        
        if (error.response?.status === 401) {
          toast.error('Authentication failed. Please login again.');
        } else if (error.response?.status === 404) {
          toast.error('Advertisement not found. It may have been already deleted.');
        } else if (error.response?.status === 403) {
          toast.error('You do not have permission to delete this advertisement.');
        } else {
          const errorMessage = error.response?.data?.message || error.response?.data || 'Failed to delete advertisement';
          toast.error(errorMessage);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Advertisements</h1>
          <p className="text-gray-600 mt-1">Manage your product advertisements</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus size={20} />
          <span>Add Advertisement</span>
        </button>
      </div>

      {/* Advertisements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && advertisements.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading advertisements...</p>
          </div>
        ) : advertisements.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements yet</h3>
            <p className="text-gray-600 mb-4">Create your first advertisement to start selling!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Advertisement</span>
            </button>
          </div>
        ) : (
          advertisements.map((ad) => {
            const statusConfig = getStatusConfig(ad.status);
            const adId = getAdvertisementId(ad);
            
            // Debug logging for each advertisement
            console.log('🔍 Advertisement render data:', {
              rawAd: ad,
              extractedId: adId,
              _id: ad._id,
              id: ad.id,
              title: ad.title,
              status: ad.status,
              sellerId: ad.sellerId,
              currentUserId: authUtils.getCurrentUserId(),
              canEdit: statusConfig.canEdit
            });
            
            return (
              <div key={adId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Image */}
                {ad.images && ad.images.length > 0 && (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}
                
                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{ad.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig.className}`}>
                      {statusConfig.displayText}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{ad.category}</p>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">{ad.description}</p>
                  <p className="text-lg font-bold text-purple-600 mb-4">LKR {parseFloat(ad.price).toLocaleString()}</p>
                  
                  {/* Debug Info - Remove in production */}
                  <div className="text-xs text-gray-400 mb-3 p-2 bg-gray-50 rounded border-l-2 border-blue-200">
                    <div><strong>Debug Info:</strong></div>
                    <div>ID: {adId}</div>
                    <div>_id: {ad._id}</div>
                    <div>id: {ad.id}</div>
                    <div>Seller ID: {ad.sellerId}</div>
                    <div>Current User: {authUtils.getCurrentUserId()}</div>
                    <div>Can Edit: {statusConfig.canEdit ? 'Yes' : 'No'}</div>
                    <div>Status: {ad.status}</div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewingAd(ad)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm flex items-center justify-center space-x-1"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                    
                    {statusConfig.canEdit && (
                      <button
                        onClick={() => {
                          console.log('Edit button clicked!');
                          handleEdit(ad);
                        }}
                        className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        console.log('Delete button clicked!');
                        handleDelete(ad);
                      }}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm flex items-center justify-center space-x-1 transition-colors"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Advertisement Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add New Advertisement</h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter advertisement title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your item..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (LKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your contact number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images (up to 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelection}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>{loading ? 'Creating...' : 'Create Advertisement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Advertisement Modal */}
      {editingAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Advertisement</h2>
              <button
                onClick={() => {
                  setEditingAd(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter advertisement title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your item..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (LKR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your contact number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add New Images (up to 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelection}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingAd(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {editLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  <span>{editLoading ? 'Updating...' : 'Update Advertisement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Advertisement Modal */}
      {viewingAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Advertisement Details</h2>
              <button
                onClick={() => setViewingAd(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Images */}
              {viewingAd.images && viewingAd.images.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewingAd.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${viewingAd.title} - Image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{viewingAd.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{viewingAd.category}</p>
                  <p className="text-gray-700 mb-4">{viewingAd.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Price:</span>
                      <span className="text-lg font-bold text-purple-600">
                        LKR {parseFloat(viewingAd.price).toLocaleString()}
                      </span>
                    </div>
                    
                    {viewingAd.mobileNo && (
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">Mobile:</span>
                        <span className="text-gray-900">{viewingAd.mobileNo}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig(viewingAd.status).className}`}>
                        {getStatusConfig(viewingAd.status).displayText}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="text-gray-900">
                        {new Date(viewingAd.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advertisements;
