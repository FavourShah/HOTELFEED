// DepartmentDashboard.jsx - Mobile Responsive Fix with Auto-Close Navigation
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Collapse,
  Divider,
  Badge,
  Avatar,
  Text,
  useColorModeValue,
  Card,
  CardBody,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";
import usePropertyStore from "../store/usePropertyStore";
import React, { useState, useEffect } from "react";

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { property, loading: propertyLoading, fetchProperty } = usePropertyStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showIssueLinks, setShowIssueLinks] = useState(true);

  // Responsive values
  const mainPadding = useBreakpointValue({ base: 2, md: 6 });
  const cardPadding = useBreakpointValue({ base: 2, md: 4 });
  const headerPadding = useBreakpointValue({ base: 4, md: 6 });

  useEffect(() => {
    if (token) {
      fetchProperty(token);
    }
  }, [token, fetchProperty]);

  const role = user?.role?.toLowerCase();
  const canViewAllIssues = ['front office manager', 'duty manager', 'general manager'].includes(role);
  const canManageGuests = role === 'front office manager';

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to login
  };

  // Enhanced navigation handler that closes drawer on mobile
  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && isOpen) {
      onClose();
    }
  };

  // Get dynamic property name with fallback
  const getPropertyName = () => {
    if (propertyLoading) return "Loading...";
    return property?.name || "Staff Portal";
  };

  // Get property logo with fallback
  const getPropertyLogo = () => {
    return property?.logoUrl || null;
  };

  // Helper function to check if a route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const NavButton = ({ children, onClick, isActive, icon, ...props }) => (
    <Button
      variant={isActive ? "solid" : "ghost"}
      colorScheme={isActive ? "green" : "whiteAlpha"}
      bg={isActive ? "green.600" : "transparent"}
      _hover={{
        bg: isActive ? "green.500" : "whiteAlpha.200",
        transform: "translateX(4px)",
      }}
      transition="all 0.2s"
      justifyContent="flex-start"
      leftIcon={icon}
      onClick={onClick}
      {...props}
    >
      {children}
    </Button>
  );

  const SidebarContent = (
    <VStack spacing={4} align="stretch">
      {/* Header */}
      <Box textAlign="center" py={4}>
        <Heading size="md" mb={2}>Staff Portal</Heading>
        <Divider borderColor="whiteAlpha.300" />
      </Box>

      {/* Navigation */}
      <VStack spacing={2} align="stretch">
        <NavButton 
          onClick={() => handleNavigate("/dashboard/department")}
          isActive={isActiveRoute("/dashboard/department")}
        >
          Dashboard Overview
        </NavButton>

        <NavButton 
          onClick={() => handleNavigate("/dashboard/department/report-issue")}
          isActive={isActiveRoute("/dashboard/department/report-issue")}
        >
          Report Issue
        </NavButton>

        {/* Issues Section */}
        <Box>
          <Button
            rightIcon={showIssueLinks ? <TriangleUpIcon /> : <TriangleDownIcon />}
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={() => setShowIssueLinks(!showIssueLinks)}
            justifyContent="space-between"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            Issues
          </Button>

          <Collapse in={showIssueLinks} animateOpacity>
            <VStack pl={4} align="stretch" spacing={1} mt={2}>
              <NavButton
                onClick={() => handleNavigate("/dashboard/department/my-issues")}
                size="sm"
                isActive={isActiveRoute("/dashboard/department/my-issues")}
              >
                My Issues
              </NavButton>
              <NavButton
                onClick={() => handleNavigate("/dashboard/department/department-issues")}
                size="sm"
                isActive={isActiveRoute("/dashboard/department/department-issues")}
              >
                Department Issues
              </NavButton>
              {canViewAllIssues && (
                <NavButton
                  onClick={() => handleNavigate("/dashboard/department/all-issues")}
                  size="sm"
                  isActive={isActiveRoute("/dashboard/department/all-issues")}
                >
                  All Issues
                </NavButton>
              )}
            </VStack>
          </Collapse>
        </Box>

        {/* Guest Management */}
        {canManageGuests && (
          <NavButton 
            onClick={() => handleNavigate("/dashboard/department/guest-management")}
            isActive={isActiveRoute("/dashboard/department/guest-management")}
          >
            Guest Management
          </NavButton>
        )}
      </VStack>
    </VStack>
  );

  return (
    <Flex direction="column" minH="100vh" bg="gray.50" w="100%">
      {/* Enhanced Topbar */}
      <Flex
        bg="green.700"
        color="white"
        px={headerPadding}
        py={4}
        alignItems="center"
        justifyContent="space-between"
        shadow="md"
        w="100%"
      >
        <Flex align="center" gap={4}>
          {isMobile ? (
            <IconButton
              icon={<HamburgerIcon />}
              variant="ghost"
              colorScheme="whiteAlpha"
              onClick={onOpen}
              aria-label="Open menu"
              _hover={{ bg: "whiteAlpha.200" }}
            />
          ) : (
            <IconButton
              icon={sidebarCollapsed ? <ArrowForwardIcon /> : <ArrowBackIcon />}
              variant="ghost"
              colorScheme="whiteAlpha"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              aria-label="Toggle sidebar"
              _hover={{ bg: "whiteAlpha.200" }}
            />
          )}
          
          <HStack spacing={3} align="center">
            {/* Dynamic Logo Display */}
            {getPropertyLogo() && (
              <Box 
                boxSize="40px" 
                bg="whiteAlpha.200" 
                borderRadius="md" 
                p={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <img
                  src={getPropertyLogo()}
                  alt={`${getPropertyName()} Logo`}
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "contain",
                    maxWidth: "36px",
                    maxHeight: "36px"
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </Box>
            )}
            
            <Box>
              {/* Dynamic Property Name */}
              {propertyLoading ? (
                <Skeleton height="24px" width="200px" />
              ) : (
                <Heading 
                  fontSize={{ base: "md", md: "xl" }} 
                  color="white" 
                  fontWeight="medium"
                >
                  {getPropertyName()}
                </Heading>
              )}
              
              <Text fontSize="xs" color="green.100">Welcome back</Text>
              
              {user ? (
                <Heading size="xs">
                  {user?.fullName || user?.role?.toUpperCase() || "User"}
                </Heading>
              ) : (
                <SkeletonText noOfLines={1} height="12px" width="80px" />
              )}
            </Box>
          </HStack>
        </Flex>

        <HStack spacing={3}>
          <Menu>
            <MenuButton>
              <Avatar 
                size="sm" 
                name={user?.fullName} 
                bg="green.500"
                cursor="pointer"
                _hover={{ transform: "scale(1.05)" }}
                transition="transform 0.2s"
              />
            </MenuButton>
            <MenuList bg="white" color="black" shadow="lg">
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <Flex flex="1" w="100%">
        {/* Enhanced Sidebar for desktop */}
        {!isMobile && !sidebarCollapsed && (
          <Box 
            w="280px" 
            bg="green.700" 
            color="white" 
            p={6} 
            shadow="lg"
            borderRight="1px solid"
            borderColor="green.600"
          >
            {SidebarContent}
          </Box>
        )}

        {/* Enhanced Drawer sidebar for mobile */}
        {isMobile && (
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent bg="green.700" color="white">
              <DrawerCloseButton />
              <DrawerBody p={6}>{SidebarContent}</DrawerBody>
            </DrawerContent>
          </Drawer>
        )}

        {/* MAIN CONTENT AREA - Fixed for mobile */}
        <Box 
          flex="1" 
          p={mainPadding}
          bg="gray.50"
          w="100%"
          maxW="100%"
          overflow="hidden"
        >
          {isMobile ? (
            // Mobile: Remove card wrapper for full width
            <Box
              bg="white"
              borderRadius="md"
              shadow="sm"
              p={cardPadding}
              w="100%"
              maxW="100%"
            >
              <Outlet />
            </Box>
          ) : (
            // Desktop: Keep card wrapper
            <Card w="100%">
              <CardBody p={cardPadding}>
                <Outlet />
              </CardBody>
            </Card>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default DepartmentDashboard;