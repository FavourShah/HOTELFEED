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
  AtSignIcon,
  SettingsIcon,
  InfoOutlineIcon,
  CalendarIcon,
} from "@chakra-ui/icons";

const ITWelcome = () => {
  return (
    <Card>
      <CardBody>
        <Heading size="lg" mb={4} color="green.700">
          Welcome to the IT Dashboard
        </Heading>

        <Text fontSize="sm" color="gray.600" mb={6}>
          As an IT administrator, you can manage staff and guests, configure rooms, assign roles, and monitor all issues reported across departments.
        </Text>

        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <Card flex="1" bg="purple.50" borderLeft="4px solid" borderColor="purple.500">
              <CardBody>
                <HStack spacing={3}>
                  <Icon as={AtSignIcon} boxSize={5} color="purple.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold" color="purple.700">User Management</Text>
                    <Text fontSize="xs" color="gray.600">Manage all staff and guest accounts.</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card flex="1" bg="blue.50" borderLeft="4px solid" borderColor="blue.500">
              <CardBody>
                <HStack spacing={3}>
                  <Icon as={CalendarIcon} boxSize={5} color="blue.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold" color="blue.700">Room Settings</Text>
                    <Text fontSize="xs" color="gray.600">Set up and manage guest room details.</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </HStack>

          <HStack spacing={4}>
            <Card flex="1" bg="yellow.50" borderLeft="4px solid" borderColor="yellow.400">
              <CardBody>
                <HStack spacing={3}>
                  <Icon as={SettingsIcon} boxSize={5} color="yellow.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold" color="yellow.700">Role & Department Setup</Text>
                    <Text fontSize="xs" color="gray.600">Configure staff roles and departmental structure.</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>

            <Card flex="1" bg="green.50" borderLeft="4px solid" borderColor="green.600">
              <CardBody>
                <HStack spacing={3}>
                  <Icon as={InfoOutlineIcon} boxSize={5} color="green.600" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold" color="green.700">Issue Oversight</Text>
                    <Text fontSize="xs" color="gray.600">View and resolve all reported issues.</Text>
                  </VStack>
                </HStack>
              </CardBody>
            </Card>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ITWelcome;
