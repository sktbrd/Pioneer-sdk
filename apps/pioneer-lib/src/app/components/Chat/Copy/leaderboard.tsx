import React from 'react';
import { Box, Heading, Text, Image, Stack, Button, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

export const Leaderboard = ({ setPage }:any) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '70%' }}>
                <Heading size="lg" color="blue.600">Pioneer Leaderboard</Heading>
                <Text fontSize="md" mt={3} mb={3}>
                    Top Pioneers are rewarded for their contributions with access to exclusive tools and features. At the heart of Pioneer is an AI-driven system designed to assist and elevate the efforts of our most active members.
                </Text>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Avatar</Th>
                            <Th>Pioneer</Th>
                            <Th isNumeric>Points</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td><Image src="https://pioneers.dev/coins/bithighlander_Depict_a_pioneer_casting_a_magical_spell_of_smart_b021fcff-a67b-4595-a79e-74980ba3d108_4.png" boxSize="50px" alt="Pioneer 1"/></Td>
                            <Td>Pioneer01</Td>
                            <Td isNumeric>1520</Td>
                        </Tr>
                        <Tr>
                            <Td><Image src="https://pioneers.dev/coins/bithighlander_Illustrate_a_pioneer_of_Litecoin_mining_the_first_168530de-0558-4d3a-8a44-352151346593_2.png" boxSize="50px" alt="Pioneer 2"/></Td>
                            <Td>Charter10</Td>
                            <Td isNumeric>1385</Td>
                        </Tr>
                    </Tbody>
                </Table>
                <Button colorScheme="blue" size="lg" mt={4} onClick={() => setPage('landing')}>
                    Go Back
                </Button>
            </div>
            <div style={{ width: '30%' }}>
                <Image
                    src="https://i.imgur.com/1CeVQtw.png"
                    alt="Pioneer Activities"
                    boxSize="100%"
                />
            </div>
        </div>
    );
}

export default Leaderboard;
