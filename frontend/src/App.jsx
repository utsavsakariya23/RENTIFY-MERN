import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CarsPage from './pages/CarsPage';
import CarDetailsPage from './pages/CarDetailsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Protected Customer Pages
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import InvoicePage from './pages/InvoicePage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminCarsPage from './pages/AdminCarsPage';
import AdminCustomersPage from './pages/AdminCustomersPage';
import AdminRentRequestPage from './pages/AdminRentRequestPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminCouponsPage from './pages/AdminCouponsPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
import AdminReviewsPage from './pages/AdminReviewsPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminDocumentsPage from './pages/AdminDocumentsPage';
import AdminCityPointsPage from './pages/AdminCityPointsPage';
import AdminMaintenancePage from './pages/AdminMaintenancePage';
import AdminBusinessPage from './pages/AdminBusinessPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminLayout from './components/layout/AdminLayout';

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-light">
          <Navbar />
          <div className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/cars" element={<CarsPage />} />
              <Route path="/cars/:id" element={<CarDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Customer Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/invoice/:id" element={<InvoicePage />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                <Route path="/admin/cars" element={<AdminLayout><AdminCarsPage /></AdminLayout>} />
                <Route path="/admin/customers" element={<AdminLayout><AdminCustomersPage /></AdminLayout>} />
                <Route path="/admin/rent-requests" element={<AdminLayout><AdminRentRequestPage /></AdminLayout>} />
                <Route path="/admin/payments" element={<AdminLayout><AdminPaymentsPage /></AdminLayout>} />
                <Route path="/admin/coupons" element={<AdminLayout><AdminCouponsPage /></AdminLayout>} />
                <Route path="/admin/messages" element={<AdminLayout><AdminMessagesPage /></AdminLayout>} />
                <Route path="/admin/reviews" element={<AdminLayout><AdminReviewsPage /></AdminLayout>} />
                <Route path="/admin/analytics" element={<AdminLayout><AdminAnalyticsPage /></AdminLayout>} />
                <Route path="/admin/documents" element={<AdminLayout><AdminDocumentsPage /></AdminLayout>} />
                <Route path="/admin/profile" element={<AdminLayout><AdminProfilePage /></AdminLayout>} />
                <Route path="/admin/city-points" element={<AdminLayout><AdminCityPointsPage /></AdminLayout>} />
                <Route path="/admin/maintenance" element={<AdminLayout><AdminMaintenancePage /></AdminLayout>} />
                <Route path="/admin/business" element={<AdminLayout><AdminBusinessPage /></AdminLayout>} />
              </Route>

            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
