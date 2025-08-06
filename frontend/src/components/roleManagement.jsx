import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  IconButton,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Container,
  Card,
  CardBody,
  useColorModeValue,
  Badge,
  Flex,
  Avatar,
  Divider,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  Select,
  ButtonGroup,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon, AddIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import axios from '../utils/axiosInstance';
import useAuthStore from "../store/useAuthStore";

// Components
const LoadingSpinner = ({ textColor }) => (
  <Center py={20}>
    <VStack spacing={4}>
      <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
      <Text color={textColor} fontSize="lg">Loading roles...</Text>
    </VStack>
  </Center>
);

const PageHeader = ({ rolesCount, filteredCount, cardBg, textColor }) => (
  <Card bg={cardBg} shadow="sm" borderRadius="xl">
    <CardBody>
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <HStack spacing={3}>
            <Avatar 
              size="md" 
              bg="purple.500" 
            
            />
            <VStack align="start" spacing={0}>
              <Heading size="lg" color={textColor}>Role Management</Heading>
              <Text color="gray.500" fontSize="sm">
                {filteredCount} of {rolesCount} {rolesCount === 1 ? 'role' : 'roles'} displayed
              </Text>
            </VStack>
          </HStack>
        </VStack>
        <Badge 
          colorScheme="purple" 
          variant="subtle" 
          borderRadius="full" 
          px={3} 
          py={1}
          fontSize="sm"
        >
          <HStack spacing={1}>
            <Text>{rolesCount} {rolesCount === 1 ? 'role' : 'roles'}</Text>
          </HStack>
        </Badge>
      </Flex>
    </CardBody>
  </Card>
);

const AddRoleCard = ({ newRole, setNewRole, onAdd, cardBg, borderColor }) => (
  <Card bg={cardBg} shadow="sm" borderRadius="xl" borderWidth="2px" borderStyle="dashed" borderColor={borderColor}>
    <CardBody>
      <VStack spacing={4} align="stretch">
        <HStack spacing={3}>
          <Avatar 
            size="sm" 
            bg="green.500" 
            icon={<AddIcon color="white" boxSize={3} />}
          />
          <Text fontWeight="600" color="gray.700">Add New Role</Text>
        </HStack>
        <FormControl>
          <InputGroup>
            <Input
              placeholder="Enter role name (e.g., Manager, Receptionist)"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              borderRadius="lg"
              _focus={{ borderColor: "green.400", boxShadow: "0 0 0 1px #48BB78" }}
              onKeyPress={(e) => e.key === 'Enter' && onAdd()}
            />
            <InputRightElement>
              <Button
                size="sm"
                colorScheme="green"
                onClick={onAdd}
                borderRadius="md"
                isDisabled={!newRole.trim()}
              >
                Add
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
      </VStack>
    </CardBody>
  </Card>
);

const RoleCard = ({ role, onEdit, onDelete, cardBg, textColor, borderColor }) => {
  const isProtected = role.name.toLowerCase() === "it";
  
  return (
    <Card 
      bg={cardBg} 
      shadow="sm" 
      borderRadius="xl" 
      borderWidth="1px"
      borderColor={borderColor}
      _hover={{ shadow: "md", transform: "translateY(-1px)" }}
      transition="all 0.2s"
    >
      <CardBody>
        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Avatar 
              size="md" 
              name={role.name}
              bg={isProtected ? "red.500" : "blue.500"}
              color="white"
            />
            <VStack align="start" spacing={0}>
              <HStack spacing={2}>
                <Text fontWeight="600" color={textColor} fontSize="lg">
                  {role.name}
                </Text>
                {isProtected && (
                  <Badge 
                    colorScheme="red" 
                    variant="subtle" 
                    size="sm"
                    borderRadius="full"
                    px={2}
                  >
                    Protected
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
          
          <HStack spacing={2}>
            <IconButton
              icon={<EditIcon />}
              size="sm"
              variant="ghost"
              colorScheme="blue"
              onClick={() => onEdit(role)}
              aria-label="Edit role"
              isDisabled={isProtected}
              borderRadius="full"
              _hover={{ bg: "blue.50" }}
            />
            <IconButton
              icon={<DeleteIcon />}
              size="sm"
              variant="ghost"
              colorScheme="red"
              onClick={() => onDelete(role)}
              aria-label="Delete role"
              isDisabled={isProtected}
              borderRadius="full"
              _hover={{ bg: "red.50" }}
            />
          </HStack>
        </Flex>
      </CardBody>
    </Card>
  );
};

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
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} roles
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

const RoleManagement = () => {
  const toast = useToast();
  const { token } = useAuthStore();
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const cancelRef = useRef();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // State
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [editingRole, setEditingRole] = useState(null);
  const [editedValue, setEditedValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination calculations
  const totalPages = Math.ceil(roles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageRoles = roles.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Disclosures
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  useEffect(() => {
    fetchRoles();
  }, []);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [roles.length]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/role", config);
      setRoles(res.data);
    } catch {
      toast({ 
        title: "Failed to fetch roles", 
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    const trimmed = newRole.trim();
    if (!trimmed) return;

    try {
      const res = await axios.post("/api/role", { name: trimmed }, config);
      setRoles((prev) => [...prev, res.data]);
      setNewRole("");
      toast({ 
        title: "Role added successfully", 
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      toast({
        title: "Failed to add role",
        description: err.response?.data?.message || "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleEdit = (role) => {
    if (role.name.toLowerCase() === "it") {
      return toast({
        title: "Cannot edit IT role",
        description: "The IT role is protected and cannot be edited.",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
    }
    setEditingRole(role);
    setEditedValue(role.name);
    onEditOpen();
  };

  const saveEdit = async () => {
    const trimmed = editedValue.trim();
    if (!trimmed) return;

    try {
      const res = await axios.put(`/api/role/${editingRole._id}`, { name: trimmed }, config);
      setRoles((prev) =>
        prev.map((r) => (r._id === res.data.role._id ? res.data.role : r))
      );
      toast({ 
        title: "Role updated successfully", 
        status: "success",
        duration: 3000,
        isClosable: true
      });
      onEditClose();
    } catch (err) {
      toast({
        title: "Failed to update role",
        description: err.response?.data?.message || "Unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleDeleteClick = (role) => {
    if (role.name.toLowerCase() === "it") {
      return toast({
        title: "Cannot delete IT role",
        description: "The IT role is required and cannot be deleted.",
        status: "warning",
        duration: 4000,
        isClosable: true
      });
    }
    setDeleteTarget(role);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/role/${deleteTarget._id}`, config);
      setRoles((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      toast({ 
        title: "Role deleted successfully", 
        status: "info",
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      toast({
        title: "Failed to delete role",
        description: err.response?.data?.message || "Role may still be assigned to staff members.",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    } finally {
      setDeleteTarget(null);
      onDeleteClose();
    }
  };

  if (loading) {
    return (
      <Container maxW="4xl" py={8} bg={bgColor} minH="100vh">
        <LoadingSpinner textColor={textColor} />
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        <PageHeader 
          rolesCount={roles.length}
          filteredCount={currentPageRoles.length}
          cardBg={cardBg}
          textColor={textColor}
        />

        <AddRoleCard 
          newRole={newRole}
          setNewRole={setNewRole}
          onAdd={handleAddRole}
          cardBg={cardBg}
          borderColor={borderColor}
        />

        {roles.length > 0 && (
          <>
            <Divider />
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="600" color={textColor}>
                Existing Roles ({roles.length})
              </Text>
              {currentPageRoles.map((role) => (
                <RoleCard
                  key={role._id}
                  role={role}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  cardBg={cardBg}
                  textColor={textColor}
                  borderColor={borderColor}
                />
              ))}
            </VStack>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={roles.length}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              borderColor={borderColor}
            />
          </>
        )}

        {roles.length === 0 && !loading && (
          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody py={12} textAlign="center">
              <VStack spacing={4}>
                <Avatar size="xl" bg="gray.200"  />
                <VStack spacing={2}>
                  <Text color="gray.500" fontSize="lg">No roles found</Text>
                  <Text color="gray.400" fontSize="sm">
                    Create your first role to get started
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
            Edit Role
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <FormControl>
              <FormLabel>Role Name</FormLabel>
              <Input
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                placeholder="Enter role name"
                borderRadius="lg"
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
            <Button onClick={onEditClose} variant="ghost" borderRadius="lg">
              Cancel
            </Button>
            <Button 
              onClick={saveEdit} 
              colorScheme="blue" 
              ml={3} 
              borderRadius="lg"
              isDisabled={!editedValue.trim()}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm Delete Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(10px)" />
        <AlertDialogContent borderRadius="xl" mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold" borderBottomWidth="1px" borderColor={borderColor}>
            Delete Role
          </AlertDialogHeader>

          <AlertDialogBody py={6}>
            <VStack spacing={4} align="start">
              <Text>
                Are you sure you want to delete the role <strong>"{deleteTarget?.name}"</strong>?
              </Text>
              <Box bg="red.50" p={3} borderRadius="lg" width="full">
                <Text fontSize="sm" color="red.600">
                  <strong>Warning:</strong> This action cannot be undone. If this role is assigned to staff members, the deletion may fail.
                </Text>
              </Box>
            </VStack>
          </AlertDialogBody>

          <AlertDialogFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
            <Button ref={cancelRef} onClick={onDeleteClose} borderRadius="lg">
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={confirmDelete} 
              ml={3} 
              borderRadius="lg"
            >
              Delete Role
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

export default RoleManagement;