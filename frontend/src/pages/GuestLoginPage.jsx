import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  FormControl,
  FormLabel,
  Text,
  useToast,
  Select,
  InputGroup,
  InputRightElement,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import axios from '../utils/axiosInstance';
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import usePropertyStore from "../store/usePropertyStore";

const GuestLoginPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, token } = useAuthStore();

  const { property, loading: propertyLoading, fetchProperty } = usePropertyStore();

  const [roomNumber, setRoomNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stayDays, setStayDays] = useState("");
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch property data for branding
    fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/api/rooms");
        setRooms(res.data);
      } catch (err) {
        toast({
          title: "Failed to load rooms",
          status: "error",
          isClosable: true,
        });
      }
    };

    fetchRooms();
  }, []);

  // Get dynamic property name with fallback
  const getPropertyName = () => {
    if (propertyLoading) return "Loading...";
    return property?.name || "Hotel Guest Portal";
  };

  // Get property logo with fallback
  const getPropertyLogo = () => {
    return property?.logoUrl || null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!roomNumber || !password) {
      return setError("Room number and password are required.");
    }

    try {
      const res = await axios.post("/api/auth/guest-login", {
        roomNumber: Number(roomNumber),
        password: password.trim(),
        stayDays: stayDays ? Number(stayDays) : undefined,
      });

      login(res.data, res.data.token);
      navigate("/report");
    } catch (err) {
      console.log("Guest login error:", err);
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 403 && message?.includes("checked out")) {
        setError("You have already checked out. Please contact the front desk.");
      } else if (status === 401 && message?.includes("Incorrect")) {
        setError("Incorrect password. Please try again.");
      } else {
        setError(message || "Login failed. Please try again.");
      }
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.100"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box
        w="full"
        maxW="md"
        p={6}
        bg="white"
        boxShadow="lg"
        borderRadius="lg"
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

        <Heading size="lg" mb={6} textAlign="center">
          Guest Login
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Room Number</FormLabel>
              <Select
                placeholder="Select Room"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                bg="white"
              >
                {rooms.map((room) => (
                  <option key={room._id} value={room.roomNumber}>
                    Room {room.roomNumber} ({room.roomType || "N/A"})
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter room password"
                />
                <InputRightElement width="3rem">
                  <Button
                    h="1.5rem"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
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

            <Button colorScheme="green" type="submit" width="full">
              Login
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default GuestLoginPage;