import React from 'react';
import { Card, Row, Col, Table, Input, Statistic, Tag } from 'antd';
import { 
  DollarOutlined, MoneyCollectOutlined, BarChartOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  AdminComponentProps, 
  Transaction, 
  recentTransactions, 
  formatLKR, 
  generateStats 
} from './shared';

const Transactions: React.FC<AdminComponentProps> = () => {
  const stats = generateStats();

  const columns = [
    {
      title: 'Gemstone',
      key: 'gemstone',
      render: (_: any, record: Transaction) => (
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
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <span className="font-semibold">{formatLKR(amount)}</span>
      )
    },
    {
      title: 'Commission',
      dataIndex: 'commission',
      key: 'commission',
      render: (commission: number) => (
        <span className="font-semibold text-green-600">{formatLKR(commission)}</span>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors: Record<string, string> = {
          completed: 'green',
          pending: 'gold',
          cancelled: 'red'
        };
        return <Tag color={statusColors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <Input.Search
          placeholder="Search transactions..."
          style={{ width: 300 }}
          allowClear
        />
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Total Revenue" 
              value={stats.totalRevenue}
              formatter={(value) => formatLKR(Number(value))}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Total Commission" 
              value={stats.totalCommission}
              formatter={(value) => formatLKR(Number(value))}
              prefix={<MoneyCollectOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic 
              title="Commission Rate" 
              value={stats.commissionRate}
              suffix="%"
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Revenue Overview */}
      <Card title="Revenue Overview" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatLKR(stats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-500">Total Platform Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatLKR(stats.totalCommission)}
            </div>
            <div className="text-sm text-gray-500">Platform Commission</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatLKR(stats.totalRevenue - stats.totalCommission)}
            </div>
            <div className="text-sm text-gray-500">Seller Revenue</div>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
              Export
            </button>
            <button className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100">
              Filter
            </button>
          </div>
        </div>
        
        <Table 
          dataSource={recentTransactions}
          columns={columns}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} transactions`
          }}
        />
      </Card>
    </div>
  );
};

export default Transactions;
