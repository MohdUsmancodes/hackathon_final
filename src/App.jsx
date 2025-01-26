import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './Admin/context/AdminAuthContext';
import { ProtectedAdminRoute } from './Admin/components/ProtectedAdminRoute';
import { ProtectedUserRoute } from './User/components/ProtectedUserRoute';
import { AdminLayout } from './Admin/components/AdminLayout';
import { UserLayout } from './User/components/UserLayout';
import { DepartmentLayout } from './DepartmentManager/components/DepartmentLayout';

// Admin Pages
import { AdminLogin } from './Admin/pages/AdminLogin';
import { AdminDashboard } from './Admin/pages/AdminDashboard';
import { ServiceManagement } from './Admin/components/ServiceManagement';
import { ServiceDetails as AdminServiceDetails } from './Admin/pages/ServiceDetails';

// User Pages
import { Login } from './User/pages/Login';
import { Signup } from './User/pages/Signup';
import { UserDashboard } from './User/pages/UserDashboard';
import { Profile } from './User/pages/Profile';
import { Services } from './User/pages/Services';
import { ServiceDetails } from './User/pages/ServiceDetails';

// Department Manager Pages
import { BookingList } from './DepartmentManager/pages/BookingList';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AdminAuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="services" element={<ServiceManagement />} />
                    <Route path="services/:id" element={<AdminServiceDetails />} />
                  </Routes>
                </AdminLayout>
              </ProtectedAdminRoute>
            } />

            {/* Department Manager Routes */}
            <Route path="/department/*" element={
              <DepartmentLayout>
                <Routes>
                  <Route path="bookings" element={<BookingList />} />
                </Routes>
              </DepartmentLayout>
            } />

            {/* User Routes */}
            <Route path="/user/*" element={
              <ProtectedUserRoute>
                <UserLayout>
                  <Routes>
                    <Route path="dashboard" element={<UserDashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="services" element={<Services />} />
                    <Route path="services/:id" element={<ServiceDetails />} />
                  </Routes>
                </UserLayout>
              </ProtectedUserRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </AdminAuthProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
