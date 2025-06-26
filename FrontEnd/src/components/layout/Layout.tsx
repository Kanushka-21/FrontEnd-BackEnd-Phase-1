import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header - Using our consistent header component */}
      <Header transparent={false} />      {/* Main Content */}
      <main className="container-fluid px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}      <footer className="bg-white border-t border-secondary-200 mt-auto">
        <div className="container-fluid px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-secondary-500">
            <p>&copy; 2024 GemNet. All rights reserved.</p>
            <p className="mt-1">The Premier Destination for Authenticated Gemstones</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
