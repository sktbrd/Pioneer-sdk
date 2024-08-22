import React from 'react';
import { Box, Heading, Text, Image, Stack, Button, List, ListItem, ListIcon, Link } from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md'; // Ensure you have react-icons installed to use this

export const Nodes = ({ setPage }: any) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '50%' }}>
                <Heading size="lg" color="blue.600">Optimize Your Network with Pioneer</Heading>
                <Text fontSize="md" mt={3} mb={3}>
                    Pioneers are at the forefront of decentralized network management, providing essential tools and data to optimize blockchain interactions.
                </Text>
                <Text fontSize="md" mt={3} mb={3}>
                    Dive deep into the network with real-time insights:
                </Text>
                <List spacing={2}>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Map and monitor node uptimes
                    </ListItem>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Access detailed charts to select the best nodes for queries
                    </ListItem>
                    <ListItem>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        Get exclusive API access, fully documented by Swagger
                    </ListItem>
                </List>
                <Link href="https://pioneers.dev/docs/" isExternal>
                    <Button colorScheme="blue" mt={4} size="lg">
                        View API Documentation
                    </Button>
                </Link>
                <Button colorScheme="blue" mt={4} size="lg" onClick={() => setPage('landing')}>
                    Go Back
                </Button>
            </div>
            <div style={{ width: '50%' }}>
                <Image
                    src="https://i.imgur.com/vytTMJl.png"
                    alt="Network Nodes"
                    boxSize="100%"
                />
            </div>
        </div>
    );
}

export default Nodes;
