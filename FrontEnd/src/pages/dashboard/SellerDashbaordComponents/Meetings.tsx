import React, { useState } from 'react';
import { Table, Button, Tag } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  mockMeetings, 
  MEETING_STATUS_COLORS,
  Meeting 
} from './shared';

interface MeetingsProps {
  user?: any;
}

const Meetings: React.FC<MeetingsProps> = ({ user }) => {
  const [meetings] = useState<Meeting[]>(mockMeetings);

  const columns = [
    {
      title: 'Gemstone',
      key: 'gemstone',
      render: (_: any, record: Meeting) => (
        <div className="flex items-center space-x-3">
          <img 
            src={record.image} 
            alt={record.gemstone}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <span className="font-medium">{record.gemstone}</span>
        </div>
      ),
    },
    {
      title: 'Buyer',
      dataIndex: 'buyer',
      key: 'buyer',
    },    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_: any, record: Meeting) => (
        <div>
          <div className="font-medium">{dayjs(record.date).format('MMM DD, YYYY')}</div>
          <div className="text-sm text-gray-500">{record.time}</div>
        </div>
      )
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={MEETING_STATUS_COLORS[status] || 'default'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button 
          size="small" 
          type="primary" 
          icon={<CalendarOutlined />}
        >
          Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Meetings</h2>
        <p className="text-gray-600">Your scheduled meetings with buyers</p>
      </div>

      {/* Meetings Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Scheduled Meetings</h3>
              <p className="text-gray-600 mt-1">All your upcoming and past meetings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Meetings Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <div className="p-0">
          <Table 
            dataSource={meetings}
            columns={columns}
            rowKey="id"
            responsive
            scroll={{ x: 'max-content' }}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} meetings`
            }}
            className="rounded-none"
            bordered={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Meetings;