import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Eye,
  Save,
  AlertCircle
} from 'lucide-react';

interface Meeting {
  id: string;
  meetingDisplayId?: string;
  gemName: string;
  gemType: string;
  gemCertificateNumber?: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone?: string;
  meetingDate: string;
  meetingTime: string;
  meetingLocation: string;
  status: string;
  buyerAttended?: boolean;
  sellerAttended?: boolean;
  adminVerified?: boolean;
  adminNotes?: string;
  buyerReasonSubmission?: {
    reason: string;
    submittedAt: string;
    adminReviewed: boolean;
    adminApproved?: boolean;
  };
  sellerReasonSubmission?: {
    reason: string;
    submittedAt: string;
    adminReviewed: boolean;
    adminApproved?: boolean;
  };
}

interface MeetingAttendanceManagementProps {
  user: any;
}

const MeetingAttendanceManagement: React.FC<MeetingAttendanceManagementProps> = ({ user }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState({
    buyerAttended: false,
    sellerAttended: false,
    adminNotes: ''
  });
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAttendanceAction, setPendingAttendanceAction] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchMeetings();
  }, [currentPage, searchTerm]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`http://localhost:9092/api/admin/no-show/meetings?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setMeetings(data.meetings || []);
        setTotalElements(data.totalElements || 0);
        setTotalPages(data.totalPages || 0);
        
        if (data.meetings?.length > 0) {
          setMessage({ type: 'success', text: `Loaded ${data.meetings.length} confirmed meetings from backend` });
        } else {
          setMessage({ type: 'info', text: 'No confirmed meetings found' });
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load meetings' });
        setMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      setMessage({ type: 'error', text: 'Failed to connect to backend. Please check if the server is running.' });
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    if (!selectedMeeting) return;

    // Check if any user is marked as not attended (no-show)
    const hasNoShow = !attendanceData.buyerAttended || !attendanceData.sellerAttended;
    
    if (hasNoShow) {
      // Show confirmation modal for no-show
      const noShowUsers = [];
      if (!attendanceData.buyerAttended) noShowUsers.push(selectedMeeting.buyerName + ' (Buyer)');
      if (!attendanceData.sellerAttended) noShowUsers.push(selectedMeeting.sellerName + ' (Seller)');
      
      setPendingAttendanceAction({
        meetingId: selectedMeeting.id,
        buyerAttended: attendanceData.buyerAttended,
        sellerAttended: attendanceData.sellerAttended,
        adminNotes: attendanceData.adminNotes,
        noShowUsers
      });
      setShowConfirmationModal(true);
      return;
    }

    // If everyone attended, proceed directly
    await submitAttendance();
  };

  const submitAttendance = async () => {
    if (!selectedMeeting && !pendingAttendanceAction) return;

    const data = pendingAttendanceAction || {
      meetingId: selectedMeeting.id,
      buyerAttended: attendanceData.buyerAttended,
      sellerAttended: attendanceData.sellerAttended,
      adminNotes: attendanceData.adminNotes
    };

    try {
      const response = await fetch('http://localhost:9092/api/admin/no-show/mark-attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          meetingId: data.meetingId,
          adminId: user?.id || 'admin',
          buyerAttended: data.buyerAttended,
          sellerAttended: data.sellerAttended,
          adminNotes: data.adminNotes
        })
      });

      const responseData = await response.json();
      if (responseData.success) {
        setMessage({ type: 'success', text: 'Attendance marked successfully! Notifications sent to users.' });
        setShowAttendanceModal(false);
        setShowConfirmationModal(false);
        setSelectedMeeting(null);
        setPendingAttendanceAction(null);
        setAttendanceData({ buyerAttended: false, sellerAttended: false, adminNotes: '' });
        await fetchMeetings(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: `Failed to mark attendance: ${responseData.message}` });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage({ type: 'error', text: 'Error marking attendance. Please try again.' });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset to first page when searching
  };

  const filteredMeetings = meetings.filter(meeting => 
    !searchTerm || 
    meeting.meetingDisplayId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.gemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceStatus = (meeting: Meeting) => {
    if (meeting.adminVerified) {
      if (meeting.buyerAttended && meeting.sellerAttended) {
        return { text: 'Both Attended', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
      } else if (!meeting.buyerAttended && !meeting.sellerAttended) {
        return { text: 'Both No-Show', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle };
      } else {
        return { text: 'Partial Attendance', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle };
      }
    }
    return { text: 'Pending Verification', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading confirmed meetings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                Meeting Attendance Management
              </h1>
              <p className="text-gray-600 mt-1">Mark attendance for confirmed meetings and manage no-shows</p>
            </div>
            <div className="text-sm text-gray-500">
              {totalElements} meeting{totalElements !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by Meeting ID, Gem Name, or User Name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {meetings.filter(m => m.adminVerified).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {meetings.filter(m => !m.adminVerified).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">No-Shows</p>
                <p className="text-2xl font-bold text-red-600">
                  {meetings.filter(m => m.adminVerified && (!m.buyerAttended || !m.sellerAttended)).length}
                </p>
              </div>
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
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMeetings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm ? `No meetings found for "${searchTerm}"` : 'No confirmed meetings found'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMeetings.map((meeting) => {
                    const status = getAttendanceStatus(meeting);
                    const StatusIcon = status.icon;
                    
                    return (
                      <tr key={meeting.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {meeting.meetingDisplayId || meeting.id.slice(0, 8)}
                            </div>
                            <div className="text-sm text-gray-600">{meeting.gemName}</div>
                            <div className="text-xs text-gray-400">{meeting.gemType}</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 font-medium">
                              Meeting Participants
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>👤 {meeting.buyerName} (Buyer)</div>
                              <div>🏪 {meeting.sellerName} (Seller)</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                              {new Date(meeting.meetingDate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              {meeting.meetingTime}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              {meeting.meetingLocation}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span>{status.text}</span>
                          </div>
                          {meeting.adminVerified && (
                            <div className="mt-2 space-y-1">
                              <div className="text-xs text-gray-600">
                                Buyer: {meeting.buyerAttended ? '✅ Attended' : '❌ No-show'}
                              </div>
                              <div className="text-xs text-gray-600">
                                Seller: {meeting.sellerAttended ? '✅ Attended' : '❌ No-show'}
                              </div>
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {!meeting.adminVerified ? (
                              <button
                                onClick={() => {
                                  setSelectedMeeting(meeting);
                                  setAttendanceData({
                                    buyerAttended: meeting.buyerAttended || false,
                                    sellerAttended: meeting.sellerAttended || false,
                                    adminNotes: meeting.adminNotes || ''
                                  });
                                  setShowAttendanceModal(true);
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Mark Attendance</span>
                              </button>
                            ) : (
                              <span className="text-xs text-green-600 font-medium">Verified</span>
                            )}
                            
                            <button
                              onClick={() => {
                                setSelectedMeeting(meeting);
                                setShowAttendanceModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Attendance Modal */}
        {showAttendanceModal && selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Mark Meeting Attendance</h3>
                  <button
                    onClick={() => {
                      setShowAttendanceModal(false);
                      setSelectedMeeting(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Meeting Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Meeting Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Meeting ID:</span>
                        <span className="ml-2">{selectedMeeting.meetingDisplayId || selectedMeeting.id.slice(0, 8)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Gem:</span>
                        <span className="ml-2">{selectedMeeting.gemName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date:</span>
                        <span className="ml-2">{new Date(selectedMeeting.meetingDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Time:</span>
                        <span className="ml-2">{selectedMeeting.meetingTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Marking */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Mark Attendance</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Buyer Attendance */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900">Buyer</h5>
                            <p className="text-sm text-gray-600">{selectedMeeting.buyerName}</p>
                            <p className="text-xs text-gray-500">{selectedMeeting.buyerEmail}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={attendanceData.buyerAttended}
                              onChange={(e) => setAttendanceData({
                                ...attendanceData,
                                buyerAttended: e.target.checked
                              })}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-green-700 font-medium">✅ Attended</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={!attendanceData.buyerAttended}
                              onChange={(e) => setAttendanceData({
                                ...attendanceData,
                                buyerAttended: !e.target.checked
                              })}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-red-700 font-medium">❌ Not Attended</span>
                          </label>
                        </div>
                      </div>

                      {/* Seller Attendance */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="mb-3">
                          <div>
                            <h5 className="font-medium text-gray-900">Seller</h5>
                            <p className="text-sm text-gray-600">{selectedMeeting.sellerName}</p>
                            <p className="text-xs text-gray-500">{selectedMeeting.sellerEmail}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={attendanceData.sellerAttended}
                              onChange={(e) => setAttendanceData({
                                ...attendanceData,
                                sellerAttended: e.target.checked
                              })}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-green-700 font-medium">✅ Attended</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={!attendanceData.sellerAttended}
                              onChange={(e) => setAttendanceData({
                                ...attendanceData,
                                sellerAttended: !e.target.checked
                              })}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-red-700 font-medium">❌ Not Attended</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        value={attendanceData.adminNotes}
                        onChange={(e) => setAttendanceData({
                          ...attendanceData,
                          adminNotes: e.target.value
                        })}
                        placeholder="Add any notes about the meeting attendance..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowAttendanceModal(false);
                        setSelectedMeeting(null);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={markAttendance}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Attendance</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for No-Shows */}
        {showConfirmationModal && pendingAttendanceAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-red-100 rounded-full p-3">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">
                  Confirm No-Show Action
                </h3>
                
                <div className="mb-6">
                  <p className="text-gray-700 text-center mb-4">
                    You are about to mark the following users as no-show:
                  </p>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <ul className="space-y-2">
                      {pendingAttendanceAction.noShowUsers.map((user: string, index: number) => (
                        <li key={index} className="flex items-center text-red-800">
                          <XCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">{user}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm text-gray-600 mt-4 text-center">
                    This action will:
                  </p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Send email notifications to no-show users</li>
                    <li>• Update their no-show count</li>
                    <li>• Apply warning or blocking status if applicable</li>
                    <li>• Cannot be undone once confirmed</li>
                  </ul>
                </div>

                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setShowConfirmationModal(false);
                      setPendingAttendanceAction(null);
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitAttendance}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Confirm No-Show</span>
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

export default MeetingAttendanceManagement;
