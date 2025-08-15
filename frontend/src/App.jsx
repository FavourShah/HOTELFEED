import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "./store/useAuthStore";
import axios from "./utils/axiosInstance";

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import GuestLoginPage from "./pages/GuestLoginPage";
import GuestReportPage from './pages/GuestReportPage';
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
  const login = useAuthStore((state) => state.login);

  // ✅ Check logged-in user from cookie when app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        login(res.data); // res.data should be the user object
      } catch (err) {
        console.log("No active session");
      }
    };
    checkAuth();
  }, [login]);

  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<HomePage />} />

      {/* Login routes */}
      <Route path="/staff-login" element={<LoginPage />} />
      <Route path="/guest-login" element={<GuestLoginPage />} />
      <Route path="/report" element={<GuestReportPage />} />

      {/* Department Dashboard */}
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

      {/* IT Dashboard */}
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

      {/* Supervisor Dashboard */}
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
