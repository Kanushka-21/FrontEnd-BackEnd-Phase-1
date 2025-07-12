import React from 'react';
import { Card, Input } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { AdminComponentProps } from './shared';

const ListingsManagement: React.FC<AdminComponentProps> = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Listings Management</h2>
        <Input.Search
          placeholder="Search listings..."
          style={{ width: 300 }}
          allowClear
        />
      </div>
      
      <Card>
        <div className="text-center py-12">
          <FileTextOutlined style={{ fontSize: '48px', color: '#ccc' }} />
          <h3 className="mt-4 text-lg font-medium">Listings Management</h3>
          <p className="text-gray-500">Manage and review gemstone listings</p>
          <p className="text-sm text-gray-400 mt-2">
            This section will contain listing approval, rejection, and management features
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ListingsManagement;
