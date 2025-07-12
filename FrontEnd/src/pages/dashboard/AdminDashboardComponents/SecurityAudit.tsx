import React from 'react';
import { Card } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';
import { AdminComponentProps } from './shared';

const SecurityAudit: React.FC<AdminComponentProps> = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Security & Audit</h2>
      
      <Card>
        <div className="text-center py-12">
          <SafetyOutlined style={{ fontSize: '48px', color: '#ccc' }} />
          <h3 className="mt-4 text-lg font-medium">Security Management</h3>
          <p className="text-gray-500">Monitor security events and audit logs</p>
          <p className="text-sm text-gray-400 mt-2">
            This section will contain security monitoring, audit trails, and security configurations
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SecurityAudit;
