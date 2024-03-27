import React, { useEffect, useState } from 'react';
import { Box, Stack, Avatar, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { usePioneer } from '@coinmasters/pioneer-react';
// Ensure addressNListToBIP32 is correctly imported from your utilities or a library
import { addressNListToBIP32 } from '@pioneer-platform/pioneer-coins';

export default function Path({ usePioneer, path }: any) {
  const { state } = usePioneer();
  const { app } = state;

  // State to hold the converted path
  const [bip32Path, setBip32Path] = useState('');
  const [bip32PathMaster, setBip32PathMaster] = useState('');
  const [data, setData] = useState({});

  useEffect(() => {
    // Safe parsing of path to object
    let pathData;
    try {
      pathData = (typeof path === 'object' && path !== null) ? path : JSON.parse(path);
    } catch (error) {
      console.error("Error parsing path:", error);
      pathData = {}; // Fallback to an empty object on error
    }

    // Convert addressNList to BIP32 path and set it
    if (pathData.addressNList) {
      const convertedPath = addressNListToBIP32(pathData.addressNList);
      setBip32Path(convertedPath);
    }
    if (pathData.addressNListMaster) {
      const convertedPath = addressNListToBIP32(pathData.addressNListMaster);
      setBip32PathMaster(convertedPath);
    }
    // Exclude addressNList from data to be displayed
    const { addressNList, ...rest } = pathData;
    setData(rest);
  }, [path]);

  return (
    <Stack>
      <Box>
        <Avatar size="xl" name="Placeholder Icon" /> {/* Placeholder for avatar icon */}
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Key</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          {/* Displaying the converted BIP32 path */}
          {bip32Path && (
            <Tr>
              <Td>BIP32 Path Account</Td>
              <Td>{bip32Path}</Td>
            </Tr>
          )}
          {bip32Path && (
            <Tr>
              <Td>BIP32 Path master</Td>
              <Td>{bip32PathMaster}</Td>
            </Tr>
          )}
          {/* Display other path data */}
          {Object.entries(data).map(([key, value]) => (
            <Tr key={key}>
              <Td>{key}</Td>
              <Td>{value?.toString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
}
