import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  Select,
  useToast,
  VStack,
  HStack,
  InputGroup,
  InputRightElement,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Spinner,
  Text,
  Badge,
  Card,
  CardBody,
  Flex,
  Avatar,
  useColorModeValue,
  Container,
  ButtonGroup,
  Tooltip,
} from "@chakra-ui/react";
import { 
  ViewIcon, 
  ViewOffIcon, 
  EditIcon, 
  DeleteIcon, 
  AddIcon, 
  EmailIcon, 
  PhoneIcon,
  DownloadIcon,
  CheckCircleIcon,
  ChevronLeftIcon, 
  ChevronRightIcon,
  LockIcon,
} from "@chakra-ui/icons";
import axios from '../utils/axiosInstance';
import useAuthStore from "../store/useAuthStore";
import usePropertyStore from "../store/usePropertyStore";
import { exportToPDF } from "../utils/exportToPDF"; 

// Constants
const INITIAL_FORM_DATA = {
  fullName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  department: "",
};

const ROLE_COLORS = {
  admin: "purple",
  it: "blue",
  supervisor: "teal",
  housekeeper: "green",
  maintenance: "orange",
  security: "red",
};

// Protected roles that cannot be edited or deleted
const PROTECTED_ROLES = ["it", "supervisor"];

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getRoleColor = (role) => {
  return ROLE_COLORS[role?.toLowerCase()] || "gray";
};

const isProtectedRole = (role) => {
  return PROTECTED_ROLES.includes(role?.toLowerCase());
};

// Components
const LoadingSpinner = ({ textColor }) => (
  <Container maxW="8xl" py={8}>
    <Flex minH="400px" justify="center" align="center">
      <VStack spacing={4}>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
        <Text color={textColor} fontSize="lg">Loading staff...</Text>
      </VStack>
    </Flex>
  </Container>
);

const PageHeader = ({ staffCount, filteredCount, onAddClick, cardBg, textColor, staffList, property }) => (
  <Card bg={cardBg} shadow="sm" borderRadius="xl">
    <CardBody>
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={textColor}>Staff Management</Heading>
          <Text color="gray.500" fontSize="sm">
            {filteredCount} of {staffCount} {staffCount === 1 ? 'staff member' : 'staff members'} displayed
          </Text>
        </VStack>
        
      <Stack
  direction={["column", "row"]}
  spacing={3}
  w="full"
>
  <Button
    w={["full", "auto"]}
    onClick={onAddClick}
    leftIcon={<AddIcon />}
    colorScheme="green"
    variant="solid"
    borderRadius="lg"
    size="md"
    _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
  >
    Add Staff Member
  </Button>
  <Button
    w={["full", "auto"]}
    onClick={() => exportToPDF({
      title: "Staff Report",
      data: staffList,
      type: "staff",
      property: property,
    })}
    leftIcon={<DownloadIcon />}
    colorScheme="green"
    variant="solid"
    borderRadius="lg"
    size="md"
    _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
  >
    Export Staff PDF
  </Button>
</Stack>

      </Flex>
    </CardBody>
  </Card>
);

const StaffTableRow = ({ staff, onEdit, onDelete, borderColor, textColor }) => {
  const isProtected = isProtectedRole(staff.role);
  
  return (
    <Tr _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
      <Td borderColor={borderColor} py={4}>
        <HStack spacing={3}>
          <Avatar 
            size="md" 
            name={staff.fullName}
            bg={`${getRoleColor(staff.role)}.500`}
            color="white"
          />
          <VStack align="start" spacing={0}>
            <HStack spacing={2}>
              <Text fontWeight="600" color={textColor}>
                {staff.fullName}
              </Text>
              {isProtected && (
                <LockIcon color="gray.400" boxSize={3} />
              )}
            </HStack>
            <Text fontSize="sm" color="gray.500">
              @{staff.username}
            </Text>
          </VStack>
        </HStack>
      </Td>
      
      <Td borderColor={borderColor} py={4}>
        <VStack align="start" spacing={2}>
          <HStack spacing={2}>
            <EmailIcon color="gray.400" boxSize={3} />
            <Text fontSize="sm" color={textColor}>
              {staff.email}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <PhoneIcon color="gray.400" boxSize={3} />
            <Text fontSize="sm" color={textColor}>
              {staff.phone}
            </Text>
          </HStack>
        </VStack>
      </Td>
      
      <Td borderColor={borderColor} py={4}>
        <VStack align="start" spacing={2}>
          <Badge
            colorScheme={getRoleColor(staff.role)}
            variant="solid"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            textTransform="capitalize"
          >
            {staff.role}
            {isProtected && <LockIcon ml={1} boxSize={2} />}
          </Badge>
          <Text fontSize="sm" color="gray.500">
            {staff.department?.name || "No department"}
          </Text>
        </VStack>
      </Td>
      
      <Td borderColor={borderColor} py={4}>
        <HStack spacing={2}>
          <Tooltip 
            label={isProtected ? `${staff.role} role is protected and cannot be edited` : "Edit staff member"}
            hasArrow
          >
            <IconButton
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              colorScheme={isProtected ? "gray" : "blue"}
              borderRadius="full"
              onClick={() => onEdit(staff)}
              isDisabled={isProtected}
              _hover={isProtected ? {} : { bg: "blue.50" }}
              opacity={isProtected ? 0.4 : 1}
              cursor={isProtected ? "not-allowed" : "pointer"}
            />
          </Tooltip>
          <Tooltip 
            label={isProtected ? `${staff.role} role is protected and cannot be deleted` : "Delete staff member"}
            hasArrow
          >
            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              colorScheme={isProtected ? "gray" : "red"}
              borderRadius="full"
              onClick={() => onDelete(staff._id)}
              isDisabled={isProtected}
              _hover={isProtected ? {} : { bg: "red.50" }}
              opacity={isProtected ? 0.4 : 1}
              cursor={isProtected ? "not-allowed" : "pointer"}
            />
          </Tooltip>
        </HStack>
      </Td>
    </Tr>
  );
};

const StaffTable = ({ currentPageStaff, onEdit, onDelete, cardBg, borderColor, textColor }) => (
<Card bg={cardBg} shadow="sm" borderRadius="xl" overflow="hidden">
  <Box overflowX="auto">
    <Table variant="simple" minWidth="800px">
      <Thead bg={useColorModeValue("gray.50", "gray.700")}>
        <Tr>
          <Th borderColor={borderColor} py={4} fontSize="sm" fontWeight="600">Staff Member</Th>
          <Th borderColor={borderColor} py={4} fontSize="sm" fontWeight="600">Contact</Th>
          <Th borderColor={borderColor} py={4} fontSize="sm" fontWeight="600">Role & Department</Th>
          <Th borderColor={borderColor} py={4} fontSize="sm" fontWeight="600">Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {currentPageStaff.map((staff) => (
          <StaffTableRow 
            key={staff._id}
            staff={staff}
            onEdit={onEdit}
            onDelete={onDelete}
            borderColor={borderColor}
            textColor={textColor}
          />
        ))}
      </Tbody>
    </Table>
  </Box>
  
  {currentPageStaff.length === 0 && (
    <Box py={12} textAlign="center">
      <Text color="gray.500" fontSize="lg">No staff members found</Text>
      <Text color="gray.400" fontSize="sm" mt={2}>
        Click "Add Staff Member" to register your first staff member
      </Text>
    </Box>
  )}
</Card>

);

const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  totalItems,
  startIndex,
  endIndex,
  onPageChange, 
  onItemsPerPageChange,
  borderColor 
}) => (
  <Card bg={useColorModeValue("white", "gray.800")} shadow="sm" borderRadius="xl">
    <CardBody>
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <HStack spacing={2}>
          <Text fontSize="sm" color="gray.500">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} staff members
          </Text>
          <Select
            size="sm"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            width="100px"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </Select>
        </HStack>

        {totalPages > 1 && (
          <ButtonGroup size="sm" isAttached variant="outline">
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              isDisabled={currentPage === 1}
              aria-label="Previous page"
            />
            
            {/* Page numbers */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  isActive={currentPage === pageNum}
                  _active={{ bg: "blue.500", color: "white" }}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            <IconButton
              icon={<ChevronRightIcon />}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              isDisabled={currentPage === totalPages}
              aria-label="Next page"
            />
          </ButtonGroup>
        )}
      </Flex>
    </CardBody>
  </Card>
);

const FormSection = ({ title, children }) => (
  <Card variant="outline" borderRadius="lg">
    <CardBody>
      <Text fontWeight="600" mb={4}>{title}</Text>
      <VStack spacing={4}>
        {children}
      </VStack>
    </CardBody>
  </Card>
);

const StaffFormModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  setFormData, 
  showPassword, 
  setShowPassword,
  editingId,
  roles,
  usedRoles,
  departments,
  onSubmit,
  saving,
  borderColor,
  textColor 
}) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent borderRadius="xl" mx={4}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
          <Text>{editingId ? "Edit Staff Member" : "Add Staff Member"}</Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            {/* Personal Information Section */}
            <FormSection title="Personal Information">
              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="500">Full Name</FormLabel>
                <Input 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleChange}
                  borderRadius="lg"
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="500">Username</FormLabel>
                <Input 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange}
                  borderRadius="lg"
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                />
              </FormControl>
              
              <Flex gap={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="500">Email</FormLabel>
                  <Input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange}
                    borderRadius="lg"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="500">Phone</FormLabel>
                  <Input 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    borderRadius="lg"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                  />
                </FormControl>
              </Flex>
            </FormSection>
            
            {/* Role & Department Section */}
            <FormSection title="Role & Department">
              <Flex gap={4}>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="500">Role</FormLabel>
                  <Select
                    placeholder="Select role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    borderRadius="lg"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                  >
                    {roles.map((role) => {
                      const isUsed = usedRoles.includes(role.name);
                      const isEditingAndCurrentRole = editingId && formData.role === role.name;
                      const disabled = isUsed && !isEditingAndCurrentRole;

                      return (
                        <option key={role._id} value={role.name} disabled={disabled}>
                          {role.name} {disabled ? " (assigned)" : ""}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel color={textColor} fontWeight="500">Department</FormLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Select department"
                    borderRadius="lg"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                  >
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </Select>
                </FormControl>
              </Flex>
            </FormSection>
            
            {/* Security Section */}
            <FormSection title="Security">
              <FormControl isRequired={!editingId}>
                <FormLabel color={textColor} fontWeight="500">Password</FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={editingId ? "Leave blank to keep current password" : "Enter password"}
                    borderRadius="lg"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                  />
                  <InputRightElement width="3rem">
                    <IconButton
                      h="1.5rem"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      aria-label="Toggle password visibility"
                      variant="ghost"
                      borderRadius="full"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </FormSection>
          </VStack>
        </ModalBody>
        
        <ModalFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
          <Button 
            onClick={onSubmit} 
            colorScheme="green" 
            mr={3} 
            isLoading={saving}
            borderRadius="lg"
            loadingText="Saving..."
          >
            <CheckCircleIcon mr={2} />
            {editingId ? "Update Staff" : "Add Staff"}
          </Button>
          <Button 
            onClick={onClose} 
            isDisabled={saving}
            variant="ghost"
            borderRadius="lg"
          >
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, cancelRef, borderColor }) => (
  <AlertDialog
    isOpen={isOpen}
    leastDestructiveRef={cancelRef}
    onClose={onClose}
    isCentered
  >
    <AlertDialogOverlay backdropFilter="blur(10px)" />
    <AlertDialogContent borderRadius="xl" mx={4}>
      <AlertDialogHeader borderBottomWidth="1px" borderColor={borderColor}>
        <HStack>
          <DeleteIcon color="red.500" />
          <Text>Delete Staff Member</Text>
        </HStack>
      </AlertDialogHeader>
      <AlertDialogBody py={6}>
        <Text>Are you sure you want to delete this staff member? This action cannot be undone.</Text>
      </AlertDialogBody>
      <AlertDialogFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
        <Button ref={cancelRef} onClick={onClose} variant="ghost" borderRadius="lg">
          Cancel
        </Button>
        <Button colorScheme="red" onClick={onConfirm} ml={3} borderRadius="lg">
          Delete
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

// Main Component
const StaffManagementPage = () => {
  // All hooks must be called before any conditional returns
  const { token } = useAuthStore();
  const { property } = usePropertyStore();
  const toast = useToast();
  const cancelRef = React.useRef();

  // Color mode values - these are hooks and must be called unconditionally
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // Disclosures
  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  // State
  const [staffList, setStaffList] = useState([]);
  const [usedRoles, setUsedRoles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination calculations
  const totalPages = Math.ceil(staffList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageStaff = staffList.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Config
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // API Functions
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/auth/staff", config);
      const filtered = res.data.filter((user) => user.role !== "guest");
      setStaffList(filtered);
      setUsedRoles(filtered.map((user) => user.role));
    } catch {
      toast({ title: "Failed to load staff", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get("/api/role", config);
      setRoles(res.data);
    } catch {
      toast({ title: "Failed to load roles", status: "error", duration: 3000 });
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("/api/departments", config);
      setDepartments(res.data);
    } catch {
      toast({ title: "Failed to load departments", status: "error", duration: 3000 });
    }
  };

  // Form Handlers
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingId(null);
    setShowPassword(false);
  };

  const openAddForm = () => {
    resetForm();
    onFormOpen();
  };

  const handleEdit = (staff) => {
    // Prevent editing protected roles
    if (isProtectedRole(staff.role)) {
      toast({ 
        title: "Action not allowed", 
        description: `${staff.role} role is protected and cannot be edited`, 
        status: "warning", 
        duration: 3000 
      });
      return;
    }

    setEditingId(staff._id);
    setFormData({
      fullName: staff.fullName,
      username: staff.username,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department?._id || "",
      password: "",
    });
    setShowPassword(false);
    onFormOpen();
  };

  const validateForm = () => {
    const { fullName, username, email, phone, password, role, department } = formData;
    
    if (!fullName || !username || !email || !phone || (!editingId && !password) || !role || !department) {
      toast({ title: "All fields required", status: "warning", duration: 3000 });
      return false;
    }

    if (!editingId && usedRoles.includes(role)) {
      toast({ title: `Role '${role}' is already assigned`, status: "error", duration: 3000 });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (editingId) {
        await axios.put(`/api/auth/users/${editingId}`, formData, config);
        toast({ title: "Staff updated successfully!", status: "success", duration: 3000 });
      } else {
        await axios.post("/api/auth/register", formData, config);
        toast({ title: "Staff registered successfully!", status: "success", duration: 3000 });
      }
      
      fetchStaff();
      resetForm();
      onFormClose();
    } catch (err) {
      toast({ 
        title: "Error", 
        description: err.response?.data?.message, 
        status: "error", 
        duration: 4000 
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Handlers
  const confirmDelete = (id) => {
    // Find the staff member to check if it's a protected role
    const staff = staffList.find(s => s._id === id);
    if (staff && isProtectedRole(staff.role)) {
      toast({ 
        title: "Action not allowed", 
        description: `${staff.role} role is protected and cannot be deleted`, 
        status: "warning", 
        duration: 3000 
      });
      return;
    }

    setDeleteId(id);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/auth/users/${deleteId}`, config);
      toast({ title: "Staff deleted successfully", status: "info", duration: 3000 });
      fetchStaff();
      onDeleteClose();
    } catch {
      toast({ title: "Delete failed", status: "error", duration: 3000 });
    }
  };

  // Effects
  useEffect(() => {
    fetchStaff();
    fetchRoles();
    fetchDepartments();
  }, []);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [staffList.length]);

  // Render
  if (loading) {
    return <LoadingSpinner textColor={textColor} />;
  }

  return (
    <Container maxW="8xl" py={8} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        <PageHeader 
          staffCount={staffList.length}
          filteredCount={currentPageStaff.length}
          staffList={staffList} 
          onAddClick={openAddForm}
          cardBg={cardBg}
          textColor={textColor}
          property={property}
        />
        
        <StaffTable 
          currentPageStaff={currentPageStaff}
          onEdit={handleEdit}
          onDelete={confirmDelete}
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
        />

        {staffList.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={staffList.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            borderColor={borderColor}
          />
        )}
      </VStack>

      <StaffFormModal
        isOpen={isFormOpen}
        onClose={onFormClose}
        formData={formData}
        setFormData={setFormData}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        editingId={editingId}
        roles={roles}
        usedRoles={usedRoles}
        departments={departments}
        onSubmit={handleSubmit}
        saving={saving}
        borderColor={borderColor}
        textColor={textColor}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        cancelRef={cancelRef}
        borderColor={borderColor}
      />
    </Container>
  );
};

export default StaffManagementPage;