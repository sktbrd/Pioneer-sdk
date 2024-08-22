import React from 'react';
import { Box, Heading, Text, Image, Stack, Button, List, ListItem, ListIcon } from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md'; // Ensure you have react-icons installed to use this

export const Blockchains = ({ setPage }: any) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '50%' }}>
                <Heading size="lg" color="blue.600">Discover Blockchains</Heading>
                <Text fontSize="md" mt={3}>
                    Dive into blockchain technology with Pioneers:
                </Text>
                <List spacing={2} mt={2} mb={3}>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Charting and indexing block explorers for seamless access to data.
                    </ListItem>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Ensuring reliable, live data for deep blockchain engagement.
                    </ListItem>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Supported by expert and AI-driven insights to optimize interactions.
                    </ListItem>
                </List>
                <Button colorScheme="blue" size="lg" onClick={() => setPage('landing')}>
                    Go Back
                </Button>
            </div>
            <div style={{ width: '50%' }}>
                <Image
                    src="https://i.imgur.com/ZHPnNSy.png"
                    alt="Blockchain Overview"
                    boxSize="100%"
                />
            </div>
        </div>
    );
}

export default Blockchains;
