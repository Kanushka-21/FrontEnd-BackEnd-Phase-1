import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Phone, Mail, MessageSquare, CheckCircle, XCircle, AlertCircle, Edit, Archive, AlertTriangle, FileText, Ban, Search } from 'lucide-react';

interface Meeting {
  id: string;
  purchaseId: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  sellerName: string;
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
  // No-show management fields
  buyerAttended?: boolean;
  sellerAttended?: boolean;
  buyerAbsenceReason?: string;
  sellerAbsenceReason?: string;
  adminVerified?: boolean;
  adminNotes?: string;
  buyerNoShowCount?: number;
  sellerNoShowCount?: number;
  meetingDisplayId?: string;
}

interface MeetingManagerProps {
  user: any;
  userType?: 'buyer' | 'seller';
}

const MeetingManager: React.FC<MeetingManagerProps> = ({ user, userType = 'buyer' }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    newDateTime: '',
    notes: ''
  });
  const [confirmData, setConfirmData] = useState({
    sellerNotes: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // No-show management state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showAbsenceReasonModal, setShowAbsenceReasonModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    attended: false,
    reason: ''
  });
  const [absenceReason, setAbsenceReason] = useState('');

  // Fetch meetings
  useEffect(() => {
    fetchMeetings();
  }, [user]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const userId = user.userId || user.id;
      const response = await fetch(`http://localhost:9092/api/meetings/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter meetings
  const filteredMeetings = meetings.filter(meeting => {
    // First filter by status
    const statusMatch = filter === 'ALL' || meeting.status === filter;
    
    // Then filter by search query (meeting ID)
    const searchMatch = !searchQuery || 
      meeting.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.meetingId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && searchMatch;
  });

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
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
    }).format(amount);
  };

  // Get proper image URL
  const getImageUrl = (imageUrl?: string, gemName?: string) => {
    if (imageUrl) {
      // If it's already a full URL, return as is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      // If it's a relative path, prepend the backend URL
      if (imageUrl.startsWith('/uploads/') || imageUrl.startsWith('uploads/')) {
        return `http://localhost:9092/${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}`;
      }
      // If it's just a filename, assume it's in gem-images
      return `http://localhost:9092/uploads/gem-images/${imageUrl}`;
    }
    
    // Fallback images based on gem type
    const gemType = gemName?.toLowerCase() || '';
    if (gemType.includes('ruby')) {
      return 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=300&h=200&fit=crop';
    } else if (gemType.includes('sapphire')) {
      return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop';
    } else if (gemType.includes('emerald')) {
      return 'https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=300&h=200&fit=crop';
    } else {
      return 'https://images.unsplash.com/photo-1506792006437-256b665541e2?w=300&h=200&fit=crop';
    }
  };

  // Check if user is seller for this meeting
  const isUserSeller = (meeting: Meeting) => {
    return meeting.sellerId === (user.userId || user.id);
  };

  // Handle confirm meeting
  const handleConfirmMeeting = async () => {
    if (!selectedMeeting) return;

    // Immediate UI feedback - close modal and show loading
    setShowConfirmModal(false);
    setSelectedMeeting(null);
    setMessage({ type: 'info', text: 'Confirming meeting...' });

    try {
      const sellerId = user.userId || user.id;
      console.log('🔄 Confirming meeting with seller ID:', sellerId);
      
      const response = await fetch(`http://localhost:9092/api/meetings/${selectedMeeting.id}/confirm`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId: sellerId,
          sellerNotes: confirmData.sellerNotes
        })
      });

      const data = await response.json();
      console.log('📤 Meeting confirmation response:', data);
      
      if (data.success) {
        console.log('✅ Meeting confirmed successfully');
        setMessage({ type: 'success', text: 'Meeting confirmed successfully! The buyer has been notified.' });
        setConfirmData({ sellerNotes: '' });
        
        // Refresh data in background
        await fetchMeetings();
      } else {
        console.error('❌ Failed to confirm meeting:', data.message);
        setMessage({ type: 'error', text: `Failed to confirm meeting: ${data.message}` });
      }
    } catch (error) {
      console.error('❌ Error confirming meeting:', error);
      setMessage({ type: 'error', text: 'Error confirming meeting. Please try again.' });
    }
  };

  // Handle reschedule meeting
  const handleRescheduleMeeting = async () => {
    if (!selectedMeeting || !rescheduleData.newDateTime) return;

    try {
      const userId = user.userId || user.id;
      console.log('🔄 Rescheduling meeting with user ID:', userId);
      
      const response = await fetch(`http://localhost:9092/api/meetings/${selectedMeeting.id}/reschedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          newDateTime: rescheduleData.newDateTime,
          notes: rescheduleData.notes
        })
      });

      const data = await response.json();
      console.log('📤 Meeting reschedule response:', data);
      
      if (data.success) {
        console.log('✅ Meeting rescheduled successfully');
        await fetchMeetings();
        setShowRescheduleModal(false);
        setSelectedMeeting(null);
        setRescheduleData({ newDateTime: '', notes: '' });
        
        // Show success message
        setMessage({ type: 'success', text: 'Meeting rescheduled successfully! The other party has been notified.' });
      } else {
        console.error('❌ Failed to reschedule meeting:', data.message);
        setMessage({ type: 'error', text: `Failed to reschedule meeting: ${data.message}` });
      }
    } catch (error) {
      console.error('❌ Error rescheduling meeting:', error);
      setMessage({ type: 'error', text: 'Error rescheduling meeting. Please try again.' });
    }
  };

  // Handle cancel meeting
  const handleCancelMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to cancel this meeting?')) return;

    try {
      const userId = user.userId || user.id;
      const response = await fetch(`http://localhost:9092/api/meetings/${meetingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          reason: 'Cancelled by user'
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchMeetings();
        setMessage({ type: 'success', text: 'Meeting cancelled successfully!' });
      } else {
        setMessage({ type: 'error', text: `Failed to cancel meeting: ${data.message}` });
      }
    } catch (error) {
      console.error('Error cancelling meeting:', error);
      setMessage({ type: 'error', text: 'Error cancelling meeting. Please try again.' });
    }
  };

  // Handle attendance marking
  const handleMarkAttendance = async (meetingId: string, attended: boolean, reason?: string) => {
    // Immediate UI feedback - close modal instantly
    setShowAttendanceModal(false);
    setSelectedMeeting(null);
    setAttendanceData({ attended: true, reason: '' });
    
    // Show immediate feedback message
    setMessage({ 
      type: 'info', 
      text: attended ? 'Marking attendance...' : 'Reporting no-show...' 
    });

    try {
      const userId = user.userId || user.id;
      const response = await fetch(`http://localhost:9092/api/no-show/mark-attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId,
          userId,
          userType,
          attended,
          reason
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update success message
        setMessage({ 
          type: 'success', 
          text: attended ? 'Attendance marked successfully!' : 'No-show reported successfully!' 
        });
        
        // Refresh data in background
        await fetchMeetings();
      } else {
        setMessage({ type: 'error', text: `Failed to mark attendance: ${data.message}` });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage({ type: 'error', text: 'Error marking attendance. Please try again.' });
    }
  };

  // Handle absence reason submission
  const handleSubmitAbsenceReason = async (meetingId: string, reason: string) => {
    try {
      const userId = user.userId || user.id;
      const response = await fetch(`http://localhost:9092/api/no-show/submit-reason`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId,
          userId,
          userType,
          reason
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchMeetings();
        setShowAbsenceReasonModal(false);
        setSelectedMeeting(null);
        setAbsenceReason('');
        setMessage({ type: 'success', text: 'Absence reason submitted successfully!' });
      } else {
        setMessage({ type: 'error', text: `Failed to submit reason: ${data.message}` });
      }
    } catch (error) {
      console.error('Error submitting absence reason:', error);
      setMessage({ type: 'error', text: 'Error submitting reason. Please try again.' });
    }
  };

  // Handle complete meeting
  const handleCompleteMeeting = async (meetingId: string) => {
    if (!confirm('Mark this meeting as completed?')) return;

    try {
      const userId = user.userId || user.id;
      const response = await fetch(`http://localhost:9092/api/meetings/${meetingId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchMeetings();
        // Use proper UI message instead of browser alert
        setMessage({ type: 'success', text: 'Meeting marked as completed!' });
      } else {
        setMessage({ type: 'error', text: `Failed to complete meeting: ${data.message}` });
      }
    } catch (error) {
      console.error('Error completing meeting:', error);
      setMessage({ type: 'error', text: 'Error completing meeting. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading meetings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Meeting Management</h1>
            <div className="text-sm text-gray-500">
              {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Meeting ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 overflow-x-auto">
            {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status}
                <span className="ml-2 text-xs">
                  ({meetings.filter(m => status === 'ALL' || m.status === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Meetings List */}
        {filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-500">
              {filter === 'ALL' 
                ? "You don't have any meetings yet."
                : `No meetings with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMeetings.map((meeting) => {
              const isSeller = isUserSeller(meeting);
              const datetime = formatDateTime(meeting.confirmedDateTime || meeting.proposedDateTime);
              const contact = isSeller ? meeting.buyerContact : meeting.sellerContact;
              
              return (
                <div key={meeting.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={getImageUrl(meeting.primaryImageUrl, meeting.gemName)}
                        alt={meeting.gemName}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getImageUrl(undefined, meeting.gemName);
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{meeting.gemName}</h3>
                        <p className="text-sm text-gray-600">{meeting.gemType}</p>
                        <p className="text-lg font-bold text-green-600 mt-1">
                          {formatCurrency(meeting.finalPrice)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-sm text-gray-500">
                            {isSeller ? 'Buyer:' : 'Seller:'}
                          </span>
                          <span className="text-sm font-medium">
                            {isSeller ? meeting.buyerName : meeting.sellerName}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                      {meeting.status}
                    </div>
                  </div>

                  {/* Meeting Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{datetime.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{datetime.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{meeting.location}</span>
                    </div>
                  </div>

                  {/* Contact Information (only shown for confirmed meetings) */}
                  {meeting.status === 'CONFIRMED' && contact && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{contact.fullName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{contact.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {(meeting.buyerNotes || meeting.sellerNotes) && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                      {meeting.buyerNotes && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Buyer: </span>
                          <span className="text-sm text-gray-600">{meeting.buyerNotes}</span>
                        </div>
                      )}
                      {meeting.sellerNotes && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Seller: </span>
                          <span className="text-sm text-gray-600">{meeting.sellerNotes}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-2">
                    {meeting.status === 'PENDING' && isSeller && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setShowConfirmModal(true);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Confirm</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setShowRescheduleModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Reschedule</span>
                        </button>
                      </>
                    )}

                    {meeting.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCompleteMeeting(meeting.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <Archive className="w-4 h-4" />
                        <span>Mark Complete</span>
                      </button>
                    )}

                    {/* No-Show Management Buttons */}
                    {meeting.status === 'CONFIRMED' && new Date(meeting.confirmedDateTime || meeting.proposedDateTime) <= new Date() && (
                      <>
                        {/* Mark Attendance Button */}
                        <button
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setShowAttendanceModal(true);
                            setAttendanceData({ attended: true, reason: '' });
                          }}
                          className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Attended</span>
                        </button>
                        
                        {/* Mark No-Show Button */}
                        <button
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setShowAttendanceModal(true);
                            setAttendanceData({ attended: false, reason: '' });
                          }}
                          className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm flex items-center space-x-1"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>No-Show</span>
                        </button>
                      </>
                    )}

                    {/* Submit Absence Reason Button */}
                    {meeting.status === 'CONFIRMED' && 
                     ((userType === 'buyer' && meeting.buyerAttended === false && !meeting.buyerAbsenceReason) ||
                      (userType === 'seller' && meeting.sellerAttended === false && !meeting.sellerAbsenceReason)) && (
                      <button
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setShowAbsenceReasonModal(true);
                        }}
                        className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Submit Reason</span>
                      </button>
                    )}

                    {/* Show No-Show Status */}
                    {meeting.status === 'CONFIRMED' && (meeting.buyerAttended !== undefined || meeting.sellerAttended !== undefined) && (
                      <div className="text-xs text-gray-600">
                        {userType === 'buyer' && meeting.buyerAttended !== undefined && (
                          <span className={`px-2 py-1 rounded ${meeting.buyerAttended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {meeting.buyerAttended ? 'You Attended' : 'You No-Show'}
                          </span>
                        )}
                        {userType === 'seller' && meeting.sellerAttended !== undefined && (
                          <span className={`px-2 py-1 rounded ${meeting.sellerAttended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {meeting.sellerAttended ? 'You Attended' : 'You No-Show'}
                          </span>
                        )}
                      </div>
                    )}

                    {['PENDING', 'CONFIRMED'].includes(meeting.status) && (
                      <button
                        onClick={() => handleCancelMeeting(meeting.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirm Meeting Modal */}
        {showConfirmModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Meeting</h3>
              <p className="text-sm text-gray-600 mb-4">
                Confirm the meeting with {selectedMeeting.buyerName} for {selectedMeeting.gemName}?
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={confirmData.sellerNotes}
                  onChange={(e) => setConfirmData({ sellerNotes: e.target.value })}
                  placeholder="Any additional information for the buyer..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedMeeting(null);
                    setConfirmData({ sellerNotes: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmMeeting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm Meeting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Meeting Modal */}
        {showRescheduleModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reschedule Meeting</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={rescheduleData.newDateTime}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, newDateTime: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rescheduling
                </label>
                <textarea
                  value={rescheduleData.notes}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, notes: e.target.value })}
                  placeholder="Please explain why you need to reschedule..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setSelectedMeeting(null);
                    setRescheduleData({ newDateTime: '', notes: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRescheduleMeeting}
                  disabled={!rescheduleData.newDateTime}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Modal */}
        {showAttendanceModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {attendanceData.attended ? 'Confirm Attendance' : 'Report No-Show'}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {attendanceData.attended 
                  ? `Confirm that you attended the meeting with ${userType === 'buyer' ? selectedMeeting.sellerName : selectedMeeting.buyerName}.`
                  : `Report that the other party (${userType === 'buyer' ? selectedMeeting.sellerName : selectedMeeting.buyerName}) did not attend the meeting.`
                }
              </p>

              {!attendanceData.attended && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for No-Show (Optional)
                  </label>
                  <textarea
                    value={attendanceData.reason}
                    onChange={(e) => setAttendanceData({ ...attendanceData, reason: e.target.value })}
                    placeholder="Please describe what happened..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAttendanceModal(false);
                    setSelectedMeeting(null);
                    setAttendanceData({ attended: false, reason: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleMarkAttendance(selectedMeeting.id, attendanceData.attended, attendanceData.reason)}
                  className={`px-4 py-2 text-white rounded-md ${
                    attendanceData.attended 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {attendanceData.attended ? 'Confirm Attendance' : 'Report No-Show'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Absence Reason Modal */}
        {showAbsenceReasonModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Absence Reason</h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for your absence. This will be reviewed by the admin.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Absence <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={absenceReason}
                  onChange={(e) => setAbsenceReason(e.target.value)}
                  placeholder="Please explain why you couldn't attend the meeting..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important:</p>
                    <p>This reason will be reviewed by an admin. Providing a valid reason may help avoid penalties.</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAbsenceReasonModal(false);
                    setSelectedMeeting(null);
                    setAbsenceReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitAbsenceReason(selectedMeeting.id, absenceReason)}
                  disabled={!absenceReason.trim()}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  Submit Reason
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingManager;
