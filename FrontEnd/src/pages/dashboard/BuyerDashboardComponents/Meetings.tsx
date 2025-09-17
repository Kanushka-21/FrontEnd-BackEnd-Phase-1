import React from 'react';
import MeetingManager from '../../../components/scheduling/MeetingManager';

interface MeetingsProps {
  user?: any;
}

const Meetings: React.FC<MeetingsProps> = ({ user }) => {
  return <MeetingManager user={user} userType="buyer" />;
};

export default Meetings;
