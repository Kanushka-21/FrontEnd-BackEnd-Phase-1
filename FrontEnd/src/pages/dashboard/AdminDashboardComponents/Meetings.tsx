import React from 'react';
import { Card, Table, Button, Tag, Space, Input } from 'antd';
import { 
  EyeOutlined, CheckOutlined, CloseOutlined, CalendarOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  AdminComponentProps, 
  Meeting, 
  pendingMeetings, 
  ActionHandlers 
} from './shared';

interface MeetingsProps extends AdminComponentProps {
  actionHandlers: ActionHandlers;
}

const Meetings: React.FC<MeetingsProps> = ({ actionHandlers }) => {
  const { handleViewMeeting, handleApproveMeeting } = actionHandlers;

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
    },
    {
      title: 'Seller',
      dataIndex: 'seller',
      key: 'seller',
    },
    {
      title: 'Requested Date',
      key: 'datetime',
      render: (_: any, record: Meeting) => (
        <div>
          <div className="font-medium">
            {dayjs(record.requestedDate).format('MMM DD, YYYY')}
          </div>
          <div className="text-sm text-gray-500">
            {record.requestedTime}
          </div>
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
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          pending: 'gold',
          approved: 'green',
          rejected: 'red'
        };
        return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Meeting) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewMeeting(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                size="small" 
                icon={<CheckOutlined />} 
                type="primary" 
                onClick={() => handleApproveMeeting(record)}
              >
                Approve
              </Button>
              <Button 
                size="small" 
                icon={<CloseOutlined />} 
                danger
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Meeting Requests</h2>
        <Input.Search
          placeholder="Search meetings..."
          style={{ width: 300 }}
          allowClear
        />
      </div>

      {/* Pending Meetings Alert */}
      {pendingMeetings.length > 0 && (
        <Card className="bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarOutlined className="text-blue-600 mr-2" />
              <div>
                <h4 className="font-semibold text-blue-800">Pending Meeting Requests</h4>
                <p className="text-sm text-blue-700">
                  {pendingMeetings.length} meeting requests are waiting for your approval
                </p>
              </div>
            </div>
            <Button type="primary" size="small">
              Review All
            </Button>
          </div>
        </Card>
      )}

      {/* Meetings Table */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">All Meeting Requests</h3>
          <div className="flex space-x-2">
            <Button size="small" type="default">
              Export
            </Button>
            <Button size="small" type="default">
              Filter
            </Button>
          </div>
        </div>
        
        <Table 
          dataSource={pendingMeetings}
          columns={columns}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} meetings`
          }}
        />
      </Card>

      {/* Meeting Statistics */}
      <Card title="Meeting Statistics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {pendingMeetings.filter(m => m.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500">Pending Meetings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {pendingMeetings.filter(m => m.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-500">Approved This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pendingMeetings.length}
            </div>
            <div className="text-sm text-gray-500">Total Requests</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Meetings;
