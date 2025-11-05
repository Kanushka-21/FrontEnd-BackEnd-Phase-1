import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  Search,
  Filter,
  Download
} from 'lucide-react';

interface MeetingDetails {
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
  primaryImageUrl: string;
  proposedDateTime: string;
  confirmedDateTime?: string;
  location: string;
  meetingType: string;
  status: string;
  buyerNotes?: string;
  sellerNotes?: string;
  buyerContact?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  sellerContact?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface MeetingManagementDashboardProps {
  user: any;
}

const MeetingManagementDashboard: React.FC<MeetingManagementDashboardProps> = ({ user }) => {
  const [meetings, setMeetings] = useState<MeetingDetails[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<MeetingDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });

  // Fetch all meetings for admin
  useEffect(() => {
    fetchAllMeetings();
  }, []);

  // Filter meetings when search or status filter changes
  useEffect(() => {
    filterMeetings();
  }, [meetings, statusFilter, searchTerm]);

  const fetchAllMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:9092/api/meetings/admin/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const data = await response.json();
      console.log('📥 Admin meetings data:', data);
      
      if (data.success) {
        const meetingsData = data.meetings || [];
        setMeetings(meetingsData);
        
        // Calculate statistics
        const newStats = {
          total: meetingsData.length,
          pending: meetingsData.filter((m: MeetingDetails) => m.status === 'PENDING').length,
          confirmed: meetingsData.filter((m: MeetingDetails) => m.status === 'CONFIRMED').length,
          completed: meetingsData.filter((m: MeetingDetails) => m.status === 'COMPLETED').length,
          cancelled: meetingsData.filter((m: MeetingDetails) => m.status === 'CANCELLED').length
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('❌ Error fetching admin meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMeetings = () => {
    let filtered = meetings;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(meeting => meeting.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(meeting => 
        meeting.buyerName?.toLowerCase().includes(searchLower) ||
        meeting.sellerName?.toLowerCase().includes(searchLower) ||
        meeting.gemName?.toLowerCase().includes(searchLower) ||
        meeting.location?.toLowerCase().includes(searchLower) ||
        meeting.buyerEmail?.toLowerCase().includes(searchLower) ||
        meeting.sellerEmail?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredMeetings(filtered);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'RESCHEDULED': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    if (!dateString) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  // Export meetings to CSV
  const exportToCSV = () => {
    const csvContent = [
      // Headers
      ['Meeting ID', 'Buyer Name', 'Buyer Email', 'Buyer Phone', 'Seller Name', 'Seller Email', 'Seller Phone', 
       'Gem Name', 'Gem Type', 'Final Price', 'Proposed Date', 'Confirmed Date', 'Location', 'Status', 'Created Date']
        .join(','),
      // Data rows
      ...filteredMeetings.map(meeting => [
        meeting.id,
        meeting.buyerName || 'N/A',
        meeting.buyerEmail || 'N/A',
        meeting.buyerPhone || 'N/A',
        meeting.sellerName || 'N/A',
        meeting.sellerEmail || 'N/A',
        meeting.sellerPhone || 'N/A',
        meeting.gemName || 'N/A',
        meeting.gemType || 'N/A',
        meeting.finalPrice || 0,
        meeting.proposedDateTime || 'N/A',
        meeting.confirmedDateTime || 'N/A',
        meeting.location || 'N/A',
        meeting.status || 'N/A',
        meeting.createdAt || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `meetings_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meeting Management Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor and manage all meeting requests and transactions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={fetchAllMeetings}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <AlertCircle className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                  <span className="ml-2 text-xs">
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

        {/* Meetings Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meeting Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Buyer Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seller Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMeetings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No meetings found matching your criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredMeetings.map((meeting) => {
                    const proposedDateTime = formatDateTime(meeting.proposedDateTime);
                    const confirmedDateTime = formatDateTime(meeting.confirmedDateTime || '');
                    
                    return (
                      <tr key={meeting.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={meeting.primaryImageUrl || '/api/placeholder/60/60'}
                              alt={meeting.gemName}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                            />
                            <div>
                              <p className="font-medium text-gray-900">{meeting.gemName}</p>
                              <p className="text-sm text-gray-500">{meeting.gemType}</p>
                              <p className="text-sm font-medium text-green-600">
                                {formatCurrency(meeting.finalPrice)}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                            <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Buyer Information
                            </h5>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <span className="font-medium text-gray-900">{meeting.buyerName || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="truncate max-w-[160px]">{meeting.buyerEmail || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                <span>{meeting.buyerPhone || 'N/A'}</span>
                              </div>
                              {meeting.buyerId && (
                                <div className="text-xs text-gray-500">
                                  ID: {meeting.buyerId.substring(0, 8)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                            <h5 className="font-semibold text-blue-800 mb-2 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Seller Information
                            </h5>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <span className="font-medium text-gray-900">{meeting.sellerName || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="truncate max-w-[160px]">{meeting.sellerEmail || 'N/A'}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                <span>{meeting.sellerPhone || 'N/A'}</span>
                              </div>
                              {meeting.sellerId && (
                                <div className="text-xs text-gray-500">
                                  ID: {meeting.sellerId.substring(0, 8)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="text-sm">
                              <p className="font-medium">Proposed:</p>
                              <div className="flex items-center text-gray-600">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>{proposedDateTime.date}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{proposedDateTime.time}</span>
                              </div>
                            </div>
                            
                            {meeting.confirmedDateTime && (
                              <div className="text-sm">
                                <p className="font-medium text-green-600">Confirmed:</p>
                                <div className="flex items-center text-gray-600">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  <span>{confirmedDateTime.date}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>{confirmedDateTime.time}</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{meeting.location}</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                            {meeting.status}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedMeeting(meeting);
                              setShowDetailsModal(true);
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Meeting Details Modal */}
        {showDetailsModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Meeting Details</h3>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedMeeting(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Gem Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Gem Information</h4>
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={selectedMeeting.primaryImageUrl || '/api/placeholder/80/80'}
                        alt={selectedMeeting.gemName}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-lg">{selectedMeeting.gemName}</p>
                        <p className="text-gray-600">{selectedMeeting.gemType}</p>
                        <p className="text-green-600 font-semibold">
                          {formatCurrency(selectedMeeting.finalPrice)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Meeting Status */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Meeting Status</h4>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedMeeting.status)}`}>
                      {selectedMeeting.status}
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p>Created: {formatDateTime(selectedMeeting.createdAt).date}</p>
                      <p>Updated: {formatDateTime(selectedMeeting.updatedAt).date}</p>
                    </div>
                  </div>

                  {/* Buyer Details */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Buyer Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">{selectedMeeting.buyerName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{selectedMeeting.buyerEmail || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{selectedMeeting.buyerPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seller Details */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Seller Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium">{selectedMeeting.sellerName || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{selectedMeeting.sellerEmail || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{selectedMeeting.sellerPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meeting Schedule */}
                <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Meeting Schedule</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Proposed Time:</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDateTime(selectedMeeting.proposedDateTime).date}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{formatDateTime(selectedMeeting.proposedDateTime).time}</span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedMeeting.confirmedDateTime && (
                      <div>
                        <p className="text-sm font-medium text-green-700">Confirmed Time:</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{formatDateTime(selectedMeeting.confirmedDateTime).date}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{formatDateTime(selectedMeeting.confirmedDateTime).time}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{selectedMeeting.location}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {(selectedMeeting.buyerNotes || selectedMeeting.sellerNotes) && (
                  <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Notes</h4>
                    {selectedMeeting.buyerNotes && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-blue-700">Buyer Notes:</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedMeeting.buyerNotes}</p>
                      </div>
                    )}
                    {selectedMeeting.sellerNotes && (
                      <div>
                        <p className="text-sm font-medium text-green-700">Seller Notes:</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedMeeting.sellerNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedMeeting(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingManagementDashboard;
