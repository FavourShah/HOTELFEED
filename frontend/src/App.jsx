import { Routes, Route } from "react-router-dom";

import HomePage from './pages/HomePage'; // ✅ Landing page for guest or staff choice
import LoginPage from './pages/LoginPage'; // ✅ Staff/IT/Supervisor login
import GuestLoginPage from "./pages/GuestLoginPage"; // ✅ Guest login form
import GuestReportPage from './pages/GuestReportPage'; // ✅ Guest dashboard after login

import DepartmentDashboard from './pages/DepartmentDashboard';
import ITDashboard from './pages/ITDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';

import GuestManagement from './components/GuestManagement';
import StaffManagement from './components/StaffManagement';
import RoleManagement from "./components/roleManagement";
import Rooms from './components/Rooms';
import DepartmentManagement from "./components/DepartmentManagement";
import AllIssues from "./components/AllIssues";
import ITWelcome from "./components/ITWelcome";
import DepartmentWelcome from "./components/DepartmentWelcome";
import PropertySettings from "./pages/PropertySettings";

import StaffIssueForm from './components/StaffForm';
import MyReportedIssues from './components/MyReportedIssues';
import DepartmentIssues from './components/DepartmentalIssues';

import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Routes>
      {/* ✅ Landing page */}
      <Route path="/" element={<HomePage />} />

      {/* ✅ Login routes */}
      <Route path="/staff-login" element={<LoginPage />} />
      <Route path="/guest-login" element={<GuestLoginPage />} />
      <Route path="/report" element={<GuestReportPage />} />

      {/* ✅ Department Dashboard */}
      <Route
        path="/dashboard/department"
        element={
          <PrivateRoute>
            <DepartmentDashboard />
          </PrivateRoute>
        }
      >
        <Route index element={<DepartmentWelcome />} />
        <Route path="report-issue" element={<StaffIssueForm />} />
        <Route path="my-issues" element={<MyReportedIssues />} />
        <Route path="department-issues" element={<DepartmentIssues />} />
        <Route path="all-issues" element={<AllIssues />} />
        <Route path="guest-management" element={<GuestManagement />} />
      </Route>

      {/* ✅ IT Dashboard */}
      <Route
        path="/dashboard/it"
        element={
          <PrivateRoute>
            <ITDashboard />
          </PrivateRoute>
        }
      >
        <Route index element={<ITWelcome />} />
        <Route path="guests" element={<GuestManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="role" element={<RoleManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="issues" element={<AllIssues />} />
        <Route path="report-issue" element={<StaffIssueForm />} />
        <Route path="my-issues" element={<MyReportedIssues />} />
        <Route path="department-issues" element={<DepartmentIssues />} />
        <Route path="property-settings" element={<PropertySettings />} />
      </Route>

      {/* ✅ Supervisor Dashboard */}
      <Route
        path="/dashboard/supervisor"
        element={
          <PrivateRoute>
            <SupervisorDashboard />
          </PrivateRoute>
        }
      >
        <Route index element={<h2>Welcome, Supervisor</h2>} />
        <Route path="guests" element={<GuestManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="role" element={<RoleManagement />} />
        <Route path="departments" element={<DepartmentManagement />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="issues" element={<AllIssues />} />
        <Route path="report-issue" element={<StaffIssueForm />} />
        <Route path="my-issues" element={<MyReportedIssues />} />
        <Route path="department-issues" element={<DepartmentIssues />} />
        <Route path="property-settings" element={<PropertySettings />} />
      </Route>
    </Routes>
  );
}

export default App;
