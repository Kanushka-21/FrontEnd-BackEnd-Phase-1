import React, { useState } from 'react';
import AdminMeetingDashboard from '@/components/admin/AdminMeetingDashboard';
import NoShowManagement from '@/components/admin/NoShowManagement';
import { AdminComponentProps, ActionHandlers } from './shared';

interface MeetingsProps extends AdminComponentProps {
  actionHandlers: ActionHandlers;
}

const Meetings: React.FC<MeetingsProps> = ({ actionHandlers }) => {
  const [activeTab, setActiveTab] = useState('meetings');

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('meetings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'meetings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meeting Management
            </button>
            <button
              onClick={() => setActiveTab('noshow')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'noshow'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              No-Show Management
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'meetings' ? (
          <AdminMeetingDashboard className="w-full" />
        ) : (
          <NoShowManagement user={null} />
        )}
      </div>
    </div>
  );
};

export default Meetings;
