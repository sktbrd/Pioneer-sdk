import React from 'react';
import { Box, Heading, Text, Image, Stack, Button, Card, CardBody, CardFooter, Divider } from '@chakra-ui/react';

export const Dapps = ({setPage}:any) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: '50%' }}>
                <Heading size="lg" color="blue.600">Find new dApps</Heading>
                <Text fontSize="md" mt={3} mb={3}>
                    Pioneers delve into the ever-evolving realm of decentralized applications, continuously unveiling layers of innovation hidden within the blockchain fabric.
                </Text>
                <Text fontSize="md" mt={3} mb={3}>
                    Curious about the uncharted territories of DApps? Let our Pioneers guide you through these digital depths, where each discovery is supported by our expert blend of human insight and AI precision.
                </Text>
                <Button colorScheme="blue" size="lg" onClick={() => setPage('landing')}>
                    Go Back
                </Button>
            </div>
            <div style={{ width: '50%' }}>
                <Image
                    src="https://i.imgur.com/y7wUbXM.png"
                    alt="ShapeShift"
                    boxSize="100%"
                />
            </div>
        </div>
    );
}

export default Dapps;
