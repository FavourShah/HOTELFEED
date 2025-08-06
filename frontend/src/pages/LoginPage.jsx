import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Heading,
  Select,
  InputGroup,
  InputRightElement,
  Spinner,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import usePropertyStore from "../store/usePropertyStore";
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const { property, loading: propertyLoading, fetchProperty } = usePropertyStore();

  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for login
  const [isLoadingRoles, setIsLoadingRoles] = useState(true); // Loading state for roles

  useEffect(() => {
    // Fetch property data for branding
    fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
   const fetchRoles = async () => {
  try {
    setIsLoadingRoles(true);
    const res = await axios.get("/api/role");
    const staffRoles = res.data.filter((r) => r.name !== "guest");

    // ✅ Append Supervisor role manually
    const extendedRoles = [...staffRoles, { name: "supervisor", _id: "manual-supervisor" }];

    setRoles(extendedRoles);
  } catch (err) {
    console.error("Failed to fetch roles:", err);
  } finally {
    setIsLoadingRoles(false);
  }
};

    fetchRoles();
  }, []);

  // Get dynamic property name with fallback
  const getPropertyName = () => {
    if (propertyLoading) return "Loading...";
    return property?.name || "Staff Portal";
  };

  // Get property logo with fallback
  const getPropertyLogo = () => {
    return property?.logoUrl || null;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Start loading

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedUsername || !normalizedPassword || !role) {
      setIsLoading(false); // Stop loading on validation error
      return setError("All fields are required.");
    }

    try {
      const res = await axios.post("/api/auth/login", {
        username: normalizedUsername,
        password: normalizedPassword,
        role,
      });

      login(res.data, res.data.token);

      switch (res.data.role) {
        case "it":
          navigate("/dashboard/it");
          break;
           case "supervisor":
    navigate("/dashboard/supervisor");
    break;
        default:
          navigate("/dashboard/department");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box
        bg="white"
        w="100%"
        maxW="400px"
        p={8}
        borderRadius="xl"
        boxShadow="lg"
        border="1px solid #CBD5E0"
      >
        <VStack spacing={2} mb={4} align="center">
          {/* Dynamic Logo Display */}
          {getPropertyLogo() && (
            <Box 
              boxSize="60px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <img
                src={getPropertyLogo()}
                alt={`${getPropertyName()} Logo`}
                style={{ 
                  maxHeight: "60px", 
                  maxWidth: "100%",
                  objectFit: "contain"
                }}
                onError={(e) => {
                  // Hide logo if it fails to load
                  e.target.style.display = 'none';
                }}
              />
            </Box>
          )}
          
          {/* Dynamic Property Name */}
          {propertyLoading ? (
            <SkeletonText noOfLines={1} height="20px" width="200px" />
          ) : (
            <Text fontSize="lg" fontWeight="bold" color="black.700">
              {getPropertyName()}
            </Text>
          )}
        </VStack>

        <Heading mb={6} textAlign="center" fontSize="md" color="green.700">
          Staff Login
        </Heading>

        <form onSubmit={handleLogin}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Role</FormLabel>
              <Select
                placeholder={isLoadingRoles ? "Loading roles..." : "Select your role"}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                bg="gray.100"
                disabled={isLoadingRoles || isLoading}
              >
                {roles.map((r) => (
                  <option key={r._id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </Select>
              {isLoadingRoles && (
                <Box display="flex" alignItems="center" mt={2}>
                  <Spinner size="sm" mr={2} />
                  <Text fontSize="sm" color="gray.500">Loading roles...</Text>
                </Box>
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Username</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                bg="gray.100"
                disabled={isLoading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  bg="gray.100"
                  disabled={isLoading}
                />
                <InputRightElement width="3rem">
                  <Button
                    h="1.5rem"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    disabled={isLoading}
                  >
                    {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}

            <Button
              type="submit"
              colorScheme="green"
              width="full"
              mt={2}
              isLoading={isLoading}
              loadingText="Logging in..."
              disabled={isLoadingRoles}
            >
              Login
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default LoginPage;