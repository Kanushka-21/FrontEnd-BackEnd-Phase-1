import React, { useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Card,
  Space,
  DatePicker,
  Divider,
  Typography,
  Radio,
  message
} from 'antd';
import {
  UploadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd/es/upload';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Define attribute sets
const CERTIFIED_ATTRIBUTES = {
  identification: [
    { name: 'species', label: 'Species', type: 'input', required: true },
    { name: 'variety', label: 'Variety', type: 'input', required: true }
  ],
  physical: [
    { name: 'weight', label: 'Weight', type: 'number', required: true, suffix: 'carats', min: 0, step: 0.01 },
    { name: 'dimensions', label: 'Dimensions', type: 'input', required: true, placeholder: 'L x W x H in mm' },
    { name: 'color', label: 'Color', type: 'input', required: true },
    { 
      name: 'transparency', 
      label: 'Transparency', 
      type: 'select',
      required: true,
      options: ['Transparent', 'Translucent', 'Opaque']
    },
    { 
      name: 'cut', 
      label: 'Cut', 
      type: 'select',
      required: true,
      options: ['Brilliant', 'Step Cut', 'Mixed Cut', 'Cabochon', 'Double Cabochon', 'Rose Cut']
    },
    { 
      name: 'shape', 
      label: 'Shape', 
      type: 'select',
      required: true,
      options: ['Round', 'Oval', 'Cushion', 'Emerald Cut', 'Pear', 'Marquise', 'Heart']
    }
  ],
  tests: [
    { name: 'refractive_index', label: 'Refractive Index', type: 'input', required: true },
    { name: 'polariscope', label: 'Polariscope Test', type: 'input', required: true },
    { name: 'microscope', label: 'Microscope Examination', type: 'textarea', required: true },
    { 
      name: 'fluorescence_long', 
      label: 'Long Wave U.V.', 
      type: 'select',
      required: true,
      options: ['Inert', 'Weak', 'Medium', 'Strong']
    },
    { 
      name: 'fluorescence_short', 
      label: 'Short Wave U.V.',
      type: 'select',
      required: true,
      options: ['Inert', 'Weak', 'Medium', 'Strong']
    },
    { name: 'pleochroism', label: 'Pleochroism', type: 'input', required: true }
  ],
  certification: [
    { name: 'issuing_authority', label: 'Issuing Authority', type: 'input', required: true },
    { name: 'report_number', label: 'Report Number', type: 'input', required: true },
    { name: 'issue_date', label: 'Issue Date', type: 'date', required: true },
    { name: 'gemmologists', label: 'Gemmologists', type: 'textarea', required: true }
  ],
  additional: [
    { name: 'specific_gravity', label: 'Specific Gravity', type: 'input', required: false },
    { name: 'absorption_spectrum', label: 'Absorption Spectrum', type: 'input', required: false },
    { name: 'comments', label: 'Additional Comments', type: 'textarea', required: false }
  ]
};

const NON_CERTIFIED_ATTRIBUTES = {
  basic: [
    { name: 'weight', label: 'Weight', type: 'number', required: true, suffix: 'carats', min: 0, step: 0.01 },
    { name: 'dimensions', label: 'Dimensions', type: 'input', required: true, placeholder: 'L x W x H in mm' },
    { name: 'color', label: 'Color', type: 'input', required: true },
    { 
      name: 'transparency', 
      label: 'Transparency', 
      type: 'select',
      required: true,
      options: ['Transparent', 'Translucent', 'Opaque']
    },
    { 
      name: 'shape', 
      label: 'Shape', 
      type: 'select',
      required: true,
      options: ['Round', 'Oval', 'Cushion', 'Emerald Cut', 'Pear', 'Marquise', 'Heart']
    },
    { name: 'visible_inclusions', label: 'Visible Inclusions', type: 'textarea', required: true },
    { name: 'additional_notes', label: 'Additional Notes', type: 'textarea', required: false }
  ]
};

interface GemListingFormProps {
  onSubmit: (values: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const GemListingForm: React.FC<GemListingFormProps> = ({
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [isCertified, setIsCertified] = useState<boolean>(false);
  const [imageFiles, setImageFiles] = useState<UploadFile[]>([]);
  const [certificateFile, setCertificateFile] = useState<UploadFile[]>([]);

  const handleCertificationChange = (e: any) => {
    setIsCertified(e.target.value === 'certified');
    form.resetFields(['attributes']);
  };

  // Image upload configuration
  const imageUploadProps: UploadProps = {
    onRemove: (file) => {
      const index = imageFiles.indexOf(file);
      const newFileList = imageFiles.slice();
      newFileList.splice(index, 1);
      setImageFiles(newFileList);
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
      setImageFiles([...imageFiles, file]);
      return false;
    },
    fileList: imageFiles,
  };

  // Certificate upload configuration
  const certificateUploadProps: UploadProps = {
    onRemove: () => {
      setCertificateFile([]);
    },
    beforeUpload: (file) => {
      const isPDF = file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      if (!isPDF && !isImage) {
        message.error('You can only upload PDF or image files for certification!');
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

  const handleSubmit = async (values: any) => {
    if (imageFiles.length === 0) {
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
        isCertified,
        images: imageFiles,
        certificateFile: isCertified ? certificateFile[0] : null,
      };
      await onSubmit(formData);
    } catch (error) {
      message.error('Failed to create listing');
    }
  };

  const renderFormItem = (attr: any, section: string) => {
    const { type, name, label, required, options, placeholder, suffix, min, step } = attr;

    const rules = required ? [{ required, message: `Please provide ${label}` }] : [];
    const fieldName = ['attributes', section, name];

    switch (type) {
      case 'number':
        return (
          <Form.Item
            key={name}
            label={label}
            name={fieldName}
            rules={rules}
            className="mb-4"
          >
            <InputNumber
              min={min}
              step={step}
              className="w-full"
              placeholder={placeholder}
              addonAfter={suffix}
            />
          </Form.Item>
        );

      case 'select':
        return (
          <Form.Item
            key={name}
            label={label}
            name={fieldName}
            rules={rules}
            className="mb-4"
          >
            <Select placeholder={`Select ${label.toLowerCase()}`}>
              {options?.map((opt: string) => (
                <Select.Option key={opt} value={opt.toLowerCase()}>
                  {opt}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        );

      case 'date':
        return (
          <Form.Item
            key={name}
            label={label}
            name={fieldName}
            rules={rules}
            className="mb-4"
          >
            <DatePicker className="w-full" />
          </Form.Item>
        );

      case 'textarea':
        return (
          <Form.Item
            key={name}
            label={label}
            name={fieldName}
            rules={rules}
            className="mb-4"
          >
            <TextArea
              rows={4}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
            />
          </Form.Item>
        );

      default:
        return (
          <Form.Item
            key={name}
            label={label}
            name={fieldName}
            rules={rules}
            className="mb-4"
          >
            <Input placeholder={placeholder || `Enter ${label.toLowerCase()}`} />
          </Form.Item>
        );
    }
  };

  return (    <div className="bg-white p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="text-primary-600">New Gemstone Listing</Title>
            <Text type="secondary" className="text-lg">
              Create a detailed listing for your gemstone
            </Text>
          </div>

          {/* Certification Type */}
          <div className="mb-8">
            <Title level={4}>Certification Status</Title>
            <Form.Item
              name="certification_type"
              rules={[{ required: true, message: 'Please select certification status' }]}
            >
              <Radio.Group onChange={handleCertificationChange} className="w-full space-y-4">
                <Card className="w-full cursor-pointer hover:border-primary-500 transition-colors">
                  <Radio value="certified">
                    <Space>
                      <CheckCircleOutlined className="text-primary-500" />
                      <div>
                        <Text strong>Certified Gemstone</Text>
                        <br />
                        <Text type="secondary">I have official certification documents</Text>
                      </div>
                    </Space>
                  </Radio>
                </Card>
                <Card className="w-full cursor-pointer hover:border-primary-500 transition-colors">
                  <Radio value="non-certified">
                    <Space>
                      <InfoCircleOutlined className="text-warning-500" />
                      <div>
                        <Text strong>Non-Certified Gemstone</Text>
                        <br />
                        <Text type="secondary">I don't have official certification</Text>
                      </div>
                    </Space>
                  </Radio>
                </Card>
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
                  <Select.Option value="sapphire">Sapphire</Select.Option>
                  <Select.Option value="ruby">Ruby</Select.Option>
                  <Select.Option value="emerald">Emerald</Select.Option>
                  <Select.Option value="other">Other</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* Gemstone Attributes */}
          <div className="mb-8">
            <Title level={4}>Gemstone Details</Title>
            <div className="bg-gray-50 p-6 rounded-lg">
              {isCertified ? (
                Object.entries(CERTIFIED_ATTRIBUTES).map(([section, attrs]) => (
                  <div key={section} className="mb-8">
                    <Title level={5} className="mb-4 capitalize">
                      {section.replace('_', ' ')}
                    </Title>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attrs.map((attr) => renderFormItem(attr, section))}
                    </div>
                  </div>
                ))
              ) : (
                Object.entries(NON_CERTIFIED_ATTRIBUTES).map(([section, attrs]) => (
                  <div key={section} className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {attrs.map((attr) => renderFormItem(attr, section))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <Title level={4}>Gemstone Images</Title>
            <Paragraph type="secondary" className="mb-4">
              Upload clear, high-quality images of your gemstone from different angles
            </Paragraph>
            <Form.Item
              name="images"
              rules={[{ required: true, message: 'Please upload at least one image' }]}
            >
              <Upload.Dragger
                {...imageUploadProps}
                listType="picture-card"
                className="upload-list-inline"
                accept="image/*"
                multiple
                maxCount={5}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag images to upload</p>
                <p className="ant-upload-hint">
                  Support for JPG, PNG. Max 5MB per file.
                </p>
              </Upload.Dragger>
            </Form.Item>
          </div>

          {/* Certificate Upload */}
          {isCertified && (
            <div className="mb-8">
              <Title level={4}>Certification Document</Title>
              <Paragraph type="secondary" className="mb-4">
                Upload the official gemstone certification document
              </Paragraph>
              <Form.Item
                name="certificate"
                rules={[{ required: true, message: 'Please upload the certification document' }]}
              >
                <Upload.Dragger
                  {...certificateUploadProps}
                  className="upload-list-inline"
                  accept=".pdf,image/*"
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag certificate to upload</p>
                  <p className="ant-upload-hint">
                    Support for PDF and images. Max 10MB.
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </div>
          )}

          {/* Price Information */}
          <div className="mb-8">
            <Title level={4}>Price Information</Title>
            <Form.Item
              label="Price (USD)"
              name="price"
              rules={[{ required: true, message: 'Please set a price' }]}
            >
              <InputNumber
                className="w-full"
                min={0}
                step={0.01}
                placeholder="Enter your price"
                prefix="$"
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
          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={onCancel} size="large">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Create Listing
              </Button>
            </Space>          </Form.Item>
        </Form>
    </div>
  );
};

export default GemListingForm;
