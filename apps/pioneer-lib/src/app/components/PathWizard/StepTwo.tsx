import React, { useState, useEffect } from 'react';
import {
  Box, FormControl, FormLabel, Input, Flex, Text, useDisclosure, Collapse, Textarea, Table, Thead, Tbody, Tr, Th, Td, Button
} from '@chakra-ui/react';
import { bip32ToAddressNList, addressNListToBIP32 } from '@pioneer-platform/pioneer-coins';
import { ChevronDownIcon } from '@chakra-ui/icons';

const StepTwo = ({ usePioneer, networkId, entry, onEntryChange }:any) => {
  const { state } = usePioneer();
  const { app } = state;
  const [type, setType] = useState(entry.type);
  const { isOpen, onToggle } = useDisclosure();
  const [isPathValid, setIsPathValid] = useState(true);
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    if (app.paths) {
      const filteredPaths = app.paths.filter((pathObj:any) => pathObj.networks && pathObj.networks.includes(networkId));
      console.log('Filtered paths:', filteredPaths);
      setPaths(filteredPaths);
    }
  }, [app.paths, networkId]);

  const handlePathChange = (e:any) => {
    const newPath = e.target.value;
    try {
      const newAddressNList = bip32ToAddressNList(newPath);
      onEntryChange({
        ...entry,
        addressNList: newAddressNList,
        addressNListMaster: [...newAddressNList, 0, 0],
        path: newPath
      });
      setIsPathValid(true);
    } catch (error) {
      console.error("Error converting BIP32 path to addressNList:", error);
      setIsPathValid(false);
    }
  };

  const handleAddOne = (pathObj:any) => {
    const newAccountIndex = pathObj.addressNList[2] + 1; // Increment the account index
    const newAddressNList = [...pathObj.addressNList.slice(0, 2), newAccountIndex];
    const newAddressNListMaster = [...pathObj.addressNListMaster.slice(0, 3), newAccountIndex, 0];

    const newPathObj: any = {
      ...pathObj,
      note: pathObj.note.replace(/(\d+)$/, (match: string) => (parseInt(match) + 1).toString()),
      addressNList: newAddressNList,
      addressNListMaster: newAddressNListMaster,
    };

    // Update the paths array in the local state
    const updatedPaths:any = [...paths, newPathObj];
    setPaths(updatedPaths);

    // Logging the new path object for debugging
    console.log('New Path Object:', newPathObj);
  };

  return (
    <Box>
      <FormControl isInvalid={!isPathValid}>
        <FormLabel>Primary BIP32 Path</FormLabel>
        <Input
          name="path"
          value={entry.path || (entry.addressNList ? addressNListToBIP32(entry.addressNList) : '')}
          onChange={handlePathChange}
          placeholder="m/44'/0'/0'/0/0"
          borderColor={isPathValid ? "green.500" : undefined}
        />
        {!isPathValid && (
          <Text color="red.500" mt={2}>
            Not a valid BIP32 path. Please correct the path.
          </Text>
        )}
      </FormControl>

      <Flex alignItems="center" mt={4}>
        <Text flexShrink={0}>Advanced</Text>
        <ChevronDownIcon
          onClick={onToggle}
          aria-label="Toggle advanced JSON edit"
          ml={2}
        />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box mt={4} p={4} border="1px" borderColor="gray.300">
          <Textarea
            value={JSON.stringify(entry, null, 2)}
            onChange={(e) => onEntryChange(JSON.parse(e.target.value))}
            h="200px"
          />
        </Box>
      </Collapse>

      <Table variant="striped" colorScheme="teal" mt={6}>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>Path</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paths.map((pathObj: any, index: number) => (
            <Tr key={index}>
              <Td>{pathObj.note}</Td>
              <Td>{addressNListToBIP32(pathObj.addressNList)}</Td>
              <Td>
                <Button onClick={() => handleAddOne(pathObj)} colorScheme="blue">Add +1</Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default StepTwo;
