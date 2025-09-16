import React, { useState, useEffect } from 'react';
import { Plus, X, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { authUtils } from '@/utils';
import toast from 'react-hot-toast';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:9092';

// Define Advertisement type
interface Advertisement {
  id: string;  // Changed from _id to id to match Spring Boot MongoDB
  title: string;
  category: string;
  description: string;
  price: string;
  mobileNo: string;
  email: string;
  images: string[];
  video?: string; // Optional video field
  sellerId: string;
  sellerName: string;
  approved: string; // Changed from status to approved to match backend
  userId: string;
  createdOn: string;
  modifiedOn: string;
}

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
        canEdit: false
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
  const [deletingAd, setDeletingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<AdvertisementFormData>({
    title: '',
    category: '',
    description: '',
    price: '',
    mobileNo: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');

  // Fetch user's advertisements
  const fetchAdvertisements = async () => {
    try {
      setLoading(true);
      const token = authUtils.getAuthToken();
      const userId = authUtils.getCurrentUserId();
      
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

      if (response.data && response.data.data) {
        setAdvertisements(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching advertisements:', error);
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

  // Handle video selection
  const handleVideoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video file size must be less than 50MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }

      setSelectedVideo(file);
      const previewUrl = URL.createObjectURL(file);
      setVideoPreviewUrl(previewUrl);
    }
  };

  // Remove selected video
  const removeVideo = () => {
    setSelectedVideo(null);
    setVideoPreviewUrl('');
  };

  // Submit new advertisement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedImages.length === 0 && !selectedVideo) {
      toast.error('Please select at least one image or video');
      return;
    }

    try {
      setLoading(true);
      const token = authUtils.getAuthToken();
      const userId = authUtils.getCurrentUserId();
      
      if (!token || !userId) {
        toast.error('Please login to create advertisements');
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

      // Add images
      selectedImages.forEach((image) => {
        submitFormData.append('images', image);
      });

      // Add video if selected
      if (selectedVideo) {
        submitFormData.append('video', selectedVideo);
      }

      const response = await axios.post(`${API_BASE_URL}/api/advertisements`, submitFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        toast.success('Advertisement created successfully! It will be reviewed by admins.');
        setShowAddForm(false);
        resetForm();
        fetchAdvertisements();
      }
    } catch (error: any) {
      console.error('Error creating advertisement:', error);
      toast.error(error.response?.data?.message || 'Failed to create advertisement');
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
    setSelectedVideo(null);
    setImagePreviewUrls([]);
    setVideoPreviewUrl('');
  };

  // Handle edit advertisement
  const handleEdit = async (advertisement: Advertisement) => {
    setEditingAd(advertisement);
    setFormData({
      title: advertisement.title,
      category: advertisement.category,
      description: advertisement.description,
      price: advertisement.price,
      mobileNo: advertisement.mobileNo,
    });
    // Reset image and video selection when editing
    setSelectedImages([]);
    setSelectedVideo(null);
    setImagePreviewUrls([]);
    setVideoPreviewUrl('');
  };

  // Submit edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingAd) return;

    try {
      setEditLoading(true);
      const token = authUtils.getAuthToken();
      const userId = authUtils.getCurrentUserId();
      
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

      // Add new images only if selected (backend now handles optional images)
      if (selectedImages.length > 0) {
        selectedImages.forEach((image) => {
          submitFormData.append('images', image);
        });
      }

      // Add new video only if selected
      if (selectedVideo) {
        submitFormData.append('video', selectedVideo);
      }

      const response = await axios.put(`${API_BASE_URL}/api/advertisements/${editingAd.id}`, submitFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        toast.success('Advertisement updated successfully!');
        setEditingAd(null);
        resetForm();
        fetchAdvertisements();
      }
    } catch (error: any) {
      console.error('Error updating advertisement:', error);
      toast.error(error.response?.data?.message || 'Failed to update advertisement');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete advertisement
  const handleDelete = (advertisement: Advertisement) => {
    setDeletingAd(advertisement);
  };

  const closeDeleteModal = () => {
    setDeletingAd(null);
  };

  const confirmDelete = async () => {
    if (!deletingAd) return;

    try {
      setLoading(true);
      const token = authUtils.getAuthToken();
      
      if (!token) {
        toast.error('Please login to delete advertisements');
        return;
      }

      const response = await axios.delete(`${API_BASE_URL}/api/advertisements/${deletingAd.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && (response.data.success || response.data.message)) {
        toast.success('Advertisement deleted successfully');
        fetchAdvertisements(); // Refresh the list
        setDeletingAd(null);
      } else {
        toast.error('Failed to delete advertisement');
      }
    } catch (error: any) {
      console.error('Error deleting advertisement:', error);
      if (error.response?.status === 404) {
        toast.error('Advertisement not found');
      } else if (error.response?.status === 403) {
        toast.error('You are not authorized to delete this advertisement');
      } else {
        toast.error(error.response?.data?.message || 'Failed to delete advertisement');
      }
    } finally {
      setLoading(false);
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
            const statusConfig = getStatusConfig(ad.approved);
            return (
              <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Media Preview */}
                <div className="relative">
                  {ad.video && ad.video.trim() !== '' ? (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                      <video
                        src={ad.video.startsWith('http') 
                          ? ad.video 
                          : `http://localhost:8080/advertisements/videos/${ad.video}`}
                        className="w-full h-48 object-cover"
                        muted
                        onMouseEnter={(e) => {
                          const video = e.target as HTMLVideoElement;
                          video.play().catch(() => {
                            // Ignore autoplay errors
                          });
                        }}
                        onMouseLeave={(e) => {
                          const video = e.target as HTMLVideoElement;
                          video.pause();
                          video.currentTime = 0;
                        }}
                      />
                      {/* Video Indicator */}
                      <div className="absolute top-2 left-2">
                        <div className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <span>🎬</span>
                          <span>VIDEO</span>
                        </div>
                      </div>
                      {/* Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                        <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <div className="w-0 h-0 border-l-4 border-l-purple-600 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                  ) : ad.images && ad.images.length > 0 ? (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                      <img
                        src={ad.images[0]}
                        alt={ad.title}
                        className="w-full h-48 object-cover"
                      />
                      {/* Multiple Images Indicator */}
                      {ad.images.length > 1 && (
                        <div className="absolute top-2 left-2">
                          <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                            📷 {ad.images.length} Images
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 h-48 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <FileText size={32} className="mx-auto mb-2" />
                        <span className="text-sm">No Media</span>
                      </div>
                    </div>
                  )}
                </div>
                
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
                        onClick={() => handleEdit(ad)}
                        className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded text-sm flex items-center justify-center space-x-1"
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(ad)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm flex items-center justify-center space-x-1"
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
                  Images (up to 5) - Optional
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video (optional) - Max 50MB
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelection}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                {/* Video Preview */}
                {videoPreviewUrl && (
                  <div className="mt-4">
                    <div className="relative">
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="w-full h-32 object-cover rounded-md"
                        style={{ maxHeight: '200px' }}
                      />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                    </div>
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
                  Current Media
                </label>
                
                {/* Current Video */}
                {editingAd.video && editingAd.video.trim() !== '' && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Video:</p>
                    <div className="relative">
                      <video
                        src={editingAd.video.startsWith('http') 
                          ? editingAd.video 
                          : `http://localhost:8080/advertisements/videos/${editingAd.video}`}
                        controls
                        className="w-full h-32 object-cover rounded-md border-2 border-purple-200"
                        style={{ maxHeight: '200px' }}
                      />
                      <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 py-0.5 rounded">
                        Current Video
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Current Images */}
                {editingAd.images && editingAd.images.length > 0 ? (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {editingAd.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Current ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border-2 border-gray-200"
                          />
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                            Current
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  !editingAd.video && (
                    <div className="mb-4 p-4 border border-gray-200 rounded-md text-center text-gray-500">
                      No current media
                    </div>
                  )
                )}

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add New Images (up to 5) - Optional
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Only upload new images if you want to replace all current images. Leave empty to keep existing images.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelection}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                {/* New Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">New Images Preview:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviewUrls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`New Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md border-2 border-green-200"
                          />
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                            New
                          </div>
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
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add New Video (optional) - Max 50MB
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Upload a new video to replace the current video. Leave empty to keep existing video.
                </p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelection}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                {/* New Video Preview */}
                {videoPreviewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">New Video Preview:</p>
                    <div className="relative">
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="w-full h-32 object-cover rounded-md border-2 border-green-200"
                        style={{ maxHeight: '200px' }}
                      />
                      <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                        New Video
                      </div>
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <X size={14} />
                      </button>
                    </div>
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
              {/* Media Section - Videos and Images */}
              {((viewingAd.video && viewingAd.video.trim() !== '') || (viewingAd.images && viewingAd.images.length > 0)) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Video First */}
                    {viewingAd.video && viewingAd.video.trim() !== '' && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                          <video
                            src={viewingAd.video.startsWith('http') 
                              ? viewingAd.video 
                              : `http://localhost:8080/advertisements/videos/${viewingAd.video}`}
                            className="w-full h-64 object-cover rounded-lg"
                            controls
                            autoPlay
                            muted
                            onLoadStart={() => console.log('🎬 Seller dashboard video loading:', viewingAd.video)}
                            onCanPlay={() => console.log('▶️ Seller dashboard video ready')}
                            onError={(e) => console.error('❌ Seller dashboard video error:', e)}
                          >
                            Your browser does not support the video tag.
                          </video>
                          {/* Video Badge */}
                          <div className="absolute top-3 left-3">
                            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                              🎬 Video
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Images */}
                    {viewingAd.images && viewingAd.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`${viewingAd.title} - Image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                        />
                        {/* Image Badge */}
                        <div className="absolute top-2 left-2">
                          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                            📷 Image {index + 1}
                          </div>
                        </div>
                      </div>
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusConfig(viewingAd.approved).className}`}>
                        {getStatusConfig(viewingAd.approved).displayText}
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

      {/* Delete Confirmation Modal */}
      {deletingAd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            {/* Modal Header */}
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Delete Advertisement</h3>
              </div>
            </div>

            {/* Modal Content */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-3">
                Are you sure you want to delete this advertisement? This action cannot be undone.
              </p>
              
              {/* Advertisement Preview */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start space-x-3">
                  {deletingAd.images && deletingAd.images.length > 0 ? (
                    <img
                      src={deletingAd.images[0]}
                      alt={deletingAd.title}
                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{deletingAd.title}</p>
                    <p className="text-sm text-gray-500">{deletingAd.category}</p>
                    <p className="text-sm text-gray-500">LKR {parseFloat(deletingAd.price).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Delete Advertisement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advertisements;
