import { useState } from 'react';
import {
  Box, Button, Input, Textarea, VStack, useToast, Spinner,
  FormControl, FormLabel, FormHelperText, HStack, Card, CardBody,
  Flex, Stack, useColorModeValue, Text, IconButton, Badge,
  InputGroup, InputLeftElement, SimpleGrid,
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
import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const StaffIssueForm = ({
  onSuccess = () => {},
  defaultRoomNumber = '',
  defaultLocation = '',
  showHeader = true,
}) => {
  const { token, user } = useAuthStore();
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [form, setForm] = useState({
    title: '',
    description: '',
    roomNumber: defaultRoomNumber,
    location: defaultLocation,
    attachments: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
        description: 'Please provide a title for the issue',
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

    if (!form.roomNumber.trim() && !form.location.trim()) {
      return toast({
        title: 'Location required',
        description: 'Please specify either a room number or location',
        status: 'warning',
        duration: 3000,
      });
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({ 
        title: 'Issue reported successfully',
        description: 'Your Issue has been recorded and will be addressed ',
        status: 'success' 
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
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <Stack spacing={6}>
      {/* Staff Info (if showHeader is true) */}
      {showHeader && (
        <Card bg="blue.50" borderRadius="xl" mb={4}>
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
                  <Text fontWeight="bold" color="blue.700">
                    {user?.name || 'Staff Member'}
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    Staff Issue Report
                  </Text>
                </Box>
              </Flex>
              <Badge colorScheme="blue" px={3} py={1} borderRadius="full">
                Staff Access
              </Badge>
            </Flex>
          </CardBody>
        </Card>
      )}

      <FormControl isRequired>
        <Flex align="center" mb={3}>
          <FaClipboardList color="gray" size={16} />
          <FormLabel ml={2} mb={0} fontWeight="semibold" color="gray.700">
            Issue Title
          </FormLabel>
        </Flex>
        <Input
          name="title"
          placeholder="e.g., Wi-Fi connectivity issues in lobby"
          value={form.title}
          onChange={handleChange}
          bg="gray.50"
          border="1px"
          borderColor={borderColor}
          focusBorderColor="blue.400"
          _hover={{ borderColor: "blue.300" }}
          size="lg"
          borderRadius="lg"
        />
      </FormControl>

      <FormControl isRequired>
        <Flex align="center" mb={3}>
          <FaExclamationCircle color="gray" size={16} />
          <FormLabel ml={2} mb={0} fontWeight="semibold" color="gray.700">
            Detailed Description
          </FormLabel>
        </Flex>
        <Textarea
          name="description"
          placeholder="Provide a comprehensive description of the issue, including steps to reproduce, impact on operations, and any temporary workarounds..."
          value={form.description}
          onChange={handleChange}
          bg="gray.50"
          border="1px"
          borderColor={borderColor}
          focusBorderColor="blue.400"
          _hover={{ borderColor: "blue.300" }}
          rows={5}
          borderRadius="lg"
          resize="vertical"
        />
      </FormControl>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <FormControl>
          <Flex align="center" mb={3}>
            <FaBed color="gray" size={16} />
            <FormLabel ml={2} mb={0} fontWeight="semibold" color="gray.700">
              Room Number
            </FormLabel>
          </Flex>
          <Input
            name="roomNumber"
            placeholder="e.g., 101, 205A"
            value={form.roomNumber}
            onChange={handleChange}
            bg="gray.50"
            border="1px"
            borderColor={borderColor}
            focusBorderColor="blue.400"
            _hover={{ borderColor: "blue.300" }}
            size="lg"
            borderRadius="lg"
          />
        </FormControl>

        <FormControl>
          <Flex align="center" mb={3}>
            <FaMapMarkerAlt color="gray" size={16} />
            <FormLabel ml={2} mb={0} fontWeight="semibold" color="gray.700">
              Location/Area
            </FormLabel>
          </Flex>
          <Input
            name="location"
            placeholder="e.g., Lobby, Restaurant, Parking"
            value={form.location}
            onChange={handleChange}
            bg="gray.50"
            border="1px"
            borderColor={borderColor}
            focusBorderColor="blue.400"
            _hover={{ borderColor: "blue.300" }}
            size="lg"
            borderRadius="lg"
          />
          <FormHelperText mt={2} fontSize="sm" color="gray.500">
            <Flex align="center">
              <WarningIcon mr={2} />
              Please specify either a room number or location (or both)
            </Flex>
          </FormHelperText>
        </FormControl>
      </SimpleGrid>

      <FormControl>
        <Flex align="center" mb={3}>
          <FaFileImage color="gray" size={16} />
          <FormLabel ml={2} mb={0} fontWeight="semibold" color="gray.700">
            Supporting Images (Optional)
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
            focusBorderColor="blue.400"
            _hover={{ borderColor: "blue.300" }}
            borderRadius="lg"
            pl={10}
            pt={2}
          />
        </InputGroup>
        <FormHelperText>
          Upload photos to provide visual context (up to 5 images)
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
          colorScheme="blue"
          size="lg"
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
          transition="all 0.2s"
          py={6}
          fontSize="md"
          fontWeight="bold"
        >
          {isLoading ? 'Submitting Report...' : 'Submit Issue Report'}
        </Button>
      </Box>
    </Stack>
  );

  if (showHeader) {
    return (
      <Box bg={bgColor} minH="100vh" p={6}>
        <Box maxW="800px" mx="auto">
          {/* Header */}
          <Box mb={8}>
            <Flex align="center" mb={2}>
              <FaTools color="blue" size={24} />
              <Box fontSize="xl" fontWeight="bold" ml={3} color="gray.700">
                Report an Issue
              </Box>
            </Flex>
            <Text color="gray.600" fontSize="md">
              Log maintenance issues and operational problems for quick resolution
            </Text>
          </Box>

          {/* Main Form Card */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl" border="1px" borderColor={borderColor}>
            <CardBody p={8}>
              {formContent}
            </CardBody>
          </Card>

          {/* Process Info */}
          <Card bg="green.50" borderRadius="xl" mt={6}>
            <CardBody p={6}>
              <Flex align="center" mb={3}>
                <CheckCircleIcon color="green.500" />
                <Text ml={2} fontWeight="semibold" color="green.700">
                  Issue Resolution Process
                </Text>
              </Flex>
              <Stack spacing={2} fontSize="sm" color="green.600">
                <Text>• Issues are automatically assigned to appropriate teams</Text>
                <Text>• High-priority issues receive immediate attention</Text>
                <Text>• You'll receive updates on the resolution progress</Text>
                <Text>• All staff reports help improve our service quality</Text>
              </Stack>
            </CardBody>
          </Card>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={0}>
      {formContent}
    </Box>
  );
};

export default StaffIssueForm;