import React, { useState, useEffect } from 'react';
import { User, Edit, Save, X, Camera, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '@/services/api';
import { authUtils } from '@/utils';

interface ProfileProps {
  user: any;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    nicNumber: '',
    bio: 'Passionate gemstone collector and buyer with over 5 years of experience in the industry.'
  });
  const [originalData, setOriginalData] = useState(profileData);

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const currentUserId = authUtils.getCurrentUserId();
      
      if (!currentUserId) {
        console.error('No user ID found');
        // Fallback to user prop data
        if (user) {
          const fallbackData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '+94 77 123 4567',
            address: user.address || 'No 109/A, Mellawa, Lihiriyagama, Dankotuwa',
            dateOfBirth: user.dateOfBirth || '1997-10-17',
            nicNumber: user.nicNumber || '972914177V',
            bio: 'Passionate gemstone collector and buyer with over 5 years of experience in the industry.'
          };
          setProfileData(fallbackData);
          setOriginalData(fallbackData);
        }
        return;
      }

      const response = await api.getUserProfile(currentUserId);
      
      if (response.success && response.data) {
        const userData = {
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phoneNumber: response.data.phoneNumber || '',
          address: response.data.address || '',
          dateOfBirth: response.data.dateOfBirth || '',
          nicNumber: response.data.nicNumber || '',
          bio: response.data.bio || 'Passionate gemstone collector and buyer with over 5 years of experience in the industry.'
        };
        setProfileData(userData);
        setOriginalData(userData);
      } else {
        console.error('Failed to fetch user profile:', response.message);
        // Use fallback data from props
        if (user) {
          const fallbackData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '+94 77 123 4567',
            address: user.address || 'No 109/A, Mellawa, Lihiriyagama, Dankotuwa',
            dateOfBirth: user.dateOfBirth || '1997-10-17',
            nicNumber: user.nicNumber || '972914177V',
            bio: 'Passionate gemstone collector and buyer with over 5 years of experience in the industry.'
          };
          setProfileData(fallbackData);
          setOriginalData(fallbackData);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Use fallback data from props
      if (user) {
        const fallbackData = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '+94 77 123 4567',
          address: user.address || 'No 109/A, Mellawa, Lihiriyagama, Dankotuwa',
          dateOfBirth: user.dateOfBirth || '1997-10-17',
          nicNumber: user.nicNumber || '972914177V',
          bio: 'Passionate gemstone collector and buyer with over 5 years of experience in the industry.'
        };
        setProfileData(fallbackData);
        setOriginalData(fallbackData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const currentUserId = authUtils.getCurrentUserId();
      
      if (!currentUserId) {
        alert('User not authenticated');
        return;
      }

      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        bio: profileData.bio
      };

      const response = await api.updateUserProfile(currentUserId, updateData);
      
      if (response.success) {
        setIsEditing(false);
        setOriginalData(profileData);
        alert('Profile updated successfully!');
        
        // Update the user data in localStorage if available
        const userData = authUtils.getUserData();
        if (userData) {
          userData.firstName = profileData.firstName;
          userData.lastName = profileData.lastName;
          authUtils.saveAuthData(userData, authUtils.getAuthToken() || '');
        }
      } else {
        alert('Failed to update profile: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700">
                  <Camera size={16} />
                </button>
              )}
            </div>
            
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {profileData.firstName} {profileData.lastName}
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Verified Buyer</span>
              </div>
              <p className="text-gray-600 mt-1">Member since January 2024</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{profileData.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{profileData.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{profileData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{profileData.phoneNumber}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{profileData.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
              <p className="text-gray-900 py-2">{profileData.dateOfBirth}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NIC Number</label>
              <p className="text-gray-900 py-2">{profileData.nicNumber}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900 py-2">{profileData.bio}</p>
              )}
            </div>
          </div>

          {/* Account Statistics */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Account Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-gray-600">Advertisements</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">8</div>
                <div className="text-sm text-gray-600">Purchases</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-sm text-gray-600">Active Bids</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">4.8</div>
                <div className="text-sm text-gray-600">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
