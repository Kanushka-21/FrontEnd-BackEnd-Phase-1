import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import HomePage from '@/pages/HomePage';
import MarketplacePage from '@/pages/MarketplacePage';

// Dashboard Pages
import AdminDashboard from '@/pages/dashboard/AdminDashboard.responsive';
import SellerDashboard from '@/pages/dashboard/SellerDashboard.new';
import BuyerDashboard from '@/pages/dashboard/BuyerDashboard.simplified';

// Layout
import Layout from '@/components/layout/Layout';
import DashboardLayout from '@/components/layout/DashboardLayout.new';

// Auth Context
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// AppRoutes component to separate routes from auth provider
const AppRoutes: React.FC = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register/*"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />          {/* Protected Routes - Dashboard Redirect */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navigate to="/buyer/dashboard" replace />
              </ProtectedRoute>
            }
          />
          
          {/* Buyer Protected Routes */}          <Route
            path="/buyer/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BuyerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Buyer Protected Routes */}
          <Route
            path="/my-bids"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>My Bids Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meetings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>My Meetings Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />          {/* Seller Protected Routes */}          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SellerDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/add-listing"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>Add Listing Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/my-listings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>My Listings Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/my-store"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>My Store Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />          {/* Admin Protected Routes */}          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>User Management Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transactions"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>Transactions Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/meetings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div>Meeting Management Page - Coming Soon</div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />{/* New Routes */}
          <Route path="/" element={<HomePage />} />          <Route
            path="/marketplace"
            element={<MarketplacePage />}
          />
          
          {/* Default Route - Changed to Home */}
          <Route path="/old-home" element={<Navigate to="/" replace />} />
          
          {/* 404 Route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-secondary-900 mb-4">404</h1>
                  <p className="text-secondary-600 mb-4">Page not found</p>
                  <a
                    href="/login"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    Go back to login
                  </a>
                </div>
              </div>
            }
          />        </Routes>
      </div>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
        }}
      />
    </Router>
  );
};

export default App;
