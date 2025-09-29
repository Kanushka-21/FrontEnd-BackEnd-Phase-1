import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  message,
  Alert,
  Badge,
  Typography,
  Tabs,
  Row,
  Col,
  Statistic,
  Timeline,
  Tooltip,
  Divider
} from 'antd';
import {
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  EditOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { api } from '../../../services/api';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface Meeting {
  id: string;
  meetingDisplayId: string;
  gemName: string;
  buyerId: string;
  sellerId: string;
  buyerName?: string;
  sellerName?: string;
  confirmedDateTime: string;
  location: string;
  status: string;
  buyerAttended?: boolean;
  sellerAttended?: boolean;
  adminVerified: boolean;
  buyerReasonSubmission?: string;
  sellerReasonSubmission?: string;
  buyerReasonAccepted?: boolean;
  sellerReasonAccepted?: boolean;
  adminNotes?: string;
  createdAt: string;
  remindersSent: number;
  lastReminderSent?: string;
}

interface UserStats {
  noShowCount: number;
  accountStatus: string;
  lastNoShowDate?: string;
  totalMeetings: number;
  completedMeetings: number;
  upcomingMeetings: number;
}

const MeetingReminderSystem: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [reasonForm] = Form.useForm();

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    if (userId) {
      fetchUserMeetings();
      fetchUserStats();
    }
  }, [userId]);

  const fetchUserMeetings = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/meetings/user/${userId}`);
      if (response.data.success) {
        setMeetings(response.data.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      message.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get(`/meetings/user/${userId}/stats`);
      if (response.data.success) {
        setUserStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const submitAbsenceReason = async (values: any) => {
    try {
      const response = await api.post(`/meetings/${selectedMeeting?.id}/submit-absence-reason`, {
        userId,
        reason: values.reason,
        additionalInfo: values.additionalInfo
      });

      if (response.data.success) {
        message.success('Absence reason submitted successfully');
        setReasonModalVisible(false);
        reasonForm.resetFields();
        fetchUserMeetings();
      } else {
        message.error(response.data.message || 'Failed to submit reason');
      }
    } catch (error) {
      console.error('Error submitting reason:', error);
      message.error('Failed to submit reason');
    }
  };

  const downloadMeetingInfo = async (meetingId: string) => {
    try {
      const response = await api.get(`/meetings/${meetingId}/download-info`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meeting-${selectedMeeting?.meetingDisplayId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Meeting information downloaded');
    } catch (error) {
      console.error('Error downloading meeting info:', error);
      message.error('Failed to download meeting information');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'green';
      case 'CONFIRMED': return 'blue';
      case 'NO_SHOW_RECORDED': return 'red';
      case 'PENDING': return 'orange';
      default: return 'default';
    }
  };

  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'WARNED': return 'orange';
      case 'BLOCKED': return 'red';
      default: return 'default';
    }
  };

  const isUpcomingMeeting = (dateTime: string) => {
    return new Date(dateTime) > new Date();
  };

  const getTimeUntilMeeting = (dateTime: string) => {
    const now = new Date();
    const meetingTime = new Date(dateTime);
    const diffMs = meetingTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Past';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays} day(s)`;
    if (diffHours > 0) return `${diffHours} hour(s)`;
    return 'Soon';
  };

  const canSubmitReason = (meeting: Meeting) => {
    const isUserInMeeting = meeting.buyerId === userId || meeting.sellerId === userId;
    const isNoShow = meeting.status === 'NO_SHOW_RECORDED';
    const hasAttendanceMarked = meeting.adminVerified && 
      ((meeting.buyerId === userId && meeting.buyerAttended === false) ||
       (meeting.sellerId === userId && meeting.sellerAttended === false));
    
    const alreadySubmitted = 
      (meeting.buyerId === userId && meeting.buyerReasonSubmission) ||
      (meeting.sellerId === userId && meeting.sellerReasonSubmission);
    
    return isUserInMeeting && (isNoShow || hasAttendanceMarked) && !alreadySubmitted;
  };

  const upcomingMeetings = meetings.filter(m => 
    isUpcomingMeeting(m.confirmedDateTime) && m.status === 'CONFIRMED'
  );

  const pastMeetings = meetings.filter(m => 
    !isUpcomingMeeting(m.confirmedDateTime) || m.status !== 'CONFIRMED'
  );

  const meetingColumns = [
    {
      title: 'Meeting ID',
      dataIndex: 'meetingDisplayId',
      key: 'meetingDisplayId',
      render: (id: string) => <Text code>{id}</Text>,
    },
    {
      title: 'Gemstone',
      dataIndex: 'gemName',
      key: 'gemName',
    },
    {
      title: 'Other Party',
      key: 'otherParty',
      render: (record: Meeting) => {
        const isIBuyer = record.buyerId === userId;
        return isIBuyer ? record.sellerName || 'Seller' : record.buyerName || 'Buyer';
      },
    },
    {
      title: 'Date & Time',
      dataIndex: 'confirmedDateTime',
      key: 'confirmedDateTime',
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString()}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {new Date(date).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Time Until',
      key: 'timeUntil',
      render: (record: Meeting) => {
        const timeUntil = getTimeUntilMeeting(record.confirmedDateTime);
        const isUrgent = timeUntil.includes('hour') || timeUntil === 'Soon';
        
        return (
          <Text type={isUrgent ? 'danger' : 'secondary'}>
            {timeUntil}
          </Text>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Meeting) => (
        <Space>
          <Button
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => {
              setSelectedMeeting(record);
              setDetailModalVisible(true);
            }}
          >
            Details
          </Button>
          {canSubmitReason(record) && (
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedMeeting(record);
                setReasonModalVisible(true);
              }}
            >
              Submit Reason
            </Button>
          )}
          {record.status === 'CONFIRMED' && (
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => downloadMeetingInfo(record.id)}
            >
              Download Info
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <ClockCircleOutlined style={{ marginRight: 8 }} />
        My Meetings & Reminders
      </Title>

      {/* User Status Alert */}
      {userStats && userStats.accountStatus !== 'ACTIVE' && (
        <Alert
          message={`Account Status: ${userStats.accountStatus}`}
          description={
            userStats.accountStatus === 'WARNED' 
              ? `You have ${userStats.noShowCount} missed meeting(s). Please attend your scheduled meetings to avoid account suspension.`
              : userStats.accountStatus === 'BLOCKED'
              ? 'Your account has been blocked due to multiple missed meetings. Please contact admin.'
              : ''
          }
          type={userStats.accountStatus === 'WARNED' ? 'warning' : 'error'}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Statistics */}
      {userStats && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Meetings"
                value={userStats.totalMeetings}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Completed"
                value={userStats.completedMeetings}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Upcoming"
                value={userStats.upcomingMeetings}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Missed Meetings"
                value={userStats.noShowCount}
                prefix={<WarningOutlined />}
                valueStyle={{ color: userStats.noShowCount > 0 ? '#f5222d' : '#52c41a' }}
              />
              <Tag 
                color={getAccountStatusColor(userStats.accountStatus)} 
                style={{ marginTop: 8 }}
              >
                {userStats.accountStatus}
              </Tag>
            </Card>
          </Col>
        </Row>
      )}

      <Tabs defaultActiveKey="upcoming">
        <TabPane 
          tab={
            <span>
              <ClockCircleOutlined />
              Upcoming Meetings 
              <Badge count={upcomingMeetings.length} showZero style={{ marginLeft: 8 }} />
            </span>
          } 
          key="upcoming"
        >
          <Card>
            {upcomingMeetings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <CalendarOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                <Title level={4} type="secondary">No Upcoming Meetings</Title>
                <Text type="secondary">You don't have any confirmed meetings scheduled.</Text>
              </div>
            ) : (
              <Table
                columns={meetingColumns}
                dataSource={upcomingMeetings}
                rowKey="id"
                loading={loading}
                pagination={false}
                rowClassName={(record) => {
                  const timeUntil = getTimeUntilMeeting(record.confirmedDateTime);
                  return timeUntil.includes('hour') || timeUntil === 'Soon' ? 'urgent-meeting' : '';
                }}
              />
            )}
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <CheckCircleOutlined />
              Past Meetings
            </span>
          } 
          key="past"
        >
          <Card>
            <Table
              columns={[
                ...meetingColumns.filter(col => col.key !== 'timeUntil'),
                {
                  title: 'Your Attendance',
                  key: 'attendance',
                  render: (record: Meeting) => {
                    if (!record.adminVerified) {
                      return <Tag color="orange">Pending Verification</Tag>;
                    }
                    
                    const isIBuyer = record.buyerId === userId;
                    const myAttendance = isIBuyer ? record.buyerAttended : record.sellerAttended;
                    const myReason = isIBuyer ? record.buyerReasonSubmission : record.sellerReasonSubmission;
                    const reasonAccepted = isIBuyer ? record.buyerReasonAccepted : record.sellerReasonAccepted;
                    
                    if (myAttendance === true) {
                      return <Tag color="green">Attended</Tag>;
                    } else if (myAttendance === false) {
                      if (myReason) {
                        return (
                          <div>
                            <Tag color="red">No Show</Tag>
                            <div style={{ fontSize: '12px', marginTop: 4 }}>
                              Reason: 
                              <Tag color={reasonAccepted === true ? 'green' : reasonAccepted === false ? 'red' : 'orange'}>
                                {reasonAccepted === true ? 'Accepted' : reasonAccepted === false ? 'Rejected' : 'Under Review'}
                              </Tag>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div>
                            <Tag color="red">No Show</Tag>
                            {canSubmitReason(record) && (
                              <div style={{ fontSize: '12px', marginTop: 4 }}>
                                <Button 
                                  size="small" 
                                  type="link" 
                                  style={{ padding: 0 }}
                                  onClick={() => {
                                    setSelectedMeeting(record);
                                    setReasonModalVisible(true);
                                  }}
                                >
                                  Submit Reason
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      }
                    }
                    
                    return <Tag>Unknown</Tag>;
                  },
                },
              ]}
              dataSource={pastMeetings}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Meeting Detail Modal */}
      <Modal
        title={`Meeting Details - ${selectedMeeting?.meetingDisplayId}`}
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          selectedMeeting?.status === 'CONFIRMED' && (
            <Button 
              key="download" 
              type="primary" 
              icon={<FileTextOutlined />}
              onClick={() => downloadMeetingInfo(selectedMeeting.id)}
            >
              Download Info
            </Button>
          ),
        ]}
        width={700}
      >
        {selectedMeeting && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small" title="Meeting Information">
                  <p><strong>Gemstone:</strong> {selectedMeeting.gemName}</p>
                  <p><strong>Date & Time:</strong> {new Date(selectedMeeting.confirmedDateTime).toLocaleString()}</p>
                  <p><strong>Location:</strong> <EnvironmentOutlined /> {selectedMeeting.location}</p>
                  <p><strong>Status:</strong> 
                    <Tag color={getStatusColor(selectedMeeting.status)} style={{ marginLeft: 8 }}>
                      {selectedMeeting.status.replace('_', ' ')}
                    </Tag>
                  </p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Reminder Information">
                  <p><strong>Reminders Sent:</strong> {selectedMeeting.remindersSent || 0}</p>
                  {selectedMeeting.lastReminderSent && (
                    <p><strong>Last Reminder:</strong> {new Date(selectedMeeting.lastReminderSent).toLocaleString()}</p>
                  )}
                  <p><strong>Time Until Meeting:</strong> {getTimeUntilMeeting(selectedMeeting.confirmedDateTime)}</p>
                </Card>
              </Col>
            </Row>

            {selectedMeeting.adminVerified && (
              <div style={{ marginTop: 16 }}>
                <Divider />
                <Title level={5}>Attendance Record</Title>
                <Timeline>
                  <Timeline.Item 
                    color={selectedMeeting.buyerAttended === true ? 'green' : selectedMeeting.buyerAttended === false ? 'red' : 'blue'}
                    dot={selectedMeeting.buyerAttended === true ? <CheckCircleOutlined /> : selectedMeeting.buyerAttended === false ? <ExclamationCircleOutlined /> : <ClockCircleOutlined />}
                  >
                    <div>
                      <Text strong>Buyer: </Text>
                      {selectedMeeting.buyerAttended === true ? 'Attended' : selectedMeeting.buyerAttended === false ? 'No Show' : 'Not Verified'}
                      {selectedMeeting.buyerReasonSubmission && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">Reason: {selectedMeeting.buyerReasonSubmission}</Text>
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                  <Timeline.Item 
                    color={selectedMeeting.sellerAttended === true ? 'green' : selectedMeeting.sellerAttended === false ? 'red' : 'blue'}
                    dot={selectedMeeting.sellerAttended === true ? <CheckCircleOutlined /> : selectedMeeting.sellerAttended === false ? <ExclamationCircleOutlined /> : <ClockCircleOutlined />}
                  >
                    <div>
                      <Text strong>Seller: </Text>
                      {selectedMeeting.sellerAttended === true ? 'Attended' : selectedMeeting.sellerAttended === false ? 'No Show' : 'Not Verified'}
                      {selectedMeeting.sellerReasonSubmission && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">Reason: {selectedMeeting.sellerReasonSubmission}</Text>
                        </div>
                      )}
                    </div>
                  </Timeline.Item>
                </Timeline>

                {selectedMeeting.adminNotes && (
                  <Alert
                    message="Admin Notes"
                    description={selectedMeeting.adminNotes}
                    type="info"
                    style={{ marginTop: 16 }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Submit Reason Modal */}
      <Modal
        title="Submit Absence Reason"
        visible={reasonModalVisible}
        onCancel={() => setReasonModalVisible(false)}
        onOk={() => reasonForm.submit()}
      >
        <Form
          form={reasonForm}
          layout="vertical"
          onFinish={submitAbsenceReason}
        >
          <Alert
            message="Important"
            description="Submitting a valid reason for your absence may help avoid missed meeting penalties. Please provide accurate and detailed information."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="Reason for Absence"
            name="reason"
            rules={[{ required: true, message: 'Please provide a reason for your absence' }]}
          >
            <Input.Select placeholder="Select a reason">
              <Input.Select.Option value="medical_emergency">Medical Emergency</Input.Select.Option>
              <Input.Select.Option value="family_emergency">Family Emergency</Input.Select.Option>
              <Input.Select.Option value="transportation_issue">Transportation Issue</Input.Select.Option>
              <Input.Select.Option value="weather_conditions">Weather Conditions</Input.Select.Option>
              <Input.Select.Option value="work_conflict">Work Conflict</Input.Select.Option>
              <Input.Select.Option value="technical_issue">Technical Issue</Input.Select.Option>
              <Input.Select.Option value="other">Other</Input.Select.Option>
            </Input.Select>
          </Form.Item>

          <Form.Item
            label="Additional Information"
            name="additionalInfo"
            rules={[{ required: true, message: 'Please provide additional details' }]}
          >
            <TextArea
              rows={4}
              placeholder="Please provide detailed explanation of your absence. Include any supporting information that may help verify your reason."
            />
          </Form.Item>

          <Alert
            message="Note"
            description="Your reason will be reviewed by an administrator. Please ensure all information is accurate as false information may result in additional penalties."
            type="warning"
            showIcon
          />
        </Form>
      </Modal>

      <style jsx>{`
        .urgent-meeting {
          background-color: #fff7e6;
          border-left: 4px solid #fa8c16;
        }
      `}</style>
    </div>
  );
};

export default MeetingReminderSystem;
