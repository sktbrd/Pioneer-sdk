import { Avatar, Box, Stack, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';

import { usePioneer } from '../../context';

export default function Balance({ onClose, balance }: any) {
  const { state } = usePioneer();
  const { app } = state;

  // Checking if pubkey is already an object, if not, parse it.
  const data =
    typeof balance === 'object' && balance !== null ? balance : JSON.parse(balance || '{}');

  return (
    <Stack>
      <Box>
        <Avatar name="Placeholder Icon" size="xl" /> {/* Placeholder for avatar icon */}
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Key</Th>
            <Th>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(data as Record<string, unknown>).map(([key, value]) => (
            <Tr key={key}>
              <Td>{key}</Td>
              <Td>
                {typeof value === 'string'
                  ? value
                  : typeof value === 'number'
                    ? value.toString()
                    : typeof value === 'boolean'
                      ? value.toString()
                      : value === null
                        ? 'null'
                        : typeof value === 'object'
                          ? JSON.stringify(value)
                          : 'Unsupported Type'}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
}
