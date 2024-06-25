import React, { useState, useEffect } from 'react';
import {
  Box, Button, Flex, FormControl, FormLabel, Input, useToast, Avatar, HStack, Text, Table, Thead, Tbody, Tr, Th, Td, Spinner
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';

const StepIndicator = ({ steps, currentStep }: any) => (
  <HStack spacing={4} justify="center" mb={6}>
    {steps.map((step: any, index: any) => (
      <Box
        key={index}
        p={2}
        borderRadius="full"
        bg={currentStep === index + 1 ? "blue.500" : "gray.200"}
        color={currentStep === index + 1 ? "white" : "gray.400"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        width={8}
        height={8}
      >
        {index + 1}
      </Box>
    ))}
  </HStack>
);

const SelectBlockchain = ({ onSelect, app }: any) => {
  const [blockchains, setBlockchains] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBlockchains = async () => {
      const data = await app.pioneer.AtlasNetwork();
      console.log('data: ', data);
      console.log('data: ', data.data);
      setBlockchains(data.data);
    };
    fetchBlockchains();
  }, [app]);

  const filteredBlockchains = blockchains?.filter((blockchain: any) =>
    blockchain.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <FormControl>
        <FormLabel>Select Blockchain</FormLabel>
        <Input
          placeholder="Search Blockchain"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          mb={4}
        />
        <Box maxHeight="200px" overflowY="auto" border="1px solid gray" borderRadius="md">
          {filteredBlockchains.length > 0 ? (
            filteredBlockchains.map((chain: any) => (
              <Box key={chain._id} p={2} onClick={() => onSelect(chain)} cursor="pointer" _hover={{ bg: "gray.100" }}>
                <Flex align="center">
                  <Avatar size="sm" src={chain.image} mr={2} />
                  <Text>{chain.name}</Text>
                </Flex>
              </Box>
            ))
          ) : (
            <Flex justify="center" align="center" p={4}>
              <Spinner />
            </Flex>
          )}
        </Box>
      </FormControl>
    </Box>
  );
};

const ReviewBlockchain = ({ blockchain }: any) => (
  <Box>
    <Text fontSize="xl" mb={4}>Review Blockchain Details</Text>
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Field</Th>
          <Th>Value</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>Name</Td>
          <Td>{blockchain.name}</Td>
        </Tr>
        <Tr>
          <Td>Symbol</Td>
          <Td>{blockchain.symbol}</Td>
        </Tr>
        <Tr>
          <Td>Chain ID</Td>
          <Td>{blockchain.chainId}</Td>
        </Tr>
        <Tr>
          <Td>RPC URL</Td>
          <Td>{blockchain.service}</Td>
        </Tr>
        <Tr>
          <Td>Explorer URL</Td>
          <Td>{blockchain.infoURL}</Td>
        </Tr>
      </Tbody>
    </Table>
  </Box>
);

const TestBlockchain = ({ success }: any) => (
  <Box textAlign="center">
    {success ? (
      <>
        <CheckCircleIcon boxSize="50px" color="green.500" />
        <Text fontSize="2xl" mt={4}>Test Successful</Text>
        {/* You can add confetti animation here */}
      </>
    ) : (
      <>
        <WarningIcon boxSize="50px" color="red.500" />
        <Text fontSize="2xl" mt={4}>Test Failed</Text>
      </>
    )}
  </Box>
);

const BlockchainWizard = ({ usePioneer }: any) => {
  const { state } = usePioneer();
  const { app } = state;
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBlockchain, setSelectedBlockchain] = useState<any>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  const nextStep = () => setCurrentStep(currentStep < 3 ? currentStep + 1 : currentStep);
  const prevStep = () => setCurrentStep(currentStep > 1 ? currentStep - 1 : currentStep);

  const handleSelectBlockchain = (blockchain: any) => {
    setSelectedBlockchain(blockchain);
    nextStep();
  };

  const handleTestBlockchain = () => {
    // Placeholder logic for testing blockchain
    const success = Math.random() > 0.5; // Random success/failure
    setTestSuccess(success);
    nextStep();
  };

  return (
    <Box p={4}>
      <Flex direction="column" align="center" justify="center">
        <StepIndicator steps={['Select', 'Review', 'Test']} currentStep={currentStep} />

        {currentStep === 1 && <SelectBlockchain onSelect={handleSelectBlockchain} app={app} />}
        {currentStep === 2 && selectedBlockchain && <ReviewBlockchain blockchain={selectedBlockchain} />}
        {currentStep === 3 && <TestBlockchain success={testSuccess} />}

        <HStack spacing={4} mt={6}>
          <Button leftIcon={<ChevronLeftIcon />} onClick={prevStep} isDisabled={currentStep === 1}>
            Back
          </Button>
          {currentStep === 2 && (
            <Button rightIcon={<ChevronRightIcon />} onClick={handleTestBlockchain}>
              Test
            </Button>
          )}
          {currentStep === 3 && (
            <Button colorScheme="blue" onClick={() => toast({
              title: "Blockchain Added",
              description: "The blockchain has been added successfully.",
              status: "success",
              duration: 9000,
              isClosable: true,
            })}>
              Finish
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default BlockchainWizard;
