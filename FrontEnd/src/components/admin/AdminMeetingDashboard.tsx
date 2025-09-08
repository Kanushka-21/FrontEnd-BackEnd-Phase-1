import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, User, Phone, Mail, Package, Eye, 
  Search, Filter, CheckCircle, XCircle, AlertCircle, Check, RefreshCw 
} from 'lucide-react';

interface Meeting {
  id: string;
  purchaseId: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
  buyerEmail: string;
  sellerEmail: string;
  buyerPhone: string;
  sellerPhone: string;
  gemName: string;
  gemType: string;
  finalPrice: number;
  commissionAmount?: number;
  primaryImageUrl: string;
  proposedDateTime: string;
  confirmedDateTime?: string;
  location: string;
  meetingType: string;
  status: string;
  buyerNotes?: string;
  sellerNotes?: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus?: string;
}

interface AdminMeetingDashboardProps {
  className?: string;
}

const AdminMeetingDashboard: React.FC<AdminMeetingDashboardProps> = ({ className = '' }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [updatingMeeting, setUpdatingMeeting] = useState<string | null>(null);

  // Statistics
  const stats = {
    total: meetings.length,
    pending: meetings.filter(m => m.status === 'PENDING').length,
    confirmed: meetings.filter(m => m.status === 'CONFIRMED').length,
    completed: meetings.filter(m => m.status === 'COMPLETED').length,
    cancelled: meetings.filter(m => m.status === 'CANCELLED').length,
  };

  // Fetch meetings
  useEffect(() => {
    fetchAllMeetings();
  }, []);

  const fetchAllMeetings = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching meetings from:', 'http://localhost:9092/api/meetings/admin/all');
      
      const response = await fetch('http://localhost:9092/api/meetings/admin/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('📊 Response status:', response.status);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Response data:', data);
      
      if (data.success) {
        setMeetings(data.meetings || []);
        setMessage({ 
          type: 'success', 
          text: `Loaded ${data.meetings?.length || 0} meetings successfully` 
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to load meetings');
      }
    } catch (error) {
      console.error('❌ Error fetching meetings:', error);
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage({ 
        type: 'error', 
        text: `Failed to load meetings: ${errorMessage}` 
      });
      
      // Load mock data for development
      console.log('🔧 Loading mock meeting data for development...');
      loadMockMeetingData();
      
    } finally {
      setLoading(false);
    }
  };

  // Load mock data for development/testing
  const loadMockMeetingData = () => {
    const mockMeetings: Meeting[] = [
      {
        id: 'meeting-001',
        purchaseId: 'purchase-001',
        buyerId: 'buyer-001',
        sellerId: 'seller-001',
        buyerName: 'John Smith',
        sellerName: 'Alice Johnson',
        buyerEmail: 'john.smith@example.com',
        sellerEmail: 'alice.johnson@example.com',
        buyerPhone: '+94 77 123 4567',
        sellerPhone: '+94 71 987 6543',
        gemName: 'Ceylon Blue Sapphire',
        gemType: 'Sapphire',
        finalPrice: 25000,
        commissionAmount: 2500,
        primaryImageUrl: '/api/placeholder/150/150',
        proposedDateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        confirmedDateTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        location: 'GemNet Office, Colombo',
        meetingType: 'VERIFICATION',
        status: 'CONFIRMED',
        buyerNotes: 'Looking forward to the verification meeting',
        sellerNotes: 'Will bring all certificates',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        paymentStatus: 'PENDING'
      },
      {
        id: 'meeting-002',
        purchaseId: 'purchase-002',
        buyerId: 'buyer-002',
        sellerId: 'seller-002',
        buyerName: 'Michael Brown',
        sellerName: 'Sarah Davis',
        buyerEmail: 'michael.brown@example.com',
        sellerEmail: 'sarah.davis@example.com',
        buyerPhone: '+94 76 234 5678',
        sellerPhone: '+94 75 876 5432',
        gemName: 'Pink Padparadscha',
        gemType: 'Padparadscha',
        finalPrice: 45000,
        commissionAmount: 4500,
        primaryImageUrl: '/api/placeholder/150/150',
        proposedDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'GemNet Office, Kandy',
        meetingType: 'HANDOVER',
        status: 'PENDING',
        buyerNotes: 'Need to verify authenticity',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        paymentStatus: 'PENDING'
      },
      {
        id: 'meeting-003',
        purchaseId: 'purchase-003',
        buyerId: 'buyer-003',
        sellerId: 'seller-003',
        buyerName: 'Robert Wilson',
        sellerName: 'Emma Thompson',
        buyerEmail: 'robert.wilson@example.com',
        sellerEmail: 'emma.thompson@example.com',
        buyerPhone: '+94 78 345 6789',
        sellerPhone: '+94 74 765 4321',
        gemName: 'Star Ruby',
        gemType: 'Ruby',
        finalPrice: 32000,
        commissionAmount: 3200,
        primaryImageUrl: '/api/placeholder/150/150',
        proposedDateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        location: 'GemNet Office, Galle',
        meetingType: 'VERIFICATION',
        status: 'COMPLETED',
        buyerNotes: 'Excellent service',
        sellerNotes: 'Transaction completed successfully',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        paymentStatus: 'COMPLETED'
      }
    ];
    
    setMeetings(mockMeetings);
    setMessage({ 
      type: 'info', 
      text: `Loaded ${mockMeetings.length} mock meetings (development mode)` 
    });
    setTimeout(() => setMessage(null), 5000);
  };

  // Update meeting status to COMPLETED
  const markAsCompleted = async (meetingId: string) => {
    setUpdatingMeeting(meetingId);
    try {
      const response = await fetch(`http://localhost:9092/api/meetings/admin/${meetingId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Meeting marked as completed successfully. Notifications sent to both parties.' 
        });
        setTimeout(() => setMessage(null), 5000);
        
        // Refresh meetings to get updated data
        fetchAllMeetings();
      } else {
        throw new Error(data.message || 'Failed to update meeting status');
      }
    } catch (error) {
      console.error('❌ Error updating meeting status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage({ 
        type: 'error', 
        text: `Failed to update meeting: ${errorMessage}` 
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setUpdatingMeeting(null);
    }
  };

  // Filter meetings
  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = !searchTerm || 
      meeting.gemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.sellerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || meeting.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={`bg-gray-50 p-6 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading meeting data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 p-6 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            message.type === 'success' ? 'bg-green-50 border-green-400 text-green-700' :
            message.type === 'error' ? 'bg-red-50 border-red-400 text-red-700' :
            'bg-blue-50 border-blue-400 text-blue-700'
          }`}>
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-3 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Compact Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Meeting Management</h1>
              <p className="text-sm text-gray-600 mt-1">All accepted meetings overview</p>
            </div>
            <button
              onClick={fetchAllMeetings}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Compact Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">Confirmed</p>
              <p className="text-xl font-bold text-green-600">{stats.confirmed}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">Completed</p>
              <p className="text-xl font-bold text-blue-600">{stats.completed}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">Cancelled</p>
              <p className="text-xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
          </div>
        </div>

        {/* Compact Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-1">
              {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                  <span className="ml-1 text-xs">
                    ({status === 'ALL' ? stats.total : 
                      status === 'PENDING' ? stats.pending :
                      status === 'CONFIRMED' ? stats.confirmed :
                      status === 'COMPLETED' ? stats.completed :
                      status === 'CANCELLED' ? stats.cancelled : 0})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* All Accepted Meetings - User Friendly Design */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">All Accepted Meetings</h2>
              <div className="text-sm text-gray-500">
                {filteredMeetings.length} meetings found
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Item & Participants</th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Meeting Details</th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Price</th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Status</th>
                  <th className="text-left p-3 font-medium text-gray-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                        <span className="text-gray-500">Loading meetings...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMeetings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>No meetings found matching your criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredMeetings.map((meeting) => {
                    const proposedDateTime = meeting.proposedDateTime ? new Date(meeting.proposedDateTime) : null;
                    const confirmedDateTime = meeting.confirmedDateTime ? new Date(meeting.confirmedDateTime) : null;

                    return (
                      <tr key={meeting.id} className="hover:bg-gray-50 transition-colors">
                        {/* Item & Participants Column */}
                        <td className="p-3">
                          <div className="flex items-start space-x-3">
                            {/* Item Image */}
                            <div className="flex-shrink-0">
                              <img
                                src={meeting.primaryImageUrl || '/api/placeholder/60/60'}
                                alt={meeting.gemName || 'Gem'}
                                className="w-14 h-14 rounded-lg object-cover border border-gray-200"
                              />
                            </div>
                            
                            {/* Item and Participants Info */}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate mb-1">
                                {meeting.gemName || 'Unknown Gem'}
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                {meeting.gemType || 'Gemstone'}
                              </div>
                              
                              {/* Participants */}
                              <div className="space-y-1">
                                <div className="flex items-center text-xs">
                                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                  <span className="text-green-700 font-medium">Buyer:</span>
                                  <span className="text-gray-600 ml-1 truncate max-w-[120px]">
                                    {meeting.buyerName || 'N/A'}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs">
                                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                  <span className="text-blue-700 font-medium">Seller:</span>
                                  <span className="text-gray-600 ml-1 truncate max-w-[120px]">
                                    {meeting.sellerName || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Meeting Details Column */}
                        <td className="p-3">
                          <div className="space-y-1">
                            {/* Date and Time */}
                            <div className="flex items-center text-xs text-gray-600">
                              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                              <span>
                                {proposedDateTime ? proposedDateTime.toLocaleDateString('en-GB') : 'TBD'}
                              </span>
                              <Clock className="w-3 h-3 ml-2 mr-1 text-gray-400" />
                              <span>
                                {proposedDateTime ? proposedDateTime.toLocaleTimeString('en-GB', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                }) : 'TBD'}
                              </span>
                            </div>
                            
                            {/* Location */}
                            <div className="flex items-center text-xs text-gray-600">
                              <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                              <span className="truncate max-w-[140px]">
                                {meeting.location || 'Location TBD'}
                              </span>
                            </div>
                            
                            {/* Meeting Type */}
                            <div className="text-xs">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {meeting.meetingType || 'MEETING'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Price Column */}
                        <td className="p-3">
                          <div className="text-sm font-semibold text-green-600">
                            LKR {meeting.finalPrice ? meeting.finalPrice.toLocaleString() : '0'}
                          </div>
                          {meeting.commissionAmount && (
                            <div className="text-xs text-gray-500">
                              Commission: LKR {meeting.commissionAmount.toLocaleString()}
                            </div>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            meeting.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            meeting.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            meeting.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                            meeting.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {meeting.status || 'PENDING'}
                          </span>
                        </td>
                        
                        {/* Actions Column */}
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedMeeting(meeting);
                                setShowDetailsModal(true);
                              }}
                              className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Details</span>
                            </button>
                            
                            {/* Mark as Completed Button for Confirmed Meetings */}
                            {meeting.status === 'CONFIRMED' && (
                              <button
                                onClick={() => markAsCompleted(meeting.id)}
                                disabled={updatingMeeting === meeting.id}
                                className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {updatingMeeting === meeting.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-green-700"></div>
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>Complete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Enhanced Meeting Details Modal */}
        {showDetailsModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Meeting Details</h3>
                    <p className="text-sm text-gray-600 mt-1">Complete information about this meeting</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Mark as Completed Button in Modal */}
                    {selectedMeeting.status === 'CONFIRMED' && (
                      <button
                        onClick={() => markAsCompleted(selectedMeeting.id)}
                        disabled={updatingMeeting === selectedMeeting.id}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingMeeting === selectedMeeting.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>Mark as Completed</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedMeeting(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-2"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Item Information with Large Image */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-purple-600" />
                        Item Details
                      </h4>
                      
                      {/* Large Item Image */}
                      <div className="mb-4">
                        <img
                          src={selectedMeeting.primaryImageUrl || '/api/placeholder/250/250'}
                          alt={selectedMeeting.gemName || 'Gem Image'}
                          className="w-full h-48 rounded-lg object-cover border-4 border-white shadow-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/250/250';
                          }}
                        />
                      </div>
                      
                      {/* Item Information */}
                      <div className="space-y-3">
                        <div>
                          <p className="font-bold text-xl text-gray-900">{selectedMeeting.gemName || 'Unknown Gem'}</p>
                          <p className="text-purple-700 font-medium">{selectedMeeting.gemType || 'Gemstone'}</p>
                        </div>
                        
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <p className="text-sm font-medium text-gray-600 mb-1">Final Price</p>
                          <p className="text-2xl font-bold text-green-600">
                            LKR {selectedMeeting.finalPrice ? selectedMeeting.finalPrice.toLocaleString() : '0'}
                          </p>
                          {selectedMeeting.commissionAmount && (
                            <p className="text-sm text-gray-500 mt-1">
                              Commission: LKR {selectedMeeting.commissionAmount.toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <p className="text-sm font-medium text-gray-600 mb-2">Status & IDs</p>
                          <div className="space-y-2">
                            <div>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                selectedMeeting.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                selectedMeeting.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                selectedMeeting.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                selectedMeeting.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {selectedMeeting.status || 'PENDING'}
                              </span>
                            </div>
                            <div className="text-xs space-y-1 text-gray-500">
                              <p>Meeting ID: <span className="font-mono">{selectedMeeting.id}</span></p>
                              <p>Purchase ID: <span className="font-mono">{selectedMeeting.purchaseId}</span></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Participants and Meeting Info */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      {/* Meeting Information */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                          Meeting Schedule & Location
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Date and Time */}
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Proposed Date & Time</p>
                                <div className="flex items-center text-gray-800">
                                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                  <span className="font-medium">
                                    {selectedMeeting.proposedDateTime ? 
                                      new Date(selectedMeeting.proposedDateTime).toLocaleDateString('en-GB', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      }) : 'TBD'
                                    }
                                  </span>
                                </div>
                                <div className="flex items-center text-gray-700 mt-1">
                                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                  <span>
                                    {selectedMeeting.proposedDateTime ? 
                                      new Date(selectedMeeting.proposedDateTime).toLocaleTimeString('en-GB', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }) : 'TBD'
                                    }
                                  </span>
                                </div>
                              </div>

                              {selectedMeeting.confirmedDateTime && (
                                <div className="pt-2 border-t border-green-200">
                                  <p className="text-sm font-medium text-green-700 mb-1">Confirmed Date & Time</p>
                                  <div className="flex items-center text-green-800">
                                    <Calendar className="w-4 h-4 mr-2 text-green-600" />
                                    <span className="font-medium">
                                      {new Date(selectedMeeting.confirmedDateTime).toLocaleDateString('en-GB', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-green-700 mt-1">
                                    <Clock className="w-4 h-4 mr-2 text-green-600" />
                                    <span>
                                      {new Date(selectedMeeting.confirmedDateTime).toLocaleTimeString('en-GB', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Location and Type */}
                          <div className="bg-white rounded-lg p-4 border border-blue-200">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Meeting Location</p>
                                <div className="flex items-start">
                                  <MapPin className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-800 font-medium">
                                    {selectedMeeting.location || 'Location TBD'}
                                  </span>
                                </div>
                              </div>
                              
                              <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Meeting Type</p>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                  {selectedMeeting.meetingType || 'GENERAL'}
                                </span>
                              </div>

                              {selectedMeeting.paymentStatus && (
                                <div>
                                  <p className="text-sm font-medium text-gray-600 mb-1">Payment Status</p>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedMeeting.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                    selectedMeeting.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {selectedMeeting.paymentStatus}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Participants Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Buyer Details */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-l-4 border-green-400">
                          <h4 className="font-bold text-green-800 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Buyer Information
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-lg font-bold text-gray-900">{selectedMeeting.buyerName || 'N/A'}</p>
                              <p className="text-xs text-gray-500 font-mono">{selectedMeeting.buyerId}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-700 break-all">{selectedMeeting.buyerEmail || 'N/A'}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{selectedMeeting.buyerPhone || 'N/A'}</span>
                              </div>
                            </div>

                            {selectedMeeting.buyerNotes && (
                              <div className="bg-white rounded-lg p-3 border border-green-200">
                                <p className="text-sm font-medium text-gray-600 mb-1">Buyer Notes</p>
                                <p className="text-sm text-gray-700">{selectedMeeting.buyerNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Seller Details */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-l-4 border-blue-400">
                          <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Seller Information
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-lg font-bold text-gray-900">{selectedMeeting.sellerName || 'N/A'}</p>
                              <p className="text-xs text-gray-500 font-mono">{selectedMeeting.sellerId}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-700 break-all">{selectedMeeting.sellerEmail || 'N/A'}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{selectedMeeting.sellerPhone || 'N/A'}</span>
                              </div>
                            </div>

                            {selectedMeeting.sellerNotes && (
                              <div className="bg-white rounded-lg p-3 border border-blue-200">
                                <p className="text-sm font-medium text-gray-600 mb-1">Seller Notes</p>
                                <p className="text-sm text-gray-700">{selectedMeeting.sellerNotes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Timeline Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">Created</p>
                            <p className="text-gray-800">{new Date(selectedMeeting.createdAt).toLocaleString('en-GB')}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Last Updated</p>
                            <p className="text-gray-800">{new Date(selectedMeeting.updatedAt).toLocaleString('en-GB')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMeetingDashboard;
