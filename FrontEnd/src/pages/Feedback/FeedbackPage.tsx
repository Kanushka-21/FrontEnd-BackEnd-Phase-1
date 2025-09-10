import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Rate, 
  Button, 
  message, 
  Card, 
  Spin, 
  Typography, 
  Row, 
  Col,
  Alert,
  Divider
} from 'antd';
import { 
  StarFilled, 
  UserOutlined, 
  MessageOutlined,
  SendOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserInfo {
  id: string;
  name: string;
  title: string;
}

interface FeedbackFormValues {
  toUserId: string;
  name: string;
  title: string;
  message: string;
  rating: number;
}

const FeedbackPage: React.FC = () => {
  const [form] = Form.useForm();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recipients, setRecipients] = useState<User[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        fetchUserInfo(),
        fetchEligibleRecipients()
      ]).finally(() => setLoadingData(false));
    } else {
      setLoadingData(false);
    }
  }, [isAuthenticated]);

  const fetchUserInfo = async () => {
    try {
      const result = await api.getUserInfo();
      if (result.success && result.data) {
        setUserInfo(result.data);
        
        // Pre-fill form with user info
        form.setFieldsValue({
          name: result.data.name,
          title: result.data.title
        });
      }
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
    }
  };

  const fetchEligibleRecipients = async () => {
    try {
      setLoading(true);
      const result = await api.getEligibleRecipients();
      if (result.success && result.data) {
        setRecipients(result.data);
      } else {
        message.error('Failed to load eligible recipients');
      }
    } catch (error) {
      console.error('❌ Error fetching recipients:', error);
      message.error('Failed to load recipients');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: FeedbackFormValues) => {
    try {
      setSubmitting(true);
      
      // Debug: Log form values to see what's being sent
      console.log('🔍 Form values:', values);
      
      // Validate all required fields are present
      if (!values.toUserId) {
        message.error('Please select a recipient');
        return;
      }
      if (!values.name || values.name.trim() === '') {
        message.error('Please enter your name');
        return;
      }
      if (!values.title || values.title.trim() === '') {
        message.error('Please enter your title');
        return;
      }
      if (!values.message || values.message.trim() === '') {
        message.error('Please enter your feedback message');
        return;
      }
      if (!values.rating || values.rating === 0) {
        message.error('Please provide a rating');
        return;
      }
      
      const result = await api.submitFeedback(values);
      if (result.success) {
        message.success('🎉 Feedback submitted successfully!');
        form.resetFields();
        
        // Restore pre-filled user info
        if (userInfo) {
          form.setFieldsValue({
            name: userInfo.name,
            title: userInfo.title
          });
        }
      } else {
        message.error(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      message.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('❌ Form validation failed:', errorInfo);
    
    // Show specific validation errors
    const { errorFields } = errorInfo;
    if (errorFields && errorFields.length > 0) {
      const firstError = errorFields[0];
      const fieldName = firstError.name[0];
      const errorMessage = firstError.errors[0];
      
      console.log(`Field "${fieldName}" error:`, errorMessage);
      message.error(`Please fix: ${errorMessage}`);
    } else {
      message.error('Please fill in all required fields correctly');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert
          message="Authentication Required"
          description="Please log in to submit feedback."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
        <div className="ml-4">
          <Text>Loading feedback form...</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Title level={2} className="text-gray-900 mb-4">
            <HeartOutlined className="text-red-500 mr-3" />
            Submit Feedback
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Share your experience with other members of our community. Your feedback helps build trust and improves our marketplace.
          </Paragraph>
        </motion.div>

        <Row gutter={[24, 24]}>
          {/* Feedback Form */}
          <Col xs={24} lg={16}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg border-0">
                <Title level={4} className="mb-6 text-gray-800">
                  <MessageOutlined className="mr-2" />
                  Share Your Experience
                </Title>
                
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  autoComplete="off"
                  size="large"
                >
                  {/* Recipient Selection */}
                  <Form.Item
                    name="toUserId"
                    label="Select Recipient"
                    rules={[
                      { required: true, message: 'Please select a recipient' }
                    ]}
                  >
                    <Select
                      placeholder="Choose who you want to leave feedback for"
                      loading={loading}
                      showSearch
                      filterOption={(input, option) =>
                        option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                      }
                      size="large"
                    >
                      {recipients.map((user) => (
                        <Option key={user.id} value={user.id}>
                          <div className="flex items-center">
                            <UserOutlined className="mr-2 text-blue-500" />
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.role}</div>
                            </div>
                          </div>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Row gutter={16}>
                    {/* Your Name */}
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Your Name"
                        rules={[
                          { required: true, message: 'Please enter your name' },
                          { min: 2, max: 100, message: 'Name must be between 2-100 characters' }
                        ]}
                      >
                        <Input 
                          placeholder="Enter your full name"
                          prefix={<UserOutlined className="text-gray-400" />}
                        />
                      </Form.Item>
                    </Col>

                    {/* Your Title */}
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="title"
                        label="Your Title/Role"
                        rules={[
                          { required: true, message: 'Please enter your title' },
                          { min: 2, max: 100, message: 'Title must be between 2-100 characters' }
                        ]}
                      >
                        <Input 
                          placeholder="e.g., Gemstone Collector, Jewelry Designer"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Rating */}
                  <Form.Item
                    name="rating"
                    label="Rating"
                    rules={[
                      { required: true, message: 'Please provide a rating' }
                    ]}
                  >
                    <Rate 
                      character={<StarFilled />}
                      className="text-yellow-500 text-xl"
                      allowClear={false}
                    />
                  </Form.Item>

                  <div className="flex items-center mb-4">
                    <Text className="text-gray-600 ml-2">
                      Click the stars above to rate your experience (1-5 stars)
                    </Text>
                  </div>

                  {/* Message */}
                  <Form.Item
                    name="message"
                    label="Your Feedback"
                    rules={[
                      { required: true, message: 'Please enter your feedback' },
                      { min: 10, max: 1000, message: 'Feedback must be between 10-1000 characters' }
                    ]}
                  >
                    <TextArea
                      rows={6}
                      placeholder="Share your experience... What went well? How did this member help you? Would you recommend them to others?"
                      showCount
                      maxLength={1000}
                    />
                  </Form.Item>

                  {/* Submit Button */}
                  <Form.Item className="mb-0">
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={submitting}
                      size="large"
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 border-0 font-medium"
                      icon={<SendOutlined />}
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>
          </Col>

          {/* Sidebar Info */}
          <Col xs={24} lg={8}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Guidelines Card */}
              <Card className="shadow-lg border-0">
                <Title level={5} className="text-gray-800 mb-4">
                  📝 Feedback Guidelines
                </Title>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <Text className="text-gray-600">
                      Be honest and constructive in your feedback
                    </Text>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <Text className="text-gray-600">
                      Focus on the transaction or interaction experience
                    </Text>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <Text className="text-gray-600">
                      Mention specific positive aspects
                    </Text>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                    <Text className="text-gray-600">
                      Keep it professional and respectful
                    </Text>
                  </div>
                </div>
              </Card>

              {/* Impact Card */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <Title level={5} className="text-blue-800 mb-4">
                  🌟 Your Impact
                </Title>
                <Paragraph className="text-blue-700 mb-0 text-sm">
                  Your feedback helps other members make informed decisions and builds trust within our gemstone community. Quality feedback is displayed on our homepage to showcase member experiences.
                </Paragraph>
              </Card>

              {/* Privacy Notice */}
              <Card className="shadow-lg border-0 bg-gray-50">
                <Title level={5} className="text-gray-800 mb-4">
                  🔒 Privacy Notice
                </Title>
                <Text className="text-gray-600 text-sm">
                  Your feedback may be displayed publicly on our website to help other users. Personal contact information will never be shared.
                </Text>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default FeedbackPage;
