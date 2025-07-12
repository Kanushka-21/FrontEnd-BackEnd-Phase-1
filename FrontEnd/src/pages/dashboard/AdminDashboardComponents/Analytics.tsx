import React from 'react';
import { Card } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { AdminComponentProps } from './shared';

const Analytics: React.FC<AdminComponentProps> = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics & Reports</h2>
      
      <Card>
        <div className="text-center py-12">
          <BarChartOutlined style={{ fontSize: '48px', color: '#ccc' }} />
          <h3 className="mt-4 text-lg font-medium">Analytics Dashboard</h3>
          <p className="text-gray-500">View detailed analytics and generate reports</p>
          <p className="text-sm text-gray-400 mt-2">
            This section will contain charts, graphs, and detailed analytics about platform performance
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
