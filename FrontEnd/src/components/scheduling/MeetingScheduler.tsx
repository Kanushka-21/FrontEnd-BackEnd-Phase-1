import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, User, MessageSquare, Phone, Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

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

  // Fetch seller information
  useEffect(() => {
    const fetchSellerInfo = async () => {
      if (!purchase.sellerId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:9092/api/users/${purchase.sellerId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSellerInfo(data.user);
          }
        }
      } catch (error) {
        console.error('Error fetching seller info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerInfo();
  }, [purchase.sellerId]);

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
        buyerId: user.userId || user.id,
        proposedDateTime,
        location: formData.location,
        meetingType: formData.meetingType,
        buyerNotes: formData.buyerNotes
      };

      const response = await fetch('http://localhost:9092/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (data.success) {
        onScheduled();
      } else {
        setErrors({ submit: data.message || 'Failed to create meeting request' });
      }

    } catch (error) {
      console.error('Error creating meeting:', error);
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
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.proposedDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.proposedDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.proposedDate}</p>
                )}
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

            {/* Meeting Type */}
            <div>
              <label htmlFor="meetingType" className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <select
                id="meetingType"
                name="meetingType"
                value={formData.meetingType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PHYSICAL">Physical Meeting</option>
                <option value="PICKUP">Pickup Location</option>
                <option value="VIRTUAL">Virtual Meeting</option>
              </select>
            </div>

            {/* Location */}
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Notes */}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{errors.submit}</p>
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
