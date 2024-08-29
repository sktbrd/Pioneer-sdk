import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip,
  Flex,
  IconButton,
  Spinner,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import Pubkey from '../../components/Pubkey'; // Adjust the import path as needed
import PubkeyAdd from '../../components/PubkeyAdd'; // Adjust the import path as needed

export function Inputs({ usePioneer, networkId }: any) {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const [selectedPubkey, setSelectedPubkey] = useState(null);
  const [copiedValue, setCopiedValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [unspent, setUnspent] = useState([]);

  useEffect(() => {
    const fetchInputs = async () => {
      let allBtcPubkeys = app.pubkeys.filter((key: any) => key.networks.includes(networkId));
      let fetchedUnspent:any = [];

      for (let i = 0; i < allBtcPubkeys.length; i++) {
        let pubkey = allBtcPubkeys[i];
        let rawInputs = await app.pioneer.ListUnspent({ network: 'BTC', xpub: pubkey.pubkey });
        fetchedUnspent = fetchedUnspent.concat(rawInputs.data);
      }
      setUnspent(fetchedUnspent);
      setLoading(false);
    };

    if (app.pubkeys && app.pubkeys.length > 0) {
      fetchInputs();
    }
  }, [app.pubkeys, app.pioneer]);

  const handlePubkeyClick = (pubkey: any) => {
    setSelectedPubkey(pubkey);
    onOpen();
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(''), 3000);
  };

  return (
    <div>
      <Box p={4}>
        {loading ? (
          <Flex justify="center" align="center">
            <Spinner size="xl" />
            <Text ml={3}>Loading inputs...</Text>
          </Flex>
        ) : (
          <>
            <Text fontWeight="bold">Total Inputs: {unspent.length}</Text>
            {unspent.map((input: any, index: any) => (
              <Card key={index} mb={4} borderWidth="1px" borderRadius="lg">
                <CardBody>
                  <Box mb={2} maxWidth="330px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    <Text fontWeight="bold">TXID:</Text>
                    <Tooltip label={input.txid}>
                      <Text isTruncated>{input.txid}</Text>
                    </Tooltip>
                  </Box>
                  <Box mb={2} maxWidth="330px">
                    <Text fontWeight="bold">VOUT:</Text>
                    <Text>{input.vout}</Text>
                  </Box>
                  <Box mb={2} maxWidth="330px">
                    <Text fontWeight="bold">Value:</Text>
                    <Text>{input.value} satoshis</Text>
                  </Box>
                  <Box mb={2} maxWidth="330px">
                    <Text fontWeight="bold">Address:</Text>
                    <Flex alignItems="center" overflow="hidden">
                      <Tooltip label={input.address}>
                        <Text isTruncated>{input.address}</Text>
                      </Tooltip>
                      <Tooltip label={copiedValue === input.address ? "Copied" : "Copy Address"} hasArrow>
                        <IconButton
                          icon={copiedValue === input.address ? <CheckIcon /> : <CopyIcon />}
                          onClick={() => handleCopy(input.address)}
                          aria-label="Copy address"
                          size="sm"
                          ml={2}
                        />
                      </Tooltip>
                    </Flex>
                  </Box>
                  <Box mb={2} maxWidth="330px">
                    <Text fontWeight="bold">Path:</Text>
                    <Text isTruncated>{input.path}</Text>
                  </Box>
                  <Box mb={2} maxWidth="330px">
                    <Text fontWeight="bold">Confirmations:</Text>
                    <Text>{input.confirmations}</Text>
                  </Box>
                  <Box mb={2} maxWidth="330px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                    <Text fontWeight="bold">Hex:</Text>
                    <Tooltip label={input.hex}>
                      <Text isTruncated>{input.hex}</Text>
                    </Tooltip>
                  </Box>
                </CardBody>
              </Card>
            ))}
          </>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size={'xxl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pubkey Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPubkey && <Pubkey pubkey={selectedPubkey} onClose={onClose} />}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Pubkey</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <PubkeyAdd usePioneer={usePioneer} />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onAddModalClose}>
              Save
            </Button>
            <Button variant="ghost" onClick={onAddModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Inputs;
