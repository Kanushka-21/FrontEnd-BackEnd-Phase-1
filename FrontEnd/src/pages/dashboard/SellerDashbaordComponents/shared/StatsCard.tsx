import React from 'react';
import { Card } from 'antd';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  gradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle, 
  gradient 
}) => {
  return (
    <Card 
      className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
      bordered={false}
      style={{ 
        background: gradient, 
        borderTop: `4px solid ${color}` 
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div 
          className="w-12 h-12 flex items-center justify-center rounded-full" 
          style={{ backgroundColor: `${color}11` }}
        >
          <div style={{ color, fontSize: '24px' }}>
            {icon}
          </div>
        </div>
      </div>
      {subtitle && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs" style={{ color }}>
            {subtitle}
          </p>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;