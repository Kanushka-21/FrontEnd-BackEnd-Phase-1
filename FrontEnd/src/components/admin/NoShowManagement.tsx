import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  User,
  Search,
  Filter,
  Eye,
  Shield,
  AlertCircle
} from 'lucide-react';

interface NoShowRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  meetingId: string;
  meetingDisplayId?: string;
  noShowCount: number;
  totalMeetings: number;
  lastNoShowDate: string;
  absenceReason?: string;
  adminNotes?: string;
  adminVerified: boolean;
  status: 'ACTIVE' | 'WARNING' | 'BLOCKED';
  userType: 'BUYER' | 'SELLER';
  recentNoShows: Array<{
    meetingId: string;
    date: string;
    reason?: string;
    adminVerified: boolean;
  }>;
}

interface NoShowManagementProps {
  user: any;
}

const NoShowManagement: React.FC<NoShowManagementProps> = ({ user: _user }) => {
  const [noShowRecords, setNoShowRecords] = useState<NoShowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<NoShowRecord | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewData, setReviewData] = useState({
    approved: false,
    adminNotes: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Fetch no-show records
  useEffect(() => {
    fetchNoShowRecords();
  }, []);

  const fetchNoShowRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:9092/api/admin/no-show/records', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setNoShowRecords(data.records || []);
      } else {
        setMessage({ type: 'error', text: 'Failed to load no-show records' });
      }
    } catch (error) {
      console.error('Error fetching no-show records:', error);
      setMessage({ type: 'error', text: 'Error loading data. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Review absence reason
  const handleReviewReason = async (recordId: string, approved: boolean, adminNotes: string) => {
    try {
      const response = await fetch('http://localhost:9092/api/no-show/review-reason', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          recordId,
          approved,
          adminNotes
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchNoShowRecords();
        setShowReviewModal(false);
        setSelectedRecord(null);
        setReviewData({ approved: false, adminNotes: '' });
        setMessage({ 
          type: 'success', 
          text: approved ? 'Absence reason approved' : 'User action taken based on review'
        });
      } else {
        setMessage({ type: 'error', text: `Failed to review reason: ${data.message}` });
      }
    } catch (error) {
      console.error('Error reviewing reason:', error);
      setMessage({ type: 'error', text: 'Error processing review. Please try again.' });
    }
  };

  // Block/Unblock user
  const handleUserAction = async (userId: string, action: 'BLOCK' | 'UNBLOCK') => {
    try {
      const response = await fetch(`http://localhost:9092/api/admin/users/${userId}/${action.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        await fetchNoShowRecords();
        setMessage({ 
          type: 'success', 
          text: `User ${action.toLowerCase()}ed successfully`
        });
      } else {
        setMessage({ type: 'error', text: `Failed to ${action.toLowerCase()} user: ${data.message}` });
      }
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing user:`, error);
      setMessage({ type: 'error', text: `Error ${action.toLowerCase()}ing user. Please try again.` });
    }
  };

  // Filter records
  const filteredRecords = noShowRecords.filter(record => {
    const matchesFilter = filter === 'ALL' || record.status === filter;
    const matchesSearch = !searchTerm || 
      record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BLOCKED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'WARNING': return <AlertTriangle className="w-4 h-4" />;
      case 'BLOCKED': return <Ban className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading no-show management data...</p>
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
                <Shield className="w-8 h-8 text-red-600 mr-3" />
                No-Show Management
              </h1>
              <p className="text-gray-600 mt-1">Monitor and manage user attendance violations</p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{noShowRecords.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {noShowRecords.filter(r => r.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {noShowRecords.filter(r => r.status === 'WARNING').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Ban className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-2xl font-bold text-red-600">
                  {noShowRecords.filter(r => r.status === 'BLOCKED').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              {['ALL', 'ACTIVE', 'WARNING', 'BLOCKED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No-Show History
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Incident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No no-show records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="w-10 h-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{record.userName}</div>
                            <div className="text-sm text-gray-500">{record.userEmail}</div>
                            <div className="text-xs text-gray-400 uppercase">{record.userType}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium text-red-600">{record.noShowCount}</span> no-shows
                        </div>
                        <div className="text-sm text-gray-500">
                          out of {record.totalMeetings} meetings
                        </div>
                        <div className="text-xs text-gray-400">
                          Rate: {((record.noShowCount / record.totalMeetings) * 100).toFixed(1)}%
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          <span>{record.status}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(record.lastNoShowDate).toLocaleDateString()}
                        </div>
                        {record.absenceReason && (
                          <div className="text-xs text-blue-600 mt-1">
                            Reason provided
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {record.absenceReason && !record.adminVerified && (
                            <button
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowReviewModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-800 text-sm"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          
                          {record.status !== 'BLOCKED' && record.noShowCount >= 2 && (
                            <button
                              onClick={() => handleUserAction(record.userId, 'BLOCK')}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          
                          {record.status === 'BLOCKED' && (
                            <button
                              onClick={() => handleUserAction(record.userId, 'UNBLOCK')}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">No-Show Details</h3>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedRecord(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* User Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">User Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2">{selectedRecord.userName}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2">{selectedRecord.userType}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2">{selectedRecord.userEmail}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span className="ml-2">{selectedRecord.userPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recent No-Shows */}
                  <div className="bg-red-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Recent No-Show Incidents</h4>
                    <div className="space-y-3">
                      {selectedRecord.recentNoShows.map((incident, index) => (
                        <div key={index} className="bg-white rounded p-3 border border-red-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium">Meeting ID: {incident.meetingId}</div>
                              <div className="text-sm text-gray-600">{new Date(incident.date).toLocaleDateString()}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs ${
                              incident.adminVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {incident.adminVerified ? 'Verified' : 'Pending'}
                            </div>
                          </div>
                          {incident.reason && (
                            <div className="mt-2 text-sm text-gray-700">
                              <span className="font-medium">Reason:</span> {incident.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {selectedRecord.adminNotes && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Admin Notes</h4>
                      <p className="text-sm text-gray-700">{selectedRecord.adminNotes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedRecord(null);
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

        {/* Review Modal */}
        {showReviewModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Review Absence Reason</h3>
                  <button
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedRecord(null);
                      setReviewData({ approved: false, adminNotes: '' });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">User's Reason:</h4>
                    <p className="text-sm text-gray-700">{selectedRecord.absenceReason}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={reviewData.adminNotes}
                      onChange={(e) => setReviewData({ ...reviewData, adminNotes: e.target.value })}
                      placeholder="Add your review notes..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => handleReviewReason(selectedRecord.id, false, reviewData.adminNotes)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject & Block
                    </button>
                    <button
                      onClick={() => handleReviewReason(selectedRecord.id, true, reviewData.adminNotes)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Reason
                    </button>
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

export default NoShowManagement;
