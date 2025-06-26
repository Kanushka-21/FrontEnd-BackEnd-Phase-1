import React, { useState } from 'react';
import { 
  Form, Input, InputNumber, Select, Upload, message, 
  Button, Card, Divider, Space, Typography, DatePicker,
  Radio, Tooltip
} from 'antd';
import { 
  UploadOutlined, InfoCircleOutlined, 
  CheckCircleOutlined, PlusOutlined, 
  QuestionCircleOutlined 
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd/es/upload';

const { Option } = Select;
const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

// Comprehensive list of certified gemstone attributes
const CERTIFIED_GEM_ATTRIBUTES = {
  identification: [
    { name: 'species', label: 'Species', type: 'input' },
    { name: 'variety', label: 'Variety', type: 'input' }
  ],
  physical: [
    { name: 'weight', label: 'Weight (carats)', type: 'number', min: 0, step: 0.01 },
    { name: 'dimensions', label: 'Dimensions (mm)', type: 'input', placeholder: 'Length x Width x Height' },
    { name: 'color', label: 'Color', type: 'input' },
    { 
      name: 'transparency', 
      label: 'Transparency', 
      type: 'select',
      options: ['Transparent', 'Translucent', 'Opaque']
    },
    { 
      name: 'cut', 
      label: 'Cut', 
      type: 'select',
      options: ['Brilliant', 'Step Cut', 'Mixed Cut', 'Cabochon', 'Double Cabochon', 'Rose Cut', 'Other']
    },
    { 
      name: 'shape', 
      label: 'Shape', 
      type: 'select',
      options: ['Round', 'Oval', 'Cushion', 'Emerald Cut', 'Pear', 'Marquise', 'Heart', 'Other']
    }
  ],
  optical: [
    { name: 'refractive_index', label: 'Refractive Index', type: 'input' },
    { name: 'polariscope', label: 'Polariscope Test', type: 'input' },
    { name: 'pleochroism', label: 'Pleochroism', type: 'input' },
    { 
      name: 'fluorescence_long', 
      label: 'Long Wave U.V.', 
      type: 'select',
      options: ['Inert', 'Weak', 'Medium', 'Strong']
    },
    { 
      name: 'fluorescence_short', 
      label: 'Short Wave U.V.',
      type: 'select',
      options: ['Inert', 'Weak', 'Medium', 'Strong']
    }
  ],
  certification: [
    { name: 'issuing_authority', label: 'Issuing Authority', type: 'input' },
    { name: 'report_number', label: 'Report Number', type: 'input' },
    { name: 'issue_date', label: 'Issue Date', type: 'date' }
  ]
};

// Basic attributes for non-certified gemstones
const NON_CERTIFIED_GEM_ATTRIBUTES = {
  basic: [
    { name: 'weight', label: 'Weight (carats)', type: 'number', min: 0, step: 0.01 },
    { name: 'dimensions', label: 'Dimensions (mm)', type: 'input', placeholder: 'Length x Width x Height' },
    { name: 'color', label: 'Color', type: 'input' },
    { 
      name: 'transparency', 
      label: 'Transparency', 
      type: 'select',
      options: ['Transparent', 'Translucent', 'Opaque']
    },
    { 
      name: 'shape', 
      label: 'Shape', 
      type: 'select',
      options: ['Round', 'Oval', 'Cushion', 'Emerald Cut', 'Pear', 'Marquise', 'Heart', 'Other']
    },
    { name: 'estimated_clarity', label: 'Estimated Clarity', type: 'input' },
    { name: 'visible_inclusions', label: 'Visible Inclusions', type: 'textarea' }
  ]
};

interface GemListingFormProps {
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const NewGemListingForm: React.FC<GemListingFormProps> = ({ 
  onSubmit, 
  onCancel,
  loading = false 
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [certificateFile, setCertificateFile] = useState<UploadFile[]>([]);
  const [isCertified, setIsCertified] = useState<boolean>(false);
  // State initialization

  // Handle certification type change
  const handleCertificationChange = (e: any) => {
    setIsCertified(e.target.value === 'certified');
    form.resetFields(['attributes']);
  };

  // File upload configuration
  const uploadProps: UploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  // Certificate upload configuration  const certificateUploadProps: UploadProps = {
    onRemove: () => {
      setCertificateFile([]);
    },
    beforeUpload: (file) => {
      const isPDF = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      if (!isPDF && !isImage) {
        message.error('You can only upload PDF or image files!');
        return false;
      }
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return false;
      }
      setCertificateFile([file]);
      return false;
    },
    fileList: certificateFile,
    maxCount: 1,
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error('Please upload at least one gemstone image');
      return;
    }

    if (isCertified && certificateFile.length === 0) {
      message.error('Please upload the certification document');
      return;
    }

    try {
      const formData = {
        ...values,
        images: fileList,
        certificateFile: certificateFile[0],
        isCertified,
      };
      await onSubmit(formData);
    } catch (error) {
      message.error('Failed to create listing');
    }
  };

  const renderAttributes = (attributes: any, section: string) => {
    return (
      <div key={section} className="mb-8">
        <Title level={5} className="mb-4">{section.replace('_', ' ').toUpperCase()}</Title>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attributes.map((attr: any) => (
            <Form.Item
              key={attr.name}
              label={
                <Space>
                  {attr.label}
                  {attr.tooltip && (
                    <Tooltip title={attr.tooltip}>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  )}
                </Space>
              }
              name={['attributes', section, attr.name]}
              rules={[{ required: true, message: `Please provide ${attr.label}` }]}
            >
              {renderFormInput(attr)}
            </Form.Item>
          ))}
        </div>
      </div>
    );
  };

  const renderFormInput = (attr: any) => {
    switch (attr.type) {
      case 'number':
        return (
          <InputNumber
            min={attr.min || 0}
            step={attr.step || 1}
            className="w-full"
            placeholder={attr.placeholder}
          />
        );
      case 'select':
        return (
          <Select placeholder={`Select ${attr.label.toLowerCase()}`}>
            {attr.options.map((opt: string) => (
              <Option key={opt} value={opt.toLowerCase()}>{opt}</Option>
            ))}
          </Select>
        );
      case 'date':
        return <DatePicker className="w-full" />;
      case 'textarea':
        return <TextArea rows={4} placeholder={attr.placeholder} />;
      default:
        return <Input placeholder={attr.placeholder || `Enter ${attr.label.toLowerCase()}`} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          scrollToFirstError
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="text-primary-600">New Gemstone Listing</Title>
            <Text type="secondary" className="text-lg">
              Create a new listing for your gemstone with detailed information
            </Text>
          </div>

          {/* Certification Status */}
          <div className="mb-8">
            <Title level={4}>Certification Status</Title>
            <Form.Item
              name="certification_type"
              rules={[{ required: true, message: 'Please select certification status' }]}
            >
              <Radio.Group onChange={handleCertificationChange} className="w-full">
                <Space direction="vertical" className="w-full">
                  <Radio value="certified" className="w-full">
                    <Card className="w-full cursor-pointer hover:border-primary-500">
                      <Space>
                        <CheckCircleOutlined className="text-primary-500" />
                        <div>
                          <Text strong>Certified Gemstone</Text>
                          <br />
                          <Text type="secondary">I have official certification documents</Text>
                        </div>
                      </Space>
                    </Card>
                  </Radio>
                  <Radio value="non-certified" className="w-full">
                    <Card className="w-full cursor-pointer hover:border-primary-500">
                      <Space>
                        <InfoCircleOutlined className="text-warning-500" />
                        <div>
                          <Text strong>Non-Certified Gemstone</Text>
                          <br />
                          <Text type="secondary">I don't have official certification</Text>
                        </div>
                      </Space>
                    </Card>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </div>

          <Divider />

          {/* Basic Information */}
          <div className="mb-8">
            <Title level={4}>Basic Information</Title>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="Gemstone Name"
                name="name"
                rules={[{ required: true, message: 'Please enter the gemstone name' }]}
              >
                <Input placeholder="e.g., Blue Sapphire" />
              </Form.Item>

              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select the category' }]}
              >
                <Select placeholder="Select gemstone category">
                  <Option value="sapphire">Sapphire</Option>
                  <Option value="ruby">Ruby</Option>
                  <Option value="emerald">Emerald</Option>
                  <Option value="diamond">Diamond</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* Attributes Section */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <Title level={4}>Gemstone Details</Title>
            {isCertified ? (
              Object.entries(CERTIFIED_GEM_ATTRIBUTES).map(([section, attrs]) => 
                renderAttributes(attrs, section)
              )
            ) : (
              Object.entries(NON_CERTIFIED_GEM_ATTRIBUTES).map(([section, attrs]) => 
                renderAttributes(attrs, section)
              )
            )}
          </div>

          {/* Image Upload Section */}
          <div className="mb-8">
            <Title level={4}>Gemstone Images</Title>
            <Paragraph type="secondary" className="mb-4">
              Upload clear, high-quality images of your gemstone from different angles
            </Paragraph>
            <Form.Item
              name="images"
              rules={[{ required: true, message: 'Please upload at least one image' }]}
            >
              <Upload
                {...uploadProps}
                listType="picture-card"
                multiple
                maxCount={5}
                accept="image/*"
              >
                <div>
                  <PlusOutlined />
                  <div className="mt-2">Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </div>

          {/* Certificate Upload Section */}
          {isCertified && (
            <div className="mb-8">
              <Title level={4}>Certification Document</Title>
              <Paragraph type="secondary" className="mb-4">
                Upload the official gemstone certification document (PDF or Image)
              </Paragraph>
              <Form.Item
                name="certificate"
                rules={[{ required: true, message: 'Please upload the certification document' }]}
              >
                <Upload {...certificateUploadProps} accept=".pdf,image/*">
                  <Button icon={<UploadOutlined />}>Upload Certificate</Button>
                </Upload>
              </Form.Item>
            </div>
          )}

          {/* Price Section */}
          <div className="mb-8">
            <Title level={4}>Price Information</Title>
            <Form.Item
              label="Your Price"
              name="price"
              rules={[{ required: true, message: 'Please set a price' }]}
            >
              <InputNumber
                prefix="$"
                min={0}
                step={0.01}
                placeholder="Enter your price"
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Description */}
          <div className="mb-8">
            <Title level={4}>Additional Details</Title>
            <Form.Item
              name="description"
              rules={[{ required: true, message: 'Please provide a description' }]}
            >
              <TextArea
                rows={4}
                placeholder="Provide any additional details about the gemstone..."
              />
            </Form.Item>
          </div>

          {/* Form Actions */}
          <Form.Item>
            <Space className="w-full justify-end">
              <Button onClick={onCancel} size="large">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Create Listing
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NewGemListingForm;
