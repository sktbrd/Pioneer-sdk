import { Box, Text, Button, Heading, VStack, Image, Switch, FormControl, FormLabel, useBoolean, Wrap, WrapItem } from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from 'react'

export function Landing({setPage}:any) {

    // Function placeholders for button actions
    const handleExploreDapps = () => setPage('dapps');
    const handleExploreBlockchains = () => setPage('blockchains');
    const handleExploreAssets = () => setPage('assets');
    const handleExploreNodes = () => setPage('nodes');
    const handleLeaderboard = () => setPage('leaderboard')



    return (
            <>
                <Box display="flex" flexDirection={["column", "row"]} flex="1" w="full">
                    <Box flex="2" p={5}>
                        <Heading mb={4}>Pioneers.dev</Heading>
                        <Text as="cite" fontSize="md" mb={4}>
                            &quot;Pioneer is a human-assisted AI project designed to chart and track the fast moving blockchain space&quot;
                        </Text>
                        <br/>
                        <br/>
                        <VStack spacing={2} align="start" w="full">
                            <Button w="full" size="lg" colorScheme="green" onClick={handleExploreDapps}>Explore Dapps</Button>
                            <Button w="full" size="lg" colorScheme="green" onClick={handleExploreBlockchains}>Explore Blockchains</Button>
                            <Button w="full" size="lg" colorScheme="green" onClick={handleExploreAssets}>Explore Assets</Button>
                            <Button w="full" size="lg" colorScheme="green" onClick={handleExploreNodes}>Explore Nodes</Button>
                            <Button w="full" size="lg" colorScheme="green" onClick={handleLeaderboard}>Leaderboard</Button>
                        </VStack>
                    </Box>
                    <Image src="https://pioneers.dev/coins/pioneerMan.png" alt="Pioneers.dev" boxSize="100%" flex="3" />
                </Box>
            </>
    );
}
