import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, User, MessageSquare, Phone, Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import MeetingService from '../../services/MeetingService';

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
}

const MeetingScheduler: React.FC<MeetingSchedulerProps> = ({ purchase, user, onBack, onScheduled }) => {
  const [sellerInfo, setSellerInfo] = useState<SellerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    proposedDate: '',
    proposedTime: '',
    location: '',
    meetingType: 'PHYSICAL',
    buyerNotes: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  // Fetch seller information with multiple fallback strategies
  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (!purchase.sellerId) return;
      
      setLoading(true);
      try {
        console.log('🔍 Fetching seller info for sellerId:', purchase.sellerId);
        
        // Strategy 1: Try the user profile endpoint
        let response = await fetch(`http://localhost:9092/api/users/profile/${purchase.sellerId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            console.log('✅ Seller info fetched from profile endpoint:', data.data);
            setSellerInfo({
              id: data.data.userId,
              fullName: `${data.data.firstName || ''} ${data.data.lastName || ''}`.trim() || 'Unknown Seller',
              email: data.data.email,
              phone: data.data.phoneNumber,
              address: data.data.address,
              isVerified: data.data.isVerified || false,
              userRole: data.data.userRole || 'SELLER'
            });
            return;
          }
        }
        
        // Strategy 2: Try to get seller from gem listing details
        console.log('🔄 Trying to fetch seller from listing details...');
        const listingResponse = await fetch(`http://localhost:9092/api/gemsData/listing/${purchase.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(localStorage.getItem('token') && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
          }
        });
        
        if (listingResponse.ok) {
          const listingData = await listingResponse.json();
          if (listingData.success && listingData.data && listingData.data.userName) {
            console.log('✅ Seller info fetched from listing:', listingData.data);
            setSellerInfo({
              id: purchase.sellerId,
              fullName: listingData.data.userName || 'Unknown Seller',
              email: listingData.data.userEmail || 'N/A',
              phone: 'Contact through platform',
              address: 'Available upon meeting confirmation',
              isVerified: false,
              userRole: 'SELLER'
            });
            return;
          }
        }
        
        // Strategy 3: Fallback - use basic seller info from purchase
        console.log('⚠️ Using fallback seller information');
        setSellerInfo({
          id: purchase.sellerId,
          fullName: 'Seller',
          email: 'Contact through platform',
          phone: 'Available upon meeting confirmation',
          address: 'Will be provided after meeting confirmation',
          isVerified: false,
          userRole: 'SELLER'
        });
        
      } catch (error) {
        console.error('❌ Error fetching seller info:', error);
        // Even on error, provide basic seller info so the meeting can be scheduled
        setSellerInfo({
          id: purchase.sellerId,
          fullName: 'Seller',
          email: 'Contact through platform',
          phone: 'Available upon meeting confirmation',
          address: 'Will be provided after meeting confirmation',
          isVerified: false,
          userRole: 'SELLER'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSellerInfo();
  }, [purchase.sellerId, purchase.id]);

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
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

    if (!formData.location.trim()) {
      newErrors.location = 'Please specify a location';
    }

    // Check if proposed date/time is in the future
    if (formData.proposedDate && formData.proposedTime) {
      const proposedDateTime = new Date(`${formData.proposedDate}T${formData.proposedTime}`);
      const now = new Date();
      
      if (proposedDateTime <= now) {
        newErrors.proposedTime = 'Please select a future date and time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const proposedDateTime = `${formData.proposedDate}T${formData.proposedTime}:00`;
      
      const requestData = {
        purchaseId: purchase.id,
        buyerId: user.id,
        sellerId: purchase.sellerId, // Ensure seller ID is included for notifications
        proposedDateTime,
        location: formData.location,
        meetingType: formData.meetingType,
        buyerNotes: formData.buyerNotes,
        // Add seller information for proper notification
        sellerInfo: sellerInfo ? {
          id: sellerInfo.id,
          fullName: sellerInfo.fullName,
          email: sellerInfo.email
        } : {
          id: purchase.sellerId,
          fullName: 'Seller',
          email: 'N/A'
        },
        // Add purchase details for context
        purchaseDetails: {
          gemName: purchase.gemName,
          gemType: purchase.gemType,
          finalPrice: purchase.finalPrice,
          purchaseDate: purchase.purchaseDate
        }
      };

      console.log('Creating meeting with data:', requestData);
      console.log('🔔 Seller will be notified:', requestData.sellerInfo);
      
      const meeting = await MeetingService.createMeeting(requestData);
      
      console.log('✅ Meeting created successfully:', meeting);
      console.log('📧 Notification sent to seller:', requestData.sellerId);
      onScheduled();

    } catch (error) {
      console.error('❌ Error creating meeting:', error);
      setErrors({ submit: 'Error creating meeting request. Please try again.' });
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
        {/* Header - Enhanced */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-md"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Purchases</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Schedule Meeting
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                Purchase ID: {purchase.id?.substring(0, 8)}...
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Meeting request for gemstone purchase</span>
              <span className="text-gray-500">Status: Pending</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Purchase Summary - Enhanced */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              Purchase Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <img
                    src={`http://localhost:9092${purchase.primaryImageUrl}` || 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=300&h=200&fit=crop'}
                    alt={purchase.gemName}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=300&h=200&fit=crop';
                    }}
                  />
                  <div className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    Won
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{purchase.gemName}</h3>
                  <p className="text-sm text-gray-600 mb-1">{purchase.gemType}</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(purchase.finalPrice)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Enhanced Gemstone Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900 text-sm">Gemstone Specifications</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {purchase.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{purchase.weight}</span>
                    </div>
                  )}
                  {purchase.color && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium">{purchase.color}</span>
                    </div>
                  )}
                  {purchase.clarity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clarity:</span>
                      <span className="font-medium">{purchase.clarity}</span>
                    </div>
                  )}
                  {purchase.cut && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cut:</span>
                      <span className="font-medium">{purchase.cut}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Status */}
              <div className="border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Transaction Status:</span>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    Awaiting Meeting
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Information - Enhanced */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              Seller Information
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-300 rounded w-1/4 mb-1"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-500 py-2">
                  Loading seller information...
                </div>
              </div>
            ) : sellerInfo ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {sellerInfo.fullName?.charAt(0).toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{sellerInfo.fullName || 'Unknown Seller'}</h3>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-600">{sellerInfo.userRole || 'SELLER'}</p>
                        {sellerInfo.isVerified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{sellerInfo.email || 'Contact through platform'}</p>
                    </div>
                  </div>
                  
                  {sellerInfo.phone && sellerInfo.phone !== 'Contact through platform' && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{sellerInfo.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {sellerInfo.address && sellerInfo.address !== 'Available upon meeting confirmation' && sellerInfo.address !== 'Will be provided after meeting confirmation' && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{sellerInfo.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Secure Communication</p>
                      <p className="text-sm text-green-700 mt-1">
                        The seller will be notified immediately of your meeting request and can confirm or suggest alternative times. All communications are tracked for security.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load seller information</h3>
                <p className="text-gray-500 mb-4">We're having trouble fetching seller details right now.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Retry Loading
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meeting Scheduling Form - Enhanced */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-5 h-5 text-purple-600 mr-2" />
            Schedule Meeting
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection - Enhanced */}
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
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.proposedDate ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.proposedDate && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.proposedDate}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Select a date from today onwards</p>
              </div>

              {/* Time Selection - Enhanced */}
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
                  className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.proposedTime ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                {errors.proposedTime && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {errors.proposedTime}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">Choose a convenient time</p>
              </div>
            </div>

            {/* Meeting Type - Enhanced */}
            <div>
              <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <select
                id="meetingType"
                name="meetingType"
                value={formData.meetingType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
              >
                <option value="PHYSICAL">Physical Meeting - Meet in person</option>
                <option value="PICKUP">Pickup Location - Collect from specified address</option>
                <option value="VIRTUAL">Virtual Meeting - Video call first</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Choose the type of meeting that works best for you</p>
            </div>

            {/* Location - Enhanced */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Meeting Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter the meeting location or address"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.location ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  {errors.location}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Provide a specific address or landmark</p>
            </div>

            {/* Notes - Enhanced */}
            <div>
              <label htmlFor="buyerNotes" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Additional Notes (Optional)
              </label>
              <textarea
                id="buyerNotes"
                name="buyerNotes"
                value={formData.buyerNotes}
                onChange={handleInputChange}
                rows={4}
                placeholder="Any additional information or special requests for the meeting..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500">Add any special instructions or requirements</p>
            </div>

            {/* Error Message - Enhanced */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-400 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Error sending meeting request</h4>
                    <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button - Enhanced */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium shadow-sm"
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

        {/* Important Notice - Enhanced */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 className="font-medium text-yellow-800 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Important Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Meeting Process</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• The seller will receive an email notification</li>
                <li>• They can confirm, decline, or suggest alternative times</li>
                <li>• You'll be notified of their response</li>
                <li>• Both parties must confirm the final arrangement</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Security & Payment</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• All communications are monitored for security</li>
                <li>• Transaction fees are handled by the platform</li>
                <li>• Payment protection is provided</li>
                <li>• Report any issues to support immediately</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              💡 Tip: Be specific about your preferred meeting location and any special requirements to ensure a smooth transaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingScheduler;
