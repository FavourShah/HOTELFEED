import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Button,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  VStack,
  Textarea,
  IconButton,
  HStack,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Image,
  Text,
  Badge,
  Card,
  CardBody,
  Flex,
  Stack,
  Divider,
  Avatar,
  useColorModeValue,
  Container,
  Checkbox,
  ButtonGroup,
  Tooltip,
} from "@chakra-ui/react";

import { useEffect, useState, useRef } from "react";
import { 
  ViewIcon, 
  EditIcon, 
  DeleteIcon, 
  DownloadIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  TimeIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from "@chakra-ui/icons";
import { MdArchive } from "react-icons/md";

import useAuthStore from "../store/useAuthStore";
import usePropertyStore from "../store/usePropertyStore"; // Add this import
import { saveAs } from "file-saver";
import { exportToPDF } from "../utils/exportToPDF";
import axios from '../utils/axiosInstance';


const AllIssuesPage = () => {
  const { token, user } = useAuthStore();
  const { property } = usePropertyStore(); // Add this line
  const toast = useToast();
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Move ALL useColorModeValue calls to the very top, before any other hooks
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const editHoverBg = useColorModeValue("green.50", "green.900");
  const viewHoverBg = useColorModeValue("blue.50", "blue.900");
  const deleteHoverBg = useColorModeValue("red.50", "red.900");
  const archiveHoverBg = useColorModeValue("orange.50", "orange.900");
  const archiveButtonBg = useColorModeValue("blue.50", "blue.900");

  // All hooks must be called at the top level, in the same order every time
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {
    isOpen: isArchiveConfirmOpen,
    onOpen: onArchiveConfirmOpen,
    onClose: onArchiveConfirmClose,
  } = useDisclosure();

  // State hooks
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [archiveFilter, setArchiveFilter] = useState("active"); // New archive filter
  const [selected, setSelected] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Selection state for bulk operations
  const [selectedIssues, setSelectedIssues] = useState(new Set());
  const [archiving, setArchiving] = useState(false);
  
  const cancelRef = useRef();

  // Helper function to format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to filter issues by date
  const filterByDate = (issues, filter) => {
    if (filter === "all") return issues;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);
    const last30Days = new Date(today);
    last30Days.setDate(today.getDate() - 30);

    return issues.filter(issue => {
      const issueDate = new Date(issue.createdAt);
      const issueDateOnly = new Date(issueDate.getFullYear(), issueDate.getMonth(), issueDate.getDate());

      switch (filter) {
        case "today":
          return issueDateOnly.getTime() === today.getTime();
        case "yesterday":
          return issueDateOnly.getTime() === yesterday.getTime();
        case "this-week":
          return issueDate >= thisWeekStart;
        case "this-month":
          return issueDate >= thisMonthStart;
        case "last-7-days":
          return issueDate >= last7Days;
        case "last-30-days":
          return issueDate >= last30Days;
        case "most-recent":
          return true;
        default:
          return true;
      }
    });
  };

  // Helper function to sort issues by date
  const sortIssuesByDate = (issues, filter) => {
    if (filter === "most-recent") {
      return [...issues].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return issues;
  };

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "orange";
      case "in-progress": return "blue";
      case "resolved": return "green";
      default: return "gray";
    }
  };

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/issues", config);
      setIssues(res.data);
    } catch {
      toast({ title: "Failed to load issues", status: "error", duration: 3000 });
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("/api/departments", config);
      setDepartments(res.data);
    } catch {
      toast({ title: "Failed to load departments", status: "error", duration: 3000 });
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchDepartments();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIssues(new Set());
  }, [statusFilter, dateFilter, archiveFilter]);

  const openEdit = (issue) => {
    setSelected(issue);
    setForm({
      department: issue.department?._id || "",
      status: issue.status,
      remarks: issue.remarks || "",
    });
    setEditModalOpen(true);
  };

  const openView = (issue) => {
    setSelected(issue);
    setViewModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "status" && form.status === "resolved" && value !== "resolved") {
      setForm((prev) => ({ ...prev, status: value, remarks: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        status: form.status,
        department: form.department || null,
      };

      if (form.status === "resolved") {
        payload.remarks = form.remarks;
        payload.statusChangedBy = user._id;
        payload.resolvedAt = new Date();
      }

      if (form.department) {
        payload.assignedBy = user._id;
      } else {
        payload.assignedBy = null;
      }

      await axios.put(`/api/issues/${selected._id}/assign`, payload, config);
      toast({ title: "Issue updated successfully!", status: "success", duration: 3000 });
      setEditModalOpen(false);

      const res = await axios.get(`/api/issues/${selected._id}`, config);
      const updated = res.data;
      setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
      setSelected(updated);
    } catch (err) {
      toast({
        title: "Failed to update issue",
        description: err.response?.data?.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/issues/${deleteId}`, config);
      toast({ title: "Issue deleted successfully", status: "info", duration: 3000 });
      fetchIssues();
      onDeleteClose();
    } catch {
      toast({ title: "Delete failed", status: "error", duration: 3000 });
    }
  };

  const handleArchiveIssues = async () => {
    setArchiving(true);
    try {
      const issueIds = Array.from(selectedIssues);
      await axios.put('/api/issues/bulk-archive', { issueIds }, config);
      
      toast({ 
        title: `${issueIds.length} issue${issueIds.length > 1 ? 's' : ''} archived successfully`, 
        status: "success", 
        duration: 3000 
      });
      
      fetchIssues();
      setSelectedIssues(new Set());
      onArchiveConfirmClose();
    } catch (err) {
      toast({
        title: "Failed to archive issues",
        description: err.response?.data?.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchiveIssues = async () => {
    setArchiving(true);
    try {
      const issueIds = Array.from(selectedIssues);
      await axios.put('/api/issues/bulk-unarchive', { issueIds }, config);
      
      toast({ 
        title: `${issueIds.length} issue${issueIds.length > 1 ? 's' : ''} unarchived successfully`, 
        status: "success", 
        duration: 3000 
      });
      
      fetchIssues();
      setSelectedIssues(new Set());
    } catch (err) {
      toast({
        title: "Failed to unarchive issues",
        description: err.response?.data?.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setArchiving(false);
    }
  };

  const downloadImage = (url) => {
    const filename = url.split("/").pop();
    saveAs(url, filename);
  };

  // Handle individual checkbox selection
  const handleIssueSelect = (issueId, checked) => {
    const newSelected = new Set(selectedIssues);
    if (checked) {
      newSelected.add(issueId);
    } else {
      newSelected.delete(issueId);
    }
    setSelectedIssues(newSelected);
  };

  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    if (checked) {
      const pageIssueIds = currentPageIssues.map(issue => issue._id);
      setSelectedIssues(new Set([...selectedIssues, ...pageIssueIds]));
    } else {
      const pageIssueIds = new Set(currentPageIssues.map(issue => issue._id));
      setSelectedIssues(new Set([...selectedIssues].filter(id => !pageIssueIds.has(id))));
    }
  };

  // Apply filters
  const statusFilteredIssues = statusFilter === "all" ? issues : issues.filter((i) => i.status === statusFilter);
  const dateFilteredIssues = filterByDate(statusFilteredIssues, dateFilter);
 // Replace the existing archiveFilteredIssues logic with this:
const archiveFilteredIssues = archiveFilter === "all" 
  ? dateFilteredIssues 
  : dateFilteredIssues.filter(issue => {
      if (archiveFilter === "archived") {
        return issue.archived === true;
      } else {
        // "active" - show issues where archived is NOT true (false, null, undefined)
        return !issue.archived;
      }
    });
  const filteredIssues = sortIssuesByDate(archiveFilteredIssues, dateFilter);

  // Pagination calculations
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageIssues = filteredIssues.slice(startIndex, endIndex);

  // Check if all current page items are selected
  const isAllCurrentPageSelected = currentPageIssues.length > 0 && 
    currentPageIssues.every(issue => selectedIssues.has(issue._id));
  const isSomeCurrentPageSelected = currentPageIssues.some(issue => selectedIssues.has(issue._id));

  // Helper function to get filter description
  const getFilterDescription = () => {
    const statusDesc = statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
    const dateDesc = dateFilter === "all" ? "" : ` - ${dateFilter.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}`;
    const archiveDesc = archiveFilter === "all" ? "" : ` - ${archiveFilter.charAt(0).toUpperCase() + archiveFilter.slice(1)}`;
    return `${statusDesc}${dateDesc}${archiveDesc}`;
  };

  if (loading) {
    return (
      <Container maxW="8xl" py={8}>
        <Flex minH="400px" justify="center" align="center">
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
            <Text color={textColor} fontSize="lg">Loading issues...</Text>
          </VStack>
        </Flex>
      </Container>
    );
  }

  return (
   <Container maxW={["full", "8xl"]} py={8} bg={bgColor} minH="100vh">

      <VStack spacing={6} align="stretch">
        {/* Header Section */}
        <Card bg={cardBg} shadow="sm" borderRadius="xl">
          <CardBody>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color={textColor}>Issue Management</Heading>
                <Text color="gray.500" fontSize="sm">
                  {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'} found
                  {(statusFilter !== "all" || dateFilter !== "all" || archiveFilter !== "active") && (
                    <Text as="span" fontWeight="500"> • {getFilterDescription()}</Text>
                  )}
                  {selectedIssues.size > 0 && (
                    <Text as="span" color="blue.500" fontWeight="600"> • {selectedIssues.size} selected</Text>
                  )}
                </Text>
              </VStack>
              
            {/* Filter Section */}
<HStack spacing={4} flexWrap="wrap" w="full">
  <Select
    w={["full", "200px"]}
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    bg={cardBg}
    borderRadius="lg"
  >
    {/* options */}
  </Select>

  <Select
    w={["full", "200px"]}
    value={dateFilter}
    onChange={(e) => setDateFilter(e.target.value)}
    bg={cardBg}
    borderRadius="lg"
  >
    {/* options */}
  </Select>

  <Select
    w={["full", "200px"]}
    value={archiveFilter}
    onChange={(e) => setArchiveFilter(e.target.value)}
    bg={cardBg}
    borderRadius="lg"
  >
    {/* options */}
  </Select>

  <Button
    w={["full", "auto"]}
    onClick={() => exportToPDF(/* ... */)}
    leftIcon={<DownloadIcon />}
    colorScheme="green"
  >
    Export PDF
  </Button>
</HStack>

            </Flex>

            {/* Bulk Actions */}
            {selectedIssues.size > 0 && (
              <Flex mt={4} p={4} bg={archiveButtonBg} borderRadius="lg" align="center" justify="space-between">
                <Text fontWeight="600" color="blue.700">
                  {selectedIssues.size} issue{selectedIssues.size > 1 ? 's' : ''} selected
                </Text>
                <HStack spacing={2}>
                  {archiveFilter === "archived" ? (
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={handleUnarchiveIssues}
                      isLoading={archiving}
                      leftIcon={<Box as={MdArchive} />}
                    >
                      Unarchive Selected
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      colorScheme="orange"
                      onClick={onArchiveConfirmOpen}
                      isLoading={archiving}
                      leftIcon={<Box as={MdArchive} />}
                    >
                      Archive Selected
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedIssues(new Set())}
                  >
                    Clear Selection
                  </Button>
                </HStack>
              </Flex>
            )}
          </CardBody>
        </Card>


       {/* Issues Table */}
<Card bg={cardBg} shadow="sm" borderRadius="xl" overflow="hidden">
  <Box overflowX="auto">
    <Table variant="simple" minW="800px">
      {/* Thead, Tbody */}
    </Table>
  </Box>
</Card>

      </VStack>

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
            <HStack>
              <EditIcon color="blue.500" />
              <Text>Edit Issue</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <Box>
                <Text fontWeight="600" mb={2} color={textColor}>Title</Text>
                <Input value={selected?.title || ""} isReadOnly bg="gray.50" borderRadius="lg" />
              </Box>
              
              <Box>
                <Text fontWeight="600" mb={2} color={textColor}>Description</Text>
                <Textarea value={selected?.description || ""} isReadOnly bg="gray.50" borderRadius="lg" rows={3} />
              </Box>
              
              <Flex gap={4}>
                <Box flex="1">
                  <Text fontWeight="600" mb={2} color={textColor}>Location</Text>
                  <Input value={selected?.roomNumber || selected?.location || ""} isReadOnly bg="gray.50" borderRadius="lg" />
                </Box>
                
                <Box flex="1">
                  <Text fontWeight="600" mb={2} color={textColor}>
                    <HStack spacing={1}>
                      <CalendarIcon boxSize={4} />
                      <Text>Created</Text>
                    </HStack>
                  </Text>
                  <Input value={formatDateTime(selected?.createdAt)} isReadOnly bg="gray.50" borderRadius="lg" />
                </Box>
              </Flex>
              
              <Divider />
              
              <Flex gap={4}>
                <Box flex="1">
                  <Text fontWeight="600" mb={2} color={textColor}>Assign Department</Text>
                  <Select 
                    name="department" 
                    value={form.department} 
                    onChange={handleFormChange}
                    borderRadius="lg"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                  >
                    <option value="">Unassigned</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </Select>
                </Box>
                
                <Box flex="1">
                  <Text fontWeight="600" mb={2} color={textColor}>Status</Text>
                  <Select 
                    name="status" 
                    value={form.status} 
                    onChange={handleFormChange}
                    borderRadius="lg"
                    _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </Select>
                </Box>
              </Flex>
              
              <Box>
                <Text fontWeight="600" mb={2} color={textColor}>Resolution Remarks</Text>
                <Textarea
                  name="remarks"
                  value={form.remarks || ""}
                  onChange={handleFormChange}
                  placeholder="Enter resolution details and remarks..."
                  isDisabled={form.status !== "resolved"}
                  borderRadius="lg"
                  rows={4}
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                />
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
            <Button 
              onClick={handleSave} 
              colorScheme="blue" 
              mr={3} 
              isLoading={saving}
              borderRadius="lg"
              loadingText="Saving..."
            >
              <CheckCircleIcon mr={2} />
              Save Changes
            </Button>
            <Button 
              onClick={() => setEditModalOpen(false)} 
              isDisabled={saving}
              variant="ghost"
              borderRadius="lg"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
            <HStack>
              <ViewIcon color="blue.500" />
              <Text>Issue Details</Text>
              {selected?.isArchived && (
                <Badge colorScheme="gray" ml={2}>
                  Archived
                </Badge>
              )}
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack align="stretch" spacing={5}>
              <Card variant="outline" borderRadius="lg">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontWeight="600" color={textColor} mb={1}>Title</Text>
                      <Text fontSize="lg">{selected?.title}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="600" color={textColor} mb={1}>Description</Text>
                      <Text color="gray.600">{selected?.description}</Text>
                    </Box>
                    
                    <Flex gap={6}>
                      <Box>
                        <Text fontWeight="600" color={textColor} mb={1}>Location</Text>
                        <Text>{selected?.roomNumber || selected?.location}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="600" color={textColor} mb={1}>Status</Text>
                        <Badge
                          colorScheme={getStatusColor(selected?.status)}
                          variant="solid"
                          borderRadius="full"
                          px={3}
                          py={1}
                          textTransform="capitalize"
                        >
                          {selected?.status?.replace("-", " ")}
                        </Badge>
                      </Box>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card variant="outline" borderRadius="lg">
                <CardBody>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontWeight="600" color={textColor} mb={1}>
                        <HStack spacing={1}>
                          <CalendarIcon boxSize={4} />
                          <Text>Date/Time of Report</Text>
                        </HStack>
                      </Text>
                      <Text>{formatDateTime(selected?.createdAt)}</Text>
                    </Box>
                    
                    {selected?.isArchived && (
                      <Box>
                        <Text fontWeight="600" color={textColor} mb={1}>
                          <HStack spacing={1}>
                            <Box as={MdArchive} boxSize={4} color="orange.500" />
                            <Text>Archived On</Text>
                          </HStack>
                        </Text>
                        <Text>{formatDateTime(selected?.archivedAt)}</Text>
                      </Box>
                    )}
                    
                    {selected?.status === "resolved" && (
                      <>
                        <Box>
                          <Text fontWeight="600" color={textColor} mb={1}>
                            <HStack spacing={1}>
                              <CheckCircleIcon boxSize={4} color="green.500" />
                              <Text>Resolved On</Text>
                            </HStack>
                          </Text>
                          <Text>{formatDateTime(selected?.resolvedAt)}</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="600" color={textColor} mb={1}>Resolution Remarks</Text>
                          <Text color="gray.600">{selected?.remarks || "—"}</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="600" color={textColor} mb={1}>Resolved By</Text>
                          <HStack>
                            <Avatar size="sm" name={selected?.statusChangedBy?.fullName} />
                            <Text>{selected?.statusChangedBy?.fullName || "—"}</Text>
                          </HStack>
                        </Box>
                      </>
                    )}
                    
                    <Flex gap={6}>
                      <Box>
                        <Text fontWeight="600" color={textColor} mb={1}>Assigned Department</Text>
                        <Text>{selected?.department?.name || "Unassigned"}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="600" color={textColor} mb={1}>Reported By</Text>
                        <HStack>
                          <Avatar size="sm" name={selected?.reportedBy?.fullName} />
                          <Text>{selected?.reportedBy?.fullName || selected?.reportedBy?.roomNumber}</Text>
                        </HStack>
                      </Box>
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
              
              {selected?.attachments?.length > 0 && (
                <Card variant="outline" borderRadius="lg">
                  <CardBody>
                    <Text fontWeight="600" color={textColor} mb={3}>Attachments</Text>
                    <VStack align="start" spacing={3}>
                      {selected.attachments.map((url, i) => (
                        <Box key={i} p={3} border="1px" borderColor={borderColor} borderRadius="lg" width="100%">
                          <Image src={url} alt={`Attachment ${i + 1}`} maxH="200px" borderRadius="md" mb={3} />
                          <HStack spacing={2}>
                            <Button size="sm" variant="outline" onClick={() => window.open(url, "_blank")}>
                              View Full Size
                            </Button>
                            <Button size="sm" colorScheme="blue" onClick={() => downloadImage(url)}>
                              Download
                            </Button>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
            <Button onClick={() => setViewModalOpen(false)} colorScheme="blue" borderRadius="lg">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Archive Confirmation Dialog */}
      <AlertDialog 
        isOpen={isArchiveConfirmOpen} 
        leastDestructiveRef={cancelRef} 
        onClose={onArchiveConfirmClose} 
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(10px)" />
        <AlertDialogContent borderRadius="xl" mx={4}>
          <AlertDialogHeader borderBottomWidth="1px" borderColor={borderColor}>
            <HStack>
              <Box as={MdArchive} color="orange.500" />
              <Text>Archive Issues</Text>
            </HStack>
          </AlertDialogHeader>
          <AlertDialogBody py={6}>
            <Text>
              Are you sure you want to archive {selectedIssues.size} issue{selectedIssues.size > 1 ? 's' : ''}? 
              Archived issues will be hidden from the main view but can still be accessed through the archive filter.
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
            <Button 
              ref={cancelRef} 
              onClick={onArchiveConfirmClose} 
              variant="ghost" 
              borderRadius="lg"
              isDisabled={archiving}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="orange" 
              onClick={handleArchiveIssues} 
              ml={3} 
              borderRadius="lg"
              isLoading={archiving}
              loadingText="Archiving..."
            >
              Archive Issues
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
        <AlertDialogOverlay backdropFilter="blur(10px)" />
        <AlertDialogContent borderRadius="xl" mx={4}>
          <AlertDialogHeader borderBottomWidth="1px" borderColor={borderColor}>
            <HStack>
              <DeleteIcon color="red.500" />
              <Text>Delete Issue</Text>
            </HStack>
          </AlertDialogHeader>
          <AlertDialogBody py={6}>
            <Text>Are you sure you want to delete this issue? This action cannot be undone.</Text>
          </AlertDialogBody>
          <AlertDialogFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
            <Button ref={cancelRef} onClick={onDeleteClose} variant="ghost" borderRadius="lg">
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete} ml={3} borderRadius="lg">
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
};

export default AllIssuesPage;