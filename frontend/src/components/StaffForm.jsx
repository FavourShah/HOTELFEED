import { useState, useCallback } from 'react';
import {
  Box, Button, Input, Textarea, VStack, useToast, Spinner,
  FormControl, FormLabel, FormHelperText, HStack, Card, CardBody,
  Flex, Stack, useColorModeValue, Text, IconButton, Badge,
  InputGroup, InputLeftElement, SimpleGrid, useBreakpointValue,
  Container, Heading, Alert, AlertIcon
} from '@chakra-ui/react';
import { 
  AttachmentIcon, 
  CloseIcon,
  CheckCircleIcon,
  WarningIcon 
} from '@chakra-ui/icons';
import { 
  FaTools, 
  FaFileImage, 
  FaPaperPlane,
  FaUser,
  FaBed,
  FaMapMarkerAlt,
  FaClipboardList,
  FaExclamationCircle
} from 'react-icons/fa';
import axios from '../utils/axiosInstance';
import useAuthStore from '../store/useAuthStore';
import { memo } from 'react';

// Memoized FormField component to prevent unnecessary re-renders
const FormField = memo(({ label, icon, children, isRequired = false, helper }) => (
  <FormControl isRequired={isRequired}>
    <Flex align="center" mb={3}>
      <Box color="blue.500" mr={2}>
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
      <FormHelperText mt={2} fontSize="xs" color="gray.500">
        {helper}
      </FormHelperText>
    )}
  </FormControl>
));

const StaffIssueForm = ({
  onSuccess = () => {},
  defaultRoomNumber = '',
  defaultLocation = '',
  showHeader = true,
}) => {
  const { user } = useAuthStore();
  const toast = useToast();

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const formSpacing = useBreakpointValue({ base: 4, md: 6 });
  const cardPadding = useBreakpointValue({ base: 4, md: 8 });
  const containerPadding = useBreakpointValue({ base: 4, md: 6 });
  const headingSize = useBreakpointValue({ base: "lg", md: "xl" });
  const iconSize = useBreakpointValue({ base: 20, md: 24 });

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
    roomNumber: defaultRoomNumber,
    location: defaultLocation,
    attachments: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Stable event handlers
  const handleTitleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, title: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, description: e.target.value }));
  }, []);

  const handleRoomNumberChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, roomNumber: e.target.value }));
  }, []);

  const handleLocationChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, location: e.target.value }));
  }, []);

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

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please provide a title for the issue',
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

    if (!form.roomNumber.trim() && !form.location.trim()) {
      toast({
        title: 'Location required',
        description: 'Please specify either a room number or location',
        status: 'warning',
        duration: 4000,
        isClosable: true
      });
      return;
    }

    setIsLoading(true);
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
        description: 'Your issue has been recorded and will be addressed',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      setForm({
        title: '',
        description: '',
        roomNumber: defaultRoomNumber || '',
        location: defaultLocation || '',
        attachments: [],
      });
      setSelectedFiles([]);
      onSuccess();
    } catch (err) {
      toast({
        title: 'Error reporting issue',
        description: err.response?.data?.message || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsLoading(false);
    }
  }, [form, toast, defaultRoomNumber, defaultLocation, onSuccess]);

  const formContent = (
    <Stack spacing={formSpacing}>
      {showHeader && (
        <Card 
          bg="blue.50" 
          borderRadius="xl" 
          mb={4}
          borderLeft="4px"
          borderLeftColor="blue.400"
          shadow={shadowColor}
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
                  bg="blue.100"
                  color="blue.600"
                  mr={{ base: 3, md: 4 }}
                  flexShrink={0}
                >
                  <FaUser size={isMobile ? 14 : 16} />
                </Box>
                <Box flex={1}>
                  <Text 
                    fontWeight="bold" 
                    color="blue.700"
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    {user?.name || user?.fullName || 'Staff Member'}
                  </Text>
                  <Text fontSize={{ base: "xs", md: "sm" }} color="blue.600">
                    Staff Issue Report
                  </Text>
                </Box>
              </Flex>
              <Badge 
                colorScheme="blue" 
                px={3} 
                py={1} 
                borderRadius="full"
                fontSize={{ base: "xs", md: "sm" }}
              >
                Staff Access
              </Badge>
            </Flex>
          </CardBody>
        </Card>
      )}

      <FormField
        label="Issue Title"
        icon={<FaClipboardList size={isMobile ? 14 : 16} />}
        isRequired
      >
        <Input
          name="title"
          placeholder={isMobile ? "Brief issue title" : "e.g., Wi-Fi connectivity issues in lobby"}
          value={form.title}
          onChange={handleTitleChange}
          bg={inputBg}
          border="2px"
          borderColor={borderColor}
          focusBorderColor="blue.400"
          _hover={{ borderColor: "blue.300" }}
          size={{ base: "md", md: "lg" }}
          borderRadius="lg"
          fontSize={{ base: "sm", md: "md" }}
        />
      </FormField>

      <FormField
        label="Detailed Description"
        icon={<FaExclamationCircle size={isMobile ? 14 : 16} />}
        isRequired
        helper="Provide comprehensive details about the issue"
      >
        <Textarea
          name="description"
          placeholder={isMobile 
            ? "Describe the issue in detail..." 
            : "Provide a comprehensive description of the issue, including steps to reproduce, impact on operations, and any temporary workarounds..."
          }
          value={form.description}
          onChange={handleDescriptionChange}
          bg={inputBg}
          border="2px"
          borderColor={borderColor}
          focusBorderColor="blue.400"
          _hover={{ borderColor: "blue.300" }}
          rows={isMobile ? 4 : 5}
          borderRadius="lg"
          resize="vertical"
          fontSize={{ base: "sm", md: "md" }}
        />
      </FormField>

      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
        <FormField
          label="Room Number"
          icon={<FaBed size={isMobile ? 14 : 16} />}
          helper={isMobile ? "e.g., 101, 205A" : undefined}
        >
          <Input
            name="roomNumber"
            placeholder="e.g., 101, 205A"
            value={form.roomNumber}
            onChange={handleRoomNumberChange}
            bg={inputBg}
            border="2px"
            borderColor={borderColor}
            focusBorderColor="blue.400"
            _hover={{ borderColor: "blue.300" }}
            size={{ base: "md", md: "lg" }}
            borderRadius="lg"
            fontSize={{ base: "sm", md: "md" }}
          />
        </FormField>

        <FormField
          label="Location/Area"
          icon={<FaMapMarkerAlt size={isMobile ? 14 : 16} />}
          helper={isMobile ? "e.g., Lobby, Restaurant" : undefined}
        >
          <Input
            name="location"
            placeholder="e.g., Lobby, Restaurant"
            value={form.location}
            onChange={handleLocationChange}
            bg={inputBg}
            border="2px"
            borderColor={borderColor}
            focusBorderColor="blue.400"
            _hover={{ borderColor: "blue.300" }}
            size={{ base: "md", md: "lg" }}
            borderRadius="lg"
            fontSize={{ base: "sm", md: "md" }}
          />
        </FormField>
      </SimpleGrid>

      <Alert status="info" borderRadius="lg" fontSize={{ base: "xs", md: "sm" }}>
        <AlertIcon boxSize={{ base: 3, md: 4 }} />
        <Text>Please specify either a room number or location (or both)</Text>
      </Alert>

      <FormField
        label="Supporting Images"
        icon={<FaFileImage size={isMobile ? 14 : 16} />}
        helper="Upload photos for visual context (up to 5 images)"
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
            focusBorderColor="blue.400"
            _hover={{ borderColor: "blue.300" }}
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
                bg="blue.50"
                borderRadius="lg"
                border="2px"
                borderColor="blue.100"
                direction={{ base: "column", sm: "row" }}
                gap={{ base: 2, sm: 0 }}
              >
                <Flex align="center" w={{ base: "100%", sm: "auto" }}>
                  <FaFileImage color="blue" size={isMobile ? 14 : 16} />
                  <Text 
                    ml={3} 
                    fontSize={{ base: "xs", md: "sm" }} 
                    color="gray.700"
                    isTruncated
                    maxW={{ base: "200px", sm: "300px" }}
                  >
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
          </VStack>
        </Box>
      )}

      <Box pt={4}>
        <Button
          colorScheme="blue"
          size={{ base: "md", md: "lg" }}
          onClick={handleSubmit}
          w="full"
          isDisabled={isLoading}
          leftIcon={isLoading ? <Spinner size="sm" /> : <FaPaperPlane />}
          borderRadius="xl"
          _hover={{ 
            transform: "translateY(-2px)", 
            shadow: "xl",
            bg: "blue.600"
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
          {isLoading ? 'Submitting...' : (isMobile ? 'Submit Report' : 'Submit Issue Report')}
        </Button>
      </Box>
    </Stack>
  );

  if (showHeader) {
    return (
      <Box bg={bgColor} minH="100vh" w="100%">
        <Container maxW="800px" px={containerPadding} py={containerPadding}>
          <Box mb={{ base: 6, md: 8 }}>
            <Flex 
              align="center" 
              mb={3}
              direction={{ base: "column", sm: "row" }}
              textAlign={{ base: "center", sm: "left" }}
              gap={{ base: 2, sm: 0 }}
            >
              <Box color="blue.500" mr={{ base: 0, sm: 3 }} mb={{ base: 2, sm: 0 }}>
                <FaTools size={iconSize} />
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
                ? "Log issues for quick resolution"
                : "Log maintenance issues and operational problems for quick resolution"
              }
            </Text>
          </Box>

          <Card 
            bg={cardBg} 
            shadow={shadowColor} 
            borderRadius="xl" 
            border="1px" 
            borderColor={borderColor}
          >
            <CardBody p={cardPadding}>
              {formContent}
            </CardBody>
          </Card>

          <Card 
            bg="green.50" 
            borderRadius="xl" 
            mt={{ base: 4, md: 6 }}
            borderLeft="4px"
            borderLeftColor="green.400"
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <Flex align="center" mb={3}>
                <CheckCircleIcon color="green.500" boxSize={{ base: 4, md: 5 }} />
                <Text 
                  ml={2} 
                  fontWeight="semibold" 
                  color="green.700"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  Resolution Process
                </Text>
              </Flex>
              <VStack 
                spacing={1} 
                fontSize={{ base: "xs", md: "sm" }} 
                color="green.600"
                align="start"
              >
                <Text>• Automatic team assignment</Text>
                <Text>• Progress updates provided</Text>
                <Text>• Quality improvement tracking</Text>
              </VStack>
            </CardBody>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box p={0} w="100%">
      {formContent}
    </Box>
  );
};

export default StaffIssueForm;