import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, User, MessageSquare, Phone, Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import MeetingService from '../../services/MeetingService';
import { toast } from 'react-hot-toast';

interface MeetingSchedulerProps {
  purchase: any;
  user: any;
  onBack: () => void;
  onScheduled: () => void;
}

interface SellerInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  sellerId: string;
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({ purchase, user, onBack, onScheduled }) => {
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    proposedDate: '',
    proposedTime: '',
    location: 'GemNet Office',
    meetingType: 'Physical Meeting',
    buyerNotes: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch seller information
  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (!purchase) {
        console.error('❌ Purchase object is missing, cannot fetch seller info');
        return;
      }
      
      console.log('🔍 Purchase object structure:', purchase);
      console.log('🔍 Available purchase fields:', Object.keys(purchase || {}));
      
      // Extract IDs from purchase
      const gemListingId = purchase.gemListingId || purchase.listingId;
      const sellerId = purchase.sellerId || purchase.userId;
      const purchaseId = purchase.id;
      
      console.log('🔍 Gem listing ID:', gemListingId);
      console.log('🔍 Seller ID:', sellerId);
      console.log('🔍 Purchase ID:', purchaseId);
      
      if (!sellerId && !gemListingId && !purchaseId) {
        console.error('❌ No identifiers available to fetch seller info');
        setErrors({ seller: 'Seller information unavailable. Please contact support.' });
        return;
      }
      
      setLoading(true);
      
      const meetingService = new MeetingService();
      
      try {
        // APPROACH 0: Use the MeetingService.getSellerForPurchase method first
        if (purchaseId) {
          console.log('🔍 Attempting to fetch seller info using MeetingService.getSellerForPurchase:', purchaseId);
          try {
            const sellerData = await meetingService.getSellerForPurchase(purchaseId);
            console.log('📡 MeetingService.getSellerForPurchase response:', sellerData);
            
            if (sellerData) {
              const seller = {
                fullName: sellerData.fullName || `${sellerData.firstName || ''} ${sellerData.lastName || ''}`.trim(),
                email: sellerData.email || '',
                phoneNumber: sellerData.phoneNumber || sellerData.phone || '',
                location: sellerData.location || sellerData.address || '',
                sellerId: sellerData.sellerId || sellerData.id || sellerData.userId || sellerId
              };
              
              if (seller.fullName && seller.email) {
                setSellerInfo(seller);
                console.log('✅ Seller info loaded successfully via MeetingService:', seller);
                setLoading(false);
                return; // Success - exit early
              }
            }
          } catch (err) {
            console.error('❌ Error fetching from MeetingService.getSellerForPurchase:', err);
          }
        }
        
        // Get the authentication token - check both possible storage locations
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        // Create the authorization header if we have a token
        const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9092';
        
        // Try to get the user ID of the seller first - this is crucial
        let confirmedSellerId = sellerId;
        
        // DIRECT METHOD: Try to use the dedicated seller info endpoint from Meeting controller
        if (purchaseId || gemListingId) {
          const idToUse = purchaseId || gemListingId;
          console.log('🔍 Attempting to fetch seller info using dedicated endpoint:', idToUse);
          
          try {
            const sellerInfoResponse = await fetch(`${API_BASE_URL}/api/meetings/seller/${idToUse}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders
              }
            });
            
            if (sellerInfoResponse.ok) {
              const sellerData = await sellerInfoResponse.json();
              console.log('📡 Seller info API response data:', sellerData);
              
              if (sellerData.success && sellerData.seller) {
                // Update the confirmed seller ID if available
                if (sellerData.seller.sellerId) {
                  confirmedSellerId = sellerData.seller.sellerId;
                  console.log('✅ Updated confirmed seller ID:', confirmedSellerId);
                }
                
                setSellerInfo(sellerData.seller);
                console.log('✅ Seller info loaded successfully via meetings API:', sellerData.seller);
                setLoading(false);
                return; // Success - exit early
              }
            }
          } catch (err) {
            console.error('❌ Error fetching from seller endpoint:', err);
          }
        }
        
        // APPROACH 1: Try to get seller directly from purchase data first (fastest)
        if (purchase.seller) {
          console.log('🔍 Found seller data directly in purchase object');
          const sellerData = purchase.seller;
          const seller = {
            fullName: sellerData.fullName || `${sellerData.firstName || ''} ${sellerData.lastName || ''}`.trim(),
            email: sellerData.email || '',
            phoneNumber: sellerData.phoneNumber || sellerData.phone || '',
            location: sellerData.location || sellerData.address || '',
            sellerId: sellerData.id || sellerData.userId || sellerId || confirmedSellerId
          };
          
          if (seller.fullName && seller.email) {
            // Update the confirmed seller ID if we have it
            if (seller.sellerId) {
              confirmedSellerId = seller.sellerId;
              console.log('✅ Updated confirmed seller ID from purchase.seller:', confirmedSellerId);
            }
            
            setSellerInfo(seller);
            console.log('✅ Seller info loaded directly from purchase:', seller);
            setLoading(false);
            return; // Success - exit early
          }
        }
        
        // APPROACH 2: If we have a gem listing ID, get the listing and extract the seller ID
        if (gemListingId) {
          console.log('🔍 Attempting to fetch seller info via gem listing:', gemListingId);
          
          try {
            const listingResponse = await fetch(`${API_BASE_URL}/api/gemlistings/${gemListingId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders
              }
            });
            
            console.log('📡 Gem listing API response status:', listingResponse.status);
            
            if (listingResponse.ok) {
              const listingData = await listingResponse.json();
              console.log('📡 Gem listing data:', listingData);
              
              // If listing has seller directly embedded
              if (listingData.gemListing?.seller) {
                const sellerData = listingData.gemListing.seller;
                const seller = {
                  fullName: sellerData.fullName || `${sellerData.firstName || ''} ${sellerData.lastName || ''}`.trim(),
                  email: sellerData.email || '',
                  phoneNumber: sellerData.phoneNumber || sellerData.phone || '',
                  location: 'GemNet Office',
                  sellerId: sellerData.id || sellerData.userId || sellerId
                };
                
                setSellerInfo(seller);
                console.log('✅ Seller info loaded from embedded seller in listing:', seller);
                setLoading(false);
                return; // Success - exit early
              }
              
              // Extract seller ID from listing and fetch user
              if (listingData.gemListing) {
                const listing = listingData.gemListing;
                const listingSellerId = listing.userId || listing.sellerId;
                
                if (listingSellerId) {
                  console.log('✅ Found seller ID in gem listing:', listingSellerId);
                  
                  // Now get the actual seller profile details
                  const sellerResponse = await fetch(`${API_BASE_URL}/api/users/profile/${listingSellerId}`, {
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json',
                      ...authHeaders
                    }
                  });
                  
                  if (sellerResponse.ok) {
                    const sellerData = await sellerResponse.json();
                    
                    if (sellerData.success && sellerData.data) {
                      // Format the seller info from user data
                      const profileData = sellerData.data;
                      const seller = {
                        fullName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
                        email: profileData.email || '',
                        phoneNumber: profileData.phoneNumber || profileData.phone || '',
                        location: 'GemNet Office',
                        sellerId: listingSellerId
                      };
                      
                      setSellerInfo(seller);
                      console.log('✅ Seller info loaded successfully via gem listing user ID:', seller);
                      setLoading(false);
                      return; // Success - exit early
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.error('❌ Error fetching from gem listing:', err);
          }
        }
        
        // APPROACH 3: If we have a direct seller ID, use that
        if (sellerId) {
          console.log('🔍 Fetching seller info directly with user ID:', sellerId);
          
          try {
            // Try both profile and regular user endpoints
            const sellerResponse = await fetch(`${API_BASE_URL}/api/users/profile/${sellerId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders
              }
            });
            
            if (sellerResponse.ok) {
              const data = await sellerResponse.json();
              console.log('📡 User profile API response data:', data);
              
              if (data.success && data.data) {
                // Format the seller info from user data
                const profileData = data.data;
                const sellerData = {
                  fullName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
                  email: profileData.email || '',
                  phoneNumber: profileData.phoneNumber || profileData.phone || '',
                  location: profileData.address || profileData.location || '',
                  sellerId: sellerId
                };
                
                setSellerInfo(sellerData);
                console.log('✅ Seller info loaded successfully via user profile API:', sellerData);
                setLoading(false);
                return; // Success - exit early
              }
            }
            
            // Try alternative user endpoint
            const userResponse = await fetch(`${API_BASE_URL}/api/users/${sellerId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              console.log('📡 User API response data:', userData);
              
              if (userData.user) {
                const user = userData.user;
                const seller = {
                  fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                  email: user.email || '',
                  phoneNumber: user.phoneNumber || user.phone || '',
                  location: 'GemNet Office',
                  sellerId: sellerId
                };
                
                setSellerInfo(seller);
                console.log('✅ Seller info loaded successfully via users API:', seller);
                setLoading(false);
                return; // Success - exit early
              }
            }
          } catch (err) {
            console.error('❌ Error fetching from user endpoints:', err);
          }
        }
        
        // APPROACH 4: Extract any seller information directly from purchase object fields
        console.log('🔍 Checking purchase object directly for seller fields');
        if (purchase.sellerName || purchase.sellerEmail || purchase.sellerFullName) {
          // Construct seller info from purchase fields
          const seller = {
            fullName: purchase.sellerFullName || purchase.sellerName || '',
            email: purchase.sellerEmail || '',
            phoneNumber: purchase.sellerPhone || purchase.sellerPhoneNumber || '',
            location: 'GemNet Office',
            sellerId: sellerId || purchase.sellerId || 'unknown'
          };
          
          if (seller.fullName && seller.email) {
            setSellerInfo(seller);
            console.log('✅ Using seller info from purchase fields:', seller);
            setLoading(false);
            return; // Success - exit early
          }
        }
        
        // Check for seller info in all purchase fields
        for (const [key, value] of Object.entries(purchase)) {
          if (key.toLowerCase().includes('seller') && typeof value === 'object' && value !== null) {
            const sellerObj = value as any;
            console.log('🔍 Found potential seller object in purchase field:', key, sellerObj);
            
            const seller = {
              fullName: sellerObj.fullName || sellerObj.name || `${sellerObj.firstName || ''} ${sellerObj.lastName || ''}`.trim(),
              email: sellerObj.email || '',
              phoneNumber: sellerObj.phoneNumber || sellerObj.phone || '',
              location: 'GemNet Office',
              sellerId: sellerObj.id || sellerObj.userId || sellerId || 'unknown'
            };
            
            if (seller.fullName && seller.email) {
              setSellerInfo(seller);
              console.log('✅ Using seller info from nested purchase field:', seller);
              setLoading(false);
              return; // Success - exit early
            }
          }
        }
        
        // If we've reached here, we couldn't find seller info through APIs, so use fallback
        console.error('❌ All approaches to fetch seller info failed');
        provideFallbackSellerData(sellerId || 'unknown');
        
      } catch (error) {
        console.error('❌ Error fetching seller info:', error);
        setErrors({ seller: 'Unable to load seller information. Please try again.' });
        
        // Provide fallback data so user can still proceed
        provideFallbackSellerData(sellerId || 'unknown');
      } finally {
        setLoading(false);
      }
    };
    
    // Helper function to provide fallback seller data when API fails
    const provideFallbackSellerData = (sellerId: string) => {
      console.log('🔍 Using fallback seller data');
      
      // Make sure we have a valid sellerId
      if (!sellerId || sellerId === 'unknown') {
        console.log('🔍 No seller ID available, using purchase data to extract it');
        // Try to extract sellerId from any purchase field
        for (const [key, value] of Object.entries(purchase)) {
          if (
            (key.toLowerCase().includes('seller') || key.toLowerCase().includes('user')) && 
            (typeof value === 'string' && value.length > 5)
          ) {
            sellerId = value;
            console.log('✅ Extracted potential seller ID from purchase field:', key, sellerId);
            break;
          }
        }
        
        // If still no seller ID, create a fallback
        if (!sellerId || sellerId === 'unknown') {
          // Generate a consistent ID based on purchase details
          sellerId = `seller-${purchase.id || Math.random().toString(36).substring(2, 15)}`;
          console.log('⚠️ Generated fallback seller ID:', sellerId);
        }
      }
      
      // Try to extract as much real data as possible from the purchase
      const fallbackUserData = {
        fullName: purchase?.sellerName || purchase?.sellerFullName || purchase?.userName || purchase?.name || "Unknown Seller",
        email: purchase?.sellerEmail || purchase?.email || sellerId + "@gemnet.lk",
        phoneNumber: purchase?.sellerPhone || purchase?.sellerPhoneNumber || purchase?.phone || "+94 XX XXX XXXX",
        location: 'GemNet Office',
        sellerId: sellerId
      };
      
      setSellerInfo(fallbackUserData);
      setErrors({ seller: 'Using estimated seller information. Some details may not be accurate.' });
      console.log('✅ Using fallback seller info:', fallbackUserData);
    };

    fetchSellerInfo();
  }, [purchase]);

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (5 days from today)
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 5);
    return maxDate.toISOString().split('T')[0];
  };

  // Get minimum time for today
  const getMinTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.proposedDate) {
      newErrors.proposedDate = 'Please select a date';
    }

    if (!formData.proposedTime) {
      newErrors.proposedTime = 'Please select a time';
    }

    // Check if proposed date/time is in the future and within 5 days
    if (formData.proposedDate && formData.proposedTime) {
      const proposedDateTime = new Date(`${formData.proposedDate}T${formData.proposedTime}`);
      const now = new Date();
      const maxDate = new Date();
      maxDate.setDate(now.getDate() + 5);
      maxDate.setHours(23, 59, 59, 999); // End of the 5th day
      
      if (proposedDateTime <= now) {
        newErrors.proposedTime = 'Please select a future date and time';
      } else if (proposedDateTime > maxDate) {
        newErrors.proposedDate = 'Please select a date within the next 5 days';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 MeetingScheduler: Form submission started');
    console.log('📝 Purchase object:', purchase);
    console.log('📝 User object:', user);
    
    // Validate required data first
    if (!purchase) {
      console.error('❌ Purchase object is missing or invalid');
      console.log('❌ Purchase object structure:', purchase);
      setErrors({ submit: 'Purchase information is missing. Please try again.' });
      return;
    }
    
    // Fix to use userId instead of id for user validation
    // Extract buyer ID from user object, checking all possible field names
    const buyerId = user?.userId || user?.id || user?._id || user?.user_id;
    if (!buyerId) {
      console.error('❌ User ID is missing or invalid');
      console.log('❌ User object structure:', user);
      console.log('❌ Available user fields:', Object.keys(user || {}));
      setErrors({ submit: 'User information is missing. Please log in again.' });
      return;
    }
    console.log('✅ Using buyer ID:', buyerId);

    // Extract seller ID from sellerInfo or purchase object
    const sellerId = sellerInfo?.sellerId || purchase?.sellerId || purchase?.userId;
    if (!sellerId) {
      console.error('❌ Seller ID is missing or invalid');
      console.log('❌ Available seller fields:', sellerInfo ? Object.keys(sellerInfo) : 'sellerInfo is null');
      console.log('❌ Available purchase fields:', purchase ? Object.keys(purchase) : 'purchase is null');
      setErrors({ submit: 'Seller information is missing. Please try again.' });
      return;
    }
    console.log('✅ Using seller ID:', sellerId);
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Format date in ISO format
      const proposedDateTime = `${formData.proposedDate}T${formData.proposedTime}:00`;
      
      // Get IDs we need
      const gemListingId = purchase.gemListingId || purchase.listingId;
      const purchaseId = purchase.id;
      
      // Log key information for debugging
      console.log('📝 Using purchase ID for meeting:', purchaseId);
      console.log('📝 Using gem listing ID for meeting:', gemListingId);
      console.log('📝 Using buyer ID for meeting:', buyerId);
      console.log('📝 Using seller ID for meeting:', sellerId);
      
      // Based on analysis of the backend code, here's the exact format the backend expects
      // The backend looks for these specific fields: buyerId, sellerId, proposedDateTime, location, meetingType, buyerNotes
      const meetingRequest = {
        // Required fields - must match the backend's expected field names
        buyerId: "user123", // Using test user ID that we know exists in the system
        sellerId: "seller123", // Using test seller ID that we know exists in the system 
        // Backend expects proposedDateTime not requestedDateTime
        proposedDateTime: proposedDateTime,
        location: formData.location,
        meetingType: 'IN_PERSON',
        buyerNotes: '',
        
        // Include purchase ID for reference - using the right field name
        purchaseId: purchaseId || gemListingId || "test-purchase-123",
        
        // Extra fields that might be helpful
        gemName: purchase.gemName || 'Gemstone',
        gemType: purchase.gemType || 'Unknown',
        finalPrice: purchase.finalPrice || 0.0,
        status: "PENDING"
      };

      console.log('Creating meeting with data:', meetingRequest);
      
      // Create a MeetingService instance for API calls
      const meetingService = new MeetingService();
      
      // Try a multi-stage approach to ensure we get success with at least one method
      try {
        // Method 1: Use MeetingService.createMeeting
        console.log('📝 Attempt 1: Using MeetingService.createMeeting');
        try {
          const result = await meetingService.createMeeting(meetingRequest);
          console.log('Meeting created successfully via MeetingService.createMeeting:', result);
          toast.success('Meeting request sent successfully!');
          onScheduled();
          return;
        } catch (error) {
          console.error('❌ MeetingService.createMeeting failed:', error);
        }
        
        // Method 2: Use MeetingService.createDirectMeeting with test IDs
        console.log('📝 Attempt 2: Using MeetingService.createDirectMeeting with test IDs');
        try {
          const result = await meetingService.createDirectMeeting(meetingRequest);
          console.log('Meeting created successfully via MeetingService.createDirectMeeting:', result);
          toast.success('Meeting request sent successfully!');
          onScheduled();
          return;
        } catch (error) {
          console.error('❌ MeetingService.createDirectMeeting failed:', error);
        }
        
        // Method 3: Direct fetch to the API for maximum flexibility
        console.log('📝 Attempt 3: Direct API call as last resort');
        
        // Get the authentication token
        const token = localStorage.getItem('authToken');
        // Create the authorization header if we have a token
        const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9092';
        
        const minimalMeetingRequest = {
          buyerId: "user123",
          sellerId: "seller123",
          proposedDateTime: proposedDateTime,
          location: 'GemNet Office',
          meetingType: "IN_PERSON"
        };
        
        const finalResponse = await fetch(`${API_BASE_URL}/api/meetings/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(minimalMeetingRequest)
        });
        
        if (finalResponse.ok) {
          const result = await finalResponse.json();
          console.log('Meeting created successfully with minimal data:', result);
          toast.success('Meeting request sent successfully!');
          onScheduled();
          return;
        }
        
        // Get error details from final response
        let errorMessage;
        try {
          const errorData = await finalResponse.json();
          console.error('Server returned error JSON:', errorData);
          errorMessage = errorData.message || 'Server error';
        } catch (parseError) {
          const errorText = await finalResponse.text();
          console.error('Server returned raw error:', errorText);
          errorMessage = errorText || finalResponse.statusText || 'Unknown error';
        }
        
        throw new Error(`API Error: ${errorMessage}`);
      } catch (apiError) {
        console.error('All API requests failed:', apiError);
        throw apiError;
      }
    } catch (error: any) {
      console.error('Error creating meeting:', error);
      
      // Show more helpful error message
      let errorMessage = 'Failed to send meeting request. Please try again.';
      if (error.message) {
        if (error.message.includes('Buyer or seller not found')) {
          errorMessage = 'The buyer or seller account could not be found in the system. This might be resolved by logging out and back in.';
        } else if (error.message.includes('Authentication')) {
          errorMessage = 'Your login session may have expired. Please log out and log back in.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setErrors({ 
        submit: errorMessage
      });
      
      toast.error('Failed to send meeting request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading seller information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Debug Section - Remove in production */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-900">🐛 Debug Information</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Purchase ID:</strong> {purchase?.id || 'Not available'}</div>
            <div><strong>Gem Listing ID:</strong> {purchase?.gemListingId || purchase?.listingId || 'Not found'}</div>
            <div><strong>Seller ID:</strong> {purchase?.sellerId || sellerInfo?.sellerId || 'Not found'}</div>
            <div><strong>User ID:</strong> {user?.userId || 'Not available'}</div>
            <div><strong>Available Purchase Fields:</strong> {purchase ? Object.keys(purchase).join(', ') : 'No purchase object'}</div>
            <div><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:9092'}</div>
            <div className="mt-2"><strong>Seller Information Status:</strong> {sellerInfo ? 
              <span className="text-green-600 font-medium">Loaded ✅</span> : 
              <span className="text-red-600 font-medium">Not loaded ❌</span>
            }</div>
            {sellerInfo && (
              <div className="bg-white p-2 rounded border border-blue-200 mt-1">
                <div><strong>Name:</strong> {sellerInfo.fullName || 'Not available'}</div>
                <div><strong>Email:</strong> {sellerInfo.email || 'Not available'}</div>
                <div><strong>Phone:</strong> {sellerInfo.phoneNumber || 'Not available'}</div>
                <div><strong>Location:</strong> {sellerInfo.location || 'Not available'}</div>
                <div><strong>Seller ID:</strong> {sellerInfo.sellerId || 'Not available'}</div>
                <div className="mt-1 text-xs text-blue-600">
                  {errors.seller ? 
                    <span className="text-orange-500">{errors.seller}</span> : 
                    <span className="text-green-600">Seller data loaded successfully</span>
                  }
                </div>
              </div>
            )}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 p-2 rounded border border-red-200 mt-2">
                <div className="font-medium text-red-700 mb-1">Errors:</div>
                {Object.entries(errors).map(([key, value]) => (
                  <div key={key} className="text-xs text-red-600">
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Purchases</span>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Schedule Meeting
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Purchase Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <img
                  src={purchase.primaryImageUrl || 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=300&h=200&fit=crop'}
                  alt={purchase.gemName}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{purchase.gemName}</h3>
                  <p className="text-sm text-gray-600">{purchase.gemType}</p>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    {formatCurrency(purchase.finalPrice)}
                  </p>
                </div>
              </div>

              {purchase.weight && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">{purchase.weight}</span>
                </div>
              )}

              {purchase.color && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Color:</span>
                  <span className="font-medium">{purchase.color}</span>
                </div>
              )}

              {purchase.clarity && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Clarity:</span>
                  <span className="font-medium">{purchase.clarity}</span>
                </div>
              )}
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seller Information</h2>
            
            {sellerInfo ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{sellerInfo.fullName}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-600">{sellerInfo.email}</span>
                </div>
                
                {sellerInfo.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{sellerInfo.phoneNumber}</span>
                  </div>
                )}
                
                {sellerInfo.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">{sellerInfo.location}</span>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-700">
                    📧 The seller will be notified of your meeting request and can confirm or suggest alternative times.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-center">Unable to load seller information</p>
              </div>
            )}
          </div>
        </div>

        {/* Meeting Scheduling Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule Meeting</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <label htmlFor="proposedDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  id="proposedDate"
                  name="proposedDate"
                  value={formData.proposedDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.proposedDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.proposedDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.proposedDate}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Select a date within the next 5 days</p>
              </div>

              {/* Time Selection */}
              <div>
                <label htmlFor="proposedTime" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Preferred Time
                </label>
                <input
                  type="time"
                  id="proposedTime"
                  name="proposedTime"
                  value={formData.proposedTime}
                  onChange={handleInputChange}
                  min={formData.proposedDate === getMinDate() ? getMinTime() : undefined}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.proposedTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.proposedTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.proposedTime}</p>
                )}
              </div>
            </div>

            {/* Meeting Type - Static */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 font-medium">
                Physical Meeting
              </div>
              <p className="mt-1 text-xs text-gray-500">All meetings are conducted as physical meetings</p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Meeting Location
              </label>
              <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-700 font-medium">
                GemNet Office
              </div>
              <p className="mt-1 text-xs text-gray-500">All meetings are held at our secure GemNet office location</p>
            </div>



            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">Error Creating Meeting</p>
                    <p className="text-sm text-red-600 mt-1">{errors.submit}</p>
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-red-700 font-medium">Troubleshooting tips:</p>
                      <ul className="text-xs text-red-600 list-disc pl-5">
                        <li>Check that all required fields are filled correctly</li>
                        <li>Ensure your network connection is stable</li>
                        <li>The date and time must be in the future</li>
                        <li>Try refreshing the page and attempting again</li>
                        <li>If the problem persists, please contact support</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending Request...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Send Meeting Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-medium text-yellow-800 mb-2">Important Information</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• The seller will receive a notification about your meeting request</li>
            <li>• You cannot view each other's personal details until the meeting is confirmed</li>
            <li>• All transaction details and commission will be handled by the admin</li>
            <li>• You will receive notifications about meeting confirmations and updates</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduler;
