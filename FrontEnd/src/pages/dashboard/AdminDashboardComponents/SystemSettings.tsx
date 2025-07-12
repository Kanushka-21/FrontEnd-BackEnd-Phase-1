import React from 'react';
import { Card } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { AdminComponentProps } from './shared';

const SystemSettings: React.FC<AdminComponentProps> = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Settings</h2>
      
      <Card>
        <div className="text-center py-12">
          <SettingOutlined style={{ fontSize: '48px', color: '#ccc' }} />
          <h3 className="mt-4 text-lg font-medium">System Configuration</h3>
          <p className="text-gray-500">Manage system settings and configurations</p>
          <p className="text-sm text-gray-400 mt-2">
            This section will contain platform settings, configuration options, and system preferences
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SystemSettings;
