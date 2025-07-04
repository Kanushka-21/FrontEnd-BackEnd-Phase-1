import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Tag, Space, Modal, Form, Input, 
  InputNumber, message, Steps, Card, Upload,
  Row, Col, Select, Divider, Typography, Spin, Alert
} from 'antd';
import { 
  PlusOutlined, EditOutlined, EyeOutlined, 
  DeleteOutlined, ArrowLeftOutlined, ArrowRightOutlined,
  FileImageOutlined, SafetyCertificateOutlined,
  UploadOutlined, CheckCircleOutlined, ReloadOutlined,
  PictureOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  formatLKR, 
  LISTING_STATUS_COLORS,
  GemListing 
} from './shared';

const { Title, Text } = Typography;
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
  const [listings, setListings] = useState<GemListing[]>([]);
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
  const [isViewListingModalVisible, setIsViewListingModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<GemListing | null>(null);
  const [editForm] = Form.useForm();
  const [basicInfoForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  // New state for data loading
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
  });

  // Load listings data on component mount
  useEffect(() => {
    loadListingsData();
  }, []);

  // Function to load listings data from backend
  const loadListingsData = async (page = 0, size = 10, status?: string) => {
    console.log('📥 Loading listings data from backend...');
    setDataLoading(true);
    setDataError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      // Add user ID if available
      if (user?.id) {
        params.append('userId', user.id.toString());
      }

      // Add status filter if specified
      if (status) {
        params.append('status', status);
      }

      console.log('🔗 API call:', `/api/gemsData/get-all-listings?${params.toString()}`);
      
      const response = await fetch(`/api/gemsData/get-all-listings?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 Backend response:', result);

      if (result.success && result.data) {
        const { listings: backendListings, totalElements } = result.data;
        
        console.log('📋 Raw backend listings:', backendListings);
        
        // Convert backend format to frontend format
        const convertedListings: GemListing[] = backendListings.map((item: any) => {
          console.log('🖼️ Processing listing item:', {
            id: item.id,
            name: item.name || item.gemName,
            image: item.image,
            primaryImageUrl: item.primaryImageUrl,
            finalImage: item.image || item.primaryImageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop&crop=center'
          });
          
          return {
            id: item.id,
            name: item.name || item.gemName,
            image: item.image || item.primaryImageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop&crop=center',
            price: item.price,
            status: item.status || item.listingStatus || 'pending',
            bids: item.bids || 0,
            views: item.views || 0,
            createdAt: item.createdAt ? dayjs(item.createdAt).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
            category: item.category,
            description: item.description,
            isCertified: item.isCertified
          };
        });

        setListings(convertedListings);
        setPagination(prev => ({
          ...prev,
          current: page + 1, // Backend uses 0-based, frontend uses 1-based
          total: totalElements,
          pageSize: size,
        }));

        console.log('✅ Successfully loaded', convertedListings.length, 'listings');
        console.log('🖼️ Final converted listings with images:', convertedListings.map(l => ({ 
          id: l.id, 
          name: l.name, 
          image: l.image 
        })));
        message.success(`Loaded ${convertedListings.length} listings successfully`);
        
      } else {
        console.error('❌ Backend error:', result.message);
        setDataError(result.message || 'Failed to load listings');
        message.error(result.message || 'Failed to load listings');
      }

    } catch (error) {
      console.error('❌ API call error:', error);
      setDataError('Failed to connect to backend. Please ensure the backend server is running.');
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        message.error('Cannot connect to backend server. Please ensure it\'s running on port 9092.');
      } else {
        message.error('Failed to load listings. Please try again.');
      }
    } finally {
      setDataLoading(false);
    }
  };

  // Handle table pagination change
  const handleTableChange = (newPagination: any) => {
    console.log('📄 Table pagination changed:', newPagination);
    const page = newPagination.current - 1; // Convert to 0-based for backend
    const size = newPagination.pageSize;
    loadListingsData(page, size);
  };

  // Refresh data
  const refreshData = () => {
    const currentPage = pagination.current - 1; // Convert to 0-based
    loadListingsData(currentPage, pagination.pageSize);
  };

  // Action Handlers for View, Edit, Delete
  
  // Handle View Listing
  const handleViewListing = (listing: GemListing) => {
    console.log('👁️ Viewing listing:', listing);
    setSelectedListing(listing);
    setIsViewListingModalVisible(true);
  };

  // Handle Edit Listing
  const handleEditListing = (listing: GemListing) => {
    console.log('✏️ Editing listing:', listing);
    setSelectedListing(listing);
    
    // Pre-populate form with existing data
    editForm.setFieldsValue({
      gemName: listing.name,
      price: listing.price,
      weight: listing.weight,
      color: listing.color,
      species: listing.species,
      variety: listing.variety,
      shape: listing.shape,
      cut: listing.cut,
      clarity: listing.clarity,
      measurements: listing.measurements,
      treatment: listing.treatment,
      origin: listing.origin,
      description: listing.description,
    });
    
    setIsEditListingModalVisible(true);
  };

  // Handle Delete Listing
  const handleDeleteListing = (listing: GemListing) => {
    console.log('🗑️ Initiating delete for listing:', listing);
    setSelectedListing(listing);
    setIsDeleteConfirmVisible(true);
  };

  // Confirm Delete Listing
  const confirmDeleteListing = async () => {
    if (!selectedListing) return;

    try {
      setLoading(true);
      console.log('🗑️ Deleting listing:', selectedListing.id);

      const response = await fetch(`/api/gemsData/delete-listing/${selectedListing.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        message.success('Listing deleted successfully');
        setIsDeleteConfirmVisible(false);
        setSelectedListing(null);
        refreshData(); // Reload the listings
      } else {
        message.error(result.message || 'Failed to delete listing');
      }
    } catch (error) {
      console.error('❌ Delete listing error:', error);
      message.error('Failed to delete listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Form Submit
  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setLoading(true);
      
      console.log('💾 Updating listing:', selectedListing?.id, 'with values:', values);

      const response = await fetch(`/api/gemsData/update-listing/${selectedListing?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success('Listing updated successfully');
        setIsEditListingModalVisible(false);
        setSelectedListing(null);
        editForm.resetFields();
        refreshData(); // Reload the listings
      } else {
        message.error(result.message || 'Failed to update listing');
      }
    } catch (error) {
      console.error('❌ Update listing error:', error);
      message.error('Failed to update listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
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
    console.log('📝 Basic info form submitted with values:', values);
    console.log('📋 Previous wizardData:', wizardData);
    
    setWizardData(prev => ({ ...prev, basicInfo: values }));
    
    console.log('📋 Updated wizardData basicInfo:', values);
    
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

      // Call backend API for certificate extraction (proxied through Vite to port 9092)
      const response = await fetch('/api/gemsData/extract-certificate-data', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Certificate extraction response status:', response.status);

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
        origin: extractedData.origin,
        // Add certificate fields for the manual form
        certificateNumber: extractedData.certificateNumber,
        authority: extractedData.authority
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

  // Validate the form data before final submission
  const validateBeforeSubmit = () => {
    // For certified stones, verify certificate number is present
    if (wizardData.certificationType === 'certified') {
      const certificateNumber = 
        wizardData.basicInfo.certificateNumber || 
        wizardData.certificationDetails?.certificateNumber;
      
      if (!certificateNumber) {
        message.error('Certificate number is required for certified gemstones. Please fill in the certificate information.');
        
        // Highlight the certificate fields tab to guide the user
        const certFieldsElement = document.querySelector('#certificate-fields');
        if (certFieldsElement) {
          certFieldsElement.scrollIntoView({ behavior: 'smooth' });
          // Add a temporary highlight effect
          certFieldsElement.classList.add('bg-red-100');
          setTimeout(() => {
            certFieldsElement.classList.remove('bg-red-100');
          }, 2000);
        }
        
        return false;
      }
    }
    
    // If images are missing
    if (!wizardData.images || wizardData.images.length === 0) {
      message.error('Please upload at least one image of your gemstone.');
      return false;
    }
    
    return true;
  };

  // Handle final submission
  const handleFinalSubmission = async () => {
    console.log('🚀 handleFinalSubmission called!');
    console.log('📋 Current wizardData:', wizardData);
    console.log('📸 Images count:', wizardData.images?.length || 0);
    
    // Validate form data before proceeding
    const isValid = validateBeforeSubmit();
    if (!isValid) {
      return;
    }
    
    setLoading(true);
    try {
      // Get user information (you might need to get this from context/props)
      const userId = user?.id || 123; // Replace with actual user ID
      const userName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : "Demo User"; // Replace with actual user name

      // Prepare gem listing data based on certification type
      const gemListingData = {
        userId: userId,
        userName: userName,
        userRole: "SELLER",
        isCertified: wizardData.certificationType === 'certified',
        
        // Basic gem information (common for both certified and non-certified)
        color: wizardData.basicInfo.color || '',
        shape: wizardData.basicInfo.shape || '',
        weight: wizardData.basicInfo.weight || '',
        measurements: wizardData.basicInfo.measurements || '',
        variety: wizardData.basicInfo.variety || '',
        species: wizardData.basicInfo.species || '',
        treatment: wizardData.basicInfo.treatment || '',
        price: parseFloat(wizardData.basicInfo.price) || 0,
        currency: "LKR",
        gemName: wizardData.certificationType === 'certified' 
          ? wizardData.basicInfo.name 
          : wizardData.basicInfo.gemName,
        category: wizardData.basicInfo.category || '',
        description: wizardData.basicInfo.description || '',
        comments: wizardData.basicInfo.comments || '',
        
        // For non-certified stones - explicitly set certificate fields to null
        ...(wizardData.certificationType === 'non-certified' && {
          cslMemoNo: null,
          issueDate: null,
          authority: null,
          giaAlumniMember: null,
          certificateNumber: null,
          certifyingAuthority: null,
        }),
        
        // For certified stones
        ...(wizardData.certificationType === 'certified' && {
          // Use manually entered certificate number first, fall back to extracted data
          certificateNumber: wizardData.basicInfo.certificateNumber || wizardData.certificationDetails?.certificateNumber,
          // Use manually entered authority first, fall back to extracted data
          certifyingAuthority: wizardData.basicInfo.authority || wizardData.certificationDetails?.authority,
          clarity: wizardData.basicInfo.clarity,
          cut: wizardData.basicInfo.cut,
          origin: wizardData.basicInfo.origin,
        }),
      };

      // Create FormData
      const formData = new FormData();
      
      // Add gem listing data as JSON string
      formData.append('gemListingData', JSON.stringify(gemListingData));
      
      // Add images if any
      if (wizardData.images && wizardData.images.length > 0) {
        wizardData.images.forEach((image) => {
          if (image.originFileObj) {
            formData.append('gemImages', image.originFileObj);
          }
        });
      }

      console.log('📤 Sending data to backend:', gemListingData);
      console.log('🖼️ Number of images:', wizardData.images?.length || 0);
      console.log('🔗 API Endpoint: /api/gemsData/list-gem-data');
      console.log('🌐 Backend should be running on port 9092');

      // Call the backend API (proxied through Vite to port 9092)
      const response = await fetch('/api/gemsData/list-gem-data', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ Backend response:', result);
        
        // Create new listing for the UI
        const newListing: GemListing = {
          id: result.data.listingId || Date.now().toString(),
          name: result.data.gemName || gemListingData.gemName,
          price: result.data.price || gemListingData.price,
          status: 'pending',
          bids: 0,
          views: 0,
          createdAt: new Date().toISOString().split('T')[0],
          image: result.data.primaryImageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100&fit=crop&crop=center',
          category: result.data.category || gemListingData.category,
          description: result.data.description || gemListingData.description,
          isCertified: result.data.isCertified !== undefined ? result.data.isCertified : gemListingData.isCertified
        };
        
        setListings(prev => [newListing, ...prev]);
        message.success('Gem listing submitted successfully! Your listing is now pending approval.');
        
        // Refresh the data from backend
        refreshData();
        
        handleBackToListings();
      } else {
        console.error('❌ Backend error:', result.message || 'Unknown error');
        message.error(result.message || 'Failed to submit listing. Please try again.');
      }
      
    } catch (error) {
      console.error('❌ API call error:', error);
      
      // Handle different types of errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network error - Check if backend is running on port 9092');
        message.error('Cannot connect to backend server. Please ensure the backend is running on port 9092.');
      } else if (error instanceof SyntaxError) {
        console.error('📄 Response parsing error - Backend may have returned HTML instead of JSON');
        message.error('Invalid response from server. Please check the backend logs.');
      } else {
        console.error('🔧 Unexpected error:', error);
        message.error('Failed to submit listing. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
    const isNonCertified = wizardData.certificationType === 'non-certified';
    
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <Title level={3}>
            {isNonCertified ? 'Enter Your Gemstone Information' : 'Enter Your Gemstone Information'}
          </Title>
          <Text type="secondary">
            {isFromCertificate 
              ? 'Review and edit the auto-populated information from your certificate'
              : isNonCertified
              ? 'Provide detailed CSL (Colored Stone Laboratory) format information'
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
            {(!wizardData.certificationDetails?.certificateNumber) && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 font-medium">
                ⚠️ Certificate number could not be extracted. Please manually enter it in the Certificate Information section below.
              </div>
            )}
          </div>
        )}

        <Form
          form={basicInfoForm}
          layout="vertical"
          onFinish={handleBasicInfoSubmit}
          initialValues={wizardData.basicInfo}
        >
        {/* Non-Certified Form */}
        {isNonCertified ? (
          <div className="space-y-6">

            {/* Gem Identification Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <Title level={4} className="text-blue-600 mb-6 mt-0">
                <FileImageOutlined className="mr-2" />
                Gem Identification Details
              </Title>
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Gem Name"
                    name="gemName"
                    rules={[{ required: true, message: 'Please enter gem name' }]}
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

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Color"
                    name="color"
                    rules={[{ required: true, message: 'Please enter color' }]}
                  >
                    <Input placeholder="e.g. Royal Blue, Padparadscha" size="large" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Shape"
                    name="shape"
                    rules={[{ required: true, message: 'Please enter shape' }]}
                  >
                    <Select placeholder="Select shape" size="large">
                      <Select.Option value="round">Round</Select.Option>
                      <Select.Option value="oval">Oval</Select.Option>
                      <Select.Option value="cushion">Cushion</Select.Option>
                      <Select.Option value="emerald">Emerald Cut</Select.Option>
                      <Select.Option value="pear">Pear</Select.Option>
                      <Select.Option value="marquise">Marquise</Select.Option>
                      <Select.Option value="heart">Heart</Select.Option>
                      <Select.Option value="princess">Princess</Select.Option>
                      <Select.Option value="radiant">Radiant</Select.Option>
                      <Select.Option value="asscher">Asscher</Select.Option>
                      <Select.Option value="other">Other</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Weight (Carats)"
                    name="weight"
                    rules={[{ required: true, message: 'Please enter weight' }]}
                  >
                    <Input placeholder="e.g. 2.35 ct" size="large" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Measurements (mm)"
                    name="measurements"
                    rules={[{ required: true, message: 'Please enter measurements' }]}
                  >
                    <Input placeholder="e.g. 8.25 x 6.10 x 4.15" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Variety"
                    name="variety"
                    rules={[{ required: true, message: 'Please enter variety' }]}
                    extra="Usually highlighted in red on CSL certificates"
                  >
                    <Input placeholder="e.g. Sapphire, Ruby, Emerald" size="large" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Species"
                    name="species"
                    rules={[{ required: true, message: 'Please enter species' }]}
                  >
                    <Input placeholder="e.g. Corundum, Beryl" size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Treatment"
                    name="treatment"
                    rules={[{ required: true, message: 'Please select treatment' }]}
                  >
                    <Select placeholder="Select treatment" size="large">
                      <Select.Option value="Heated">Heated</Select.Option>
                      <Select.Option value="Unheated">Unheated</Select.Option>
                      <Select.Option value="Diffusion">Diffusion</Select.Option>
                      <Select.Option value="Oiled">Oiled</Select.Option>
                      <Select.Option value="Fracture Filled">Fracture Filled</Select.Option>
                      <Select.Option value="Irradiated">Irradiated</Select.Option>
                      <Select.Option value="No Treatment">No Treatment</Select.Option>
                      <Select.Option value="Other">Other</Select.Option>
                    </Select>
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
            </div>

            {/* Additional Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <Title level={4} className="text-green-600 mb-6 mt-0">
                Additional Information
              </Title>
              
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="Provide detailed description of your gemstone..." 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                label="Comments"
                name="comments"
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="Any additional comments or observations about the gemstone..." 
                  size="large"
                />
              </Form.Item>
            </div>
          </div>
        ) : (
          /* Certified Gemstone Form (Original) */
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <Title level={4} className="text-blue-600 mb-6 mt-0">
                <SafetyCertificateOutlined className="mr-2" />
                Basic Gemstone Information
              </Title>
              <Row gutter={[24, 16]}>
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

              <Row gutter={[24, 16]}>
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

              {/* Certificate Number and Authority Fields */}
              {wizardData.certificationType === 'certified' && (
                <Row id="certificate-fields" gutter={[24, 16]} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 transition-all duration-300">
                  <Col span={24}>
                    <div className="text-green-700 font-medium mb-2">Certificate Information</div>
                    <div className="text-green-600 text-sm mb-4">Please ensure this information matches your certificate exactly</div>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      label="Certificate Number" 
                      name="certificateNumber"
                      rules={[{ required: true, message: 'Certificate number is required for certified stones' }]}
                    >
                      <Input placeholder="e.g. GIA 1234567890" size="large" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      label="Certifying Authority" 
                      name="authority"
                    >
                      <Input placeholder="e.g. GIA, IGI" size="large" />
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
            </div>
          </div>
        )}

          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 mt-6">
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
          </div>
        </Form>
      </div>
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
        <Card>
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

          <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 mt-6">
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
        </Card>
      </div>
    );
  };

  // Render images and review step
  const renderImagesStep = () => {
    // Handle image upload change
    const handleImageChange = (info: any) => {
      console.log('📁 Image upload change:', info);
      
      // Update wizard data with uploaded images
      setWizardData(prev => ({
        ...prev,
        images: info.fileList
      }));
    };

    const uploadProps = {
      name: 'images',
      multiple: true,
      accept: '.jpg,.jpeg,.png,.webp',
      listType: 'picture-card' as const,
      onChange: handleImageChange,
      beforeUpload: () => false, // Prevent automatic upload
      maxCount: 10,
    };

    // Check if button should be disabled
    const hasGemName = wizardData.certificationType === 'certified' 
      ? wizardData.basicInfo.name 
      : wizardData.basicInfo.gemName;
    
    const isButtonDisabled = !hasGemName;
    
    console.log('🔘 Button state check:', {
      certificationType: wizardData.certificationType,
      hasName: wizardData.basicInfo.name,
      hasGemName: wizardData.basicInfo.gemName,
      isButtonDisabled,
      basicInfo: wizardData.basicInfo
    });

    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card>
          <div className="text-center mb-6">
            <FileImageOutlined className="text-3xl text-purple-600 mb-4" />
            <Title level={3}>Upload Images & Review</Title>
            <Text type="secondary">
              Upload high-quality images of your gemstone and review your listing
            </Text>
          </div>

          <Form layout="vertical">
            <Form.Item label="Gemstone Images" required>
              <Upload {...uploadProps}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
              <Text type="secondary" className="text-sm block mt-2">
                Upload up to 10 high-quality images. First image will be used as the primary image.
                Supported formats: JPG, PNG, WebP (Max 5MB per image)
              </Text>
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
                  <Text strong>Gem Name: </Text>
                  <Text>{wizardData.basicInfo.name || wizardData.basicInfo.gemName || 'N/A'}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Variety: </Text>
                  <Text>{wizardData.basicInfo.variety || 'N/A'}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Price: </Text>
                  <Text>{wizardData.basicInfo.price ? formatLKR(wizardData.basicInfo.price) : 'N/A'}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Weight: </Text>
                  <Text>{wizardData.basicInfo.weight || 'N/A'}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Treatment: </Text>
                  <Text>{wizardData.basicInfo.treatment || 'N/A'}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Images: </Text>
                  <Text>{wizardData.images?.length || 0} uploaded</Text>
                </Col>
                {wizardData.certificationType === 'non-certified' && (
                  <Col xs={24} md={12}>
                    <Text strong>CSL Memo: </Text>
                    <Text>{wizardData.basicInfo.cslMemoNo || 'N/A'}</Text>
                  </Col>
                )}
              </Row>
            </div>

            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 mt-6">
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
                  onClick={() => {
                    console.log('🔘 Submit button clicked!');
                    console.log('📋 wizardData at button click:', wizardData);
                    handleFinalSubmission();
                  }}
                  loading={loading}
                  size="large"
                  disabled={isButtonDisabled}
                >
                  {loading ? 'Submitting...' : 'Submit Listing'}
                </Button>
              </div>
            </div>
          </Form>
        </Card>
      </div>
    );
  };

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

  // Component for gemstone image with fallback
  const GemstoneImage: React.FC<{ record: GemListing }> = ({ record }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
      console.log('❌ Image failed to load:', record.image);
      setImageError(true);
    };

    const handleImageLoad = () => {
      console.log('✅ Image loaded successfully:', record.image);
      setImageError(false);
    };

    return (
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
          {imageError || !record.image ? (
            <PictureOutlined className="text-gray-400 text-xl" />
          ) : (
            <img 
              src={record.image} 
              alt={record.name}
              className="w-12 h-12 object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: 'block' }}
            />
          )}
        </div>
        <div>
          <span className="font-medium">{record.name}</span>
          <div className="text-xs text-gray-500">{record.category}</div>
        </div>
      </div>
    );
  };

  // Table columns definition
  const columns = [
    {
      title: 'Gemstone',
      key: 'gemstone',
      render: (_: any, record: GemListing) => <GemstoneImage record={record} />,
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
      title: 'Certified',
      dataIndex: 'isCertified',
      key: 'isCertified',
      render: (isCertified: boolean) => (
        <Tag color={isCertified ? 'green' : 'orange'}>
          {isCertified ? 'Certified' : 'Non-Certified'}
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
            onClick={() => handleViewListing(record)}
          >
            View
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            type="text"
            className="text-green-600 hover:text-green-800"
            onClick={() => handleEditListing(record)}
          >
            Edit
          </Button>
          {record.status !== 'sold' && (
            <Button 
              size="small" 
              icon={<DeleteOutlined />} 
              danger
              type="text"
              onClick={() => handleDeleteListing(record)}
            >
              Remove
            </Button>
          )}
        </Space>
      )
    }
  ];

  // Wizard Form Mode
  if (viewMode === 'add-listing') {
    return (
      <div className="h-full flex flex-col">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <Steps current={currentStep} items={getWizardSteps()} />
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-start justify-center">
              <div className="w-full max-w-4xl py-4">
                {renderCurrentStep()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Listings View
  return (
    <div className="space-y-3">
      {/* My Listings Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">My Listings</h3>
              <p className="text-gray-600 mt-1">
                Manage all your gemstone listings 
                {pagination.total > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({pagination.total} total)
                  </span>
                )}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                icon={<ReloadOutlined />}
                onClick={refreshData}
                loading={dataLoading}
                className="shadow-sm hover:shadow-md"
              >
                Refresh
              </Button>
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
      </div>

      {/* Error Alert */}
      {dataError && (
        <Alert
          message="Error Loading Data"
          description={dataError}
          type="error"
          showIcon
          closable
          onClose={() => setDataError(null)}
          action={
            <Button size="small" onClick={refreshData}>
              Retry
            </Button>
          }
        />
      )}

      {/* Listings Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-0">
          {dataLoading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
              <span className="ml-3 text-gray-600">Loading your listings...</span>
            </div>
          ) : (
            <Table 
              dataSource={listings}
              columns={columns}
              rowKey="id"
              scroll={{ x: 'max-content' }}
              pagination={{
                ...pagination,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} listings`,
                onChange: handleTableChange,
              }}
              className="rounded-none"
              bordered={false}
              loading={dataLoading}
            />
          )}
        </div>
      </div>

      {/* View Listing Modal */}
      <Modal
        title="Listing Details"
        open={isViewListingModalVisible}
        onCancel={() => setIsViewListingModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewListingModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedListing && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Basic Information</h4>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div><strong>Name:</strong> {selectedListing.name}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Price:</strong> {formatLKR(selectedListing.price)}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Weight:</strong> {selectedListing.weight} carats</div>
                </Col>
                <Col span={12}>
                  <div><strong>Color:</strong> {selectedListing.color}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Species:</strong> {selectedListing.species}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Variety:</strong> {selectedListing.variety}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Shape:</strong> {selectedListing.shape}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Cut:</strong> {selectedListing.cut}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Clarity:</strong> {selectedListing.clarity}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Status:</strong> 
                    <Tag color={LISTING_STATUS_COLORS[selectedListing.status] || 'default'} className="ml-2">
                      {selectedListing.status.charAt(0).toUpperCase() + selectedListing.status.slice(1)}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Additional Details */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Additional Details</h4>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div><strong>Measurements:</strong> {selectedListing.measurements || 'N/A'}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Treatment:</strong> {selectedListing.treatment || 'N/A'}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Origin:</strong> {selectedListing.origin || 'N/A'}</div>
                </Col>
                <Col span={12}>
                  <div><strong>Certified:</strong> 
                    <Tag color={selectedListing.isCertified ? 'green' : 'orange'} className="ml-2">
                      {selectedListing.isCertified ? 'Certified' : 'Non-Certified'}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Description */}
            {selectedListing.description && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Description</h4>
                <p className="text-gray-700">{selectedListing.description}</p>
              </div>
            )}

            {/* Images */}
            {selectedListing.image && (
              <div>
                <h4 className="text-lg font-semibold mb-4">Images</h4>
                <div className="flex justify-center">
                  <img 
                    src={selectedListing.image} 
                    alt={selectedListing.name}
                    className="max-w-md rounded-lg border"
                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}

            {/* Listing Stats */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Listing Statistics</h4>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedListing.views || 0}</div>
                    <div className="text-gray-500">Views</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedListing.bids || 0}</div>
                    <div className="text-gray-500">Bids</div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedListing.createdAt ? dayjs(selectedListing.createdAt).format('MMM DD') : 'N/A'}
                    </div>
                    <div className="text-gray-500">Created</div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Delete"
        open={isDeleteConfirmVisible}
        onOk={confirmDeleteListing}
        onCancel={() => setIsDeleteConfirmVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: loading }}
      >
        {selectedListing && (
          <div>
            <p>Are you sure you want to delete the listing:</p>
            <p className="font-semibold text-lg mt-2">"{selectedListing.name}"</p>
            <p className="text-gray-600 mt-2">This action cannot be undone.</p>
          </div>
        )}
      </Modal>

      {/* Edit Listing Modal */}
      <Modal
        title="Edit Listing"
        visible={isEditListingModalVisible}
        onCancel={() => setIsEditListingModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            label="Gemstone Name"
            name="name"
            rules={[{ required: true, message: 'Please enter gemstone name' }]}
          >
            <Input placeholder="e.g. Blue Sapphire" size="large" />
          </Form.Item>

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

          <Form.Item
            label="Color"
            name="color"
            rules={[{ required: true, message: 'Please enter color' }]}
          >
            <Input placeholder="e.g. Royal Blue, Padparadscha" size="large" />
          </Form.Item>

          <Form.Item
            label="Shape"
            name="shape"
            rules={[{ required: true, message: 'Please enter shape' }]}
          >
            <Select placeholder="Select shape" size="large">
              <Select.Option value="round">Round</Select.Option>
              <Select.Option value="oval">Oval</Select.Option>
              <Select.Option value="cushion">Cushion</Select.Option>
              <Select.Option value="emerald">Emerald Cut</Select.Option>
              <Select.Option value="pear">Pear</Select.Option>
              <Select.Option value="marquise">Marquise</Select.Option>
              <Select.Option value="heart">Heart</Select.Option>
              <Select.Option value="princess">Princess</Select.Option>
              <Select.Option value="radiant">Radiant</Select.Option>
              <Select.Option value="asscher">Asscher</Select.Option>
              <Select.Option value="other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Variety"
            name="variety"
            rules={[{ required: true, message: 'Please enter variety' }]}
            extra="Usually highlighted in red on CSL certificates"
          >
            <Input placeholder="e.g. Sapphire, Ruby, Emerald" size="large" />
          </Form.Item>

          <Form.Item
            label="Species"
            name="species"
            rules={[{ required: true, message: 'Please enter species' }]}
          >
            <Input placeholder="e.g. Corundum, Beryl" size="large" />
          </Form.Item>

          <Form.Item
            label="Treatment"
            name="treatment"
            rules={[{ required: true, message: 'Please select treatment' }]}
          >
            <Select placeholder="Select treatment" size="large">
              <Select.Option value="Heated">Heated</Select.Option>
              <Select.Option value="Unheated">Unheated</Select.Option>
              <Select.Option value="Diffusion">Diffusion</Select.Option>
              <Select.Option value="Oiled">Oiled</Select.Option>
              <Select.Option value="Fracture Filled">Fracture Filled</Select.Option>
              <Select.Option value="Irradiated">Irradiated</Select.Option>
              <Select.Option value="No Treatment">No Treatment</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          {/* Certificate Number and Authority Fields */}
          {wizardData.certificationType === 'certified' && (
            <div id="certificate-fields" className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="text-green-700 font-medium mb-2">Certificate Information</div>
              <div className="text-green-600 text-sm mb-4">Please ensure this information matches your certificate exactly</div>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label="Certificate Number" 
                    name="certificateNumber"
                    rules={[{ required: true, message: 'Certificate number is required for certified stones' }]}
                  >
                    <Input placeholder="e.g. GIA 1234567890" size="large" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item 
                    label="Certifying Authority" 
                    name="authority"
                  >
                    <Input placeholder="e.g. GIA, IGI" size="large" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
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

          <div className="flex justify-end">
            <Button 
              onClick={() => setIsEditListingModalVisible(false)} 
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
            >
              Update Listing
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Listings;
