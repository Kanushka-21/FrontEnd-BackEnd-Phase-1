import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  iconBgColor: string;
  textColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  iconBgColor,
  textColor
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className={`text-xs mt-2 ${textColor}`}>{change}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
