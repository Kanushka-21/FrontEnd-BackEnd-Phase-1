import React, { useState } from 'react';
import { 
  Table, Button, Tag, Space, Modal, Form, Input, 
  InputNumber, message, Steps, Card, Radio, Upload,
  Row, Col, Select, Divider, Typography
} from 'antd';
import { 
  PlusOutlined, EditOutlined, EyeOutlined, 
  DeleteOutlined, ArrowLeftOutlined, ArrowRightOutlined,
  FileImageOutlined, SafetyCertificateOutlined,
  UploadOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import NewGemListingForm from '../../../components/forms/NewGemListingForm';
import { 
  mockListings, 
  formatLKR, 
  LISTING_STATUS_COLORS,
  GemListing 
} from './shared';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Dragger } = Upload;

interface ListingsProps {
  user?: any;
}

type CertificationStatus = 'certified' | 'non-certified';
type ViewMode = 'list' | 'add-listing';

interface WizardData {
  certificationType: CertificationStatus | null;
  basicInfo: any;
  certificationDetails: any;
  images: any[];
}

const Listings: React.FC<ListingsProps> = ({ user }) => {
  const [listings, setListings] = useState<GemListing[]>(mockListings);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    certificationType: null,
    basicInfo: {},
    certificationDetails: {},
    images: []
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isEditListingModalVisible, setIsEditListingModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<GemListing | null>(null);
  const [editForm] = Form.useForm();
  const [basicInfoForm] = Form.useForm();
  const [certificationForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Handle starting new listing wizard
  const handleStartNewListing = () => {
    setViewMode('add-listing');
    setCurrentStep(0);
    setWizardData({
      certificationType: null,
      basicInfo: {},
      certificationDetails: {},
      images: []
    });
  };

  // Handle going back to listings view
  const handleBackToListings = () => {
    setViewMode('list');
    setCurrentStep(0);
    setUploadedFile(null);
    setWizardData({
      certificationType: null,
      basicInfo: {},
      certificationDetails: {},
      images: []
    });
  };

  // Handle certification type selection
  const handleCertificationTypeSelect = (type: CertificationStatus) => {
    setWizardData(prev => ({ ...prev, certificationType: type }));
    if (type === 'certified') {
      setCurrentStep(1); // Go to certificate upload for certified gems
    } else {
      setCurrentStep(1); // Go to basic info for non-certified gems
    }
  };

  // Handle step navigation
  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle basic info form submission
  const handleBasicInfoSubmit = (values: any) => {
    setWizardData(prev => ({ ...prev, basicInfo: values }));
    if (wizardData.certificationType === 'certified') {
      setCurrentStep(3); // Go to images step for certified gems
    } else {
      setCurrentStep(2); // Go to images step for non-certified gems
    }
  };

  // Handle certification details submission
  const handleCertificationSubmit = (values: any) => {
    setWizardData(prev => ({ ...prev, certificationDetails: values }));
    setCurrentStep(2); // Go to basic info step for certified gems
  };

  // Handle certificate upload and backend API call
  const handleCertificateUpload = async (file: File) => {
    setLoading(true);
    try {
      // Create FormData to send file to backend
      const formData = new FormData();
      formData.append('certificate', file);

      // TODO: Replace with your actual backend endpoint
      const response = await fetch('/api/extract-certificate-data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract certificate data');
      }

      const extractedData = await response.json();
      
      // Update wizard data with extracted information
      setWizardData(prev => ({
        ...prev,
        certificationDetails: {
          authority: extractedData.authority,
          certificateNumber: extractedData.certificateNumber,
          certificateFile: file
        },
        basicInfo: {
          name: extractedData.gemstoneName,
          category: extractedData.category,
          weight: extractedData.weight,
          price: extractedData.estimatedValue || '',
          description: extractedData.description || '',
          color: extractedData.color,
          clarity: extractedData.clarity,
          cut: extractedData.cut,
          origin: extractedData.origin
        }
      }));

      // Update the basic info form with extracted data
      basicInfoForm.setFieldsValue({
        name: extractedData.gemstoneName,
        category: extractedData.category,
        weight: extractedData.weight,
        price: extractedData.estimatedValue || '',
        description: extractedData.description || '',
        color: extractedData.color,
        clarity: extractedData.clarity,
        cut: extractedData.cut,
        origin: extractedData.origin
      });

      message.success('Certificate data extracted successfully!');
      // Auto-proceed to basic information step
      setCurrentStep(2);
      
    } catch (error) {
      console.error('Certificate upload error:', error);
      message.error('Failed to extract certificate data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle final submission
  const handleFinalSubmission = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newListing: GemListing = {
        id: Date.now().toString(),
        name: wizardData.basicInfo.name,
        price: wizardData.basicInfo.price,
        status: 'pending',
        bids: 0,
        views: 0,
        createdAt: new Date().toISOString().split('T')[0],
        image: 'https://via.placeholder.com/100',
        category: wizardData.basicInfo.category,
        description: wizardData.basicInfo.description,
        isCertified: wizardData.certificationType === 'certified'
      };
      
      setListings(prev => [newListing, ...prev]);
      message.success('Listing submitted for approval successfully!');
      handleBackToListings();
    } catch (error) {
      message.error('Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  // Handle opening edit listing modal
  const handleOpenEditListingModal = (listing: GemListing) => {
    setSelectedListing(listing);
    editForm.setFieldsValue({
      name: listing.name,
      price: listing.price,
      description: listing.description
    });
    setIsEditListingModalVisible(true);
  };

  // Handle editing listing
  const handleEditListing = async (values: any) => {
    if (!selectedListing) return;
    
    try {
      const updatedListings = listings.map(listing => 
        listing.id === selectedListing.id 
          ? { ...listing, ...values }
          : listing
      );
      setListings(updatedListings);
      message.success('Listing updated successfully');
      setIsEditListingModalVisible(false);
    } catch (error) {
      message.error('Failed to update listing');
    }
  };

  // Handle deleting listing
  const handleDeleteListing = (listingId: string) => {
    Modal.confirm({
      title: 'Delete Listing',
      content: 'Are you sure you want to delete this listing?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setListings(prev => prev.filter(listing => listing.id !== listingId));
        message.success('Listing deleted successfully');
      }
    });
  };

  // Get wizard steps based on certification type
  const getWizardSteps = () => {
    if (wizardData.certificationType === 'certified') {
      return [
        {
          title: 'Certification',
          description: 'Select certification status'
        },
        {
          title: 'Certificate Upload',
          description: 'Upload certification documents'
        },
        {
          title: 'Basic Information',
          description: 'Gemstone details (auto-populated)'
        },
        {
          title: 'Images & Review',
          description: 'Upload images and review'
        }
      ];
    } else {
      return [
        {
          title: 'Certification',
          description: 'Select certification status'
        },
        {
          title: 'Basic Information',
          description: 'Gemstone details'
        },
        {
          title: 'Images & Review',
          description: 'Upload images and review'
        }
      ];
    }
  };

  const columns = [
    {
      title: 'Gemstone',
      key: 'gemstone',
      render: (_: any, record: GemListing) => (
        <div className="flex items-center space-x-3">
          <img 
            src={record.image} 
            alt={record.name}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <span className="font-medium">{record.name}</span>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatLKR(price)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={LISTING_STATUS_COLORS[status] || 'default'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Bids',
      dataIndex: 'bids',
      key: 'bids',
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: GemListing) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            type="text"
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleOpenEditListingModal(record)}
            type="text"
            className="text-green-600 hover:text-green-800"
          >
            Edit
          </Button>
          {record.status !== 'sold' && (
            <Button 
              size="small" 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteListing(record.id)}
              danger
              type="text"
            >
              Remove
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Render certification type selection step
  const renderCertificationStep = () => (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <SafetyCertificateOutlined className="text-6xl text-blue-600 mb-6" />
        <Title level={2}>Select Certification Status</Title>
        <Text type="secondary" className="text-lg">
          Choose whether your gemstone is certified or non-certified
        </Text>
      </div>

      <Row gutter={[48, 48]} justify="center">
        <Col xs={24} lg={10}>
          <Card
            hoverable
            className={`text-center cursor-pointer transition-all duration-200 h-full ${
              wizardData.certificationType === 'certified' 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : 'border-gray-200'
            }`}
            onClick={() => handleCertificationTypeSelect('certified')}
            bodyStyle={{ padding: '32px' }}
          >
            <CheckCircleOutlined className="text-5xl text-green-600 mb-6" />
            <Title level={3}>Certified Gemstone</Title>
            <Text type="secondary" className="text-base block mb-6">
              Your gemstone has official certification from recognized gemological institutes
            </Text>
            <div className="mt-6">
              <Tag color="green" className="text-sm py-1 px-3">Higher Trust</Tag>
              <Tag color="blue" className="text-sm py-1 px-3 ml-2">Premium Listing</Tag>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={10}>
          <Card
            hoverable
            className={`text-center cursor-pointer transition-all duration-200 h-full ${
              wizardData.certificationType === 'non-certified' 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : 'border-gray-200'
            }`}
            onClick={() => handleCertificationTypeSelect('non-certified')}
            bodyStyle={{ padding: '32px' }}
          >
            <FileImageOutlined className="text-5xl text-orange-600 mb-6" />
            <Title level={3}>Non-Certified Gemstone</Title>
            <Text type="secondary" className="text-base block mb-6">
              Your gemstone doesn't have official certification but you can provide detailed descriptions
            </Text>
            <div className="mt-6">
              <Tag color="orange" className="text-sm py-1 px-3">Standard Listing</Tag>
              <Tag color="purple" className="text-sm py-1 px-3 ml-2">Quick Process</Tag>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Render basic information step
  const renderBasicInfoStep = () => {
    const isFromCertificate = wizardData.certificationType === 'certified' && Object.keys(wizardData.basicInfo).length > 0;
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <Title level={3}>Basic Gemstone Information</Title>
          <Text type="secondary">
            {isFromCertificate 
              ? 'Review and edit the auto-populated information from your certificate'
              : 'Provide essential details about your gemstone'
            }
          </Text>
        </div>

        {isFromCertificate && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircleOutlined className="text-green-600" />
              <Text strong className="text-green-800">Information extracted from certificate</Text>
            </div>
            <Text type="secondary">
              The following details have been automatically filled from your certificate. Please review and edit if needed.
            </Text>
          </div>
        )}

        <Form
          form={basicInfoForm}
          layout="vertical"
          onFinish={handleBasicInfoSubmit}
          initialValues={wizardData.basicInfo}
        >
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Gemstone Name"
                name="name"
                rules={[{ required: true, message: 'Please enter gemstone name' }]}
              >
                <Input placeholder="e.g. Blue Sapphire" size="large" />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category" size="large">
                  <Select.Option value="sapphire">Sapphire</Select.Option>
                  <Select.Option value="ruby">Ruby</Select.Option>
                  <Select.Option value="emerald">Emerald</Select.Option>
                  <Select.Option value="diamond">Diamond</Select.Option>
                  <Select.Option value="other">Other</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Weight (Carats)"
                name="weight"
                rules={[{ required: true, message: 'Please enter weight' }]}
              >
                <InputNumber
                  placeholder="Enter weight"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  step={0.01}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                label="Price (LKR)"
                name="price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber
                  placeholder="Enter price"
                  style={{ width: '100%' }}
                  size="large"
                  formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value: string | undefined) => value ? value.replace(/LKR\s?|(,*)/g, '') : ''}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Additional fields for certified gemstones */}
          {wizardData.certificationType === 'certified' && (
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Color" name="color">
                  <Input placeholder="e.g. Royal Blue" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Clarity" name="clarity">
                  <Input placeholder="e.g. VVS" size="large" />
                </Form.Item>
              </Col>
            </Row>
          )}

          {wizardData.certificationType === 'certified' && (
            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <Form.Item label="Cut" name="cut">
                  <Input placeholder="e.g. Oval" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Origin" name="origin">
                  <Input placeholder="e.g. Sri Lanka" size="large" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Provide detailed description of your gemstone..." 
              size="large"
            />
          </Form.Item>

          <Divider />

          <div className="flex justify-between">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handlePrevious}
              size="large"
            >
              Previous
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<ArrowRightOutlined />}
              size="large"
            >
              Next
            </Button>
          </div>
        </Form>
      </Card>
    );
  };

  // Render certification upload step
  const renderCertificationUploadStep = () => {
    const uploadProps = {
      name: 'certificate',
      multiple: false,
      accept: '.pdf,.jpg,.jpeg,.png',
      beforeUpload: (file: File) => {
        setUploadedFile(file);
        return false; // Prevent automatic upload
      },
      onRemove: () => {
        setUploadedFile(null);
      }
    };

    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <SafetyCertificateOutlined className="text-3xl text-blue-600 mb-3" />
          <Title level={4}>Upload Certification Documents</Title>
          <Text type="secondary">
            Upload your gemstone certification documents to auto-extract information
          </Text>
        </div>

        <div className="space-y-2">
          <div>
            <Text strong className="mb-2 block">Upload Certificate</Text>
            <Dragger {...uploadProps} className="border-1 border-dashed border-gray-300 rounded-lg p-2">
              <p className="ant-upload-drag-icon">
                <UploadOutlined className="text-1xl" />
              </p>
              <p className="ant-upload-text">Click or drag certificate file to this area</p>
              <p className="ant-upload-hint">
                Support for PDF, JPG, JPEG, PNG files. Maximum file size: 10MB
              </p>
            </Dragger>
          </div>

          {uploadedFile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircleOutlined className="text-green-600" />
                <Text strong>Ready to extract data from: {uploadedFile.name}</Text>
              </div>
            </div>
          )}

          <div className="text-center">
            <Button
              type="primary"
              size="large"
              loading={loading}
              disabled={!uploadedFile}
              onClick={() => uploadedFile && handleCertificateUpload(uploadedFile)}
              className="px-6"
            >
              {loading ? 'Extracting Data...' : 'Upload Certificate & Extract Data'}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <Title level={5} className="text-blue-800 mb-2">
              <SafetyCertificateOutlined className="mr-2" />
              What happens next?
            </Title>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Certificate will be analyzed using AI technology</li>
              <li>• Gemstone details will be automatically extracted</li>
              <li>• Basic information form will be pre-filled</li>
              <li>• You can review and edit the extracted data</li>
            </ul>
          </div>
        </div>

        <Divider className="my-4" />

        <div className="flex justify-between">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handlePrevious}
            size="large"
          >
            Previous
          </Button>
          <Text type="secondary">Upload certificate to continue</Text>
        </div>
      </div>
    );
  };

  // Render images and review step
  const renderImagesStep = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <FileImageOutlined className="text-3xl text-purple-600 mb-4" />
        <Title level={3}>Upload Images & Review</Title>
        <Text type="secondary">
          Upload high-quality images of your gemstone and review your listing
        </Text>
      </div>

      <Form layout="vertical">
        <Form.Item label="Gemstone Images" required>
          <Dragger
            name="images"
            multiple={true}
            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            accept=".jpg,.jpeg,.png"
            listType="picture"
          >
            <p className="ant-upload-drag-icon">
              <FileImageOutlined />
            </p>
            <p className="ant-upload-text">Click or drag images to this area to upload</p>
            <p className="ant-upload-hint">
              Upload multiple high-quality images. Support for JPG, JPEG, PNG files.
            </p>
          </Dragger>
        </Form.Item>

        <Divider />

        {/* Review Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <Title level={4}>Review Your Listing</Title>
          <Row gutter={[16, 8]}>
            <Col xs={24} md={12}>
              <Text strong>Certification: </Text>
              <Tag color={wizardData.certificationType === 'certified' ? 'green' : 'orange'}>
                {wizardData.certificationType === 'certified' ? 'Certified' : 'Non-Certified'}
              </Tag>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Name: </Text>
              <Text>{wizardData.basicInfo.name || 'N/A'}</Text>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Category: </Text>
              <Text>{wizardData.basicInfo.category || 'N/A'}</Text>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Price: </Text>
              <Text>{wizardData.basicInfo.price ? formatLKR(wizardData.basicInfo.price) : 'N/A'}</Text>
            </Col>
          </Row>
        </div>

        <Divider />

        <div className="flex justify-between">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handlePrevious}
            size="large"
          >
            Previous
          </Button>
          <Button 
            type="primary" 
            onClick={handleFinalSubmission}
            loading={loading}
            size="large"
          >
            Submit Listing
          </Button>
        </div>
      </Form>
    </Card>
  );

  // Render current wizard step
  const renderCurrentStep = () => {
    if (wizardData.certificationType === 'certified') {
      // Certified gemstone flow: Certification → Certificate Upload → Basic Info → Images
      switch (currentStep) {
        case 0:
          return renderCertificationStep();
        case 1:
          return renderCertificationUploadStep();
        case 2:
          return renderBasicInfoStep();
        case 3:
          return renderImagesStep();
        default:
          return renderCertificationStep();
      }
    } else {
      // Non-certified gemstone flow: Certification → Basic Info → Images
      switch (currentStep) {
        case 0:
          return renderCertificationStep();
        case 1:
          return renderBasicInfoStep();
        case 2:
          return renderImagesStep();
        default:
          return renderCertificationStep();
      }
    }
  };

  if (viewMode === 'add-listing') {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <Steps current={currentStep} items={getWizardSteps()} />
          </div>
          
          <div className="flex-1 p-6 overflow-hidden flex items-center justify-center">
            <div className="w-full max-w-4xl">
              {renderCurrentStep()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* My Listings Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">My Listings</h3>
              <p className="text-gray-600 mt-1">Manage all your gemstone listings</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleStartNewListing}
              className="shadow-sm hover:shadow-md"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                borderColor: '#7c3aed'
              }}
            >
              Add New Listing
            </Button>
          </div>
        </div>
      </div>

      {/* Listings Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-0">
          <Table 
            dataSource={listings}
            columns={columns}
            rowKey="id"
            responsive
            scroll={{ x: 'max-content' }}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} listings`
            }}
            className="rounded-none"
            bordered={false}
          />
        </div>
      </div>

      {/* Edit Listing Modal */}
      <Modal
        open={isEditListingModalVisible}
        title="Edit Gemstone Listing"
        onCancel={() => setIsEditListingModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {selectedListing && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditListing}
            initialValues={{
              name: selectedListing.name,
              price: selectedListing.price,
              description: selectedListing.description
            }}
          >
            <Form.Item
              label="Gemstone Name"
              name="name"
              rules={[{ required: true, message: 'Please enter gemstone name' }]}
            >
              <Input placeholder="e.g. Blue Sapphire" />
            </Form.Item>
            
            <Form.Item
              label="Price (LKR)"
              name="price"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber
                placeholder="Enter price"
                style={{ width: '100%' }}
                formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value: string | undefined) => value ? value.replace(/LKR\s?|(,*)/g, '') : ''}
              />
            </Form.Item>
            
            <Form.Item
              label="Description"
              name="description"
            >
              <Input.TextArea rows={4} placeholder="Enter gemstone description..." />
            </Form.Item>
            
            <Form.Item>
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setIsEditListingModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Listings;