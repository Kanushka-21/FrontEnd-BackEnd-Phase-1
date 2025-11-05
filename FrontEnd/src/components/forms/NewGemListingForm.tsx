import React, { useState } from 'react';
import { 
  Form, Input, InputNumber, Select, Upload, message, 
  Button, Card, Divider, Space, Typography, DatePicker,
  Radio, Tooltip
} from 'antd';
import { 
  UploadOutlined, InfoCircleOutlined, 
  CheckCircleOutlined, PlusOutlined, 
  QuestionCircleOutlined, DollarOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd/es/upload';

const { Option } = Select;
const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

// Comprehensive list of certified gemstone attributes
const CERTIFIED_GEM_ATTRIBUTES = {
  identification: [
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
  // Add CSS to head for custom animations and styling
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.5s ease-out forwards;
      }
      .gemstone-image-upload .ant-upload-list-picture-card-container {
        transition: all 0.3s ease;
        border-radius: 8px;
        overflow: hidden;
      }
      .gemstone-image-upload .ant-upload-list-picture-card-container:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 15px rgba(0,0,0,0.1);
      }
      .gemstone-form .ant-form-item {
        margin-bottom: 16px;
      }
      
      /* Responsive adjustments */
      @media (max-width: 768px) {
        .gemstone-form .ant-card-body {
          padding: 16px 12px;
        }
        .gemstone-form .ant-form-item-label > label {
          font-size: 14px;
        }
        .gemstone-form .ant-typography {
          white-space: normal;
        }
        .gemstone-form .bg-gradient-to-r {
          padding: 16px 12px;
        }
        .gemstone-form .rounded-lg {
          border-radius: 6px;
        }
      }
      
      @media (max-width: 480px) {
        .gemstone-form .ant-upload-picture-card-wrapper {
          display: flex;
          justify-content: center;
        }
        .gemstone-form .ant-upload.ant-upload-select {
          width: 100%;
          max-width: 280px;
          margin: 0 auto;
        }
        .gemstone-form .ant-input-number {
          width: 100% !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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

  // Certificate upload configuration
  const certificateUploadProps: UploadProps = {
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
      
      // Simulate OCR processing notification
      message.success('Certificate uploaded. Processing with OCR to extract gemstone data...');
      
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
      // Remove any certificate fields from the form values if this is a non-certified gemstone
      let formValues = { ...values };
      
      // For non-certified gemstones, explicitly remove any certificate-related fields
      if (!isCertified) {
        // Delete any certificate-related fields that might be in the form values
        if (formValues.attributes && formValues.attributes.certification) {
          delete formValues.attributes.certification;
        }
      }
      
      const formData = {
        ...formValues,
        images: fileList,
        // Only include certificate file for certified gemstones
        ...(isCertified ? { certificateFile: certificateFile[0] } : {}),
        isCertified,
        // Add default species value to maintain backend compatibility
        species: formValues.species || 'Not specified',
        // For non-certified gemstones, explicitly set ALL certificate-related fields to null/empty
        ...(isCertified ? {} : {
          // CSL certificate fields
          cslMemoNo: null,
          issueDate: null,
          authority: null,
          giaAlumniMember: null,
          
          // Other certificate fields
          certificateNumber: null,
          certifyingAuthority: null,
          certificateIssueDate: null,
          certificateAuthority: null,
          
          // Any other certificate-related fields that might exist
          certificateUrl: null,
          certificateType: null,
          certificateDetails: null
        })
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
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-8 sm:px-6 lg:px-8">
      <Card className="max-w-4xl mx-auto shadow-sm overflow-hidden">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          scrollToFirstError
          className="gemstone-form"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Title level={2} className="text-primary-600">New Gemstone Listing</Title>
            <Text type="secondary" className="text-lg">
              Create a new listing for your gemstone with detailed information
            </Text>
          </div>

          {/* Certification Status */}
          <div className="mb-4">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6 shadow-sm">
              <Title level={4} className="flex items-center text-indigo-800 mb-4">
                <CheckCircleOutlined className="text-indigo-600 mr-2" />
                Step 1: Certification Status
              </Title>
              <Form.Item
                name="certification_type"
                rules={[{ required: true, message: 'Please select certification status' }]}
              >
                <Radio.Group onChange={handleCertificationChange} className="w-full">
                  <Space direction="vertical" className="w-full" size="large">
                    <Radio value="certified" className="w-full">
                      <Card 
                        className={`w-full cursor-pointer transition-all duration-300 ${isCertified ? 'border-indigo-500 shadow-md bg-gradient-to-r from-indigo-50 to-blue-50' : 'hover:border-indigo-400 hover:shadow-sm'}`}
                        style={{ borderWidth: isCertified ? '2px' : '1px' }}
                      >
                        <Space align="start">
                          <div className={`p-2 rounded-full ${isCertified ? 'bg-indigo-100' : ''}`}>
                            <CheckCircleOutlined className="text-2xl text-indigo-500" />
                          </div>
                          <div>
                            <Text strong className="text-lg text-indigo-700">Certified Gemstone</Text>
                            <br />
                            <Text type="secondary">I have official certification documents</Text>
                          </div>
                        </Space>
                      </Card>
                    </Radio>
                    <Radio value="non-certified" className="w-full">
                      <Card 
                        className={`w-full cursor-pointer transition-all duration-300 ${!isCertified && form.getFieldValue('certification_type') === 'non-certified' ? 'border-amber-500 shadow-md bg-gradient-to-r from-amber-50 to-yellow-50' : 'hover:border-amber-400 hover:shadow-sm'}`}
                        style={{ borderWidth: !isCertified && form.getFieldValue('certification_type') === 'non-certified' ? '2px' : '1px' }}
                      >
                        <Space align="start">
                          <div className={`p-2 rounded-full ${!isCertified && form.getFieldValue('certification_type') === 'non-certified' ? 'bg-amber-100' : ''}`}>
                            <InfoCircleOutlined className="text-2xl text-amber-500" />
                          </div>
                          <div>
                            <Text strong className="text-lg text-amber-700">Non-Certified Gemstone</Text>
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
          </div>

          {/* Certificate Upload Section - Shown immediately after certification selection */}
          {isCertified && (
            <div className="mb-8 transition-all duration-500 ease-in-out mt-4 animate-fadeIn">
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 md:p-6 shadow-sm">
                <Title level={4} className="flex items-center text-indigo-700 flex-wrap">
                  <CheckCircleOutlined className="text-indigo-600 mr-2" />
                  <span className="break-normal">Step 2: Upload Certification Document</span>
                </Title>
                <div className="flex items-center mb-4 p-3 bg-blue-100 rounded-md">
                  <InfoCircleOutlined className="text-blue-600 mr-2 text-lg" />
                  <Paragraph type="secondary" className="mb-0 text-blue-700">
                    Upload your certification document to auto-fill gemstone attributes using OCR technology
                  </Paragraph>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 border border-blue-100 shadow-inner">
                  <Form.Item
                    name="certificate"
                    rules={[{ required: true, message: 'Please upload the certification document' }]}
                    className="mb-0"
                  >
                    <Upload 
                      {...certificateUploadProps} 
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                      className="w-full"
                      listType="picture"
                    >
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-500 transition-all duration-300 bg-gradient-to-b from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 shadow-sm hover:shadow">
                        <div className="p-4 rounded-full bg-indigo-100 mb-4">
                          <UploadOutlined className="text-4xl text-indigo-600" />
                        </div>
                        <div className="text-center">
                          <Text strong className="block text-lg text-indigo-700">Click or drag certificate to upload</Text>
                          <Text type="secondary">
                            Support for PDF and images. Max 10MB.
                          </Text>
                        </div>
                      </div>
                    </Upload>
                  </Form.Item>
                  {certificateFile.length > 0 && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-sm">
                      <Text className="text-green-700 flex items-center font-medium">
                        <CheckCircleOutlined className="mr-2 text-lg" />
                        Certificate uploaded successfully: {certificateFile[0].name}
                      </Text>
                      <div className="flex items-center mt-2 ml-6 bg-white px-3 py-2 rounded-md border border-green-100">
                        <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse mr-2"></div>
                        <div className="text-sm text-green-700">OCR processing: Extracting gemstone attributes from certificate...</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <Divider className="border-gray-200" />

          {/* Basic Information */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-3 sm:p-4 md:p-6 shadow-sm">
              <Title level={4} className="flex items-center text-teal-700 mb-4 flex-wrap">
                <InfoCircleOutlined className="text-teal-600 mr-2" />
                <span className="break-normal">Step 3: Basic Information</span>
              </Title>
              <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 border border-teal-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                  <Form.Item
                    label={<span className="text-teal-700 font-medium">Gemstone Name</span>}
                    name="name"
                    rules={[{ required: true, message: 'Please enter the gemstone name' }]}
                  >
                    <Input 
                      placeholder="e.g., Blue Sapphire" 
                      className="hover:border-teal-400 focus:border-teal-500"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-teal-700 font-medium">Category</span>}
                    name="category"
                    rules={[{ required: true, message: 'Please select the category' }]}
                  >
                    <Select 
                      placeholder="Select gemstone category"
                      className="hover:border-teal-400"
                      dropdownClassName="border-teal-200"
                    >
                      <Option value="sapphire">Sapphire</Option>
                      <Option value="ruby">Ruby</Option>
                      <Option value="emerald">Emerald</Option>
                      <Option value="diamond">Diamond</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>

          {/* Attributes Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-3 sm:p-4 md:p-6 shadow-sm">
              <Title level={4} className="flex items-center text-blue-700 mb-4 flex-wrap">
                <CheckCircleOutlined className="text-blue-600 mr-2" />
                <span className="break-normal">Step 4: Gemstone Details</span>
              </Title>
              <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 border border-blue-100">
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
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mb-8 transition-all duration-300 ease-in-out">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 sm:p-4 md:p-6 shadow-sm">
              <Title level={4} className="flex items-center text-purple-700 mb-2 flex-wrap">
                <PlusOutlined className="text-purple-600 mr-2" />
                <span className="break-normal">Step 5: Gemstone Images</span>
              </Title>
              <Paragraph type="secondary" className="mb-4">
                Upload clear, high-quality images of your gemstone from different angles
              </Paragraph>
              <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 border border-purple-100">
                <Form.Item
                  name="images"
                  rules={[{ required: true, message: 'Please upload at least one image' }]}
                  className="mb-0"
                >
                  <Upload
                    {...uploadProps}
                    listType="picture-card"
                    multiple
                    maxCount={5}
                    accept="image/*"
                    className="gemstone-image-upload"
                  >
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 transition-colors bg-purple-50 hover:bg-purple-100">
                      <PlusOutlined className="text-3xl text-purple-500 mb-2" />
                      <div className="text-center">
                        <Text strong className="block">Add Images</Text>
                        <Text type="secondary" className="text-xs">
                          JPG, PNG, GIF (Max: 5MB)
                        </Text>
                      </div>
                    </div>
                  </Upload>
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Certificate Upload Section moved up, right after certification selection */}

          {/* Price Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 sm:p-4 md:p-6 shadow-sm">
              <Title level={4} className="flex items-center text-green-700 mb-4 flex-wrap">
                <DollarOutlined className="text-green-600 mr-2" />
                <span className="break-normal">Step 6: Price Information</span>
              </Title>
              <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 border border-green-100">
                <Form.Item
                  label={<span className="text-green-700 font-medium">Your Price (LKR)</span>}
                  name="price"
                  rules={[{ required: true, message: 'Please set a price' }]}
                >
                  <InputNumber
                    prefix="LKR"
                    min={0}
                    step={100}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => value ? parseFloat(value.replace(/[^\d.]/g, '')) : 0}
                    placeholder="Enter your price"
                    className="w-full hover:border-green-400 focus:border-green-500"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 sm:p-4 md:p-6 shadow-sm">
              <Title level={4} className="flex items-center text-amber-700 mb-4 flex-wrap">
                <InfoCircleOutlined className="text-amber-600 mr-2" />
                <span className="break-normal">Step 7: Additional Details</span>
              </Title>
              <div className="bg-white rounded-lg p-3 sm:p-4 md:p-5 border border-amber-100">
                <Form.Item
                  name="description"
                  rules={[{ required: true, message: 'Please provide a description' }]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Provide any additional details about the gemstone..."
                    className="hover:border-amber-400 focus:border-amber-500"
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <Form.Item>
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 shadow-sm">
              <Space className="w-full justify-end">
                <Button 
                  onClick={onCancel} 
                  size="large" 
                  className="border-gray-300 hover:border-gray-400 hover:text-gray-800 shadow-sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading} 
                  size="large"
                  className="bg-gradient-to-r from-indigo-600 to-blue-600 border-none shadow-md hover:shadow-lg transition-all"
                >
                  Create Listing
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default NewGemListingForm;
