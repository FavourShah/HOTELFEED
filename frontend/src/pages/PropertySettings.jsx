import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Card,
  CardBody,
  Text,
  Divider,
  Image,
  IconButton,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
  Container,
  Flex,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Tooltip,
  FormErrorMessage,
  Center,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Code,
} from '@chakra-ui/react';
import { 
  EditIcon, 
  CheckIcon, 
  CloseIcon, 
  SettingsIcon,
  AttachmentIcon,
  DeleteIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import useAuthStore from '../store/useAuthStore';
import usePropertyStore from '../store/usePropertyStore';

const PropertySettings = () => {
  const { token, user } = useAuthStore();
  const { property, loading, fetchProperty, updateProperty, uploadLogo, deleteLogo } = usePropertyStore();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();

  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Property data:', property);
    console.log('🔍 Logo URL:', property?.logoUrl);
  console.log('🔍 Full logo URL would be:', property?.logoUrl || 'No URL');

  }, [property]);

  // Initialize form data when property loads
  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || ''
      });
    }
  }, [property]);

  // Fetch property on component mount
  useEffect(() => {
    if (token) {
      fetchProperty(token);
    }
  }, [token, fetchProperty]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Property name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Property name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Property name must be less than 100 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before saving',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setSaving(true);
    
    try {
      const updateData = {
        name: formData.name.trim()
      };
      
      await updateProperty(token, updateData);
      
      toast({
        title: 'Success!',
        description: 'Property settings updated successfully',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      
      setIsEditing(false);
      
    } catch (error) {
      console.error('Update failed:', error);
      
      let errorMessage = 'Failed to update property settings';
      let errorTitle = 'Update Failed';
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;
        
        switch (status) {
          case 400:
            errorTitle = 'Invalid Request';
            errorMessage = serverMessage || 'The data you provided is invalid. Please check your inputs.';
            break;
          case 401:
            errorTitle = 'Authentication Failed';
            errorMessage = 'You are not authorized to perform this action. Please log in again.';
            break;
          case 403:
            errorTitle = 'Access Forbidden';
            errorMessage = 'You do not have permission to update property settings.';
            break;
          case 404:
            errorTitle = 'Property Not Found';
            errorMessage = 'The property could not be found. Please refresh the page and try again.';
            break;
          case 422:
            errorTitle = 'Validation Error';
            errorMessage = serverMessage || 'The provided data failed server validation.';
            break;
          case 500:
            errorTitle = 'Server Error';
            errorMessage = 'A server error occurred. Please try again later.';
            break;
          default:
            errorMessage = serverMessage || `Server error (${status}). Please try again.`;
        }
      } else if (error.request) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else {
        errorTitle = 'Unexpected Error';
        errorMessage = error.message || 'An unexpected error occurred.';
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
      
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: property?.name || ''
    });
    setFormErrors({});
    setIsEditing(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('📁 File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
      });

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file (PNG, JPG, etc.)',
          status: 'error',
          duration: 4000,
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 5MB',
          status: 'error',
          duration: 4000,
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('📷 Preview image created');
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      handleLogoUpload(file);
    }
  };

  const handleLogoUpload = async (file) => {
    setUploading(true);
    console.log('⬆️ Starting upload for file:', file.name);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const result = await uploadLogo(token, formData);
      console.log('✅ Upload successful:', result);
      
      toast({
        title: 'Logo Uploaded!',
        description: 'Your property logo has been updated successfully',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      
      setPreviewImage(null);
      setImageLoadError(false);
      
    } catch (error) {
      console.error('❌ Logo upload failed:', error);
      
      let errorMessage = 'Failed to upload logo';
      let errorTitle = 'Upload Failed';
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        switch (status) {
          case 400:
            errorTitle = 'Invalid File';
            errorMessage = serverMessage || 'The file you selected is not valid.';
            break;
          case 413:
            errorTitle = 'File Too Large';
            errorMessage = 'The file is too large. Please select a smaller image.';
            break;
          default:
            errorMessage = serverMessage || 'An error occurred while uploading the logo.';
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
      
      setPreviewImage(null);
    } finally {
      setUploading(false);
    }
  };

  const handleLogoDelete = async () => {
    try {
      await deleteLogo(token);
      
      toast({
        title: 'Logo Removed',
        description: 'Your property logo has been removed',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      
      setImageLoadError(false);
      
    } catch (error) {
      console.error('Logo delete failed:', error);
      
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to remove logo',
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const handleImageError = (e) => {
    console.error('🖼️ Image failed to load:', e.target.src);
    setImageLoadError(true);
  };

  const handleImageLoad = (e) => {
    console.log('✅ Image loaded successfully:', e.target.src);
    setImageLoadError(false);
  };

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <Flex minH="400px" justify="center" align="center">
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
            <Text color={textColor} fontSize="lg" fontWeight="medium">
              Loading Property Settings...
            </Text>
          </VStack>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        
{/* Header */}
<Card bg={cardBg} shadow="md" borderRadius="xl">
  <Box bg="linear-gradient(135deg, #48BB78 0%, #38A169 100%)" p={6} borderTopRadius="xl">
    <HStack justify="space-between" align="center" color="white">
      <HStack spacing={4}>
        <Box p={3} bg="whiteAlpha.200" borderRadius="lg">
          <SettingsIcon boxSize={6} />
        </Box>
        <VStack align="start" spacing={1}>
          <Heading size="lg" fontWeight="bold">Property Settings</Heading>
          <Text opacity={0.9}>
            Manage your property information and branding
          </Text>
        </VStack>
      </HStack>
      {/* Role badge removed */}
    </HStack>
  </Box>
</Card>

        {/* Status Cards */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardBody>
              <Stat>
                <StatLabel color="gray.500">Property Status</StatLabel>
                <StatNumber>
                  <Badge colorScheme={property?.name ? 'green' : 'orange'} size="lg">
                    {property?.name ? 'Configured' : 'Pending Setup'}
                  </Badge>
                </StatNumber>
                <StatHelpText>
                  {property?.name ? 'Ready for use' : 'Requires configuration'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="md" borderRadius="xl">
            <CardBody>
              <Stat>
                <StatLabel color="gray.500">Logo Status</StatLabel>
                <StatNumber>
                  <Badge colorScheme={property?.logoUrl ? 'green' : 'gray'} size="lg">
                    {property?.logoUrl ? 'Custom Logo' : 'Default Branding'}
                  </Badge>
                </StatNumber>
                <StatHelpText>
                  Last updated: {property?.updatedAt ? new Date(property.updatedAt).toLocaleDateString() : 'Never'}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Property Information */}
        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Section Header */}
             <HStack justify="space-between" align="center" flexWrap={{ base: "wrap", sm: "nowrap" }}>
        <HStack spacing={3} mb={{ base: 3, sm: 0 }}>
          <EditIcon color="green.500" boxSize={5} />
          <Text fontWeight="600" color={textColor} fontSize="lg">
            Property Information
          </Text>
        </HStack>

        {!isEditing ? (
          <Button
            leftIcon={<EditIcon />}
            colorScheme="green"
            variant="solid"
            onClick={() => setIsEditing(true)}
            size="md"
            w={{ base: "full", sm: "auto" }}
          >
            Edit Settings
          </Button>
        ) : (
          <VStack
            spacing={3}
            align={{ base: "stretch", sm: "center" }}
            w={{ base: "full", sm: "auto" }}
          >
            <Button
              leftIcon={<CheckIcon />}
              colorScheme="green"
              onClick={handleSave}
              isLoading={saving}
              loadingText="Saving..."
              size="md"
              w={{ base: "full", sm: "auto" }}
            >
              Save Changes
            </Button>
            <Button
              leftIcon={<CloseIcon />}
              variant="outline"
              onClick={handleCancel}
              isDisabled={saving}
              size="md"
              w={{ base: "full", sm: "auto" }}
            >
              Cancel
            </Button>
          </VStack>
        )}
      </HStack>


              <Divider />

              {/* Property Name */}
              <FormControl isRequired isInvalid={!!formErrors.name}>
                <FormLabel fontWeight="500" color={textColor}>
                  Property Name
                </FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement>
                    <AttachmentIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your property name"
                    isReadOnly={!isEditing}
                    bg={isEditing ? 'white' : 'gray.50'}
                    borderRadius="lg"
                    _focus={{ 
                      borderColor: 'blue.400', 
                      boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.1)' 
                    }}
                  />
                  {isEditing && (
                    <InputRightElement>
                      <Text fontSize="xs" color="gray.400">
                        {formData.name.length}/100
                      </Text>
                    </InputRightElement>
                  )}
                </InputGroup>
                {formErrors.name && <FormErrorMessage>{formErrors.name}</FormErrorMessage>}
                <Text fontSize="sm" color="gray.500" mt={2}>
                  This name appears throughout your system interface
                </Text>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Logo Management */}
        <Card bg={cardBg} shadow="md" borderRadius="xl">
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Section Header */}
              <HStack spacing={3}>
                <Text fontWeight="600" color={textColor} fontSize="lg">
                  Property Logo
                </Text>
              </HStack>

              <Divider />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                {/* Current Logo Display */}
                <VStack spacing={4}>
                  <Text fontWeight="500" color={textColor} alignSelf="start">
                    Current Logo
                  </Text>
                  
                  <Box
                    w="full"
                    maxW="400px"
                    minH="200px"
                    border="2px dashed"
                    borderColor={borderColor}
                    borderRadius="lg"
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    p={4}
                  >
                    {property?.logoUrl ? (
                      <>
                        {imageLoadError ? (
                          <VStack spacing={2} color="red.400">
                            <Text fontSize="sm">❌ Failed to load image</Text>
                            <Code fontSize="xs">{property.logoUrl}</Code>
                            <Button size="xs" onClick={() => window.open(property.logoUrl, '_blank')
}>
                              Test URL
                            </Button>
                          </VStack>
                        ) : (
                          <Image
                            src={property.logoUrl}
                            alt="Property Logo"
                            maxH="300px"
                            maxW="100%"
                            objectFit="contain"
                            borderRadius="lg"
                            cursor="pointer"
                            onClick={onPreviewOpen}
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                            _hover={{ transform: 'scale(1.02)', transition: '0.2s' }}
                          />
                        )}
                      </>
                    ) : (
                      <VStack spacing={2} color="gray.400">
                        <Text fontSize="sm">No logo uploaded</Text>
                      </VStack>
                    )}
                  </Box>
                  
                  {property?.logoUrl && (
                    <HStack spacing={2}>
                      <Tooltip label="Preview Logo">
                        <IconButton
                          icon={<ViewIcon />}
                          size="sm"
                          variant="outline"
                          colorScheme="blue"
                          onClick={onPreviewOpen}
                        />
                      </Tooltip>
                      <Tooltip label="Test URL">
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="purple"
                          onClick={() => window.open(`${window.location.origin}${property.logoUrl}`, '_blank')}
                        >
                          Test
                        </Button>
                      </Tooltip>
                      <Tooltip label="Remove Logo">
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          onClick={handleLogoDelete}
                        />
                      </Tooltip>
                    </HStack>
                  )}
                </VStack>

                {/* Upload Section */}
                <VStack spacing={4} align="stretch">
                  <Text fontWeight="500" color={textColor}>
                    Upload New Logo
                  </Text>
                  
                  {previewImage && (
                    <Box
                      w="full"
                      maxW="300px"
                      border="2px solid"
                      borderColor="blue.200"
                      borderRadius="lg"
                      p={2}
                      bg="white"
                    >
                      <Image
                        src={previewImage}
                        alt="Preview"
                        maxH="200px"
                        maxW="100%"
                        objectFit="contain"
                        borderRadius="md"
                      />
                    </Box>
                  )}

                  <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={uploading}
                    loadingText="Uploading..."
                    size="lg"
                  >
                    Choose Logo File
                  </Button>

                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    display="none"
                  />

                  <VStack spacing={1} align="start">
                    <Text fontSize="sm" color="gray.500">
                      • Supported formats: PNG, JPG, GIF
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      • Maximum file size: 5MB
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      • Recommended: Square format for best results
                    </Text>
                  </VStack>
                </VStack>
              </SimpleGrid>

              {/* Warning for system-wide changes */}
              {(isEditing || uploading) && (
                <Alert status="info" borderRadius="lg" bg="blue.50" borderColor="blue.200">
                  <AlertIcon color="blue.500" />
                  <AlertDescription fontSize="sm" color="blue.700">
                    Changes will be visible to all users across the platform immediately.
                  </AlertDescription>
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Logo Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Logo Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center p={4} minH="300px">
              {property?.logoUrl && (
                <Image
                  src={property.logoUrl}
                  alt="Property Logo Preview"
                  maxH="500px"
                  maxW="100%"
                  objectFit="contain"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              )}
            </Center>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onPreviewClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PropertySettings;