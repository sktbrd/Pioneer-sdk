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
import { usePioneer } from '@coinmasters/pioneer-react';
import Path from '../../components/Path';
// import { getWalletContent } from '../../components/WalletIcon';
//@ts-ignore
import { addressNListToBIP32, getPaths } from '@pioneer-platform/pioneer-coins';

export default function Paths() {
  const { state } = usePioneer();
  const { app } = state;
  const { isOpen, onOpen, onClose: onModalClose } = useDisclosure();
  const [selectedPath, setSelectedPath] = useState(null);
  const [copiedAddress, setCopiedAddress] = useState('');
  const [paths, setPaths] = useState<any>([]);
  const [pathDetails, setPathDetails] = useState<any>(selectedPath || {});
  const [isEditMode, setIsEditMode] = useState(false);

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
        const combinedPaths = Array.from(new Set([...defaultPaths, ...customPathsForWallet]));


        // Filter out disabled paths
        const pathsView = combinedPaths.filter(path => !disabledPathsForWallet.includes(path));

        console.log("pathsView: ", pathsView);

        // Assuming setPaths is a function defined to update your paths state
        setPaths(pathsView || []);
        //get disabled paths for wallet
      }
    }catch(e){
      console.error("Failed to load paths view: ", e);
    }
  }

  useEffect(() => {
    loadPathsView();
  }, [app, app?.paths]);

  const handlePathClick = (path: any) => {
    setSelectedPath(path);
    onOpen();
  };

  const handleCopy = (address: any) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(''), 3000);
  };

  const onAddPath = () => {
    //open modal
    console.log('Add Path');
    onOpen()
  };

    const handleChange = (e:any) => {
      const { name, value } = e.target;
      setPathDetails((prevDetails:any) => ({ ...prevDetails, [name]: value }));
    };

  const renderForm = () => (
    Object.keys(selectedPath ?? {}).map(key => ( // If selectedPath is nullish, default to an empty object
      <FormControl key={key} mt={4}>
        <FormLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</FormLabel>
        <Input name={key} value={pathDetails[key]} onChange={handleChange} placeholder={`Enter ${key}`} />
      </FormControl>
    ))
  );

  const renderDetails = () => {
    if (!selectedPath) return null; // Or return some placeholder UI

    const renderValue = (value: unknown): string => {
      if (Array.isArray(value)) {
        // TypeScript understands value is an array here, so .join() is safe
        return value.join(', ');
      }
      if (value === null || value === undefined) {
        // Handle null and undefined explicitly
        return '';
      }
      // For other types, calling .toString() is safe.
      // If value is an object, consider checking for a custom .toString() method if needed.
      return value.toString();
    };

    return (
      Object.entries(selectedPath).map(([key, value]) => (
        <Box key={key} p={2}>
          <Text fontWeight="bold">{`${key.charAt(0).toUpperCase()}${key.slice(1)}:`}</Text>
          <Text>{renderValue(value)}</Text>
        </Box>
      ))
    );
  };

  const onSavePath = async function(path: any){
    try{
      console.log("onSavePath: ", pathDetails);
    }catch(e){
      console.error(e)
    }
  }



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
          <ModalHeader>{isEditMode ? 'Edit Path Details' : 'Path Details'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {isEditMode ? renderForm() : renderDetails()}
            <Button mt={4} colorScheme="blue" onClick={() => {
              if (isEditMode) {
                onSavePath(pathDetails); // Function to save the edited details
              }
              setIsEditMode(!isEditMode);
            }}>
              {isEditMode ? 'Save' : 'Edit'}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
