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
  Badge,
  Flex,
  IconButton,
  Collapse,
  Input,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon, AddIcon } from '@chakra-ui/icons';
import Pubkey from '../../components/Pubkey'; // Adjust the import path as needed
import PubkeyAdd from '../../components/PubkeyAdd'; // Adjust the import path as needed

export function Pubkeys({ usePioneer, networkId, pubkey }: any) {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const [selectedPubkey, setSelectedPubkey] = useState(null);
  const [copiedValue, setCopiedValue] = useState('');
  const [expandedKey, setExpandedKey] = useState('');

  useEffect(() => {
    if (app?.pubkeys) {
      console.log('app?.pubkeys: ', app?.pubkeys);
    }
  }, [app, app?.pubkeys]);

  const handlePubkeyClick = (pubkey: any) => {
    setSelectedPubkey(pubkey);
    onOpen();
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(''), 3000);
  };

  const toggleExpand = (key: string) => {
    setExpandedKey(expandedKey === key ? '' : key);
  };

  // Filter pubkeys based on networkId and pubkey
  const filteredPubkeys = app?.pubkeys?.filter((key: any) => {
    const matchesNetworkId = !networkId || key.networks.includes(networkId);
    const matchesPubkey = !pubkey || key.pubkey === pubkey;
    return matchesNetworkId && matchesPubkey;
  }) || [];

  return (
    <div>
      <Box p={4}>
        <Text fontWeight="bold">Total: {filteredPubkeys.length}</Text>
        {filteredPubkeys.map((key:any, index:any) => (
          <Flex
            key={index}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            alignItems="flex-start"
            justifyContent="space-between"
            my={2}
            direction="column"
            width="100%"
          >
            <Box mb={2}>
              <Text fontWeight="bold"><Badge colorScheme='green'>{key.note}</Badge></Text>
            </Box>
            <Box mb={2}>
              <Text fontWeight="bold">Type: <Badge colorScheme='green'>{key.type}</Badge></Text>
            </Box>
            <Box mb={2} width="100%">
              <Flex width="100%" alignItems="center">
                <Text fontWeight="bold" flexShrink={0} mr={2}>
                  Address:
                </Text>
                <Input value={key.master || key.address} isReadOnly size="xl" flex="1" mr={2} />
                <Tooltip label={copiedValue === (key.master || key.address) ? "Copied" : "Copy Address"} hasArrow>
                  <IconButton
                    icon={copiedValue === (key.master || key.address) ? <CheckIcon /> : <CopyIcon />}
                    onClick={() => handleCopy(key.master || key.address)}
                    aria-label="Copy address"
                  />
                </Tooltip>
              </Flex>
            </Box>
            {(key.master || key.address) !== key.pubkey && (
              <Box mb={2} width="100%">
                <Flex width="100%" alignItems="center">
                  <Text fontWeight="bold" flexShrink={0} mr={2}>
                    Pubkey:
                  </Text>
                  <Input value={key.pubkey} isReadOnly size="sm" flex="1" mr={2} />
                  <Tooltip label={copiedValue === key.pubkey ? "Copied" : "Copy Pubkey"} hasArrow>
                    <IconButton
                      icon={copiedValue === key.pubkey ? <CheckIcon /> : <CopyIcon />}
                      onClick={() => handleCopy(key.pubkey)}
                      aria-label="Copy pubkey"
                    />
                  </Tooltip>
                </Flex>
              </Box>
            )}
          </Flex>
        ))}
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

export default Pubkeys;
