import React from 'react';
import MeetingManager from '../../MeetingManager';

interface MeetingsProps {
  user: any;
}

const Meetings: React.FC<MeetingsProps> = ({ user }) => {
  return <MeetingManager user={user} userType="buyer" />;
};

export default Meetings;
