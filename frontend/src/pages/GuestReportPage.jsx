import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Input, Textarea, VStack, Heading, useToast,
  FormControl, FormLabel, FormHelperText, Card, CardBody,
  Flex, Stack, useColorModeValue, Text, IconButton,
  InputGroup, InputLeftElement, Badge, HStack,
  Menu, MenuButton, MenuList, MenuItem, Avatar,
  Skeleton, SkeletonText, useBreakpointValue, Container,
  Alert, AlertIcon
} from '@chakra-ui/react';
import { 
  AttachmentIcon, 
  WarningIcon, 
  CheckCircleIcon,
  CloseIcon 
} from '@chakra-ui/icons';
import { 
  FaExclamationTriangle, 
  FaFileImage, 
  FaPaperPlane,
  FaUser,
  FaBed,
  FaClipboardList,
  FaPhone
} from 'react-icons/fa';
import axios from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import usePropertyStore from '../store/usePropertyStore';
import { memo } from 'react';

// Memoized FormField component to prevent unnecessary re-renders
const FormField = memo(({ label, icon, children, isRequired = false, helper }) => (
  <FormControl isRequired={isRequired}>
    <Flex align="center" mb={3}>
      <Box color="orange.500" mr={2}>
        {icon}
      </Box>
      <FormLabel 
        mb={0} 
        fontWeight="semibold" 
        color="gray.700"
        fontSize={{ base: "sm", md: "md" }}
      >
        {label}
      </FormLabel>
    </Flex>
    {children}
    {helper && (
      <FormHelperText mt={2} fontSize={{ base: "xs", md: "sm" }} color="gray.500">
        {helper}
      </FormHelperText>
    )}
  </FormControl>
));

function GuestReportPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const { property, loading: propertyLoading, fetchProperty } = usePropertyStore();

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const formSpacing = useBreakpointValue({ base: 4, md: 6 });
  const cardPadding = useBreakpointValue({ base: 4, md: 8 });
  const containerPadding = useBreakpointValue({ base: 4, md: 6 });
  const headingSize = useBreakpointValue({ base: "md", md: "lg" });
  const headerPadding = useBreakpointValue({ base: 4, md: 6 });

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("white", "gray.700");
  const shadowColor = useBreakpointValue({ 
    base: "md", 
    md: "lg" 
  });

  const [form, setForm] = useState({
    title: '',
    description: '',
    roomNumber: '',
    attachments: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
    if (user?.roomNumber) {
      setForm((prev) => ({ ...prev, roomNumber: user.roomNumber }));
    }
  }, [user]);

  const getPropertyName = () => {
    if (propertyLoading) return "Loading...";
    return property?.name || "Guest Portal";
  };

  const getPropertyLogo = () => {
    return property?.logoUrl || null;
  };

  const handleLogout = useCallback(() => {
    logout();
    navigate('/guest-login');
  }, [logout, navigate]);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast({
        title: 'Too many files',
        description: 'Please select up to 5 images only',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }
    
    setForm((prev) => ({ ...prev, attachments: e.target.files }));
    setSelectedFiles(files);
  }, [toast]);

  const removeFile = useCallback((index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    const dt = new DataTransfer();
    newFiles.forEach(file => dt.items.add(file));
    setForm((prev) => ({ ...prev, attachments: dt.files }));
  }, [selectedFiles]);

  const handleTitleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, title: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, description: e.target.value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for your issue',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    if (!form.description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please describe the issue in detail',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'attachments') {
        [...value].forEach((file) => data.append('attachments', file));
      } else {
        data.append(key, value);
      }
    });

    try {
      await axios.post('/api/issues', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({ 
        title: 'Issue reported successfully', 
        description: 'Our team will address your concern shortly',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      setForm({
        title: '',
        description: '',
        roomNumber: user?.roomNumber || '',
        attachments: [],
      });
      setSelectedFiles([]);
    } catch (err) {
      toast({
        title: 'Error reporting issue',
        description: err.response?.data?.message || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [form, toast, user]);

  return (
    <Box bg={bgColor} minH="100vh" w="100%">
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
        <HStack 
          spacing={{ base: 2, md: 3 }} 
          align="center"
          flex={1}
          minW={0}
        >
          {getPropertyLogo() && (
            <Box 
              boxSize={{ base: "32px", md: "40px" }}
              bg="whiteAlpha.200" 
              borderRadius="md" 
              p={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <img
                src={getPropertyLogo()}
                alt={`${getPropertyName()} Logo`}
                style={{ 
                  width: "100%", 
                  height: "100%", 
                  objectFit: "contain",
                  maxWidth: isMobile ? "28px" : "36px",
                  maxHeight: isMobile ? "28px" : "36px"
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Box>
          )}
          
          <Box flex={1} minW={0}>
            {propertyLoading ? (
              <Skeleton height="20px" width="120px" />
            ) : (
              <Heading 
                fontSize={{ base: "sm", md: "xl" }} 
                color="white" 
                fontWeight="medium"
                isTruncated
              >
                {getPropertyName()}
              </Heading>
            )}
            
            <Text fontSize={{ base: "xs", md: "xs" }} color="green.100">
              Guest Portal
            </Text>
            
            {user ? (
              <Text 
                fontSize={{ base: "xs", md: "xs" }}
                color="green.50"
                isTruncated
              >
                {user?.name || 'Guest'} - Room {user?.roomNumber || form.roomNumber}
              </Text>
            ) : (
              <SkeletonText noOfLines={1} height="10px" width="100px" />
            )}
          </Box>
        </HStack>

        <HStack spacing={3} flexShrink={0}>
          <Menu>
            <MenuButton>
              <Avatar
                size={{ base: "sm", md: "sm" }}
                name={user?.name || 'Guest User'}
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

      <Container maxW="800px" px={containerPadding} py={containerPadding}>
        <Box mb={{ base: 6, md: 8 }}>
          <Flex 
            align="center" 
            mb={3}
            direction={{ base: "column", sm: "row" }}
            textAlign={{ base: "center", sm: "left" }}
            gap={{ base: 2, sm: 0 }}
          >
            <Box 
              color="orange.500" 
              mr={{ base: 0, sm: 3 }} 
              mb={{ base: 2, sm: 0 }}
            >
              <FaExclamationTriangle size={isMobile ? 20 : 24} />
            </Box>
            <Heading 
              size={headingSize}
              color="gray.700"
              fontWeight="bold"
            >
              Report an Issue
            </Heading>
          </Flex>
          <Text 
            color="gray.600" 
            fontSize={{ base: "sm", md: "md" }}
            textAlign={{ base: "center", sm: "left" }}
          >
            {isMobile 
              ? "Let us know about any problems in your room"
              : "Let us know about any problems you're experiencing in your room"
            }
          </Text>
        </Box>

        <Card 
          bg={cardBg} 
          shadow={shadowColor} 
          borderRadius="xl" 
          mb={{ base: 4, md: 6 }}
          borderLeft="4px"
          borderLeftColor="orange.400"
        >
          <CardBody p={{ base: 3, md: 4 }}>
            <Flex 
              align="center" 
              justify="space-between"
              direction={{ base: "column", sm: "row" }}
              gap={{ base: 3, sm: 0 }}
            >
              <Flex align="center" w={{ base: "100%", sm: "auto" }}>
                <Box
                  p={{ base: 2, md: 3 }}
                  rounded="full"
                  bg="orange.100"
                  color="orange.600"
                  mr={{ base: 3, md: 4 }}
                  flexShrink={0}
                >
                  <FaUser size={isMobile ? 14 : 16} />
                </Box>
                <Box flex={1}>
                  <Text 
                    fontWeight="bold" 
                    color="gray.700"
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    {user?.name || 'Guest User'}
                  </Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                    Logged in as guest
                  </Text>
                </Box>
              </Flex>
              <Badge 
                colorScheme="orange" 
                px={3} 
                py={1} 
                borderRadius="full"
                fontSize={{ base: "xs", md: "sm" }}
              >
                Room {user?.roomNumber || form.roomNumber}
              </Badge>
            </Flex>
          </CardBody>
        </Card>

        <Card 
          bg={cardBg} 
          shadow={shadowColor} 
          borderRadius="xl" 
          border="1px" 
          borderColor={borderColor}
        >
          <CardBody p={cardPadding}>
            <Stack spacing={formSpacing}>
              <FormField
                label="Issue Title"
                icon={<FaClipboardList size={isMobile ? 14 : 16} />}
                isRequired
              >
                <Input
                  placeholder={isMobile ? "Brief issue description" : "e.g., Air conditioning not working"}
                  value={form.title}
                  onChange={handleTitleChange}
                  bg={inputBg}
                  border="2px"
                  borderColor={borderColor}
                  focusBorderColor="orange.400"
                  _hover={{ borderColor: "orange.300" }}
                  size={{ base: "md", md: "lg" }}
                  borderRadius="lg"
                  fontSize={{ base: "sm", md: "md" }}
                />
              </FormField>

              <FormField
                label="Description"
                icon={<FaClipboardList size={isMobile ? 14 : 16} />}
                isRequired
                helper="Describe the problem in detail"
              >
                <Textarea
                  placeholder={isMobile 
                    ? "Describe the problem, when it started, what you've tried..." 
                    : "Please describe the problem in detail. Include when it started, what you've tried, and any other relevant information..."
                  }
                  value={form.description}
                  onChange={handleDescriptionChange}
                  bg={inputBg}
                  border="2px"
                  borderColor={borderColor}
                  focusBorderColor="orange.400"
                  _hover={{ borderColor: "orange.300" }}
                  rows={isMobile ? 4 : 5}
                  borderRadius="lg"
                  resize="vertical"
                  fontSize={{ base: "sm", md: "md" }}
                />
              </FormField>

              <FormField
                label="Room Number"
                icon={<FaBed size={isMobile ? 14 : 16} />}
                helper="This is your assigned room number"
              >
                <Input
                  value={form.roomNumber}
                  readOnly
                  bg="gray.100"
                  border="2px"
                  borderColor={borderColor}
                  size={{ base: "md", md: "lg" }}
                  borderRadius="lg"
                  _focus={{ bg: "gray.100" }}
                  fontSize={{ base: "sm", md: "md" }}
                />
              </FormField>

              <FormField
                label="Attach Images"
                icon={<FaFileImage size={isMobile ? 14 : 16} />}
                helper="Upload up to 5 images to help us understand the issue"
              >
                <InputGroup>
                  <InputLeftElement pointerEvents="none" pl={2}>
                    <AttachmentIcon color="gray.400" boxSize={{ base: 3, md: 4 }} />
                  </InputLeftElement>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    bg={inputBg}
                    border="2px"
                    borderColor={borderColor}
                    focusBorderColor="orange.400"
                    _hover={{ borderColor: "orange.300" }}
                    borderRadius="lg"
                    pl={{ base: 8, md: 10 }}
                    pt={isMobile ? 1.5 : 2}
                    fontSize={{ base: "xs", md: "sm" }}
                  />
                </InputGroup>
              </FormField>

              {selectedFiles.length > 0 && (
                <Box>
                  <Text 
                    fontSize="sm" 
                    fontWeight="medium" 
                    color="gray.600" 
                    mb={3}
                  >
                    Selected Files ({selectedFiles.length}/5)
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {selectedFiles.map((file, index) => (
                      <Flex
                        key={index}
                        align="center"
                        justify="space-between"
                        p={3}
                        bg="orange.50"
                        borderRadius="lg"
                        border="2px"
                        borderColor="orange.100"
                        direction={{ base: "column", sm: "row" }}
                        gap={{ base: 2, sm: 0 }}
                      >
                        <Flex align="center" w={{ base: "100%", sm: "auto" }}>
                          <FaFileImage color="orange" size={isMobile ? 14 : 16} />
                          <Text 
                            ml={3} 
                            fontSize={{ base: "xs", md: "sm" }} 
                            color="gray.700"
                            isTruncated
                            maxW={{ base: "200px", sm: "300px" }}
                          >
                            {file.name}
                          </Text>
                          <Badge ml={2} colorScheme="orange" size="sm">
                            {(file.size / 1024).toFixed(1)} KB
                          </Badge>
                        </Flex>
                        <IconButton
                          icon={<CloseIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => removeFile(index)}
                          aria-label="Remove file"
                        />
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}

              <Box pt={4}>
                <Button
                  colorScheme="orange"
                  size={{ base: "md", md: "lg" }}
                  onClick={handleSubmit}
                  w="full"
                  isLoading={isSubmitting}
                  loadingText={isMobile ? "Submitting..." : "Submitting Report..."}
                  leftIcon={<FaPaperPlane />}
                  borderRadius="xl"
                  _hover={{ 
                    transform: "translateY(-2px)", 
                    shadow: "xl",
                    bg: "orange.600"
                  }}
                  _active={{
                    transform: "translateY(0px)",
                    shadow: "md"
                  }}
                  transition="all 0.2s"
                  py={{ base: 5, md: 6 }}
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="bold"
                  shadow="md"
                >
                  {isMobile ? "Submit Report" : "Submit Issue Report"}
                </Button>
              </Box>
            </Stack>
          </CardBody>
        </Card>

        <Alert 
          status="warning" 
          borderRadius="xl" 
          mt={{ base: 4, md: 6 }}
          p={{ base: 3, md: 4 }}
          flexDirection={{ base: "column", sm: "row" }}
          textAlign={{ base: "center", sm: "left" }}
        >
          <AlertIcon boxSize={{ base: 4, md: 5 }} mb={{ base: 2, sm: 0 }} />
          <Box>
            <Text 
              fontWeight="semibold" 
              fontSize={{ base: "sm", md: "md" }}
              color="orange.700"
            >
              Emergency?
            </Text>
            <Text fontSize={{ base: "xs", md: "sm" }} color="orange.600">
              For urgent issues, please call the front desk immediately
            </Text>
          </Box>
          <Button 
            size="sm" 
            colorScheme="orange" 
            variant="outline"
            leftIcon={<FaPhone />}
            mt={{ base: 2, sm: 0 }}
            ml={{ base: 0, sm: 4 }}
            flexShrink={0}
          >
            Call Desk
          </Button>
        </Alert>

        <Card 
          bg="blue.50" 
          borderRadius="xl" 
          mt={{ base: 4, md: 6 }}
          borderLeft="4px"
          borderLeftColor="blue.400"
        >
          <CardBody p={{ base: 4, md: 6 }}>
            <Flex align="center" mb={3}>
              <CheckCircleIcon color="blue.500" boxSize={{ base: 4, md: 5 }} />
              <Text 
                ml={2} 
                fontWeight="semibold" 
                color="blue.700"
                fontSize={{ base: "sm", md: "md" }}
              >
                What happens next?
              </Text>
            </Flex>
            <VStack 
              spacing={1} 
              fontSize={{ base: "xs", md: "sm" }} 
              color="blue.600"
              align="start"
            >
              <Text>• We'll prioritize urgent issues</Text>
              <Text>• Quick resolution is our goal</Text>
              <Text>• Emergency? Call front desk</Text>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}

export default GuestReportPage;