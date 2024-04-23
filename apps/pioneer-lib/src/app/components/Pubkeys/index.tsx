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
  Flex,
  IconButton,
  Input,
  FormControl,
  FormLabel,
  useClipboard,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon, AddIcon } from '@chakra-ui/icons';
import Pubkey from '../../components/Pubkey'; // Adjust the import path as needed
import PubkeyAdd from '../../components/PubkeyAdd'; // Adjust the import path as needed

export function Pubkeys({usePioneer}:any) {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const [selectedPubkey, setSelectedPubkey] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState('');

  useEffect(() => {
    if (app?.pubkeys) {
      console.log('app?.pubkeys: ', app?.pubkeys);
    }
  }, [app, app?.pubkeys]);

  const handlePubkeyClick = (pubkey: any) => {
    setSelectedPubkey(pubkey);
    onOpen();
  };

  const handleCopy = (address: any) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(''), 3000);
  };

  return (
    <div>
      <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={onAddModalOpen}>
        Add Pubkey
      </Button>
      <div>
        total: {app?.pubkeys?.length}
        {app?.pubkeys?.map((key: any, index: any) => (
          <Flex key={index} p={4} borderWidth="1px" borderRadius="lg" alignItems="center" justifyContent="space-between">
            <Box>
              <Text fontWeight="bold">type: {key.type}</Text>
              <Text fontWeight="bold">networks: {key.networks}</Text>
              <Text fontWeight="bold">address: {key.master || key.address}</Text>
              <Text fontWeight="bold">pubkey: {key.pubkey}</Text>
            </Box>
            <Flex alignItems="center">
              <IconButton
                icon={copiedAddress === key.address ? <CheckIcon /> : <CopyIcon />}
                onClick={() => handleCopy(key.address)}
                aria-label="Copy address"
                mr={2}
              />
              <Button onClick={() => handlePubkeyClick(key)}>Select</Button>
            </Flex>
          </Flex>
        ))}
      </div>

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
            <PubkeyAdd usePioneer={usePioneer}/>
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
