import React from 'react';
import { Card, Form, Input, Button, Upload, Row, Col, Divider } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';

interface ProfileProps {
  user?: any;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('Profile update:', values);
  };

  return (
    <div className="space-y-6">
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
            initialValues={{
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              email: user?.email || '',
              phone: '',
              bio: '',
              location: ''
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: 'Please enter your first name' }]}
                >
                  <Input placeholder="Enter your first name" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Please enter your last name' }]}
                >
                  <Input placeholder="Enter your last name" />
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
                  <Input placeholder="Enter your email" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Phone"
                  name="phone"
                >
                  <Input placeholder="Enter your phone number" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Location"
              name="location"
            >
              <Input placeholder="Enter your location" />
            </Form.Item>

            <Form.Item
              label="Bio"
              name="bio"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Tell buyers about yourself and your gemstones..." 
              />
            </Form.Item>

            <Divider />

            <Form.Item
              label="Profile Picture"
              name="avatar"
            >
              <Upload 
                listType="picture"
                maxCount={1}
                beforeUpload={() => false}
              >
                <Button icon={<UploadOutlined />}>
                  Upload Profile Picture
                </Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <div className="flex justify-end space-x-2">
                <Button>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Save Changes
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