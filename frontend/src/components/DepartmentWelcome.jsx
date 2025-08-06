import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
} from "@chakra-ui/react";
import {
  AddIcon,
  ViewIcon,
  WarningIcon,
  CheckCircleIcon,
  StarIcon,
} from "@chakra-ui/icons";
import useAuthStore from "../store/useAuthStore.js";

const DepartmentWelcome = () => {
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase();
  const canViewAllIssues = ['front office manager', 'duty manager', 'general manager'].includes(role);
  const canManageGuests = role === 'front office manager';

  return (
    <Card>
      <CardBody>
        <Heading size="lg" mb={4} color="green.700">
          Welcome to Your Department Dashboard
        </Heading>

        <Text fontSize="sm" color="gray.600" mb={6}>
          Report issues, track submissions, and collaborate with your team to ensure smooth operations across all departments.
        </Text>

        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <Card flex="1" bg="green.50" borderLeft="4px solid" borderColor="green.500">
              <CardBody>
                <HStack spacing={3}>
                  <Icon as={AddIcon} boxSize={5} color="green.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold" color="green.700">Report Issues</Text>
                    <Text fontSize="xs" color="gray.600">Submit maintenance requests and operational issues.</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card flex="1" bg="blue.50" borderLeft="4px solid" borderColor="blue.500">
              <CardBody>
                <HStack spacing={3}>
                  <Icon as={ViewIcon} boxSize={5} color="blue.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold" color="blue.700">Issue Tracking</Text>
                    <Text fontSize="xs" color="gray.600">Monitor your reports and departmental issues.</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </HStack>

          <HStack spacing={4}>
            {canViewAllIssues && (
              <Card flex="1" bg="purple.50" borderLeft="4px solid" borderColor="purple.500">
                <CardBody>
                  <HStack spacing={3}>
                    <Icon as={CheckCircleIcon} boxSize={5} color="purple.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="bold" color="purple.700">Issue Management</Text>
                      <Text fontSize="xs" color="gray.600">Oversee and resolve all reported issues.</Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            )}

            {canManageGuests && (
              <Card flex="1" bg="teal.50" borderLeft="4px solid" borderColor="teal.500">
                <CardBody>
                  <HStack spacing={3}>
                    <Icon as={StarIcon} boxSize={5} color="teal.500" />
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="bold" color="teal.700">Guest Management</Text>
                      <Text fontSize="xs" color="gray.600">Manage guest accounts and access permissions.</Text>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            )}
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default DepartmentWelcome;