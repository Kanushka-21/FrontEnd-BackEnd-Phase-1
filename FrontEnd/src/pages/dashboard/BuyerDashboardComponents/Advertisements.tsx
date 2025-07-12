import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Advertisement, AdvertisementFormData, CATEGORIES } from './shared';
import { api } from '@/services/api';
import { authUtils } from '@/utils';
import toast from 'react-hot-toast';

interface AdvertisementsProps {
  // Add any props you need from parent component
}

const Advertisements: React.FC<AdvertisementsProps> = () => {
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
    email: '',
    images: []
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Fetch user advertisements
  const fetchUserAdvertisements = async () => {
    try {
      setLoading(true);
      const userId = authUtils.getCurrentUserId();
      
      if (!userId) {
        console.error('User ID not found in localStorage');
        toast.error('User not authenticated. Please login again.');
        return;
      }
      
      console.log('Fetching advertisements for user:', userId);
      
      const response = await api.getUserAdvertisements(userId);
      console.log('Fetch response:', response);
      
      if (response.success && response.data) {
        // Transform backend data to match UI expectations
        const transformedData = response.data.map(ad => ({
          ...ad,
          status: ad.approved ? 'Approved' : 'Pending Review',
          dateCreated: new Date(ad.createdOn).toLocaleDateString(),
          views: 0, // Default values for now
          inquiries: 0,
          // Transform image paths if needed (for backward compatibility)
          images: ad.images ? ad.images.map(imagePath => {
            // Check if it's already a web URL
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
              return imagePath;
            }
            // If it's still a file system path, convert it
            const fileName = imagePath.split('/').pop() || imagePath.split('\\').pop();
            return `http://localhost:9092/uploads/advertisement-images/${fileName}`;
          }) : []
        }));
        setAdvertisements(transformedData);
        console.log('Transformed advertisements:', transformedData);
      } else {
        console.warn('Failed to fetch advertisements:', response);
        toast.error('Failed to load advertisements');
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast.error('Error loading advertisements');
    } finally {
      setLoading(false);
    }
  };

  // Load advertisements on component mount
  useEffect(() => {
    fetchUserAdvertisements();
  }, []);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const toastId = toast.loading(editingAd ? 'Updating advertisement...' : 'Creating advertisement...');
    
    try {
      setLoading(true);
      
      // Get and validate user ID
      const userId = authUtils.getCurrentUserId();
      if (!userId) {
        toast.error('User not authenticated. Please login again.', { id: toastId });
        return;
      }
      
      // Create FormData object for multipart/form-data
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      submitData.append('mobileNo', formData.mobileNo);
      submitData.append('email', formData.email);
      submitData.append('userId', userId);
      
      // Append images
      formData.images.forEach((file, index) => {
        submitData.append('images', file);
      });


      let response;
      if (editingAd) {
        // Update existing advertisement
        response = await api.updateAdvertisement(editingAd.id, submitData);
        console.log('Update response:', response);
      } else {
        // Create new advertisement
        response = await api.createAdvertisement(submitData);
        console.log('Create response:', response);
      }

      // Handle different response structures
      if (response && (response.success === true || response.status === 'success' || response.data)) {
        // Success case
        toast.success(
          `Advertisement ${editingAd ? 'updated' : 'created'} successfully! It will be reviewed before publishing.`,
          { id: toastId }
        );
        
        // Reset form
        setFormData({
          title: '',
          category: '',
          description: '',
          price: '',
          mobileNo: '',
          email: '',
          images: []
        });
        setShowAddForm(false);
        setEditingAd(null);
        
        // Refresh advertisements list
        await fetchUserAdvertisements();
        
      } else if (response && response.success === false) {
        // API returned success: false
        const errorMessage = response.message || response.error || 'Unknown error occurred';
        console.error('API Error:', errorMessage);
        toast.error(`Error ${editingAd ? 'updating' : 'creating'} advertisement: ${errorMessage}`, { id: toastId });
      } else {
        // Unexpected response structure
        console.error('Unexpected response:', response);
        toast.error('Unexpected response format from server', { id: toastId });
      }
    } catch (error: any) {
      console.error('Error submitting advertisement:', error);
      
      // Handle different error types
      let errorMessage = 'An error occurred while submitting the advertisement';
      
      if (error.response) {
        // Server responded with an error status
        console.error('Server error response:', error.response);
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        // Other error
        console.error('Other error:', error.message);
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (ad: Advertisement) => {
    const toastId = toast.loading('Loading advertisement details...');
    
    try {
      setEditLoading(true);
      
      // Fetch the full advertisement details by ID
      const response = await api.getAdvertisementById(ad.id);
      console.log('Edit - Fetch response:', response);
      
      if (response && (response.success === true || response.data)) {
        const advertisementData = response.data || response;
        
        // Set the editing advertisement
        setEditingAd(advertisementData);
        
        // Populate form data
        setFormData({
          title: advertisementData.title || '',
          category: advertisementData.category || '',
          description: advertisementData.description || '',
          price: advertisementData.price || '',
          mobileNo: advertisementData.mobileNo || '',
          email: advertisementData.email || '',
          images: [] // Start with empty new images
        });
        
        // Set existing images
        if (advertisementData.images && advertisementData.images.length > 0) {
          const transformedImages = advertisementData.images.map(imagePath => {
            // Check if it's already a web URL
            if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
              return imagePath;
            }
            // If it's still a file system path, convert it
            const fileName = imagePath.split('/').pop() || imagePath.split('\\').pop();
            return `http://localhost:9092/uploads/advertisement-images/${fileName}`;
          });
          setExistingImages(transformedImages);
        } else {
          setExistingImages([]);
        }
        
        setShowAddForm(true);
        toast.success('Advertisement details loaded successfully!', { id: toastId });
      } else {
        const errorMessage = response?.message || response?.error || 'Failed to load advertisement details';
        console.error('Edit - Fetch error:', errorMessage);
        toast.error(`Error loading advertisement: ${errorMessage}`, { id: toastId });
      }
    } catch (error: any) {
      console.error('Error fetching advertisement for edit:', error);
      
      let errorMessage = 'An error occurred while loading the advertisement';
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage, { id: toastId });
      
      // Fallback to using the data from the table if API fails
      setEditingAd(ad);
      setFormData({
        title: ad.title,
        category: ad.category,
        description: ad.description,
        price: ad.price,
        mobileNo: ad.mobileNo,
        email: ad.email,
        images: []
      });
      setExistingImages(ad.images || []);
      setShowAddForm(true);
    } finally {
      setEditLoading(false);
    }
  };

  const handleView = (ad: Advertisement) => {
    setViewingAd(ad);
  };

  const closeViewModal = () => {
    setViewingAd(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this advertisement?')) {
      const toastId = toast.loading('Deleting advertisement...');
      
      try {
        setLoading(true);
        const response = await api.deleteAdvertisement(id);
        console.log('Delete response:', response);
        
        if (response && (response.success === true || response.status === 'success')) {
          toast.success('Advertisement deleted successfully!', { id: toastId });
          await fetchUserAdvertisements();
        } else {
          const errorMessage = response?.message || response?.error || 'Failed to delete advertisement';
          console.error('Delete error:', errorMessage);
          toast.error(`Error deleting advertisement: ${errorMessage}`, { id: toastId });
        }
      } catch (error: any) {
        console.error('Error deleting advertisement:', error);
        
        let errorMessage = 'An error occurred while deleting the advertisement';
        if (error.response) {
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message || errorMessage;
        }
        
        toast.error(errorMessage, { id: toastId });
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingAd(null);
    setExistingImages([]);
    setFormData({
      title: '',
      category: '',
      description: '',
      price: '',
      mobileNo: '',
      email: '',
      images: []
    });
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {showAddForm ? (
        <AdvertisementForm
          formData={formData}
          editingAd={editingAd}
          existingImages={existingImages}
          onSubmit={handleSubmitAd}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onRemoveExistingImage={removeExistingImage}
          onCancel={resetForm}
          loading={loading}
          editLoading={editLoading}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">My Advertisements</h2>
            <button
              onClick={() => setShowAddForm(true)}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Create Advertisement</span>
            </button>
          </div>

          <AdvertisementsList
            advertisements={advertisements}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            loading={loading}
            editLoading={editLoading}
            onCreateNew={() => setShowAddForm(true)}
          />
        </>
      )}

      {/* View Advertisement Modal */}
      {viewingAd && (
        <ViewAdvertisementModal
          advertisement={viewingAd}
          onClose={closeViewModal}
        />
      )}
    </div>
  );
};

// Separate component for the advertisement form
interface AdvertisementFormProps {
  formData: AdvertisementFormData;
  editingAd: Advertisement | null;
  existingImages: string[];
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onRemoveExistingImage: (index: number) => void;
  onCancel: () => void;
  loading: boolean;
  editLoading: boolean;
}

const AdvertisementForm: React.FC<AdvertisementFormProps> = ({
  formData,
  editingAd,
  existingImages,
  onSubmit,
  onInputChange,
  onImageUpload,
  onRemoveImage,
  onRemoveExistingImage,
  onCancel,
  loading,
  editLoading
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
      </h2>
      <button onClick={onCancel} className="text-gray-400 hover:text-gray-600" disabled={loading || editLoading}>
        <X size={24} />
      </button>
    </div>

    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onInputChange}
          disabled={loading || editLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="Enter advertisement title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
        <select
          name="category"
          value={formData.category}
          onChange={onInputChange}
          disabled={loading || editLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          disabled={loading || editLoading}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="Describe your item in detail"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
        <input
          type="text"
          name="price"
          value={formData.price}
          onChange={onInputChange}
          disabled={loading || editLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="e.g., LKR 50,000 or Negotiable"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
        <input
          type="text"
          name="mobileNo"
          value={formData.mobileNo}
          onChange={onInputChange}
          disabled={loading || editLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="e.g., 0777875691"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onInputChange}
          disabled={loading || editLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          placeholder="e.g., your@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images *</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onImageUpload}
            disabled={loading || editLoading}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className={`cursor-pointer flex flex-col items-center justify-center ${loading || editLoading ? 'opacity-50' : ''}`}>
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Click to upload {editingAd ? 'additional' : ''} images</span>
            <span className="text-xs text-gray-400">PNG, JPG up to 10MB each</span>
          </label>
        </div>

        {/* Display existing images (for editing) */}
        {editingAd && existingImages.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images</h4>
            <div className="grid grid-cols-3 gap-4">
              {existingImages.map((imageUrl, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img 
                    src={imageUrl} 
                    alt={`Existing ${index + 1}`} 
                    className="w-full h-24 object-cover rounded-lg" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijk2IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA2NEMzNC43NDUyIDY0IDI0IDUzLjI1NDggMjQgNDBDMjQgMjYuNzQ1MiAzNC43NDUyIDE2IDQ4IDE2QzYxLjI1NDggMTYgNzIgMjYuNzQ1MiA3MiA0MEM3MiA1My4yNTQ4IDYxLjI1NDggNjQgNDggNjRaTTQ4IDU2QzU2LjgzNjYgNTYgNjQgNDguODM2NiA2NCA0MEM2NCAzMS4xNjM0IDU2LjgzNjYgMjQgNDggMjRDMzkuMTYzNCAyNCAzMiAzMS4xNjM0IDMyIDQwQzMyIDQ4LjgzNjYgMzkuMTYzNCA1NiA0OCA1NloiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveExistingImage(index)}
                    disabled={loading || editLoading}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                  >
                    <X size={12} />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                    Current
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display new images being uploaded */}
        {formData.images.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{editingAd ? 'New Images to Add' : 'Selected Images'}</h4>
            <div className="grid grid-cols-3 gap-4">
              {formData.images.map((file, index) => (
                <div key={`new-${index}`} className="relative">
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={`Preview ${index + 1}`} 
                    className="w-full h-24 object-cover rounded-lg" 
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    disabled={loading || editLoading}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 disabled:opacity-50"
                  >
                    <X size={12} />
                  </button>
                  {editingAd && (
                    <div className="absolute bottom-1 left-1 bg-green-600 bg-opacity-80 text-white text-xs px-1 rounded">
                      New
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || editLoading}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || editLoading || 
            (formData.images.length === 0 && existingImages.length === 0) || 
            !formData.title || !formData.category || !formData.price || !formData.mobileNo || !formData.email}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {loading || editLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <span>{editingAd ? 'Update' : 'Submit'} Advertisement</span>
          )}
        </button>
      </div>
    </form>
  </div>
);

// Separate component for the advertisements list
interface AdvertisementsListProps {
  advertisements: Advertisement[];
  onEdit: (ad: Advertisement) => void;
  onDelete: (id: string) => void;
  onView: (ad: Advertisement) => void;
  loading: boolean;
  editLoading: boolean;
  onCreateNew?: () => void;
}

const AdvertisementsList: React.FC<AdvertisementsListProps> = ({
  advertisements,
  onEdit,
  onDelete,
  onView,
  loading,
  editLoading,
  onCreateNew
}) => (
  <>
    {loading ? (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-500">Loading advertisements...</p>
      </div>
    ) : advertisements.length > 0 ? (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                  Advertisement
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                  Category
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                  Price
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                  Contact
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                  Status
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[8%]">
                  Stats
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                  Date
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[6%]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {advertisements.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-2 py-3">
                    <div className="flex items-center">
                      {ad.images && ad.images.length > 0 ? (
                        <img 
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0" 
                          src={ad.images[0]} 
                          alt={ad.title}
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMxNy4zNzI2IDMyIDEyIDI2LjYyNzQgMTIgMjBDMTIgMTMuMzcyNiAxNy4zNzI2IDggMjQgOEMzMC42Mjc0IDggMzYgMTMuMzcyNiAzNiAyMEMzNiAyNi42Mjc0IDMwLjYyNzQgMzIgMjQgMzJaTTI0IDI4QzI4LjQxODMgMjggMzIgMjQuNDE4MyAzMiAyMEMzMiAxNS41ODE3IDI4LjQxODMgMTIgMjQgMTJDMTkuNTgxNyAxMiAxNiAxNS41ODE3IDE2IDIwQzE2IDI0LjQxODMgMTkuNTgxNyAyOCAyNCAyOFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+Cg==';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="ml-2 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate" title={ad.title}>{ad.title}</div>
                        <div className="text-xs text-gray-500 truncate" title={ad.description || 'No description'}>
                          {ad.description ? 
                            (ad.description.length > 30 ? 
                              ad.description.substring(0, 30) + '...' : 
                              ad.description
                            ) : 
                            'No description'
                          }
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate">
                      {ad.category}
                    </span>
                  </td>
                  <td className="px-2 py-3">
                    <div className="text-sm font-medium text-gray-900 truncate" title={`LKR ${ad.price}`}>LKR {ad.price}</div>
                  </td>
                  <td className="px-2 py-3">
                    <div className="text-sm text-gray-900 truncate" title={ad.mobileNo}>{ad.mobileNo}</div>
                    <div className="text-xs text-gray-500 truncate" title={ad.email}>
                      {ad.email}
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      ad.approved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ad.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-500">
                    <div className="text-xs">{ad.views || 0} views</div>
                    <div className="text-xs">{ad.inquiries || 0} inquiries</div>
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-500">
                    <div className="text-xs">{new Date(ad.createdOn).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(ad.createdOn).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50" 
                        title="View Details"
                        onClick={() => onView(ad)}
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50"  
                        title="Edit"
                        onClick={() => onEdit(ad)}
                        disabled={loading || editLoading}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50" 
                        title="Delete"
                        onClick={() => onDelete(ad.id)}
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ) : (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements yet</h3>
          <p className="text-gray-500 mb-6">Create your first advertisement to start selling your items to potential buyers.</p>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <Plus size={16} />
            <span>Create Advertisement</span>
          </button>
        </div>
      </div>
    )}
  </>
);

// View Advertisement Modal Component
interface ViewAdvertisementModalProps {
  advertisement: Advertisement;
  onClose: () => void;
}

const ViewAdvertisementModal: React.FC<ViewAdvertisementModalProps> = ({
  advertisement,
  onClose
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (advertisement.images && advertisement.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === advertisement.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (advertisement.images && advertisement.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? advertisement.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Advertisement Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-md hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images Section */}
            <div className="space-y-4">
              {advertisement.images && advertisement.images.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div className="relative">
                    <img
                      src={advertisement.images[currentImageIndex]}
                      alt={`${advertisement.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-85 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjQwQzE2MC44MTggMjQwIDEyOCAyMDcuMTgyIDEyOCAxNjhDMTI4IDEyOC44MTggMTYwLjgxOCA5NiAyMDAgOTZDMjM5LjE4MiA5NiAyNzIgMTI4LjgxOCAyNzIgMTY4QzI3MiAyMDcuMTgyIDIzOS4xODIgMjQwIDIwMCAyNDBaTTIwMCAyMDBDMjE3LjY3MyAyMDAgMjMyIDE4NS42NzMgMjMyIDE2OEMyMzIgMTUwLjMyNyAyMTcuNjczIDEzNiAyMDAgMTM2QzE4Mi4zMjcgMTM2IDE2OCAxNTAuMzI3IDE2OCAxNjhDMTY4IDE4NS42NzMgMTgyLjMyNyAyMDAgMjAwIDIwMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                      }}
                    />
                    
                    {/* Navigation arrows for multiple images */}
                    {advertisement.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          ←
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          →
                        </button>
                        
                        {/* Image counter */}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                          {currentImageIndex + 1} / {advertisement.images.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {advertisement.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto h-20">
                      {advertisement.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex
                              ? 'border-blue-500'
                              : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiA0OEMyNC42ODYzIDQ4IDE4Ljg4MDEgNDIuMTkzNyAxOC44ODAxIDM0Ljg4MDFDMTguODgwMSAyNy41NjY0IDI0LjY4NjMgMjEuNzYwMiAzMiAyMS43NjAyQzM5LjMxMzcgMjEuNzYwMiA0NS4xMTk5IDI3LjU2NjQgNDUuMTE5OSAzNC44ODAxQzQ1LjExOTkgNDIuMTkzNyAzOS4zMTM3IDQ4IDMyIDQ4Wk0zMiA0MEMzNS4zMTM3IDQwIDM4IDM3LjMxMzcgMzggMzQuODgwMUMzOCAzMi40NDY0IDM1LjMxMzcgMjkuNzYwMiAzMiAyOS43NjAyQzI4LjY4NjMgMjkuNzYwMiAyNiAzMi40NDY0IDI2IDM0Ljg4MDFGMJY2IDM3LjMxMzcgMjguNjg2MyA0MCAzMiA0MFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Title and Category */}
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{advertisement.title}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {advertisement.category}
                </span>
              </div>

              {/* Price */}
              <div>
                <label className="block text-m font-medium mb-1">Price</label>
                <p className="text-3xl font-bold text-green-600">LKR {advertisement.price}</p>
              </div>

              {/* Description */}
              {advertisement.description && (
                <div>
                  <label className="block text-m font-medium  mb-1">Description</label>
                  <p className="text-gray-600 leading-relaxed">{advertisement.description}</p>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">Contact Information</h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Mobile:</span>
                    <span className="text-sm text-gray-900">{advertisement.mobileNo}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <span className="text-sm text-gray-900">{advertisement.email}</span>
                  </div>
                </div>
              </div>

              {/* Status and Stats */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-m font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    advertisement.approved
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {advertisement.approved ? 'Approved' : 'Pending Review'}
                  </span>
                </div>
                <div>
                  <label className="block text-m font-medium  mb-1">Statistics</label>
                  <div className="text-sm text-gray-600">
                    <div>{advertisement.views || 0} views</div>
                    <div>{advertisement.inquiries || 0} inquiries</div>
                  </div>
                </div>
              </div>

              {/* Date Created */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Created</label>
                <p className="text-sm text-gray-600">
                  {new Date(advertisement.createdOn).toLocaleDateString()} at{' '}
                  {new Date(advertisement.createdOn).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Advertisements;