// components/PrivateRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Spinner, Flex } from "@chakra-ui/react";
import useAuthStore from "../store/useAuthStore";
import axios from "../utils/axiosInstance";

const PrivateRoute = ({ children }) => {
  const { user, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        login(res.data); // only user object
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [login, logout]);

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return user ? children : <Navigate to="/staff-login" replace />;
};

export default PrivateRoute;
