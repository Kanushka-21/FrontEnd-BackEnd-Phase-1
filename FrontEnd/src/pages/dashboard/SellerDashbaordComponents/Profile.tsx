import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Row, Col, Divider, message, Spin } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { api } from '@/services/api';
import { authUtils } from '@/utils';

interface ProfileProps {
  user?: any;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    bio: '',
    dateOfBirth: '',
    nicNumber: '',
    userRole: '',
    verificationStatus: ''
  });

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setFetchingProfile(true);
      const currentUserId = authUtils.getCurrentUserId();
      
      if (!currentUserId) {
        console.error('No user ID found');
        // Fallback to user prop data
        if (user) {
          const fallbackData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            address: user.address || '',
            bio: user.bio || '',
            dateOfBirth: user.dateOfBirth || '',
            nicNumber: user.nicNumber || '',
            userRole: user.userRole || 'seller',
            verificationStatus: user.verificationStatus || 'pending'
          };
          setProfileData(fallbackData);
          form.setFieldsValue({
            firstName: fallbackData.firstName,
            lastName: fallbackData.lastName,
            email: fallbackData.email,
            phone: fallbackData.phoneNumber,
            location: fallbackData.address,
            bio: fallbackData.bio
          });
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
          bio: response.data.bio || '',
          dateOfBirth: response.data.dateOfBirth || '',
          nicNumber: response.data.nicNumber || '',
          userRole: response.data.userRole || 'seller',
          verificationStatus: response.data.verificationStatus || 'pending'
        };
        setProfileData(userData);
        
        // Set form values
        form.setFieldsValue({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phone: userData.phoneNumber,
          location: userData.address,
          bio: userData.bio
        });
      } else {
        console.error('Failed to fetch user profile:', response.message);
        message.error('Failed to load profile data');
        
        // Use fallback data from props
        if (user) {
          const fallbackData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            address: user.address || '',
            bio: user.bio || '',
            dateOfBirth: user.dateOfBirth || '',
            nicNumber: user.nicNumber || '',
            userRole: user.userRole || 'seller',
            verificationStatus: user.verificationStatus || 'pending'
          };
          setProfileData(fallbackData);
          form.setFieldsValue({
            firstName: fallbackData.firstName,
            lastName: fallbackData.lastName,
            email: fallbackData.email,
            phone: fallbackData.phoneNumber,
            location: fallbackData.address,
            bio: fallbackData.bio
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      message.error('Failed to load profile data');
      
      // Use fallback data from props
      if (user) {
        const fallbackData = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          bio: user.bio || '',
          dateOfBirth: user.dateOfBirth || '',
          nicNumber: user.nicNumber || '',
          userRole: user.userRole || 'seller',
          verificationStatus: user.verificationStatus || 'pending'
        };
        setProfileData(fallbackData);
        form.setFieldsValue({
          firstName: fallbackData.firstName,
          lastName: fallbackData.lastName,
          email: fallbackData.email,
          phone: fallbackData.phoneNumber,
          location: fallbackData.address,
          bio: fallbackData.bio
        });
      }
    } finally {
      setFetchingProfile(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const currentUserId = authUtils.getCurrentUserId();
      
      if (!currentUserId) {
        message.error('User not authenticated');
        return;
      }

      const updateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phone,
        address: values.location,
        bio: values.bio
      };

      const response = await api.updateUserProfile(currentUserId, updateData);
      
      if (response.success) {
        message.success('Profile updated successfully!');
        
        // Update local profile data
        setProfileData(prev => ({
          ...prev,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phone,
          address: values.location,
          bio: values.bio
        }));
        
        // Update the user data in localStorage if available
        const userData = authUtils.getUserData();
        if (userData) {
          userData.firstName = values.firstName;
          userData.lastName = values.lastName;
          authUtils.saveAuthData(userData, authUtils.getAuthToken() || '');
        }
      } else {
        message.error('Failed to update profile: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    form.setFieldsValue({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      email: profileData.email,
      phone: profileData.phoneNumber,
      location: profileData.address,
      bio: profileData.bio
    });
  };

  return (
    <div className="space-y-6">
      {/* Loading Indicator */}
      {fetchingProfile && (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <p className="text-gray-600">Manage your seller profile information</p>
      </div>

      {/* Profile Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              <p className="text-gray-600 mt-1">Update your profile details and preferences</p>
            </div>
            {/* Verification Status Badge */}
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                profileData.verificationStatus === 'VERIFIED' 
                  ? 'bg-green-100 text-green-800' 
                  : profileData.verificationStatus === 'REJECTED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profileData.verificationStatus === 'VERIFIED' ? '✅ Verified Seller' : 
                 profileData.verificationStatus === 'REJECTED' ? '❌ Verification Failed' : 
                 '⏳ Verification Pending'}
              </span>
            </div>
          </div>
          
          {/* User Info Summary */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserOutlined className="text-2xl text-blue-600" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {profileData.firstName} {profileData.lastName}
              </h4>
              <p className="text-gray-600">{profileData.email}</p>
              <p className="text-sm text-gray-500">Role: {profileData.userRole?.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={fetchingProfile}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: 'Please enter your first name' }]}
                >
                  <Input placeholder="Enter your first name" disabled={loading} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Please enter your last name' }]}
                >
                  <Input placeholder="Enter your last name" disabled={loading} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="Enter your email" disabled={true} />
                  <small className="text-gray-500">Email cannot be changed</small>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[{ required: true, message: 'Please enter your phone number' }]}
                >
                  <Input placeholder="Enter your phone number" disabled={loading} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Address/Location"
              name="location"
              rules={[{ required: true, message: 'Please enter your location' }]}
            >
              <Input placeholder="Enter your complete address" disabled={loading} />
            </Form.Item>

            <Form.Item
              label="Bio"
              name="bio"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Tell buyers about yourself, your expertise, and the types of gemstones you specialize in..." 
                disabled={loading}
              />
            </Form.Item>

            {/* Read-only Information */}
            <Divider orientation="left">Account Information</Divider>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="Date of Birth">
                  <Input 
                    value={profileData.dateOfBirth} 
                    disabled={true} 
                    placeholder="Not provided"
                  />
                  <small className="text-gray-500">Cannot be changed after verification</small>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="NIC Number">
                  <Input 
                    value={profileData.nicNumber} 
                    disabled={true} 
                    placeholder="Not provided"
                  />
                  <small className="text-gray-500">Cannot be changed after verification</small>
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Form.Item
              label="Profile Picture"
              name="avatar"
            >
              <Upload 
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
                disabled={loading}
              >
                <Button icon={<UploadOutlined />} disabled={loading}>
                  Upload Profile Picture
                </Button>
              </Upload>
              <small className="text-gray-500 block mt-2">
                Profile pictures will be implemented in a future update
              </small>
            </Form.Item>

            <Form.Item>
              <div className="flex justify-end space-x-2">
                <Button onClick={handleCancel} disabled={loading}>
                  Reset
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  disabled={fetchingProfile}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Profile;