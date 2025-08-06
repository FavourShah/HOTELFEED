import { useState, useEffect } from 'react';
import {
  Box, Button, Input, Textarea, VStack, Heading, useToast,
  FormControl, FormLabel, FormHelperText, Card, CardBody,
  Flex, Stack, useColorModeValue, Text, IconButton,
  InputGroup, InputLeftElement, Badge, Progress, HStack,
  Menu, MenuButton, MenuList, MenuItem, Avatar,
  Skeleton, SkeletonText,
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
  FaClipboardList
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import usePropertyStore from '../store/usePropertyStore';

function GuestReportPage() {
  const { token, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const { property, loading: propertyLoading, fetchProperty } = usePropertyStore();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [form, setForm] = useState({
    title: '',
    description: '',
    roomNumber: '',
    attachments: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    // Fetch property data for branding
    fetchProperty();
  }, [fetchProperty]);

  useEffect(() => {
    if (user?.roomNumber) {
      setForm((prev) => ({ ...prev, roomNumber: user.roomNumber }));
    }
  }, [user]);

  // Get dynamic property name with fallback
  const getPropertyName = () => {
    if (propertyLoading) return "Loading...";
    return property?.name || "Guest Portal";
  };

  // Get property logo with fallback
  const getPropertyLogo = () => {
    return property?.logoUrl || null;
  };

  const handleLogout = () => {
    logout();
    navigate('/guest-login');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast({
        title: 'Too many files',
        description: 'Please select up to 5 images only',
        status: 'warning'
      });
      return;
    }
    
    setForm({ ...form, attachments: e.target.files });
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    
    const dt = new DataTransfer();
    newFiles.forEach(file => dt.items.add(file));
    setForm({ ...form, attachments: dt.files });
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for your issue',
        status: 'warning'
      });
      return;
    }

    if (!form.description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please describe the issue in detail',
        status: 'warning'
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      toast({ 
        title: 'Issue reported successfully', 
        description: 'Our team will address your concern shortly',
        status: 'success',
        duration: 5000
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
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Header Bar */}
      <Flex
        bg="green.700"
        color="white"
        px={6}
        py={4}
        alignItems="center"
        justifyContent="space-between"
        shadow="md"
      >
        {/* Logo + Property Info */}
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
                  // Hide logo if it fails to load
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
              <Heading fontSize="xl" color="white" fontWeight="medium">
                {getPropertyName()}
              </Heading>
            )}
            
            <Text fontSize="xs" color="green.100">
              Guest Portal
            </Text>
            
            {user ? (
              <Heading size="xs">
                {user?.name || 'Guest User'} - Room {user?.roomNumber || form.roomNumber}
              </Heading>
            ) : (
              <SkeletonText noOfLines={1} height="12px" width="150px" />
            )}
          </Box>
        </HStack>

        {/* User Menu */}
        <HStack spacing={3}>
          <Menu>
            <MenuButton>
              <Avatar
                size="sm"
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

      {/* Main Content */}
      <Box p={6}>
        <Box maxW="800px" mx="auto">
          {/* Header */}
          <Box mb={8}>
            <Flex align="center" mb={2}>
              <FaExclamationTriangle color="orange" size={24} />
              <Heading size="lg" ml={3} color="gray.700">
                Report an Issue
              </Heading>
            </Flex>
            <Text color="gray.600" fontSize="md">
              Let us know about any problems you're experiencing in your room
            </Text>
          </Box>

          {/* Guest Info Card */}
          <Card bg={cardBg} shadow="md" borderRadius="xl" mb={6}>
            <CardBody p={4}>
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Box
                    p={3}
                    rounded="full"
                    bg="blue.100"
                    color="blue.600"
                    mr={4}
                  >
                    <FaUser size={16} />
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.700">
                      {user?.name || 'Guest User'}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Logged in as guest
                    </Text>
                  </Box>
                </Flex>
                <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                  Room {user?.roomNumber || form.roomNumber}
                </Badge>
              </Flex>
            </CardBody>
          </Card>

          {/* Main Form */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" border="1px" borderColor={borderColor}>
            <CardBody p={8}>
              <Stack spacing={6}>
                <FormControl isRequired>
                  <Flex align="center" mb={3}>
                    <FaClipboardList color="gray" size={16} />
                    <FormLabel ml={2} mb={0} fontWeight="semibold" color="gray.700">
                      Issue Title
                    </FormLabel>
                  </Flex>
                  <Input
                    placeholder="e.g., Air conditioning not working"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    bg="gray.50"
                    border="1px"
                    borderColor={borderColor}
                    focusBorderColor="orange.400"
                    _hover={{ borderColor: "orange.300" }}
                    size="lg"
                    borderRadius="lg"
                  />
                </FormControl>

                <FormControl isRequired>
                  <Flex align="center" mb={3}>
                    <FaClipboardList color="gray" size={16} />
                    <FormLabel ml={2} mb={0} fontWeight="semibold" color="gray.700">
                      Description
                    </FormLabel>
                  </Flex>
                  <Textarea
                    placeholder="Please describe the problem in detail. Include when it started, what you've tried, and any other relevant information..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    bg="gray.50"
                    border="1px"
                    borderColor={borderColor}
                    focusBorderColor="orange.400"
                    _hover={{ borderColor: "orange.300" }}
                    rows={5}
                    borderRadius="lg"
                    resize="vertical"
                  />
                </FormControl>

                <FormControl>
                  <Flex align="center" mb={3}>
                    <FaBed color="gray" size={16} />
                    <FormLabel ml={2} mb={0} fontWeight="semibold" color="gray.700">
                      Room Number
                    </FormLabel>
                  </Flex>
                  <Input
                    value={form.roomNumber}
                    readOnly
                    bg="gray.100"
                    border="1px"
                    borderColor={borderColor}
                    size="lg"
                    borderRadius="lg"
                    _focus={{ bg: "gray.100" }}
                  />
                  <FormHelperText>
                    This is your assigned room number
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <Flex align="center" mb={3}>
                    <FaFileImage color="gray" size={16} />
                    <FormLabel ml={2} mb={0} fontWeight="semibold" color="gray.700">
                      Attach Images (Optional)
                    </FormLabel>
                  </Flex>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none" pl={2}>
                      <AttachmentIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      bg="gray.50"
                      border="1px"
                      borderColor={borderColor}
                      focusBorderColor="orange.400"
                      _hover={{ borderColor: "orange.300" }}
                      borderRadius="lg"
                      pl={10}
                      pt={2}
                    />
                  </InputGroup>
                  <FormHelperText>
                   You can upload up to 5 images to help us understand the issue better
                  </FormHelperText>
                </FormControl>

                {/* File Preview */}
                {selectedFiles.length > 0 && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={3}>
                      Selected Files ({selectedFiles.length}/5)
                    </Text>
                    <Stack spacing={2}>
                      {selectedFiles.map((file, index) => (
                        <Flex
                          key={index}
                          align="center"
                          justify="space-between"
                          p={3}
                          bg="gray.50"
                          borderRadius="lg"
                          border="1px"
                          borderColor={borderColor}
                        >
                          <Flex align="center">
                            <FaFileImage color="blue" size={16} />
                            <Text ml={3} fontSize="sm" color="gray.700">
                              {file.name}
                            </Text>
                            <Badge ml={2} colorScheme="blue" size="sm">
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
                    </Stack>
                  </Box>
                )}

                <Box pt={4}>
                  <Button
                    colorScheme="orange"
                    size="lg"
                    onClick={handleSubmit}
                    w="full"
                    isLoading={isSubmitting}
                    loadingText="Submitting Report..."
                    leftIcon={<FaPaperPlane />}
                    borderRadius="xl"
                    _hover={{ 
                      transform: "translateY(-2px)", 
                      shadow: "xl",
                      bg: "orange.600"
                    }}
                    transition="all 0.2s"
                    py={6}
                    fontSize="md"
                    fontWeight="bold"
                  >
                    Submit Issue Report
                  </Button>
                </Box>
              </Stack>
            </CardBody>
          </Card>

          {/* Help Text */}
          <Card bg="blue.50" borderRadius="xl" mt={6}>
            <CardBody p={6}>
              <Flex align="center" mb={3}>
                <CheckCircleIcon color="blue.500" />
                <Text ml={2} fontWeight="semibold" color="blue.700">
                  What happens next?
                </Text>
              </Flex>
              <Stack spacing={2} fontSize="sm" color="blue.600">
                <Text>• Your report will be reviewed by our maintenance team</Text>
                <Text>• We'll prioritize urgent issues and aim to resolve them quickly</Text>
                <Text>• You may be contacted if we need additional information</Text>
                <Text>• For emergencies, please call the front desk immediately</Text>
              </Stack>
            </CardBody>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default GuestReportPage;