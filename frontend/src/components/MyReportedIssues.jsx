import { useEffect, useState } from "react";
import axios from '../utils/axiosInstance';
import {
  Box,
  Heading,
  Spinner,
  Stack,
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
  useColorModeValue,
  Container,
  IconButton,
  Avatar,
  Divider,
  ButtonGroup,
} from "@chakra-ui/react";
import { ViewIcon, DownloadIcon, TimeIcon, CheckCircleIcon, CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import useAuthStore from "../store/useAuthStore";
import usePropertyStore from "../store/usePropertyStore"; // Add this import
import { saveAs } from "file-saver";
import { exportToPDF } from "../utils/exportToPDF";

const MyReportedIssues = () => {
  const { user } = useAuthStore();
  const { property } = usePropertyStore(); // Add this line
  const toast = useToast();

  // Color mode values
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const viewHoverBg = useColorModeValue("blue.50", "blue.900");

  // State
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper functions
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "orange";
      case "in-progress": return "blue";
      case "resolved": return "green";
      default: return "gray";
    }
  };

  useEffect(() => {
    const fetchMyIssues = async () => {
      try {
      const res = await axios.get("/api/issues/my-reports");

        setIssues(res.data);
      } catch (err) {
        toast({
          title: "Error fetching your issues",
          description: err.response?.data?.message || err.message,
          status: "error",
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyIssues();
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

  const downloadImage = (url) => {
    const filename = url.split("/").pop();
    saveAs(url, filename);
  };

  // Filter out archived issues and apply status filter
  const activeIssues = issues.filter(issue => !issue.archived);
  const filteredIssues = statusFilter === "all"
    ? activeIssues
    : activeIssues.filter((i) => i.status === statusFilter);

  // Pagination calculations
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageIssues = filteredIssues.slice(startIndex, endIndex);

  const handleExport = () => {
    exportToPDF({
      title: `My Issues - ${user?.fullName || "Unknown User"}`,
      data: filteredIssues,
      type: "issues",
      property: property, // Add this line to pass the property object
    });
  };

  if (loading) {
    return (
      <Container maxW="8xl" py={8}>
        <Flex minH="400px" justify="center" align="center">
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
            <Text color={textColor} fontSize="lg">Loading your reported issues...</Text>
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
                <Heading size="lg" color={textColor}>My Reported Issues</Heading>
                <Text color="gray.500" fontSize="sm">
                  {filteredIssues.length} {filteredIssues.length === 1 ? 'issue' : 'issues'} reported by you
                  {statusFilter !== "all" && (
                    <Text as="span" fontWeight="500"> • {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace("-", " ")}</Text>
                  )}
                </Text>
              </VStack>
              
           <Stack
  direction={["column", "row"]} // Stack on mobile, inline on desktop
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

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <Card bg={cardBg} shadow="sm" borderRadius="xl">
            <CardBody py={12} textAlign="center">
              <Text color="gray.500" fontSize="lg">No issues found</Text>
              <Text color="gray.400" fontSize="sm" mt={2}>
                {statusFilter !== "all" ? `No ${statusFilter} issues available` : "You haven't reported any issues yet"}
              </Text>
            </CardBody>
          </Card>
        ) : (
          <>
            <VStack spacing={4} align="stretch">
              {currentPageIssues.map((issue) => (
                <Card 
                  key={issue._id}
                  bg={cardBg}
                  shadow="sm"
                  borderRadius="xl"
                  _hover={{ 
                    shadow: "md", 
                    transform: "translateY(-2px)",
                    transition: "all 0.2s"
                  }}
                  cursor="pointer"
                  onClick={() => openModal(issue)}
                >
                  <CardBody>
                    <Flex justify="space-between" align="start" gap={4}>
                      <VStack align="start" spacing={3} flex="1">
                        <HStack justify="space-between" width="100%">
                          <VStack align="start" spacing={1} flex="1">
                            <Text fontWeight="600" fontSize="lg" color={textColor} noOfLines={1}>
                              {issue.title}
                            </Text>
                            <Text color="gray.500" fontSize="sm" noOfLines={2}>
                              {issue.description}
                            </Text>
                          </VStack>
                          
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
                        
                        <Flex gap={6} wrap="wrap">
                          <HStack spacing={2}>
                            <Text fontSize="sm" fontWeight="500" color={textColor}>Location:</Text>
                            <Text fontSize="sm" color="gray.500">
                              {issue.roomNumber || issue.location}
                            </Text>
                          </HStack>
                          
                          <HStack spacing={2}>
                            <TimeIcon color="gray.400" boxSize={3} />
                            <Text fontSize="sm" color="gray.500">
                              {formatDateTime(issue.createdAt)}
                            </Text>
                          </HStack>
                          
                          {issue.department?.name && (
                            <HStack spacing={2}>
                              <Text fontSize="sm" fontWeight="500" color={textColor}>Department:</Text>
                              <Text fontSize="sm" color="gray.500">
                                {issue.department.name}
                              </Text>
                            </HStack>
                          )}
                        </Flex>
                        
                        {issue.attachments?.length > 0 && (
                          <HStack spacing={2}>
                            <Text fontSize="sm" color="gray.500">
                              📎 {issue.attachments.length} attachment{issue.attachments.length !== 1 ? 's' : ''}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                      
                      <IconButton
                        icon={<ViewIcon />}
                        size="md"
                        variant="ghost"
                        colorScheme="blue"
                        borderRadius="full"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(issue);
                        }}
                        _hover={{ bg: viewHoverBg }}
                      />
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </VStack>

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
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
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

      {/* View Modal */}
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
            {selectedIssue && (
              <VStack align="stretch" spacing={5}>
                <Card variant="outline" borderRadius="lg">
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Box>
                        <Text fontWeight="600" color={textColor} mb={1}>Title</Text>
                        <Text fontSize="lg">{selectedIssue.title}</Text>
                      </Box>
                      
                      <Box>
                        <Text fontWeight="600" color={textColor} mb={1}>Description</Text>
                        <Text color="gray.600">{selectedIssue.description}</Text>
                      </Box>
                      
                      <Flex gap={6}>
                        <Box>
                          <Text fontWeight="600" color={textColor} mb={1}>Location</Text>
                          <Text>{selectedIssue.roomNumber || selectedIssue.location}</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="600" color={textColor} mb={1}>Status</Text>
                          <Badge
                            colorScheme={getStatusColor(selectedIssue.status)}
                            variant="solid"
                            borderRadius="full"
                            px={3}
                            py={1}
                            textTransform="capitalize"
                          >
                            {selectedIssue.status.replace("-", " ")}
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
                            <Text>Date/Time Reported</Text>
                          </HStack>
                        </Text>
                        <Text>{formatDateTime(selectedIssue.createdAt)}</Text>
                      </Box>
                      
                      {selectedIssue.status === "resolved" && (
                        <>
                          <Box>
                            <Text fontWeight="600" color={textColor} mb={1}>
                              <HStack spacing={1}>
                                <CheckCircleIcon boxSize={4} color="green.500" />
                                <Text>Resolved On</Text>
                              </HStack>
                            </Text>
                            <Text>{formatDateTime(selectedIssue.resolvedAt)}</Text>
                          </Box>
                          
                          <Box>
                            <Text fontWeight="600" color={textColor} mb={1}>Resolution Remarks</Text>
                            <Text color="gray.600">{selectedIssue.remarks || "—"}</Text>
                          </Box>
                          
                          {selectedIssue.statusChangedBy && (
                            <Box>
                              <Text fontWeight="600" color={textColor} mb={1}>Resolved By</Text>
                              <HStack>
                                <Avatar size="sm" name={selectedIssue.statusChangedBy?.fullName} />
                                <Text>{selectedIssue.statusChangedBy?.fullName}</Text>
                              </HStack>
                            </Box>
                          )}
                        </>
                      )}
                      
                      {selectedIssue.department?.name && (
                        <Box>
                          <Text fontWeight="600" color={textColor} mb={1}>Assigned Department</Text>
                          <Text>{selectedIssue.department.name}</Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
                
                {selectedIssue.attachments?.length > 0 && (
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
            )}
          </ModalBody>
          
          <ModalFooter borderTopWidth="1px" borderColor={borderColor} pt={4}>
            <Button onClick={closeModal} colorScheme="blue" borderRadius="lg">
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MyReportedIssues;