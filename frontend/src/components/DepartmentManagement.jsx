import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  HStack,
  useToast,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Spinner,
  Center,
  Container,
  useColorModeValue,
  Card,
  CardBody,
  Text,
  FormControl,
  FormLabel,
  Flex,
  Badge,
  Divider,
  Textarea,
  Select,
  ButtonGroup,
} from "@chakra-ui/react";
import { 
  EditIcon, 
  DeleteIcon, 
  AddIcon,
  CheckCircleIcon,
  InfoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";

import useAuthStore from "../store/useAuthStore";
import axios from '../utils/axiosInstance';

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Components
const LoadingSpinner = ({ textColor }) => (
  <Container maxW="6xl" py={8}>
    <Flex minH="400px" justify="center" align="center">
      <VStack spacing={4}>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="green.500" />
        <Text color={textColor} fontSize="lg">Loading departments...</Text>
      </VStack>
    </Flex>
  </Container>
);

const PageHeader = ({ departmentCount, onAddClick, cardBg, textColor }) => (
  <Card bg={cardBg} shadow="sm" borderRadius="xl">
    <CardBody>
      <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={textColor}>Department Management</Heading>
          <Text color="gray.500" fontSize="sm">
            {departmentCount} {departmentCount === 1 ? 'department' : 'departments'} configured
          </Text>
        </VStack>
        
        <Button
          onClick={onAddClick}
          leftIcon={<AddIcon />}
          colorScheme="green"
          variant="solid"
          borderRadius="lg"
          size="md"
          _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
        >
          Add Department
        </Button>
      </Flex>
    </CardBody>
  </Card>
);

const DepartmentCard = ({ dept, onEdit, onDelete, cardBg, textColor, borderColor }) => (
  <Card 
    bg={cardBg} 
    shadow="sm" 
    borderRadius="xl" 
    _hover={{ 
      shadow: "md", 
      transform: "translateY(-1px)",
      transition: "all 0.2s ease-in-out"
    }}
    transition="all 0.2s ease-in-out"
  >
    <CardBody p={6}>
      <Flex justify="space-between" align="start">
        <VStack align="start" spacing={3} flex="1">
          <HStack spacing={3} align="center">
            <Box
              w={3}
              h={3}
              borderRadius="full"
              bg="green.400"
            />
            <Text fontWeight="600" fontSize="lg" color={textColor}>
              {dept.name}
            </Text>
           
          </HStack>
          
          {dept.description && (
            <Text fontSize="sm" color="gray.500" lineHeight="1.5">
              {dept.description}
            </Text>
          )}
          
          <Divider borderColor={borderColor} />
          
         
        </VStack>
        
        <VStack spacing={2}>
          <IconButton
            icon={<EditIcon />}
            size="sm"
            variant="ghost"
            colorScheme="blue"
            borderRadius="full"
            onClick={() => onEdit(dept)}
            _hover={{ bg: "blue.50" }}
            aria-label="Edit department"
          />
          <IconButton
            icon={<DeleteIcon />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            borderRadius="full"
            onClick={() => onDelete(dept)}
            _hover={{ bg: "red.50" }}
            aria-label="Delete department"
          />
        </VStack>
      </Flex>
    </CardBody>
  </Card>
);

const DepartmentGrid = ({ departments, onEdit, onDelete, cardBg, textColor, borderColor }) => (
  <VStack spacing={4} align="stretch">
    {departments.length === 0 ? (
      <Card bg={cardBg} shadow="sm" borderRadius="xl">
        <CardBody py={12} textAlign="center">
          <VStack spacing={4}>
            <Box
              w={16}
              h={16}
              borderRadius="full"
              bg="gray.100"
              display="flex"
              align="center"
              justify="center"
            >
              <InfoIcon color="gray.400" boxSize={8} />
            </Box>
            <VStack spacing={2}>
              <Text color="gray.500" fontSize="lg" fontWeight="500">
                No departments found
              </Text>
              <Text color="gray.400" fontSize="sm">
                Click "Add Department" to create your first department
              </Text>
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    ) : (
      departments.map((dept) => (
        <DepartmentCard 
          key={dept._id}
          dept={dept}
          onEdit={onEdit}
          onDelete={onDelete}
          cardBg={cardBg}
          textColor={textColor}
          borderColor={borderColor}
        />
      ))
    )}
  </VStack>
);

const Pagination = ({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  borderColor 
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <Card shadow="sm" borderRadius="xl" overflow="hidden">
      <Box p={4} borderTopWidth="1px" borderColor={borderColor}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.500">
              Showing {startIndex + 1} to {endIndex} of {totalItems} departments
            </Text>
            <Select
              size="sm"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              width="120px"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </Select>
          </HStack>

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
                  _active={{ bg: "green.500", color: "white" }}
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
        </Flex>
      </Box>
    </Card>
  );
};

const FormSection = ({ title, children, borderColor }) => (
  <Card variant="outline" borderRadius="lg" borderColor={borderColor}>
    <CardBody>
      <Text fontWeight="600" mb={4}>{title}</Text>
      <VStack spacing={4}>
        {children}
      </VStack>
    </CardBody>
  </Card>
);

const DepartmentFormModal = ({ 
  isOpen, 
  onClose, 
  name,
  setName,
  description,
  setDescription,
  editingDept,
  onSubmit,
  saving,
  borderColor,
  textColor 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent borderRadius="xl" mx={4}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
          <Text>{editingDept ? "Edit Department" : "Add Department"}</Text>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody py={6}>
          <VStack spacing={5} align="stretch">
            {/* Department Information Section */}
            <FormSection title="Department Information" borderColor={borderColor}>
              <FormControl isRequired>
                <FormLabel color={textColor} fontWeight="500">Department Name</FormLabel>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Information Technology"
                  borderRadius="lg"
                  _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #48BB78" }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel color={textColor} fontWeight="500">Description</FormLabel>
                <Textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the department's responsibilities..."
                  borderRadius="lg"
                  rows={4}
                  _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #48BB78" }}
                />
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
            {editingDept ? "Update Department" : "Add Department"}
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

const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, cancelRef, deleteDept, borderColor }) => (
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
          <Text>Delete Department</Text>
        </HStack>
      </AlertDialogHeader>
      <AlertDialogBody py={6}>
        <Text>
          Are you sure you want to delete <strong>{deleteDept?.name}</strong>? 
          This action cannot be undone.
        </Text>
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
const DepartmentManagement = () => {
  // All hooks must be called before any conditional returns
  const { token } = useAuthStore();
  const toast = useToast();
  const cancelRef = useRef();

  // Color mode values
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
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingDept, setEditingDept] = useState(null);
  const [deleteDept, setDeleteDept] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Config
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Pagination calculations
  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageDepartments = departments.slice(startIndex, endIndex);

  // API Functions
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/departments", config);
      setDepartments(res.data);
    } catch {
      toast({ 
        title: "Failed to load departments", 
        status: "error",
        duration: 3000 
      });
    } finally {
      setLoading(false);
    }
  };

  // Form Handlers
  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingDept(null);
  };

  const openAddForm = () => {
    resetForm();
    onFormOpen();
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || "");
    onFormOpen();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ 
        title: "Department name is required", 
        status: "warning",
        duration: 3000 
      });
      return;
    }

    try {
      setSaving(true);
      if (editingDept) {
        const res = await axios.put(
          `/api/departments/${editingDept._id}`, 
          { name, description }, 
          config
        );
        setDepartments(departments.map((d) => (d._id === res.data._id ? res.data : d)));
        toast({ 
          title: "Department updated successfully!", 
          status: "success",
          duration: 3000 
        });
      } else {
        const res = await axios.post("/api/departments", { name, description }, config);
        setDepartments([...departments, res.data]);
        toast({ 
          title: "Department created successfully!", 
          status: "success",
          duration: 3000 
        });
      }

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
  const confirmDelete = (dept) => {
    setDeleteDept(dept);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/departments/${deleteDept._id}`, config);
      setDepartments(departments.filter((d) => d._id !== deleteDept._id));
      toast({ 
        title: "Department deleted successfully", 
        status: "info",
        duration: 3000 
      });
      onDeleteClose();
    } catch {
      toast({ 
        title: "Delete failed", 
        status: "error",
        duration: 3000 
      });
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Effects
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Reset pagination when departments change
  useEffect(() => {
    setCurrentPage(1);
  }, [departments.length]);

  // Render
  if (loading) {
    return <LoadingSpinner textColor={textColor} />;
  }

  return (
    <Container maxW="6xl" py={8} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        <PageHeader 
          departmentCount={departments.length}
          onAddClick={openAddForm}
          cardBg={cardBg}
          textColor={textColor}
        />
        
        <DepartmentGrid 
          departments={currentPageDepartments}
          onEdit={handleEdit}
          onDelete={confirmDelete}
          cardBg={cardBg}
          textColor={textColor}
          borderColor={borderColor}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={departments.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          borderColor={borderColor}
        />
      </VStack>

      <DepartmentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          resetForm();
          onFormClose();
        }}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        editingDept={editingDept}
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
        deleteDept={deleteDept}
        borderColor={borderColor}
      />
    </Container>
  );
};

export default DepartmentManagement;