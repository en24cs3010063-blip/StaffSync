import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/authSlice';

// Layouts & Protected Guards
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HRDashboard from './pages/HRDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EmployeeProfile from './pages/EmployeeProfile';
import AttendanceManagement from './pages/AttendanceManagement';
import LeaveManagement from './pages/LeaveManagement';
import AnnouncementsPage from './pages/AnnouncementsPage';
import TrainingManagement from './pages/TrainingManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchMe());
    }
  }, [dispatch, token]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Authenticated Dashboard Workspace */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* HR Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/hr" element={<HRDashboard />} />
              <Route path="/reports" element={<ReportsAnalytics />} />
            </Route>

            {/* Manager Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'manager']} />}>
              <Route path="/dashboard/manager" element={<ManagerDashboard />} />
              <Route path="/employees" element={<EmployeeDirectory />} />
            </Route>

            {/* Employee Dashboard */}
            <Route path="/dashboard/employee" element={<EmployeeDashboard />} />

            {/* Shared Modules */}
            <Route path="/profile" element={<EmployeeProfile />} />
            <Route path="/profile/:id" element={<EmployeeProfile />} />
            <Route path="/attendance" element={<AttendanceManagement />} />
            <Route path="/leaves" element={<LeaveManagement />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/training" element={<TrainingManagement />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 Catch All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
