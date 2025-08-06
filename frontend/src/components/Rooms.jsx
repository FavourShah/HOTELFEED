// RoomSettingsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Input,
  Button,
  VStack,
  HStack,
  Text,
  Select,
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
  SimpleGrid,
  Divider,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Card,
  CardBody,
  Badge,
  Flex,
  InputGroup,
  InputLeftElement,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, AddIcon, SearchIcon, WarningIcon } from "@chakra-ui/icons";
import { FaBed, FaBuilding, FaPlus } from "react-icons/fa";
import axios from '../utils/axiosInstance';
import useAuthStore from "../store/useAuthStore";

const RoomSettingsPage = () => {
  const { token } = useAuthStore();
  const toast = useToast();
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("");
  const [rooms, setRooms] = useState([]);
  const [types, setTypes] = useState([]);
  const [newType, setNewType] = useState("");
  const [editingType, setEditingType] = useState(null);
  const [editedTypeValue, setEditedTypeValue] = useState("");
  const [typeToDelete, setTypeToDelete] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null); // New state for room deletion
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [savingRoom, setSavingRoom] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingTypeEdit, setSavingTypeEdit] = useState(false);
  const [deletingTypeId, setDeletingTypeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    isOpen: isTypeOpen,
    onOpen: onTypeOpen,
    onClose: onTypeClose,
  } = useDisclosure();
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  // New disclosure for room deletion confirmation
  const {
    isOpen: isRoomDeleteOpen,
    onOpen: onRoomDeleteOpen,
    onClose: onRoomDeleteClose,
  } = useDisclosure();
  const cancelRef = React.useRef();
  const roomCancelRef = React.useRef(); // New ref for room deletion

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingRoom, setEditingRoom] = useState(null);
  const [editNumber, setEditNumber] = useState("");
  const [editType, setEditType] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingRooms(true);
        setLoadingTypes(true);
        const [roomRes, typeRes] = await Promise.all([
          axios.get("/api/rooms", config),
          axios.get("/api/room-types", config),
        ]);
        setRooms(roomRes.data);
        setTypes(typeRes.data);
      } catch {
        toast({ title: "Failed to load data", status: "error" });
      } finally {
        setLoadingRooms(false);
        setLoadingTypes(false);
      }
    };
    loadData();
  }, []);

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(room =>
    room.roomNumber.toString().includes(searchTerm.toLowerCase()) ||
    room.roomType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRoom = async () => {
    if (!roomNumber || !roomType) {
      return toast({ title: "Room number & type required", status: "warning" });
    }
    try {
      setSavingRoom(true);
      await axios.post("/api/rooms", { roomNumber, roomType }, config);
      setRoomNumber("");
      setRoomType("");
      const res = await axios.get("/api/rooms", config);
      setRooms(res.data);
      toast({ title: "Room added successfully", status: "success" });
    } catch (err) {
      toast({
        title: "Failed to add room",
        description: err.response?.data?.message,
        status: "error",
      });
    } finally {
      setSavingRoom(false);
    }
  };

  // Updated function to show confirmation modal and check room status
  const askDeleteRoom = (room) => {
    // Check if room has status properties indicating it's active/checked in
    // Adjust these property names based on your actual room object structure
    if (room.status === 'occupied' || room.status === 'active' || room.isOccupied || room.isActive || room.isCheckedIn) {
      toast({
        title: "Cannot delete room",
        description: `Room ${room.roomNumber} is currently occupied/active and cannot be deleted.`,
        status: "warning",
        duration: 5000,
      });
      return;
    }

    setRoomToDelete(room);
    onRoomDeleteOpen();
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      setDeletingRoomId(roomToDelete._id);
      await axios.delete(`/api/rooms/${roomToDelete._id}`, config);
      const res = await axios.get("/api/rooms", config);
      setRooms(res.data);
      toast({ 
        title: "Room deleted successfully", 
        status: "info",
        description: `Room ${roomToDelete.roomNumber} has been removed.`
      });
    } catch (error) {
      let errorMessage = "Error deleting room";
      
      // Handle specific error cases
      if (error.response?.status === 400 || error.response?.status === 409) {
        errorMessage = error.response?.data?.message || "Room cannot be deleted - it may be currently occupied or active.";
      } else {
        errorMessage = error.response?.data?.message || "An unexpected error occurred while deleting the room.";
      }
      
      toast({ 
        title: "Failed to delete room", 
        description: errorMessage,
        status: "error",
        duration: 6000
      });
    } finally {
      setDeletingRoomId(null);
      setRoomToDelete(null);
      onRoomDeleteClose();
    }
  };

  const handleEditClick = (room) => {
    setEditingRoom(room);
    setEditNumber(room.roomNumber);
    setEditType(room.roomType);
    onOpen();
  };

  const handleEditSave = async () => {
    try {
      setSavingEdit(true);
      await axios.put(
        `/api/rooms/${editingRoom._id}`,
        { roomNumber: editNumber, roomType: editType },
        config
      );
      onClose();
      const res = await axios.get("/api/rooms", config);
      setRooms(res.data);
      toast({ title: "Room updated successfully", status: "success" });
    } catch {
      toast({ title: "Failed to update room", status: "error" });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddType = async () => {
    const t = newType.trim().toLowerCase();
    if (!t) return toast({ title: "Type name required", status: "warning" });
    try {
      const res = await axios.post("/api/room-types", { name: t }, config);
      setTypes((prev) => [...prev, res.data]);
      setNewType("");
      toast({ title: `Room type "${t}" added successfully`, status: "success" });
    } catch (err) {
      toast({
        title: "Failed to add type",
        description: err.response?.data?.message,
        status: "error",
      });
    }
  };

  const handleEditType = (type) => {
    setEditingType(type);
    setEditedTypeValue(type.name);
  };

  const saveEditedType = async () => {
    try {
      setSavingTypeEdit(true);
      const res = await axios.put(
        `/api/room-types/${editingType._id}`,
        { name: editedTypeValue },
        config
      );
      setTypes((prev) =>
        prev.map((t) => (t._id === res.data.type._id ? res.data.type : t))
      );
      setEditingType(null);
      toast({ title: "Room type updated successfully", status: "success" });
    } catch {
      toast({ title: "Failed to update type", status: "error" });
    } finally {
      setSavingTypeEdit(false);
    }
  };

  const askDeleteType = (type) => {
    setTypeToDelete(type);
    onConfirmOpen();
  };

  const confirmDeleteType = async () => {
    try {
      setDeletingTypeId(typeToDelete._id);
      await axios.delete(`/api/room-types/${typeToDelete._id}`, config);
      setTypes((prev) => prev.filter((t) => t._id !== typeToDelete._id));
      toast({ title: "Room type deleted successfully", status: "info" });
    } catch {
      toast({ title: "Failed to delete type", status: "error" });
    } finally {
      setTypeToDelete(null);
      setDeletingTypeId(null);
      onConfirmClose();
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" p={4}>
      <Box maxW="1400px" mx="auto">
        {/* Header */}
        <Box mb={6}>
          <Flex align="center" mb={2}>
            <FaBuilding color="blue.500" size={24} />
            <Heading size="lg" ml={3} color="gray.700">
              Room Management
            </Heading>
          </Flex>
          <Text color="gray.600" fontSize="md">
            Manage hotel rooms and room types efficiently
          </Text>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
          <Card bg={cardBg} shadow="sm" borderRadius="lg" size="sm">
            <CardBody p={4}>
              <Flex align="center">
                <Box p={2} rounded="full" bg="blue.100" color="blue.600" mr={3}>
                  <FaBed size={16} />
                </Box>
                <Box>
                  <Text fontSize="xl" fontWeight="bold" color="gray.700">
                    {rooms.length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Total Rooms
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="sm" borderRadius="lg" size="sm">
            <CardBody p={4}>
              <Flex align="center">
                <Box p={2} rounded="full" bg="green.100" color="green.600" mr={3}>
                  <FaBuilding size={16} />
                </Box>
                <Box>
                  <Text fontSize="xl" fontWeight="bold" color="gray.700">
                    {types.length}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Room Types
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} shadow="sm" borderRadius="lg" size="sm">
            <CardBody p={4}>
              <Flex align="center">
                <Box p={2} rounded="full" bg="purple.100" color="purple.600" mr={3}>
                  <FaPlus size={16} />
                </Box>
                <Box>
                  <Text fontSize="xl" fontWeight="bold" color="gray.700">
                    Quick
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Add Room
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Top Section - Forms */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
          {/* Add Room Form - Compact */}
          <Card bg={cardBg} shadow="sm" borderRadius="lg">
            <CardBody p={5}>
              <Flex align="center" mb={4}>
                <Box p={2} rounded="lg" bg="green.100" color="green.600" mr={3}>
                  <AddIcon size={14} />
                </Box>
                <Heading size="sm" color="gray.700">
                  Add New Room
                </Heading>
              </Flex>
              
              <Stack spacing={3}>
                <HStack spacing={3}>
                  <Box flex="1">
                    <Text fontSize="xs" fontWeight="medium" color="gray.600" mb={1}>
                      Room Number
                    </Text>
                    <Input
                      placeholder="Room #"
                      type="number"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      size="sm"
                      bg="gray.50"
                      border="1px"
                      borderColor={borderColor}
                    />
                  </Box>
                  
                  <Box flex="1">
                    <Text fontSize="xs" fontWeight="medium" color="gray.600" mb={1}>
                      Room Type
                    </Text>
                    <Select
                      placeholder="Select type"
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      size="sm"
                      bg="gray.50"
                      border="1px"
                      borderColor={borderColor}
                    >
                      {types.map((t) => (
                        <option key={t._id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </HStack>
                
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={handleAddRoom}
                  isLoading={savingRoom}
                  loadingText="Adding..."
                  leftIcon={<AddIcon />}
                  borderRadius="md"
                >
                  Add Room
                </Button>
              </Stack>
            </CardBody>
          </Card>

          {/* Room Types Management - Compact */}
          <Card bg={cardBg} shadow="sm" borderRadius="lg">
            <CardBody p={5}>
              <Flex align="center" mb={4}>
                <Box p={2} rounded="lg" bg="blue.100" color="blue.600" mr={3}>
                  <FaBuilding size={14} />
                </Box>
                <Heading size="sm" color="gray.700">
                  Manage Room Types
                </Heading>
              </Flex>
              
              <Stack spacing={3}>
                <HStack spacing={2}>
                  <Input
                    placeholder="Add new type"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    size="sm"
                    bg="gray.50"
                    border="1px"
                    borderColor={borderColor}
                  />
                  <Button 
                    onClick={handleAddType} 
                    colorScheme="blue"
                    size="sm"
                    leftIcon={<AddIcon />}
                    borderRadius="md"
                    flexShrink={0}
                  >
                    Add
                  </Button>
                </HStack>
                
                {loadingTypes ? (
                  <Center py={4}>
                    <Spinner size="md" color="blue.500" />
                  </Center>
                ) : (
                  <Box
                    maxH="200px"
                    overflowY="auto"
                    border="1px"
                    borderColor={borderColor}
                    borderRadius="md"
                    p={2}
                    bg="gray.50"
                  >
                    <Stack spacing={2}>
                      {types.map((type) => (
                        <Box
                          key={type._id}
                          p={2}
                          bg="white"
                          borderRadius="md"
                          border="1px"
                          borderColor="gray.200"
                        >
                          {editingType?._id === type._id ? (
                            <HStack spacing={2}>
                              <Input
                                value={editedTypeValue}
                                onChange={(e) => setEditedTypeValue(e.target.value)}
                                size="xs"
                                bg="white"
                              />
                              <Button
                                onClick={saveEditedType}
                                size="xs"
                                colorScheme="green"
                                isLoading={savingTypeEdit}
                              >
                                Save
                              </Button>
                              <Button
                                onClick={() => setEditingType(null)}
                                size="xs"
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </HStack>
                          ) : (
                            <Flex justify="space-between" align="center">
                              <Badge
                                colorScheme="blue"
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="md"
                              >
                                {type.name}
                              </Badge>
                              <HStack spacing={1}>
                                <IconButton
                                  icon={<EditIcon />}
                                  size="xs"
                                  variant="outline"
                                  colorScheme="blue"
                                  onClick={() => handleEditType(type)}
                                  aria-label="Edit type"
                                />
                                <IconButton
                                  icon={<DeleteIcon />}
                                  size="xs"
                                  variant="outline"
                                  colorScheme="red"
                                  onClick={() => askDeleteType(type)}
                                  isLoading={deletingTypeId === type._id}
                                  aria-label="Delete type"
                                />
                              </HStack>
                            </Flex>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Rooms List - Full Width with Better Organization */}
        <Card bg={cardBg} shadow="sm" borderRadius="lg">
          <CardBody p={5}>
            {/* Header with Search */}
            <Flex justify="space-between" align="center" mb={4}>
              <Flex align="center">
                <Box p={2} rounded="lg" bg="purple.100" color="purple.600" mr={3}>
                  <FaBed size={14} />
                </Box>
                <Heading size="sm" color="gray.700">
                  All Rooms ({filteredRooms.length})
                </Heading>
              </Flex>
              
              <InputGroup maxW="250px">
                <InputLeftElement pointerEvents="none" h="8">
                  <SearchIcon color="gray.400" size={14} />
                </InputLeftElement>
                <Input
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="sm"
                  bg="gray.50"
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                />
              </InputGroup>
            </Flex>

            {/* Rooms Grid with Proper Scrolling */}
            {loadingRooms ? (
              <Center py={8}>
                <Spinner size="lg" color="blue.500" />
              </Center>
            ) : (
              <Box
                maxH="600px"
                overflowY="auto"
                border="1px"
                borderColor={borderColor}
                borderRadius="md"
                p={3}
                bg="gray.50"
              >
                {filteredRooms.length === 0 ? (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Text color="gray.500" fontSize="md">
                        No rooms found
                      </Text>
                      <Text color="gray.400" fontSize="sm">
                        {searchTerm
                          ? "Try adjusting your search terms"
                          : "Add your first room to get started"}
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={3}>
                    {filteredRooms.map((room) => (
                      <Card
                        key={room._id}
                        bg="white"
                        shadow="sm"
                        borderRadius="md"
                        border="1px"
                        borderColor="gray.200"
                        _hover={{
                          shadow: "md",
                          borderColor: "blue.300",
                        }}
                        transition="all 0.2s"
                        size="sm"
                      >
                        <CardBody p={3}>
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontWeight="bold" fontSize="sm" color="gray.700">
                                Room {room.roomNumber}
                              </Text>
                              <Badge
                                colorScheme="blue"
                                fontSize="xs"
                                px={2}
                                py={1}
                                borderRadius="md"
                                mt={1}
                              >
                                {room.roomType}
                              </Badge>
                            </Box>
                            <VStack spacing={1}>
                              <IconButton
                                icon={<EditIcon />}
                                size="xs"
                                variant="outline"
                                colorScheme="blue"
                                onClick={() => handleEditClick(room)}
                                aria-label="Edit room"
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                size="xs"
                                variant="outline"
                                colorScheme="red"
                                onClick={() => askDeleteRoom(room)}
                                isLoading={deletingRoomId === room._id}
                                aria-label="Delete room"
                              />
                            </VStack>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                )}
              </Box>
            )}
          </CardBody>
        </Card>
      </Box>

      {/* Edit Room Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
        <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <ModalContent borderRadius="lg" mx={4}>
          <ModalHeader borderRadius="lg" bg="blue.50">
            <Flex align="center">
              <EditIcon color="blue.500" mr={3} />
              Edit Room
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Stack spacing={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Room Number
                </Text>
                <Input
                  type="number"
                  value={editNumber}
                  onChange={(e) => setEditNumber(e.target.value)}
                  bg="gray.50"
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                  Room Type
                </Text>
                <Select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  bg="gray.50"
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  {types.map((t) => (
                    <option key={t._id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </Box>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={handleEditSave}
              colorScheme="blue"
              mr={3}
              isLoading={savingEdit}
              loadingText="Saving..."
              borderRadius="md"
            >
              Save Changes
            </Button>
            <Button onClick={onClose} variant="outline" borderRadius="md">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Room Type Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={onConfirmClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <AlertDialogContent borderRadius="lg" mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color="black">
            Delete Room Type
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text color="gray.600">
              Are you sure you want to delete this room type? This action cannot be undone
              and may affect existing rooms using this type.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onConfirmClose} borderRadius="md">
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmDeleteType}
              ml={3}
              isLoading={!!deletingTypeId}
              loadingText="Deleting..."
              borderRadius="md"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Room Delete Confirmation Dialog - NEW */}
      <AlertDialog
        isOpen={isRoomDeleteOpen}
        leastDestructiveRef={roomCancelRef}
        onClose={onRoomDeleteClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
        <AlertDialogContent borderRadius="lg" mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold" color="black">
            <Flex align="center">
              <WarningIcon color="red.500" mr={3} />
              Delete Room
            </Flex>
          </AlertDialogHeader>
          <AlertDialogBody>
            <VStack align="start" spacing={3}>
              <Text color="gray.600">
                Are you sure you want to delete <strong>Room {roomToDelete?.roomNumber}</strong>?
              </Text>
              <Text color="gray.600" fontSize="sm">
                This action cannot be undone. The room will be permanently removed from the system.
              </Text>
              <Box 
                bg="orange.50" 
                border="1px" 
                borderColor="orange.200" 
                borderRadius="md" 
                p={3} 
                w="full"
              >
                <Flex align="center">
                  <WarningIcon color="orange.500" mr={2} size={14} />
                  <Text fontSize="sm" color="orange.700" fontWeight="medium">
                    Note: Rooms that are currently checked in or active cannot be deleted.
                  </Text>
                </Flex>
              </Box>
            </VStack>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button 
              ref={roomCancelRef} 
              onClick={onRoomDeleteClose} 
              borderRadius="md"
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={confirmDeleteRoom}
              ml={3}
              isLoading={deletingRoomId === roomToDelete?._id}
              loadingText="Deleting..."
              borderRadius="md"
            >
              Delete Room
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default RoomSettingsPage;