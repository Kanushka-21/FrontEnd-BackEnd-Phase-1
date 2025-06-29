import React, { useState } from 'react';
import { Plus, X, Upload, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Advertisement, FormData, CATEGORIES, MOCK_ADVERTISEMENTS } from './shared';

interface AdvertisementsProps {
  // Add any props you need from parent component
}

const Advertisements: React.FC<AdvertisementsProps> = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    description: '',
    price: '',
    contactInfo: '',
    images: []
  });

  // Mock advertisements data (in real app, this would come from props or API)
  const [myAdvertisements] = useState(MOCK_ADVERTISEMENTS);

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, images: [...prev.images, ...imageUrls] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitAd = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting advertisement:', formData);
    
    // Reset form
    setFormData({
      title: '',
      category: '',
      description: '',
      price: '',
      contactInfo: '',
      images: []
    });
    setShowAddForm(false);
    setEditingAd(null);
    
    alert('Advertisement submitted successfully! It will be reviewed before publishing.');
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      category: ad.category,
      description: ad.description,
      price: ad.price,
      contactInfo: ad.contactInfo,
      images: ad.images
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingAd(null);
    setFormData({
      title: '',
      category: '',
      description: '',
      price: '',
      contactInfo: '',
      images: []
    });
  };

  return (
    <div className="space-y-6">
      {showAddForm ? (
        <AdvertisementForm
          formData={formData}
          editingAd={editingAd}
          onSubmit={handleSubmitAd}
          onInputChange={handleInputChange}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onCancel={resetForm}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">My Advertisements</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Create Advertisement</span>
            </button>
          </div>

          <AdvertisementsList
            advertisements={myAdvertisements}
            onEdit={handleEdit}
            onDelete={(id) => console.log('Delete ad:', id)}
          />
        </>
      )}
    </div>
  );
};

// Separate component for the advertisement form
interface AdvertisementFormProps {
  formData: FormData;
  editingAd: Advertisement | null;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onCancel: () => void;
}

const AdvertisementForm: React.FC<AdvertisementFormProps> = ({
  formData,
  editingAd,
  onSubmit,
  onInputChange,
  onImageUpload,
  onRemoveImage,
  onCancel
}) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
      </h2>
      <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe your item in detail"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
        <input
          type="text"
          name="price"
          value={formData.price}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., LKR 50,000 or Negotiable"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information *</label>
        <input
          type="text"
          name="contactInfo"
          value={formData.contactInfo}
          onChange={onInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Phone number or email"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">Click to upload images</span>
            <span className="text-xs text-gray-400">PNG, JPG up to 10MB each</span>
          </label>
        </div>

        {formData.images.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative">
                <img src={image} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>{editingAd ? 'Update' : 'Submit'} Advertisement</span>
        </button>
      </div>
    </form>
  </div>
);

// Separate component for the advertisements list
interface AdvertisementsListProps {
  advertisements: Advertisement[];
  onEdit: (ad: Advertisement) => void;
  onDelete: (id: number) => void;
}

const AdvertisementsList: React.FC<AdvertisementsListProps> = ({
  advertisements,
  onEdit,
  onDelete
}) => (
  <>
    {advertisements.length > 0 ? (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Advertisement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views/Inquiries
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {advertisements.map((ad) => (
                <tr key={ad.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-12 w-12 rounded-lg object-cover" src={ad.images[0]} alt={ad.title} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{ad.title}</div>
                        <div className="text-sm text-gray-500">{ad.description.substring(0, 60)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {ad.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ad.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ad.status === 'Approved' 
                        ? 'bg-green-100 text-green-800'
                        : ad.status === 'Pending Review'
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ad.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{ad.views} views</div>
                    <div>{ad.inquiries} inquiries</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ad.dateCreated}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900" title="View">
                        <Eye size={16} />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900"  
                        title="Edit"
                        onClick={() => onEdit(ad)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900" 
                        title="Delete"
                        onClick={() => onDelete(ad.id)}
                      >
                        <Trash2 size={16} />
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
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisements yet</h3>
        <p className="text-gray-500 mb-4">Create your first advertisement to start selling your items.</p>
        <button
          onClick={() => {/* Handle create ad click */}}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2 mx-auto"
        >
          <Plus size={16} />
          <span>Create Advertisement</span>
        </button>
      </div>
    )}
  </>
);

export default Advertisements;
