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
  FormControl,
  FormLabel,
  Input,
  useClipboard,
} from '@chakra-ui/react';
import { CopyIcon, CheckIcon } from '@chakra-ui/icons';
// import { usePioneer } from '@coinmasters/pioneer-react';
import Path from '../../components/Path';
import PathWizard from '../../components/PathWizard';
// import { getWalletContent } from '../../components/WalletIcon';
//@ts-ignore
import { addressNListToBIP32, getPaths } from '@pioneer-platform/pioneer-coins';

export default function Paths({usePioneer}: any) {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [selectedPath, setSelectedPath] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState('');
  const [paths, setPaths] = useState<any>([]);
  const [pathDetails, setPathDetails] = useState<any>(selectedPath || {});
  const [isEditMode, setIsEditMode] = useState(false);

  const loadPathsView = async () => {
    try {
      // Ensure this code runs only in a browser environment
      if (typeof window === 'undefined') return;

      // If app.paths is not empty, update the paths state directly
      if (app?.paths?.length > 0) {
        //console.log('app.paths: ', app.paths);
        //console.log('app.blockchains: ', app.blockchains);
        setPaths(app.paths);
        return; // Exit the function early
      }

      // Log when loading paths for the last connected wallet
      //console.log("Load paths for last connected wallet");

      // Get the last paired wallet from localStorage
      const lastPairedWallet = window.localStorage.getItem('lastPairedWallet');

      // Retrieve custom and disabled paths for the wallet from localStorage
      const customPathsForWallet = JSON.parse(window.localStorage.getItem(`${lastPairedWallet}:paths:add`) || '[]');
      const disabledPathsForWallet = JSON.parse(window.localStorage.getItem(`${lastPairedWallet}:paths:removed`) || '[]');

      // Get default paths based on app.blockchains
      const defaultPaths = getPaths(app?.blockchains);
      //console.log("defaultPaths: ", defaultPaths);

      // Combine default paths with custom paths, ensuring unique values
      const combinedPaths = Array.from(new Set([...defaultPaths, ...customPathsForWallet]));

      // Filter out disabled paths
      const pathsView = combinedPaths.filter(path => !disabledPathsForWallet.includes(path));
      //console.log("pathsView: ", pathsView);

      // Update the paths state
      setPaths(pathsView);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPathsView();
  }, [app, app?.paths]);

  const handlePathClick = (path: any) => {
    setSelectedPath(path);
    setIsEditMode(true);
    onOpen();
  };

  const handleCopy = (address: any) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(''), 3000);
  };

  const onAddPath = () => {
    //open modal
    //console.log('Add Path');
    setIsEditMode(true)
    onOpen()
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
            <Text fontWeight="bold">{addressNListToBIP32(key.addressNList || [])}</Text>
          </Box>
          <Flex alignItems="center">
            <IconButton
              icon={copiedAddress === key.address ? <CheckIcon /> : <CopyIcon />}
              onClick={() => handleCopy(key.address)}
              aria-label="Copy address"
              mr={2}
            />
            <Button onClick={() => handlePathClick(key)}>view</Button>
          </Flex>
        </Card>
      ))}
      <Button onClick={onAddPath} mt={4}>
        Add Custom Path
      </Button>
      <Modal isOpen={isOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditMode ? 'Path Details' : 'Add Custom Path'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isEditMode ? (<div>
              <PathWizard />
            </div>) : (<div>
              <Path path={selectedPath} />
            </div>)}

          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
