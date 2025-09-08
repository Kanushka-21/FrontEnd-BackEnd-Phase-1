import React from 'react';
import AdminMeetingDashboard from '@/components/admin/AdminMeetingDashboard';
import { AdminComponentProps, ActionHandlers } from './shared';

interface MeetingsProps extends AdminComponentProps {
  actionHandlers: ActionHandlers;
}

const Meetings: React.FC<MeetingsProps> = ({ actionHandlers }) => {
  // Use the comprehensive AdminMeetingDashboard component
  return (
    <div className="w-full">
      <AdminMeetingDashboard className="w-full" />
    </div>
  );
};

export default Meetings;
