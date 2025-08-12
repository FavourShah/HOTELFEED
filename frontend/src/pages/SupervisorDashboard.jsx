// SupervisorDashboard.jsx - Mobile Responsive Fix with Auto-Close Navigation
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
  Avatar,
  Text,
  Card,
  CardBody,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  TriangleDownIcon,
  TriangleUpIcon,
  SettingsIcon,
} from "@chakra-ui/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import React, { useEffect, useState } from "react";
import usePropertyStore from "../store/usePropertyStore";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token } = useAuthStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const { property, loading: propertyLoading, fetchProperty } = usePropertyStore();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserLinks, setShowUserLinks] = useState(true);
  const [showIssueLinks, setShowIssueLinks] = useState(true);
  const [showSystemLinks, setShowSystemLinks] = useState(true);

  // Responsive values
  const mainPadding = useBreakpointValue({ base: 2, md: 6 });
  const cardPadding = useBreakpointValue({ base: 2, md: 4 });
  const headerPadding = useBreakpointValue({ base: 4, md: 6 });

  useEffect(() => {
    if (token) {
      fetchProperty(token);
    }
  }, [token, fetchProperty]);

  const handleLogout = () => {
    logout();
    navigate("/");
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
    return property?.name || "Supervisor Management Portal";
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
      colorScheme={isActive ? "blue" : "whiteAlpha"}
      bg={isActive ? "blue.600" : "transparent"}
      _hover={{
        bg: isActive ? "blue.500" : "whiteAlpha.200",
        transform: "translateX(4px)",
      }}
      transition="all 0.2s"
      justifyContent="flex-start"
      onClick={onClick}
      leftIcon={icon}
      {...props}
    >
      {children}
    </Button>
  );

  const SidebarContent = (
    <VStack spacing={4} align="stretch">
      <Box textAlign="center" py={4}>
        <Heading size="md" mb={2}>Supervisor Portal</Heading>
        <Divider borderColor="whiteAlpha.300" />
      </Box>

      <VStack spacing={2} align="stretch">
        <NavButton 
          onClick={() => handleNavigate("/dashboard/supervisor")}
          isActive={isActiveRoute("/dashboard/supervisor")}
        >
          Dashboard Overview
        </NavButton>

        {/* Users Section */}
        <Box>
          <Button
            rightIcon={showUserLinks ? <TriangleUpIcon /> : <TriangleDownIcon />}
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={() => setShowUserLinks(!showUserLinks)}
            justifyContent="space-between"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            Users
          </Button>
          <Collapse in={showUserLinks}>
            <VStack pl={4} align="stretch" spacing={1} mt={2}>
              <NavButton 
                onClick={() => handleNavigate("/dashboard/supervisor/guests")} 
                size="sm"
                isActive={isActiveRoute("/dashboard/supervisor/guests")}
              >
                Guest Management
              </NavButton>
              <NavButton 
                onClick={() => handleNavigate("/dashboard/supervisor/staff")} 
                size="sm"
                isActive={isActiveRoute("/dashboard/supervisor/staff")}
              >
                Staff Management
              </NavButton>
              <NavButton 
                onClick={() => handleNavigate("/dashboard/supervisor/role")} 
                size="sm"
                isActive={isActiveRoute("/dashboard/supervisor/role")}
              >
                Role Management
              </NavButton>
              <NavButton 
                onClick={() => handleNavigate("/dashboard/supervisor/departments")} 
                size="sm"
                isActive={isActiveRoute("/dashboard/supervisor/departments")}
              >
                Department Management
              </NavButton>
            </VStack>
          </Collapse>
        </Box>

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
          <Collapse in={showIssueLinks}>
            <VStack pl={4} align="stretch" spacing={1} mt={2}>
              <NavButton 
                onClick={() => handleNavigate("/dashboard/supervisor/issues")} 
                size="sm"
                isActive={isActiveRoute("/dashboard/supervisor/issues")}
              >
                All Issues
              </NavButton>
            </VStack>
          </Collapse>
        </Box>

        <NavButton 
          onClick={() => handleNavigate("/dashboard/supervisor/rooms")}
          isActive={isActiveRoute("/dashboard/supervisor/rooms")}
        >
          Room Settings
        </NavButton>

        {/* System & Settings Section */}
        <Box>
          <Button
            rightIcon={showSystemLinks ? <TriangleUpIcon /> : <TriangleDownIcon />}
            variant="ghost"
            colorScheme="whiteAlpha"
            onClick={() => setShowSystemLinks(!showSystemLinks)}
            justifyContent="space-between"
            _hover={{ bg: "whiteAlpha.200" }}
          >
            System & Settings
          </Button>
          <Collapse in={showSystemLinks}>
            <VStack pl={4} align="stretch" spacing={1} mt={2}>
              <NavButton 
                onClick={() => handleNavigate("/dashboard/supervisor/property-settings")} 
                size="sm"
                isActive={isActiveRoute("/dashboard/supervisor/property-settings")}
                icon={<SettingsIcon boxSize={3} />}
              >
                Property Settings
              </NavButton>
              {/* You can add more system settings here in the future */}
            </VStack>
          </Collapse>
        </Box>
      </VStack>
    </VStack>
  );

  return (
    <Flex direction="column" minH="100vh" bg="gray.50" w="100%">
      <Flex
        bg="blue.700"
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
              icon={sidebarCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
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
              
              <Text fontSize="xs" color="blue.100">
                Supervisor Dashboard
              </Text>
              
              {user ? (
                <Heading size="xs">
                  {user.fullName || user.role?.toUpperCase() || "Supervisor"}
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
                bg="blue.500"
                cursor="pointer"
                _hover={{ transform: "scale(1.05)" }}
                transition="transform 0.2s"
              />
            </MenuButton>
            <MenuList bg="white" color="black" shadow="lg">
              <MenuItem onClick={() => handleNavigate("/dashboard/supervisor/property-settings")}>
                Property Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      <Flex flex="1" w="100%">
        {!isMobile && !sidebarCollapsed && (
          <Box
            w="280px"
            bg="blue.700"
            color="white"
            p={6}
            shadow="lg"
            borderRight="1px solid"
            borderColor="blue.600"
          >
            {SidebarContent}
          </Box>
        )}

        {isMobile && (
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent bg="blue.700" color="white">
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

export default SupervisorDashboard;