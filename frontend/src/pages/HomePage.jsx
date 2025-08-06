// pages/HomePage.jsx
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Container,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue("white", "gray.800");
  const bgOverlay = useColorModeValue("rgba(255, 255, 255, 0.85)", "rgba(0, 0, 0, 0.65)");

  return (
    <Box
      minH="100vh"
      bgImage="url('https://images.unsplash.com/photo-1501117716987-c8e1ecb210d5?auto=format&fit=crop&w=1470&q=80')"
      bgSize="cover"
      bgPosition="center"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box bg={bgOverlay} w="100%" h="100%" position="absolute" top="0" left="0" />

      <Container position="relative" zIndex={1} maxW="md">
        <Card borderRadius="2xl" boxShadow="xl" bg={cardBg}>
          <CardBody>
            <VStack spacing={6} py={6} px={4}>
              <Heading size="lg" color="green.700" textAlign="center">
                Welcome to the Hotel Portal
              </Heading>

              <Text color="gray.600" textAlign="center" fontSize="md">
                Please select your role to continue
              </Text>

              <VStack spacing={4} w="full">
                <Button
                  colorScheme="green"
                  size="lg"
                  w="full"
                  onClick={() => navigate("/staff-login")}
                >
                  Staff Login
                </Button>

                <Button
                  colorScheme="green"
                  size="lg"
                  w="full"
                  onClick={() => navigate("/guest-login")}
                >
                  Guest Login
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default HomePage;
