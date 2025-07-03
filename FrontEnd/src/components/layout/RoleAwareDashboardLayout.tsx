import React from 'react';
import RoleAwareHeader from './RoleAwareHeader';

interface RoleAwareDashboardLayoutProps {
  children: React.ReactNode;
}

const RoleAwareDashboardLayout: React.FC<RoleAwareDashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary-50 flex flex-col">
      {/* Role-aware header */}
      <RoleAwareHeader />
      
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default RoleAwareDashboardLayout;
