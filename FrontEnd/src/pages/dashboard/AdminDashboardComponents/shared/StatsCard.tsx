import React from 'react';
import { Card, Progress } from 'antd';
import { StatsCardProps } from './types';

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  description,
  trend 
}) => {
  return (
    <Card 
      className="transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
      bordered={false}
      style={{ 
        background: `linear-gradient(135deg, ${color}11 0%, ${color}22 100%)`, 
        borderTop: `4px solid ${color}` 
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className="w-12 h-12 flex items-center justify-center rounded-full" 
             style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
      
      {description && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{description}</span>
            {trend && (
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatsCard;
