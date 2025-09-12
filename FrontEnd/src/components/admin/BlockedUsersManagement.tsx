import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    message,
    Statistic,
    Row,
    Col,
    Typography,
    Tag
} from 'antd';
import {
    StopOutlined,
    ReloadOutlined,
    UnlockOutlined,
    UserOutlined,
    SearchOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface BlockedUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    userRole: string;
    noShowCount: number;
    blockingReason: string;
    blockedAt: string;
    lastNoShowDate: string;
}

const BlockedUsersManagement: React.FC = () => {
    const { user } = useAuth();
    const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<BlockedUser | null>(null);
    const [unblockModalVisible, setUnblockModalVisible] = useState(false);
    const [statistics, setStatistics] = useState({
        totalBlocked: 0,
        blockedBuyers: 0,
        blockedSellers: 0
    });
    
    const [form] = Form.useForm();

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const fetchBlockedUsers = async () => {
        try {
            setLoading(true);

            const response = await fetch(`http://localhost:9092/api/admin/no-show/blocked-users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                const users = data.blockedUsers || [];
                setBlockedUsers(users);
                
                // Calculate statistics
                setStatistics({
                    totalBlocked: users.length,
                    blockedBuyers: users.filter((u: BlockedUser) => u.userRole === 'BUYER').length,
                    blockedSellers: users.filter((u: BlockedUser) => u.userRole === 'SELLER').length
                });
            } else {
                message.error(data.message || 'Failed to fetch blocked users');
            }
        } catch (err) {
            console.error('Error fetching blocked users:', err);
            message.error('Failed to fetch blocked users');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblockUser = async (values: { reason?: string }) => {
        if (!selectedUser || !user?.userId) return;

        try {
            setLoading(true);

            const response = await fetch(`http://localhost:9092/api/admin/no-show/unblock-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    adminId: user.userId,
                    reason: values.reason || 'No additional notes provided'
                }),
            });

            const data = await response.json();

            if (data.success) {
                const newNoShowCount = data.newNoShowCount !== undefined ? data.newNoShowCount : 'unknown';
                message.success(
                    `User ${selectedUser.firstName} ${selectedUser.lastName} has been successfully unblocked! 
                    No-show count reduced to ${newNoShowCount}.`,
                    5 // Display for 5 seconds
                );
                setUnblockModalVisible(false);
                setSelectedUser(null);
                form.resetFields();
                await fetchBlockedUsers(); // Refresh the list
            } else {
                message.error(data.message || 'Failed to unblock user');
            }
        } catch (err) {
            console.error('Error unblocking user:', err);
            message.error('Failed to unblock user');
        } finally {
            setLoading(false);
        }
    };

    const showUnblockModal = (user: BlockedUser) => {
        setSelectedUser(user);
        setUnblockModalVisible(true);
    };

    const handleCancel = () => {
        setUnblockModalVisible(false);
        setSelectedUser(null);
        form.resetFields();
    };

    // Filter blocked users based on search query
    const filteredUsers = blockedUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Table columns definition
    const columns = [
        {
            title: 'User',
            key: 'user',
            render: (record: BlockedUser) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>
                        {record.firstName} {record.lastName}
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                        {record.email}
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'userRole',
            key: 'userRole',
            render: (role: string) => (
                <Tag color={role === 'BUYER' ? 'blue' : 'orange'}>
                    {role}
                </Tag>
            ),
        },
        {
            title: 'No-Shows',
            dataIndex: 'noShowCount',
            key: 'noShowCount',
            render: (count: number) => (
                <Tag color="red">{count}</Tag>
            ),
        },
        {
            title: 'Blocking Reason',
            dataIndex: 'blockingReason',
            key: 'blockingReason',
            render: (reason: string) => (
                <Text ellipsis={{ tooltip: reason }} style={{ maxWidth: 200 }}>
                    {reason || 'No reason provided'}
                </Text>
            ),
        },
        {
            title: 'Blocked Date',
            dataIndex: 'blockedAt',
            key: 'blockedAt',
            render: (date: string) => (
                <div style={{ fontSize: '12px' }}>
                    {new Date(date).toLocaleString()}
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: BlockedUser) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<UnlockOutlined />}
                    onClick={() => showUnblockModal(record)}
                    loading={loading}
                >
                    Unblock
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2}>
                <StopOutlined style={{ marginRight: 8 }} />
                Blocked Users Management
            </Title>

            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Total Blocked Users"
                            value={statistics.totalBlocked}
                            prefix={<StopOutlined />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Blocked Buyers"
                            value={statistics.blockedBuyers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Blocked Sellers"
                            value={statistics.blockedSellers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Input
                        placeholder="Search blocked users by name or email"
                        prefix={<SearchOutlined />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: 300 }}
                    />
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchBlockedUsers}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        total: filteredUsers.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} blocked users`,
                    }}
                    locale={{
                        emptyText: (
                            <div style={{ textAlign: 'center', padding: '50px' }}>
                                <StopOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                                <div style={{ fontSize: '16px', color: '#999' }}>No Blocked Users</div>
                                <div style={{ fontSize: '14px', color: '#ccc' }}>
                                    Great! Currently no users are blocked due to no-show violations.
                                </div>
                            </div>
                        )
                    }}
                />
            </Card>

            {/* Unblock Modal */}
            <Modal
                title={
                    <div>
                        <UnlockOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                        Unblock User
                    </div>
                }
                open={unblockModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
            >
                {selectedUser && (
                    <div>
                        <div style={{ 
                            backgroundColor: '#f5f5f5', 
                            padding: '16px', 
                            borderRadius: '6px', 
                            marginBottom: '16px' 
                        }}>
                            <Title level={4} style={{ margin: 0, marginBottom: '12px' }}>
                                User Information
                            </Title>
                            <Row gutter={[16, 8]}>
                                <Col span={8}><Text strong>Name:</Text></Col>
                                <Col span={16}>{selectedUser.firstName} {selectedUser.lastName}</Col>
                                
                                <Col span={8}><Text strong>Email:</Text></Col>
                                <Col span={16}>{selectedUser.email}</Col>
                                
                                <Col span={8}><Text strong>Role:</Text></Col>
                                <Col span={16}>
                                    <Tag color={selectedUser.userRole === 'BUYER' ? 'blue' : 'orange'}>
                                        {selectedUser.userRole}
                                    </Tag>
                                </Col>
                                
                                <Col span={8}><Text strong>No-Shows:</Text></Col>
                                <Col span={16}>
                                    <Tag color="red">{selectedUser.noShowCount}</Tag>
                                </Col>
                                
                                <Col span={8}><Text strong>Blocked Reason:</Text></Col>
                                <Col span={16}>
                                    <Text type="danger">{selectedUser.blockingReason}</Text>
                                </Col>
                                
                                <Col span={8}><Text strong>Blocked Date:</Text></Col>
                                <Col span={16}>
                                    <Text type="secondary">
                                        {new Date(selectedUser.blockedAt).toLocaleString()}
                                    </Text>
                                </Col>
                            </Row>
                        </div>

                        <Form form={form} onFinish={handleUnblockUser} layout="vertical">
                            <Form.Item
                                name="reason"
                                label="Admin Note (Optional)"
                            >
                                <TextArea
                                    placeholder="Enter reason for unblocking this user (optional)..."
                                    rows={3}
                                />
                            </Form.Item>

                            <div style={{ 
                                backgroundColor: '#fff7e6', 
                                border: '1px solid #ffd666', 
                                borderRadius: '6px', 
                                padding: '12px', 
                                marginBottom: '16px' 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                                    <Text strong>Confirm Unblock Action</Text>
                                </div>
                                <Text type="secondary">
                                    This will restore the user's account to ACTIVE status and allow them to access the system normally.
                                </Text>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <Button onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    loading={loading}
                                    icon={<UnlockOutlined />}
                                    danger
                                >
                                    Unblock User
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default BlockedUsersManagement;
