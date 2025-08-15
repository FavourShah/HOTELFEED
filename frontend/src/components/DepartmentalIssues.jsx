import { useEffect, useState } from "react";

import {
  Box,
  Heading,
  Spinner,
  Text,
  Badge,
  useToast,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Image,
  Select,
  Card,
  CardBody,
  Flex,
  Container,
  useColorModeValue,
  Avatar,
  Divider,
  SimpleGrid,
  IconButton,
  ButtonGroup,
  Stack,
  Textarea,
  FormControl,
  FormLabel,
  useDisclosure,
} from "@chakra-ui/react";
import { 
  ViewIcon, 
  DownloadIcon, 
  TimeIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  EditIcon,
  CheckIcon
} from "@chakra-ui/icons";
import { saveAs } from "file-saver";
import { exportToPDF } from "../utils/exportToPDF";
import useAuthStore from "../store/useAuthStore";
import usePropertyStore from "../store/usePropertyStore";
import axios from '../utils/axiosInstance';

const DepartmentalIssues = () => {
  const { user } = useAuthStore();
  const { property } = usePropertyStore();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Status update states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const { isOpen: isStatusModalOpen, onOpen: onStatusModalOpen, onClose: onStatusModalClose } = useDisclosure();
  const [statusUpdateIssue, setStatusUpdateIssue] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

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

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "orange";
      case "in-progress": return "blue";
      case "resolved": return "green";
      default: return "gray";
    }
  };

  // Status options for dropdown
  const statusOptions = [
    { value: "pending", label: "Pending", color: "orange" },
    { value: "in-progress", label: "In Progress", color: "blue" },
    { value: "resolved", label: "Resolved", color: "green" }
  ];

  const fetchIssues = async () => {
    try {
      const res = await axios.get("/api/issues/assigned-to-dept");
      setIssues(res.data || []);
    } catch (err) {
      toast({
        title: "Error loading issues",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [toast]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const openModal = (issue) => {
    setSelectedIssue(issue);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedIssue(null);
    setModalOpen(false);
  };

  const openStatusModal = (issue) => {
    setStatusUpdateIssue(issue);
    setNewStatus(issue.status);
    setRemarks("");
    onStatusModalOpen();
  };

  const closeStatusModal = () => {
    setStatusUpdateIssue(null);
    setNewStatus("");
    setRemarks("");
    onStatusModalClose();
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdateIssue || !newStatus) return;
    
    // Validate remarks for resolved status
    if (newStatus === "resolved" && (!remarks || !remarks.trim())) {
      toast({
        title: "Remarks Required",
        description: "Please provide remarks when resolving an issue",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setUpdatingStatus(true);
    
    try {
      const payload = { status: newStatus };
      if (newStatus === "resolved") {
        payload.remarks = remarks.trim();
      }

      const response = await axios.put(
        `/api/issues/${statusUpdateIssue._id}/status`,
        payload
      );

      // Update the issues list with the updated issue
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue._id === statusUpdateIssue._id ? response.data : issue
        )
      );

      // Update selected issue if it's the same one
      if (selectedIssue?._id === statusUpdateIssue._id) {
        setSelectedIssue(response.data);
      }

      toast({
        title: "Status Updated",
        description: `Issue status changed to ${newStatus.replace("-", " ")}`,
        status: "success",
        duration: 3000,
      });

      closeStatusModal();
    } catch (err) {
      toast({
        title: "Error updating status",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 4000,
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const downloadImage = (url) => {
    const filename = url.split("/").pop();
    saveAs(url, filename);
  };

  // Filter out archived issues and apply status filter
  const activeIssues = Array.isArray(issues) ? issues.filter(issue => !issue.archived) : [];
  const filteredIssues = statusFilter === "all"
    ? activeIssues
    : activeIssues.filter((i) => i.status === statusFilter);

  // Pagination calculations
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageIssues = filteredIssues.slice(startIndex, endIndex);

  const handleExport = () => {
    const deptName = user.department?.name || "Department";
    exportToPDF({
      title: `Departmental Issues - ${deptName}`,
      data: filteredIssues,
      type: "issues",
      property: property,
    });
  };

  if (loading) {
    return (
      <Container maxW="8xl" py={8}>
        <Flex minH="400px" justify="center" align="center">
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
            <Text color={textColor} fontSize="lg">Loading departmental issues...</Text>
          </VStack>
        </Flex>
      </Container>
    );
  }

  return (
    <Container maxW="8xl" py={8} bg={bgColor} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header Section */}
        <Card bg={cardBg} shadow="sm" borderRadius="xl">
          <CardBody>
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color={textColor}>Departmental Issues</Heading>
                <Text color="gray.500" fontSize="sm">
                  {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'} assigned to {user.department?.name || 'your department'}
                  {statusFilter !== "all" && (
                    <Text as="span" fontWeight="500"> • {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace("-", " ")}</Text>
                  )}
                </Text>
              </VStack>
              
              <Stack
                direction={["column", "row"]}
                spacing={4}
                w="full"
              >
                <Select
                  w={["full", "200px"]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  bg={cardBg}
                  borderRadius="lg"
                  _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
                >
                  <option value="all">All Issues</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </Select>

                <Button
                  w={["full", "auto"]}
                  onClick={handleExport}
                  leftIcon={<DownloadIcon />}
                  colorScheme="green"
                  variant="solid"
                  borderRadius="lg"
                  size="md"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                >
                  Export PDF
                </Button>
              </Stack>
            </Flex>
          </CardBody>
        </Card>

        {/* Issues Grid */}
        {filteredIssues.length === 0 ? (
          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody py={12} textAlign="center">
              <Text color="gray.500" fontSize="lg">No issues found</Text>
              <Text color="gray.400" fontSize="sm" mt={2}>
                {statusFilter !== "all" ? `No ${statusFilter} issues assigned to your department` : "No issues have been assigned to your department yet"}
              </Text>
            </CardBody>
          </Card>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
              {currentPageIssues.map((issue) => (
                <Card
                  key={issue._id}
                  bg={cardBg}
                  shadow="sm"
                  borderRadius="xl"
                  border="1px"
                  borderColor={borderColor}
                  _hover={{ shadow: "md", transform: "translateY(-2px)", bg: hoverBg }}
                  transition="all 0.2s"
                >
                  <CardBody p={6}>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Heading size="sm" color={textColor} noOfLines={2} mb={2}>
                          {issue.title}
                        </Heading>
                        <Text fontSize="sm" color="gray.500" noOfLines={3}>
                          {issue.description}
                        </Text>
                      </Box>

                      <Divider />

                      <VStack align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.400" fontWeight="600">LOCATION</Text>
                          <Text fontSize="sm" color={textColor}>
                            {issue.roomNumber || issue.location}
                          </Text>
                        </HStack>

                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.400" fontWeight="600">STATUS</Text>
                          <Badge
                            colorScheme={getStatusColor(issue.status)}
                            variant="solid"
                            borderRadius="full"
                            px={3}
                            py={1}
                            fontSize="xs"
                            textTransform="capitalize"
                          >
                            {issue.status.replace("-", " ")}
                          </Badge>
                        </HStack>

                        <HStack justify="space-between">
                          <Text fontSize="xs" color="gray.400" fontWeight="600">REPORTED</Text>
                          <HStack spacing={1}>
                            <TimeIcon color="gray.400" boxSize={3} />
                            <Text fontSize="xs" color="gray.500">
                              {formatDateTime(issue.createdAt)}
                            </Text>
                          </HStack>
                        </HStack>

                        {issue.reportedBy && (
                          <HStack justify="space-between">
                            <Text fontSize="xs" color="gray.400" fontWeight="600">REPORTED BY</Text>
                            <HStack spacing={2}>
                              <Avatar size="xs" name={issue.reportedBy?.fullName} />
                              <Text fontSize="sm" color={textColor}>
                                {issue.reportedBy?.fullName || `Room ${issue.reportedBy?.roomNumber}`}
                              </Text>
                            </HStack>
                          </HStack>
                        )}
                      </VStack>

                      <Divider />

                      <HStack justify="space-between" pt={2}>
                        <HStack spacing={2}>
                          {issue.attachments?.length > 0 && (
                            <Text fontSize="xs" color="blue.500" fontWeight="600">
                              📎 {issue.attachments.length} attachment{issue.attachments.length > 1 ? 's' : ''}
                            </Text>
                          )}
                        </HStack>
                        <HStack spacing={1}>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="orange"
                            borderRadius="full"
                            onClick={(e) => {
                              e.stopPropagation();
                              openStatusModal(issue);
                            }}
                            _hover={{ bg: "orange.50" }}
                            title="Update Status"
                          />
                          <IconButton
                            icon={<ViewIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            borderRadius="full"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal(issue);
                            }}
                            _hover={{ bg: "blue.50" }}
                            title="View Details"
                          />
                        </HStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            {/* Pagination */}
            {filteredIssues.length > 0 && (
              <Card bg={cardBg} shadow="sm" borderRadius="xl">
                <CardBody>
                  <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                    <HStack spacing={2}>
                      <Text fontSize="sm" color="gray.500">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredIssues.length)} of {filteredIssues.length} issues
                      </Text>
                      <Select
                        size="sm"
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        width="120px"
                      >
                        <option value={8}>8 per page</option>
                        <option value={12}>12 per page</option>
                        <option value={24}>24 per page</option>
                        <option value={48}>48 per page</option>
                      </Select>
                    </HStack>

                    <ButtonGroup size="sm" isAttached variant="outline">
                      <IconButton
                        icon={<ChevronLeftIcon />}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            _active={{ bg: "blue.500", color: "white" }}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      
                      <IconButton
                        icon={<ChevronRightIcon />}
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        isDisabled={currentPage === totalPages}
                        aria-label="Next page"
                      />
                    </ButtonGroup>
                  </Flex>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </VStack>

      {/* Status Update Modal */}
      <Modal isOpen={isStatusModalOpen} onClose={closeStatusModal} size="md">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
            <HStack>
              <EditIcon color="orange.500" />
              <Text>Update Issue Status</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="600" color={textColor} mb={2}>Issue</Text>
                <Text fontSize="sm" color="gray.600">{statusUpdateIssue?.title}</Text>
              </Box>
              
              <FormControl>
                <FormLabel fontWeight="600" color={textColor}>New Status</FormLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  borderRadius="lg"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {newStatus === "resolved" && (
                <FormControl isRequired>
                  <FormLabel fontWeight="600" color={textColor}>
                    Resolution Remarks <Text as="span" color="red.500">*</Text>
                  </FormLabel>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Please provide details about how this issue was resolved..."
                    borderRadius="lg"
                    rows={4}
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Remarks are required when marking an issue as resolved
                  </Text>
                </FormControl>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
            <HStack spacing={3}>
              <Button 
                variant="ghost" 
                onClick={closeStatusModal}
                borderRadius="lg"
              >
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleStatusUpdate}
                isLoading={updatingStatus}
                loadingText="Updating..."
                leftIcon={<CheckIcon />}
                borderRadius="lg"
                isDisabled={newStatus === "resolved" && (!remarks || !remarks.trim())}
              >
                Update Status
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Details Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} size="xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="xl" mx={4}>
          <ModalHeader borderBottomWidth="1px" borderColor={borderColor} pb={4}>
            <HStack>
              <ViewIcon color="blue.500" />
              <Text>Issue Details</Text>
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
                      <Text fontSize="lg">{selectedIssue?.title}</Text>
                    </Box>
                    
                    <Box>
                      <Text fontWeight="600" color={textColor} mb={1}>Description</Text>
                      <Text color="gray.600">{selectedIssue?.description}</Text>
                    </Box>
                    
                    <Flex gap={6}>
                      <Box>
                        <Text fontWeight="600" color={textColor} mb={1}>Location</Text>
                        <Text>{selectedIssue?.roomNumber || selectedIssue?.location}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="600" color={textColor} mb={1}>Status</Text>
                        <Badge
                          colorScheme={getStatusColor(selectedIssue?.status)}
                          variant="solid"
                          borderRadius="full"
                          px={3}
                          py={1}
                          textTransform="capitalize"
                        >
                          {selectedIssue?.status?.replace("-", " ")}
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
                      <Text>{formatDateTime(selectedIssue?.createdAt)}</Text>
                    </Box>
                    
                    {selectedIssue?.status === "resolved" && (
                      <>
                        <Box>
                          <Text fontWeight="600" color={textColor} mb={1}>
                            <HStack spacing={1}>
                              <CheckCircleIcon boxSize={4} color="green.500" />
                              <Text>Resolved On</Text>
                            </HStack>
                          </Text>
                          <Text>{formatDateTime(selectedIssue?.resolvedAt)}</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="600" color={textColor} mb={1}>Resolution Remarks</Text>
                          <Text color="gray.600">{selectedIssue?.remarks || "—"}</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="600" color={textColor} mb={1}>Resolved By</Text>
                          <HStack>
                            <Avatar size="sm" name={selectedIssue?.statusChangedBy?.fullName} />
                            <Text>{selectedIssue?.statusChangedBy?.fullName || "—"}</Text>
                          </HStack>
                        </Box>
                      </>
                    )}
                    
                    <Box>
                      <Text fontWeight="600" color={textColor} mb={1}>Reported By</Text>
                      <HStack>
                        <Avatar size="sm" name={selectedIssue?.reportedBy?.fullName} />
                        <Text>{selectedIssue?.reportedBy?.fullName || `Room ${selectedIssue?.reportedBy?.roomNumber}`}</Text>
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
              
              {selectedIssue?.attachments?.length > 0 && (
                <Card variant="outline" borderRadius="lg">
                  <CardBody>
                    <Text fontWeight="600" color={textColor} mb={3}>Attachments</Text>
                    <VStack align="start" spacing={3}>
                      {selectedIssue.attachments.map((url, i) => (
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
            <HStack spacing={3}>
              <Button
                leftIcon={<EditIcon />}
                colorScheme="orange"
                variant="outline"
                onClick={() => {
                  closeModal();
                  openStatusModal(selectedIssue);
                }}
                borderRadius="lg"
              >
                Update Status
              </Button>
              <Button onClick={closeModal} colorScheme="blue" borderRadius="lg">
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DepartmentalIssues;