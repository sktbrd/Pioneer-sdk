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
  useDisclosure,
  Flex,
  IconButton,
  Card,
  useClipboard,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
import { usePioneer } from '../../context';
import Path from '../../components/Path';
// import { getWalletContent } from '../../components/WalletIcon';
//@ts-ignore
import { addressNListToBIP32, getPaths } from '@pioneer-platform/pioneer-coins';

export default function Paths() {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [selectedPubkey, setSelectedPubkey] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState('');
  const [paths, setPaths] = useState([]);

  let loadPathsView = async function(){
    try{
      if (app?.paths.length !== 0) {
        console.log('app?.paths: ', app);
        console.log('app?.paths: ', app?.paths.length);
        console.log('app?.blockchains: ', app?.blockchains);
        setPaths(app?.paths);
      } else {
        console.log("Load paths for last connected wallet")
        //get last paired wallet
        let lastPairedWallet = localStorage.getItem('lastPairedWallet');
        // Retrieve custom and disabled paths for the wallet from localStorage
        const customPathsForWalletStr = localStorage.getItem(lastPairedWallet + ':paths:add');
        const disabledPathsForWalletStr = localStorage.getItem(lastPairedWallet + ':paths:removed');

        // Parse the retrieved strings as arrays
        const customPathsForWallet = customPathsForWalletStr ? JSON.parse(customPathsForWalletStr) : [];
        const disabledPathsForWallet = disabledPathsForWalletStr ? JSON.parse(disabledPathsForWalletStr) : [];


        //get default paths
        let defaultPaths = getPaths(app?.blockchains);
        console.log("defaultPaths: ",defaultPaths)

        // Combine default paths with custom paths, ensuring unique values
        const combinedPaths = [...new Set([...defaultPaths, ...customPathsForWallet])];

        // Filter out disabled paths
        const pathsView = combinedPaths.filter(path => !disabledPathsForWallet.includes(path));

        console.log("pathsView: ", pathsView);

        // Assuming setPaths is a function defined to update your paths state
        setPaths(pathsView);
        //get disabled paths for wallet
      }
    }catch(e){
      console.error("Failed to load paths view: ", e);
    }
  }

  useEffect(() => {
    loadPathsView();
  }, [app, app?.paths]);

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
      {paths.map((key: any, index: any) => (
        <Card key={index} p={4} borderWidth="1px" borderRadius="lg" alignItems="center" justifyContent="space-between">
          <Box>
            <Text fontWeight="bold">{key.network}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">{key.symbol}: {key.type}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">{key.note}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">{addressNListToBIP32(key.addressNList)}</Text>
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
        </Card>
      ))}

      <Modal isOpen={isOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pubkey Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPubkey && <Path path={selectedPubkey} onClose={onModalClose} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
