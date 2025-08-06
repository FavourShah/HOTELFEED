import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Text,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Spinner,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  Flex,
  Container,
  useColorModeValue,
  Avatar,
  ButtonGroup,
} from "@chakra-ui/react";
import { EditIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import axios from '../utils/axiosInstance';
import useAuthStore from "../store/useAuthStore";

// Constants
const STATUS_COLORS = {
  active: "green",
  checked_out: "blue",
  maintenance: "orange",
  available: "gray",
};

// Utility functions
const getStatusColor = (status) => {
  return STATUS_COLORS[status?.toLowerCase()] || "gray";
};

// Components
const LoadingSpinner = ({ textColor }) => (
  <Container maxW="8xl" py={8}>
    <Flex minH="400px" justify="center" align="center">
      <VStack spacing={4}>
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
        <Text color={textColor} fontSize="lg">Loading rooms...</Text>
      </VStack>
    </Flex>
  </Container>
);

const PageHeader = ({ roomsCount, filteredCount, cardBg, textColor }) => (
  <Card bg={cardBg} shadow="sm" borderRadius="xl">
    <CardBody>
      <VStack align="start" spacing={1}>
        <Heading size="lg" color={textColor}>Guest Room Status</Heading>
        <Text color="gray.500" fontSize="sm">
          {filteredCount} of {roomsCount} {roomsCount === 1 ? 'room' : 'rooms'} displayed
        </Text>
      </VStack>
    </CardBody>
  </Card>
);

const RoomTableRow = ({ 
  room, 
  onSelectChange, 
  onEditClick, 
  onSaveClick, 
  editingStayDays, 
  editedStayDays, 
  setEditedStayDays,
  borderColor, 
  textColor 
}) => (
  <Tr _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}>
    <Td borderColor={borderColor} py={4}>
      <HStack spacing={3}>
        <Avatar 
          size="md" 
          name={String(room.roomNumber || 'Room')}
          bg={`${getStatusColor(room.status)}.500`}
          color="white"
        />
        <VStack align="start" spacing={0}>
          <Text fontWeight="600" color={textColor}>
            {room.roomNumber}
          </Text>
        </VStack>
      </HStack>
    </Td>
    
    <Td borderColor={borderColor} py={4}>
      <Text color={textColor}>{room.roomType}</Text>
    </Td>
    
    <Td borderColor={borderColor} py={4}>
      <Badge
        colorScheme={getStatusColor(room.status)}
        variant="solid"
        borderRadius="full"
        px={3}
        py={1}
        fontSize="xs"
        textTransform="capitalize"
      >
        {room.status || "—"}
      </Badge>
    </Td>
    
    <Td borderColor={borderColor} py={4}>
      <Select
        placeholder="Select Status"
        size="sm"
        borderRadius="lg"
        onChange={(e) => onSelectChange(room, e.target.value)}
        _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
      >
        <option value="active">Active</option>
        <option value="checked_out">Checked Out</option>
      </Select>
    </Td>
    
    <Td borderColor={borderColor} py={4}>
      {room.status === "active" ? (
        <Text fontWeight="bold" fontFamily="mono" color="green.600">
          G{room.roomNumber}
        </Text>
      ) : (
        <Text color="gray.400">—</Text>
      )}
    </Td>
    
    <Td borderColor={borderColor} py={4}>
      {editingStayDays[room._id] ? (
        <HStack spacing={2}>
          <Input
            size="sm"
            type="number"
            value={editedStayDays[room._id]}
            onChange={(e) =>
              setEditedStayDays({ ...editedStayDays, [room._id]: e.target.value })
            }
            width="80px"
            borderRadius="lg"
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
          />
          <IconButton
            size="sm"
            colorScheme="green"
            icon={<CheckIcon />}
            onClick={() => onSaveClick(room._id)}
            borderRadius="full"
          />
        </HStack>
      ) : (
        <HStack spacing={2}>
          <Text color={textColor}>{room.stayDays || 0}</Text>
          <IconButton
            size="sm"
            icon={<EditIcon />}
            onClick={() => onEditClick(room._id, room.stayDays)}
            variant="ghost"
            colorScheme="blue"
            borderRadius="full"
            _hover={{ bg: "blue.50" }}
          />
        </HStack>
      )}
    </Td>
  </Tr>
);

const RoomTable = ({ 
  currentPageRooms, 
  onSelectChange, 
  onEditClick, 
  onSaveClick, 
  editingStayDays, 
  editedStayDays, 
  setEditedStayDays,
  cardBg, 
  borderColor, 
  textColor 
}) => (
  <Card bg={cardBg} shadow="sm" borderRadius="xl" overflow="hidden">
    <Table variant="simple">
      <Thead bg={useColorModeValue("gray.50", "gray.700")}>
        <Tr>
          <Th borderColor={borderColor} py={4} fontSize="sm" fontWeight="600">Room Number</Th>
          <Th borderColor={borderColor} py={4} fontSize="sm" fontWeight="600">Type</Th>
          <Th borderColor={borderColor} py={4} fontSize="sm" fontWeight="600">Status</Th>
          <Th borderColor={borderColor} py={4} fontSize="sm" fontWeight="600">Change</Th>
          <Th borderColor={borderColor} py={4} fontSize="sm" fontWeight="600">Password</Th>
          <Th borderColor={borderColor} py={4} fontSize="sm" fontWeight="600">Stay Days</Th>
        </Tr>
      </Thead>
      <Tbody>
        {currentPageRooms.map((room) => (
          <RoomTableRow 
            key={room._id}
            room={room}
            onSelectChange={onSelectChange}
            onEditClick={onEditClick}
            onSaveClick={onSaveClick}
            editingStayDays={editingStayDays}
            editedStayDays={editedStayDays}
            setEditedStayDays={setEditedStayDays}
            borderColor={borderColor}
            textColor={textColor}
          />
        ))}
      </Tbody>
    </Table>
    
    {currentPageRooms.length === 0 && (
      <Box py={12} textAlign="center">
        <Text color="gray.500" fontSize="lg">No rooms found</Text>
        <Text color="gray.400" fontSize="sm" mt={2}>
          Rooms will appear here once they are configured
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
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} rooms
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

// Main Component
const GuestManagement = () => {
  // Hooks must be called before any conditional returns
  const { token } = useAuthStore();
  const toast = useToast();
  const cancelRef = React.useRef();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // Disclosures
  const { isOpen, onOpen, onClose } = useDisclosure();

  // State
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [statusToUpdate, setStatusToUpdate] = useState("");
  const [stayDays, setStayDays] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editingStayDays, setEditingStayDays] = useState({});
  const [editedStayDays, setEditedStayDays] = useState({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination calculations
  const totalPages = Math.ceil(rooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageRooms = rooms.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Original API function - unchanged
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/rooms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(res.data);
    } catch (err) {
      toast({ title: "Failed to load rooms", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Original handlers - unchanged logic
  const handleSelectChange = (room, value) => {
    if (!value || value === "select") return;

    if (room.status === value) {
      toast({ title: `Room is already marked as ${value}`, status: "info" });
      return;
    }

    setSelectedRoom(room);
    setStatusToUpdate(value);
    setStayDays("");

    if (["active", "checked_out"].includes(value)) {
      onOpen();
    } else {
      confirmStatusChange(room._id, value);
    }
  };

  const confirmStatusChange = async () => {
    try {
      const roomId = selectedRoom._id;
      const newStatus = statusToUpdate;

      if (newStatus === "active" && (!stayDays || isNaN(stayDays) || stayDays <= 0)) {
        toast({ title: "Enter valid stay days", status: "warning" });
        return;
      }

      const res = await axios.put(
        `/api/rooms/${roomId}`,
        { status: newStatus, stayDays: newStatus === "active" ? stayDays : undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (newStatus === "active") {
        const password = `G${selectedRoom.roomNumber}`;
        setNewPassword(password);
        toast({ title: "Password generated", description: password, status: "success" });
      } else {
        setNewPassword("");
      }

      toast({ title: `Room marked as ${newStatus}`, status: "success" });

      fetchRooms();
      setSelectedRoom(null);
      setStatusToUpdate("");
      setStayDays("");
      onClose();
    } catch (err) {
      toast({ title: "Update failed", status: "error" });
    }
  };

  const handleEditClick = (roomId, currentDays) => {
    setEditingStayDays({ ...editingStayDays, [roomId]: true });
    setEditedStayDays({ ...editedStayDays, [roomId]: currentDays });
  };

  const handleSaveClick = async (roomId) => {
    const newDays = editedStayDays[roomId];
    if (!newDays || isNaN(newDays)) {
      toast({ title: "Invalid number of days", status: "warning" });
      return;
    }

    try {
      await axios.put(
        `/api/rooms/${roomId}`,
        { stayDays: Number(newDays) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Stay days updated", status: "success" });
      setEditingStayDays({ ...editingStayDays, [roomId]: false });
      fetchRooms();
    } catch (err) {
      toast({ title: "Failed to update stay days", status: "error" });
    }
  };

  // Original useEffect - unchanged
  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 60000);
    return () => clearInterval(interval);
  }, []);

  // Reset pagination when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [rooms.length]);

  // Render
  if (loading) {
    return <LoadingSpinner textColor={textColor} />;
  }

  return (
    <Container maxW="8xl" py={8} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        <PageHeader 
          roomsCount={rooms.length}
          filteredCount={rooms.length}
          cardBg={cardBg}
          textColor={textColor}
        />
        
        <RoomTable 
          currentPageRooms={currentPageRooms}
          onSelectChange={handleSelectChange}
          onEditClick={handleEditClick}
          onSaveClick={handleSaveClick}
          editingStayDays={editingStayDays}
          editedStayDays={editedStayDays}
          setEditedStayDays={setEditedStayDays}
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
        />

        {rooms.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={rooms.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            borderColor={borderColor}
          />
        )}
      </VStack>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay backdropFilter="blur(10px)" />
        <AlertDialogContent borderRadius="xl" mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold" borderBottomWidth="1px" borderColor={borderColor}>
            Confirm Status Change
          </AlertDialogHeader>

          <AlertDialogBody py={6}>
            Are you sure you want to set Room {selectedRoom?.roomNumber} as {statusToUpdate}?
            {statusToUpdate === "active" && (
              <Box mt={4}>
                <FormControl isRequired>
                  <FormLabel>Enter Number of Days</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={stayDays}
                    onChange={(e) => setStayDays(e.target.value)}
                    placeholder="e.g. 3"
                    borderRadius="lg"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                  />
                </FormControl>
              </Box>
            )}
          </AlertDialogBody>

          <AlertDialogFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
            <Button ref={cancelRef} onClick={onClose} variant="ghost" borderRadius="lg">
              Cancel
            </Button>
            <Button colorScheme="green" onClick={confirmStatusChange} ml={3} borderRadius="lg">
              Confirm
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

export default GuestManagement;