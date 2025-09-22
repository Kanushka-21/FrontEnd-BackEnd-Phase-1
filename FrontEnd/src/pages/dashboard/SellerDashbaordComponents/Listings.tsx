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
  PictureOutlined, DollarOutlined, AlertCircleOutlined
} from '@ant-design/icons';
import { AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import { 
  formatLKR, 
  LISTING_STATUS_COLORS,
  GemListing 
} from './shared';
import AIPricePrediction from '@/components/common/AIPricePrediction';

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
  videos: any[];
  certificateImages: any[];
}

const Listings: React.FC<ListingsProps> = ({ user }) => {
  const [listings, setListings] = useState<GemListing[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    certificationType: null,
    basicInfo: {},
    certificationDetails: {},
    images: [],
    videos: [],
    certificateImages: []
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isEditListingModalVisible, setIsEditListingModalVisible] = useState(false);
  const [isViewListingModalVisible, setIsViewListingModalVisible] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<GemListing | null>(null);
  const [editForm] = Form.useForm();
  const [basicInfoForm] = Form.useForm();
  
  // Price prediction state
  const [showPricePrediction, setShowPricePrediction] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
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
      // Check if user ID is available, with fallback for testing
      const userId = user?.userId || '123'; // Fallback for testing
      if (!userId) {
        console.error('❌ User ID not available:', user);
        setDataError('User ID not available. Please log in again.');
        return;
      }

      console.log('🔐 Using user ID:', userId);

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      // Add status filter if specified
      if (status) {
        params.append('status', status);
      }

      // Use user-specific endpoint for seller dashboard
      const apiUrl = `/api/gemsData/get-user-listings/${userId}?${params.toString()}`;
      console.log('🔗 API call:', apiUrl);
      
      const response = await fetch(apiUrl, {
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

      if (result && result.success && result.data) {
        const { content: backendListings, totalElements } = result.data;
        
        console.log('📋 Raw backend listings:', backendListings);
        
        // Ensure backendListings is an array before mapping
        if (!Array.isArray(backendListings)) {
          console.error('❌ Backend listings is not an array:', backendListings);
          setDataError('Invalid data format received from backend');
          return;
        }
        
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
        console.error('❌ Backend error:', result.message || 'Unknown error');
        const errorMessage = result.message || 'Failed to load listings';
        setDataError(errorMessage);
        message.error(errorMessage);
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
  
  // Handle starting new listing wizard with verification check
  const handleStartNewListing = () => {
    // Check if user is verified before allowing listing creation
    if (!user?.isVerified) {
      Modal.warning({
        title: 'Verification Required',
        content: (
          <div>
            <p>You cannot create listings because your account is not verified.</p>
            <p>Please contact the admin to complete your verification process.</p>
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-sm text-orange-700">
                <strong>Current Status:</strong> {user?.verificationStatus || 'Unverified'}
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Contact admin at: <strong>admin@gemnet.com</strong>
              </p>
            </div>
          </div>
        ),
        okText: 'Understood',
        width: 500,
      });
      return;
    }

    setViewMode('add-listing');
    setCurrentStep(0);
    setWizardData({
      certificationType: null,
      basicInfo: {},
      certificationDetails: {},
      images: [],
      certificateImages: []
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
      images: [],
      certificateImages: []
    });
  };

  // Handle certification type selection
  const handleCertificationTypeSelect = (type: CertificationStatus) => {
    setWizardData(prev => ({ ...prev, certificationType: type }));
    if (type === 'certified') {
      setCurrentStep(1); // Go directly to basic info for certified gems
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
      setCurrentStep(2); // Go to images step for certified gems
    } else {
      setCurrentStep(2); // Go to images step for non-certified gems
    }
  };

  // Handle certification details submission
  const handleCertificationSubmit = (values: any) => {
    setWizardData(prev => ({ ...prev, certificationDetails: values }));
    setCurrentStep(1); // Go to basic info step for certified gems
  };

  // Handle certificate upload (just store the file, no extraction)
  const handleCertificateUpload = async (file: File) => {
    setLoading(true);
    try {
      // Just store the certificate file for later upload
      setWizardData(prev => ({
        ...prev,
        certificationDetails: {
          certificateFile: file
        }
      }));

      message.success('Certificate image uploaded successfully!');
      // Auto-proceed to basic information step
      setCurrentStep(1);
      
    } catch (error) {
      console.error('Certificate upload error:', error);
      message.error('Failed to upload certificate. Please try again.');
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
      
      // Check for certificate images
      if (!wizardData.certificateImages || wizardData.certificateImages.length === 0) {
        message.error('Certificate images are required for certified gemstones. Please upload clear images of your certificate.');
        return false;
      }
    }
    
    // If both images and videos are missing
    if ((!wizardData.images || wizardData.images.length === 0) && 
        (!wizardData.videos || wizardData.videos.length === 0)) {
      message.error('Please upload at least one image or video of your gemstone.');
      return false;
    }
    
    return true;
  };

  // Handle price prediction
  const handlePricePrediction = () => {
    // Only allow prediction for certified gemstones
    if (wizardData.certificationType !== 'certified') {
      message.warning('AI Price Prediction is only available for certified gemstones.');
      return;
    }

    // Validate that we have enough basic info for prediction
    if (!wizardData.basicInfo.weight || !wizardData.basicInfo.species || !wizardData.basicInfo.color) {
      message.warning('Please fill in weight, species, and color information for accurate price prediction.');
      return;
    }

    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      setShowPricePrediction(true);
    }, 1000); // Simulate prediction processing
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
      const userId = user?.userId || 123; // Replace with actual user ID
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
        // Convert arrays to strings for fields that might be arrays due to tags mode
        color: Array.isArray(wizardData.basicInfo.color) 
          ? wizardData.basicInfo.color[0] || '' 
          : wizardData.basicInfo.color || '',
        shape: wizardData.basicInfo.shape || '',
        weight: wizardData.basicInfo.weight || '',
        measurements: Array.isArray(wizardData.basicInfo.measurements) 
          ? wizardData.basicInfo.measurements[0] || '' 
          : wizardData.basicInfo.measurements || '',
        variety: Array.isArray(wizardData.basicInfo.variety) 
          ? wizardData.basicInfo.variety[0] || '' 
          : wizardData.basicInfo.variety || '',
        species: wizardData.basicInfo.species || '',
        treatment: wizardData.basicInfo.treatment || '',
        origin: Array.isArray(wizardData.basicInfo.origin) 
          ? wizardData.basicInfo.origin[0] || '' 
          : wizardData.basicInfo.origin || '',
        price: parseFloat(wizardData.basicInfo.price) || 0,
        currency: "LKR",
        gemName: wizardData.certificationType === 'certified' 
          ? wizardData.basicInfo.name 
          : wizardData.basicInfo.gemName,
        category: wizardData.basicInfo.category || '',
        description: wizardData.basicInfo.description || '',
        comments: wizardData.basicInfo.comments || '',
        
        // For non-certified stones - explicitly set certificate fields to null and provide defaults for missing fields
        ...(wizardData.certificationType === 'non-certified' && {
          // Set certificate fields to null
          cslMemoNo: null,
          issueDate: null,
          authority: null,
          giaAlumniMember: null,
          certificateNumber: null,
          certifyingAuthority: null,
          clarity: null,
          cut: null,
          // Provide defaults for fields that non-certified form doesn't have
          measurements: wizardData.basicInfo.measurements || 'Not specified',
          variety: wizardData.basicInfo.gemName || 'Not specified', // Use gemName as variety for non-certified
          species: 'Not specified', // Non-certified doesn't require species
        }),
        
        // For certified stones - include all enhanced fields
        ...(wizardData.certificationType === 'certified' && {
          // Certificate information
          certificateNumber: wizardData.basicInfo.certificateNumber,
          certifyingAuthority: wizardData.basicInfo.authority,
          issueDate: Array.isArray(wizardData.basicInfo.issueDate) 
            ? wizardData.basicInfo.issueDate[0] || '' 
            : wizardData.basicInfo.issueDate || '',
          
          // Enhanced gemstone properties
          clarity: wizardData.basicInfo.clarity,
          cut: wizardData.basicInfo.cut,
          origin: Array.isArray(wizardData.basicInfo.origin) 
            ? wizardData.basicInfo.origin[0] || '' 
            : wizardData.basicInfo.origin || '',
        }),
      };

      // Create FormData
      const formData = new FormData();
      
      // Add gem listing data as JSON string
      formData.append('gemListingData', JSON.stringify(gemListingData));
      
      // Add gemstone images
      if (wizardData.images && wizardData.images.length > 0) {
        wizardData.images.forEach((image) => {
          if (image.originFileObj) {
            formData.append('gemImages', image.originFileObj);
          }
        });
      }
      
      // Add gemstone videos
      if (wizardData.videos && wizardData.videos.length > 0) {
        wizardData.videos.forEach((video) => {
          if (video.originFileObj) {
            formData.append('gemVideos', video.originFileObj);
          }
        });
      }
      
      // Add certificate images for certified gemstones
      if (wizardData.certificationType === 'certified' && wizardData.certificateImages && wizardData.certificateImages.length > 0) {
        wizardData.certificateImages.forEach((certImage) => {
          if (certImage.originFileObj) {
            formData.append('certificateImages', certImage.originFileObj);
          }
        });
      }

      console.log('📤 Sending data to backend:', gemListingData);
      console.log('🖼️ Number of gemstone images:', wizardData.images?.length || 0);
      console.log('🎬 Number of gemstone videos:', wizardData.videos?.length || 0);
      console.log('📄 Number of certificate images:', wizardData.certificationType === 'certified' ? wizardData.certificateImages?.length || 0 : 0);
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
          title: 'Basic Information',
          description: 'Enter gemstone details manually'
        },
        {
          title: 'Media & Review',
          description: 'Upload images/videos and review'
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
          title: 'Media & Review',
          description: 'Upload images/videos and review'
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
              ? 'Enter detailed information about your certified gemstone'
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
              <Text strong className="text-green-800">Certificate Uploaded</Text>
            </div>
            <Text type="secondary">
              Please enter all gemstone details manually. Make sure the information matches your uploaded certificate.
            </Text>
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

            {/* Essential Gem Information */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <Title level={4} className="text-orange-600 mb-6 mt-0">
                <FileImageOutlined className="mr-2" />
                Essential Gem Information
              </Title>
              <div className="text-orange-600 text-sm mb-4">
                Since this gemstone is not certified, please provide basic essential information only
              </div>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Gem Name"
                    name="gemName"
                    rules={[{ required: true, message: 'Please enter gem name' }]}
                  >
                    <Input placeholder="e.g. Blue Sapphire, Ruby" size="large" />
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
                      <Select.Option value="unknown">Unknown</Select.Option>
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
                    <Input placeholder="e.g. Royal Blue, Pinkish Red" size="large" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Shape/Cut"
                    name="shape"
                    rules={[{ required: true, message: 'Please select shape' }]}
                  >
                    <Select placeholder="Select shape" size="large">
                      <Select.Option value="round">Round</Select.Option>
                      <Select.Option value="oval">Oval</Select.Option>
                      <Select.Option value="cushion">Cushion</Select.Option>
                      <Select.Option value="emerald">Emerald Cut</Select.Option>
                      <Select.Option value="pear">Pear</Select.Option>
                      <Select.Option value="heart">Heart</Select.Option>
                      <Select.Option value="raw">Raw/Rough</Select.Option>
                      <Select.Option value="other">Other</Select.Option>
                      <Select.Option value="unknown">Unknown</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Approximate Weight"
                    name="weight"
                    rules={[{ required: true, message: 'Please enter approximate weight' }]}
                  >
                    <Input placeholder="e.g. 2.35 ct or 5g (approx)" size="large" />
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
                      min={0}
                      formatter={value => `LKR ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value: string | undefined) => value ? value.replace(/LKR\s?|(,*)/g, '') : ''}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Treatment (if known)"
                    name="treatment"
                  >
                    <Select placeholder="Select treatment" size="large" allowClear>
                      <Select.Option value="No Treatment">No Treatment</Select.Option>
                      <Select.Option value="Heat treated">Heat Treated</Select.Option>
                      <Select.Option value="Oiled">Oiled</Select.Option>
                      <Select.Option value="Unknown">Unknown</Select.Option>
                      <Select.Option value="Not specified">Not specified</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Origin (if known)"
                    name="origin"
                  >
                    <Select placeholder="Select origin" size="large" allowClear>
                      <Select.Option value="Sri Lanka">Sri Lanka</Select.Option>
                      <Select.Option value="Myanmar">Myanmar</Select.Option>
                      <Select.Option value="Madagascar">Madagascar</Select.Option>
                      <Select.Option value="Tanzania">Tanzania</Select.Option>
                      <Select.Option value="Thailand">Thailand</Select.Option>
                      <Select.Option value="Brazil">Brazil</Select.Option>
                      <Select.Option value="Unknown">Unknown</Select.Option>
                      <Select.Option value="Not specified">Not specified</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Description */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <Title level={4} className="text-gray-600 mb-6 mt-0">
                Description & Additional Details
              </Title>
              
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Describe your gemstone: visual appearance, size, any notable features, condition, etc." 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                label="Additional Comments (Optional)"
                name="comments"
              >
                <Input.TextArea 
                  rows={2} 
                  placeholder="Any additional information, history, or special notes about the gemstone..." 
                  size="large"
                />
              </Form.Item>
            </div>
          </div>
        ) : (
          /* Certified Gemstone Form (Enhanced) */
          <div className="space-y-6">
            {/* Basic Gemstone Information */}
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
                    <Input placeholder="e.g. Ceylon Blue Sapphire" size="large" />
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
                      <Select.Option value="unknown">Unknown</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Carat Weight"
                    name="weight"
                    rules={[{ required: true, message: 'Please enter carat weight' }]}
                  >
                    <InputNumber
                      placeholder="e.g. 3.09"
                      style={{ width: '100%' }}
                      size="large"
                      min={0}
                      step={0.01}
                      precision={2}
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
            </div>

            {/* Gemstone Properties */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <Title level={4} className="text-purple-600 mb-6 mt-0">
                <FileImageOutlined className="mr-2" />
                Gemstone Properties
              </Title>
              
              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Color Grade"
                    name="color"
                    rules={[{ required: true, message: 'Please select or enter color grade' }]}
                  >
                    <Select 
                      placeholder="Select or enter color grade" 
                      size="large"
                      mode="tags"
                      allowClear
                      showSearch
                    >
                      <Select.Option value="Vivid Red">Vivid Red</Select.Option>
                      <Select.Option value="Deep Blue">Deep Blue</Select.Option>
                      <Select.Option value="Medium Blue">Medium Blue</Select.Option>
                      <Select.Option value="Light Blue">Light Blue</Select.Option>
                      <Select.Option value="Pink">Pink</Select.Option>
                      <Select.Option value="Yellow">Yellow</Select.Option>
                      <Select.Option value="Green">Green</Select.Option>
                      <Select.Option value="Purple">Purple</Select.Option>
                      <Select.Option value="Orange">Orange</Select.Option>
                      <Select.Option value="Colorless">Colorless</Select.Option>
                      <Select.Option value="Unknown">Unknown</Select.Option>
                      <Select.Option value="Not specified">Not specified</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Cut / Shape"
                    name="shape"
                    rules={[{ required: true, message: 'Please select cut/shape' }]}
                  >
                    <Select placeholder="Select cut/shape" size="large">
                      <Select.Option value="Round">Round</Select.Option>
                      <Select.Option value="Oval">Oval</Select.Option>
                      <Select.Option value="Pear">Pear</Select.Option>
                      <Select.Option value="Cushion">Cushion</Select.Option>
                      <Select.Option value="Emerald">Emerald Cut</Select.Option>
                      <Select.Option value="Princess">Princess</Select.Option>
                      <Select.Option value="Marquise">Marquise</Select.Option>
                      <Select.Option value="Heart">Heart</Select.Option>
                      <Select.Option value="Radiant">Radiant</Select.Option>
                      <Select.Option value="Asscher">Asscher</Select.Option>
                      <Select.Option value="Other">Other</Select.Option>
                      <Select.Option value="Unknown">Unknown</Select.Option>
                      <Select.Option value="Not specified">Not specified</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Clarity / Transparency"
                    name="clarity"
                    rules={[{ required: true, message: 'Please select clarity' }]}
                  >
                    <Select placeholder="Select clarity" size="large">
                      <Select.Option value="Transparent">Transparent</Select.Option>
                      <Select.Option value="Semi-transparent">Semi-transparent</Select.Option>
                      <Select.Option value="Translucent">Translucent</Select.Option>
                      <Select.Option value="Semi-translucent">Semi-translucent</Select.Option>
                      <Select.Option value="Opaque">Opaque</Select.Option>
                      <Select.Option value="FL">FL (Flawless)</Select.Option>
                      <Select.Option value="IF">IF (Internally Flawless)</Select.Option>
                      <Select.Option value="VVS1">VVS1</Select.Option>
                      <Select.Option value="VVS2">VVS2</Select.Option>
                      <Select.Option value="VS1">VS1</Select.Option>
                      <Select.Option value="VS2">VS2</Select.Option>
                      <Select.Option value="SI1">SI1</Select.Option>
                      <Select.Option value="SI2">SI2</Select.Option>
                      <Select.Option value="Unknown">Unknown</Select.Option>
                      <Select.Option value="Not specified">Not specified</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Dimensions (L x W x H mm)"
                    name="measurements"
                    rules={[{ required: true, message: 'Please enter dimensions or select option' }]}
                  >
                    <Select 
                      placeholder="Select or enter dimensions" 
                      size="large"
                      mode="tags"
                      allowClear
                      showSearch
                    >
                      <Select.Option value="Unknown">Unknown</Select.Option>
                      <Select.Option value="Not measured">Not measured</Select.Option>
                      <Select.Option value="Not specified">Not specified</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Species / Variety"
                    name="variety"
                    rules={[{ required: true, message: 'Please select or enter variety' }]}
                  >
                    <Select 
                      placeholder="Select or enter variety" 
                      size="large"
                      mode="tags"
                      allowClear
                      showSearch
                    >
                      <Select.Option value="Sapphire">Sapphire</Select.Option>
                      <Select.Option value="Ruby">Ruby</Select.Option>
                      <Select.Option value="Emerald">Emerald</Select.Option>
                      <Select.Option value="Aquamarine">Aquamarine</Select.Option>
                      <Select.Option value="Tourmaline">Tourmaline</Select.Option>
                      <Select.Option value="Garnet">Garnet</Select.Option>
                      <Select.Option value="Spinel">Spinel</Select.Option>
                      <Select.Option value="Zircon">Zircon</Select.Option>
                      <Select.Option value="Unknown">Unknown</Select.Option>
                      <Select.Option value="Not specified">Not specified</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Species"
                    name="species"
                    rules={[{ required: true, message: 'Please select species' }]}
                  >
                    <Select placeholder="Select species" size="large">
                      <Select.Option value="Corundum">Corundum</Select.Option>
                      <Select.Option value="Beryl">Beryl</Select.Option>
                      <Select.Option value="Quartz">Quartz</Select.Option>
                      <Select.Option value="Feldspar">Feldspar</Select.Option>
                      <Select.Option value="Tourmaline">Tourmaline</Select.Option>
                      <Select.Option value="Garnet">Garnet</Select.Option>
                      <Select.Option value="Spinel">Spinel</Select.Option>
                      <Select.Option value="Zircon">Zircon</Select.Option>
                      <Select.Option value="Other">Other</Select.Option>
                      <Select.Option value="Unknown">Unknown</Select.Option>
                      <Select.Option value="Not specified">Not specified</Select.Option>
                    </Select>
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
                      <Select.Option value="No Treatment">No Treatment</Select.Option>
                      <Select.Option value="Heat treated">Heat Treated</Select.Option>
                      <Select.Option value="Heated & Flux Healed">Heated & Flux Healed</Select.Option>
                      <Select.Option value="Heated & Lead Glass Filled">Heated & Lead Glass Filled</Select.Option>
                      <Select.Option value="Irradiated">Irradiated</Select.Option>
                      <Select.Option value="Oiled">Oiled</Select.Option>
                      <Select.Option value="Fracture Filled">Fracture Filled</Select.Option>
                      <Select.Option value="Diffusion">Diffusion</Select.Option>
                      <Select.Option value="Other">Other</Select.Option>
                      <Select.Option value="Unknown">Unknown</Select.Option>
                      <Select.Option value="Not specified">Not specified</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Origin (Optional)"
                    name="origin"
                  >
                    <Select 
                      placeholder="Select or enter origin" 
                      size="large"
                      mode="tags"
                      allowClear
                      showSearch
                    >
                      <Select.Option value="Sri Lanka">Sri Lanka</Select.Option>
                      <Select.Option value="Myanmar (Burma)">Myanmar (Burma)</Select.Option>
                      <Select.Option value="Kashmir">Kashmir</Select.Option>
                      <Select.Option value="Madagascar">Madagascar</Select.Option>
                      <Select.Option value="Tanzania">Tanzania</Select.Option>
                      <Select.Option value="Thailand">Thailand</Select.Option>
                      <Select.Option value="Australia">Australia</Select.Option>
                      <Select.Option value="Brazil">Brazil</Select.Option>
                      <Select.Option value="Colombia">Colombia</Select.Option>
                      <Select.Option value="Afghanistan">Afghanistan</Select.Option>
                      <Select.Option value="Unknown">Unknown</Select.Option>
                      <Select.Option value="Not specified">Not specified</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Certificate Information */}
            {wizardData.certificationType === 'certified' && (
              <div id="certificate-fields" className="bg-green-50 border border-green-200 rounded-lg p-6">
                <Title level={4} className="text-green-600 mb-6 mt-0">
                  <SafetyCertificateOutlined className="mr-2" />
                  Certificate Information
                </Title>
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
                      rules={[{ required: true, message: 'Please enter certifying authority' }]}
                    >
                      <Select placeholder="Select authority" size="large">
                        <Select.Option value="GIA">GIA (Gemological Institute of America)</Select.Option>
                        <Select.Option value="IGI">IGI (International Gemological Institute)</Select.Option>
                        <Select.Option value="SSEF">SSEF (Swiss Gemmological Institute)</Select.Option>
                        <Select.Option value="Gübelin">Gübelin Gem Lab</Select.Option>
                        <Select.Option value="AIGS">AIGS (Asian Institute of Gemological Sciences)</Select.Option>
                        <Select.Option value="CSL">CSL (Colored Stone Laboratory)</Select.Option>
                        <Select.Option value="Other">Other</Select.Option>
                        <Select.Option value="Unknown">Unknown</Select.Option>
                        <Select.Option value="Not specified">Not specified</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      label="Cut Grade (Optional)" 
                      name="cut"
                    >
                      <Select placeholder="Select cut grade" size="large">
                        <Select.Option value="Excellent">Excellent</Select.Option>
                        <Select.Option value="Very Good">Very Good</Select.Option>
                        <Select.Option value="Good">Good</Select.Option>
                        <Select.Option value="Fair">Fair</Select.Option>
                        <Select.Option value="Poor">Poor</Select.Option>
                        <Select.Option value="Unknown">Unknown</Select.Option>
                        <Select.Option value="Not specified">Not specified</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      label="Issue Date (Optional)" 
                      name="issueDate"
                    >
                      <Select 
                        placeholder="Select or enter issue date" 
                        size="large"
                        mode="tags"
                        allowClear
                        showSearch
                      >
                        <Select.Option value="Unknown">Unknown</Select.Option>
                        <Select.Option value="Not specified">Not specified</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <Title level={4} className="text-gray-600 mb-6 mt-0">
                Additional Information
              </Title>
              
              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Provide detailed description of your certified gemstone..." 
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                label="Comments (Optional)"
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
            <Title level={4}>Upload Certificate Image</Title>
            <Text type="secondary">
              Upload an image of your gemstone certificate for verification
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
                  <Text strong>Certificate uploaded: {uploadedFile.name}</Text>
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
                {loading ? 'Uploading...' : 'Continue with Certificate'}
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Title level={5} className="text-blue-800 mb-2">
                <SafetyCertificateOutlined className="mr-2" />
                What happens next?
              </Title>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Certificate image will be stored for verification</li>
                <li>• You will manually enter all gemstone details</li>
                <li>• Basic information form will need to be filled completely</li>
                <li>• Certificate details must match your uploaded image</li>
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
    // Handle gemstone image upload change
    const handleImageChange = (info: any) => {
      console.log('📁 Gemstone image upload change:', info);
      
      // Update wizard data with uploaded images
      setWizardData(prev => ({
        ...prev,
        images: info.fileList
      }));
    };

    // Handle certificate image upload change
    const handleCertificateImageChange = (info: any) => {
      console.log('📁 Certificate image upload change:', info);
      
      // Update wizard data with uploaded certificate images
      setWizardData(prev => ({ 
        ...prev, 
        certificateImages: info.fileList
      }));
    };

    // Handle video upload change
    const handleVideoChange = (info: any) => {
      console.log('🎬 Video upload change:', info);
      
      // Update wizard data with uploaded videos
      setWizardData(prev => ({ 
        ...prev, 
        videos: info.fileList
      }));
    };    const uploadProps = {
      name: 'images',
      multiple: true,
      accept: '.jpg,.jpeg,.png,.webp',
      listType: 'picture-card' as const,
      onChange: handleImageChange,
      beforeUpload: () => false, // Prevent automatic upload
      maxCount: 10,
    };

    const certificateUploadProps = {
      name: 'certificateImages',
      multiple: true,
      accept: '.jpg,.jpeg,.png,.webp,.pdf',
      listType: 'picture-card' as const,
      onChange: handleCertificateImageChange,
      beforeUpload: () => false, // Prevent automatic upload
      maxCount: 5,
    };

    const videoUploadProps = {
      name: 'videos',
      multiple: true,
      accept: '.mp4,.avi,.mov,.wmv,.webm',
      listType: 'picture-card' as const,
      onChange: handleVideoChange,
      beforeUpload: () => false, // Prevent automatic upload
      maxCount: 3,
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
            <Title level={3}>Upload Media & Review</Title>
            <Text type="secondary">
              Upload high-quality images and videos of your gemstone and review your listing
            </Text>
          </div>

          <Form layout="vertical">
            <Form.Item label="Gemstone Images" required>
              <Upload {...uploadProps}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload Gemstone Images</div>
                </div>
              </Upload>
              <Text type="secondary" className="text-sm block mt-2">
                Upload up to 10 high-quality images of your gemstone. First image will be used as the primary image.
                Supported formats: JPG, PNG, WebP (Max 5MB per image)
              </Text>
            </Form.Item>

            <Form.Item label="Gemstone Videos (Optional)">
              <Upload {...videoUploadProps}>
                <div>
                  <PictureOutlined />
                  <div style={{ marginTop: 8 }}>Upload Gemstone Videos</div>
                </div>
              </Upload>
              <Text type="secondary" className="text-sm block mt-2">
                Upload up to 3 high-quality videos of your gemstone showing different angles or features.
                Supported formats: MP4, AVI, MOV, WMV, WebM (Max 50MB per video)
              </Text>
            </Form.Item>

            {/* Certificate Images Upload - Only for certified gemstones */}
            {wizardData.certificationType === 'certified' && (
              <Form.Item label="Certificate Images" required>
                <Upload {...certificateUploadProps}>
                  <div>
                    <SafetyCertificateOutlined />
                    <div style={{ marginTop: 8 }}>Upload Certificate Images</div>
                  </div>
                </Upload>
                <Text type="secondary" className="text-sm block mt-2">
                  Upload clear images of your gemstone certificate. Include all pages if multi-page certificate.
                  Supported formats: JPG, PNG, WebP, PDF (Max 5MB per file)
                </Text>
              </Form.Item>
            )}

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
                  <Text strong>Category: </Text>
                  <Text>{wizardData.basicInfo.category || 'N/A'}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Color: </Text>
                  <Text>{wizardData.basicInfo.color || 'N/A'}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Shape: </Text>
                  <Text>{wizardData.basicInfo.shape || 'N/A'}</Text>
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
                  <Text>{wizardData.basicInfo.treatment || 'Not specified'}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Origin: </Text>
                  <Text>{wizardData.basicInfo.origin || 'Not specified'}</Text>
                </Col>
                <Col xs={24} md={12}>
                  <Text strong>Gemstone Images: </Text>
                  <Text>{wizardData.images?.length || 0} uploaded</Text>
                </Col>
                {wizardData.certificationType === 'certified' && (
                  <Col xs={24} md={12}>
                    <Text strong>Certificate Images: </Text>
                    <Text>{wizardData.certificateImages?.length || 0} uploaded</Text>
                  </Col>
                )}
                {wizardData.certificationType === 'certified' && wizardData.basicInfo.certificateNumber && (
                  <Col xs={24} md={12}>
                    <Text strong>Certificate Number: </Text>
                    <Text>{wizardData.basicInfo.certificateNumber}</Text>
                  </Col>
                )}
              </Row>
            </div>

            {/* Price Prediction Section */}
            {showPricePrediction && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl">
                <div className="mb-4">
                  <Title level={4} className="text-blue-800 mb-2">
                    <DollarOutlined className="mr-2" />
                    AI Price Prediction Results
                  </Title>
                  <Alert
                    message="Price Prediction Accuracy"
                    description="Please enter the correct valid information for true accuracy. This prediction is based on the gemstone characteristics you've provided."
                    type="info"
                    showIcon
                    className="mb-4"
                  />
                </div>
                
                <AIPricePrediction 
                  gemData={{
                    weight: wizardData.basicInfo.weight || '1.0',
                    color: wizardData.basicInfo.color || 'Blue',
                    cut: wizardData.basicInfo.cut || 'Good',
                    clarity: wizardData.basicInfo.clarity || 'SI1',
                    species: wizardData.basicInfo.species || wizardData.basicInfo.variety || 'Sapphire',
                    isCertified: wizardData.certificationType === 'certified',
                    shape: wizardData.basicInfo.shape || 'Round',
                    treatment: wizardData.basicInfo.treatment || 'Heat Treatment',
                    origin: wizardData.basicInfo.origin
                  }}
                  showDetails={true}
                  className="shadow-lg border-2 border-blue-300"
                />
                
                <div className="mt-4 text-center">
                  <Button 
                    type="link" 
                    onClick={() => setShowPricePrediction(false)}
                    className="text-blue-600"
                  >
                    Hide Prediction
                  </Button>
                </div>
              </div>
            )}

            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 mt-6">
              <div className="flex justify-between items-center">
                <Button 
                  icon={<ArrowLeftOutlined />} 
                  onClick={handlePrevious}
                  size="large"
                >
                  Previous
                </Button>
                
                <div className="flex space-x-3">
                  {/* Predict Price Button - Only for Certified Gemstones */}
                  {wizardData.certificationType === 'certified' && (
                    <Button 
                      icon={<DollarOutlined />}
                      onClick={handlePricePrediction}
                      loading={isPredicting}
                      size="large"
                      className="bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600"
                    >
                      {isPredicting ? 'Predicting...' : 'Predict Price'}
                    </Button>
                  )}
                  
                  {/* Submit Listing Button */}
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
            </div>
          </Form>
        </Card>
      </div>
    );
  };

  // Render current wizard step
  const renderCurrentStep = () => {
    if (wizardData.certificationType === 'certified') {
      // Certified gemstone flow: Certification → Basic Info → Images
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

  // Helper to construct proper image URL
  const constructImageUrl = (imagePath: string): string => {
    if (!imagePath) return 'https://via.placeholder.com/400x300?text=Gemstone';
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    const baseUrl = 'http://localhost:9092';
    if (imagePath.startsWith('/')) {
      return `${baseUrl}${imagePath}`;
    }
    
    return `${baseUrl}/${imagePath}`;
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

    // Construct full image URL
    const fullImageUrl = constructImageUrl(record.image);

    return (
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border">
          {imageError || !record.image ? (
            <PictureOutlined className="text-gray-400 text-xl" />
          ) : (
            <img 
              src={fullImageUrl} 
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
          <Button 
            size="small" 
            icon={<DeleteOutlined />} 
            danger
            type="text"
            onClick={() => handleDeleteListing(record)}
            title={record.status === 'sold' ? 'Delete completed listing' : 'Delete listing'}
          >
            Delete
          </Button>
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
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-gray-600">
                  Manage all your gemstone listings 
                  {pagination.total > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">
                      ({pagination.total} total)
                    </span>
                  )}
                </p>
                {/* Verification Status Indicator */}
                <div className="flex items-center">
                  {user?.isVerified ? (
                    <Tag color="green" className="border-0">
                      <CheckCircleOutlined className="mr-1" />
                      Verified Seller
                    </Tag>
                  ) : (
                    <Tag color="orange" className="border-0">
                      <AlertTriangle className="mr-1 w-3 h-3" />
                      Unverified Account
                    </Tag>
                  )}
                </div>
              </div>
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
                  background: user?.isVerified 
                    ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' 
                    : 'linear-gradient(135deg, #9ca3af, #6b7280)',
                  borderColor: user?.isVerified ? '#7c3aed' : '#9ca3af'
                }}
                title={user?.isVerified ? 'Create a new listing' : 'Verification required to create listings'}
              >
                Add New Listing
                {!user?.isVerified && (
                  <span className="ml-1 text-xs">🔒</span>
                )}
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
                    src={constructImageUrl(selectedListing.image)} 
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
            {selectedListing.status === 'sold' ? (
              <div className="mt-3">
                <p className="text-orange-600 font-medium">⚠️ This is a completed/sold listing</p>
                <p className="text-gray-600 mt-1">Deleting this will remove it from your sales history.</p>
              </div>
            ) : (
              <p className="text-gray-600 mt-2">This will remove the listing from the marketplace.</p>
            )}
            <p className="text-red-600 mt-2 font-medium">This action cannot be undone.</p>
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
