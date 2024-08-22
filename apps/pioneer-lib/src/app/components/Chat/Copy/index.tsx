'use client'
import { Box, Button, Heading, Text, VStack, Image, Switch, FormControl, FormLabel, useBoolean, Wrap, WrapItem } from "@chakra-ui/react";
import React, { useEffect, useState, useRef } from 'react'

import { Dapps } from './dapps';
import { Assets } from './assets';
import { Nodes } from './nodes';
import { Blockchains } from './blockchains';
import { Landing } from './landing';
import { Leaderboard } from './leaderboard';


export function Index() {
    // Function placeholders for button actions
    const [page, setPage] = useState('')

    // State for toggling network
    const [useMainnet, setUseMainnet] = useBoolean(false);


    const renderPage = () => {
        switch (page) {
            case 'dapps':
                return <Dapps setPage={setPage}/>;
            case 'blockchains':
                return <Blockchains setPage={setPage}/>;
            case 'assets':
                return <Assets setPage={setPage}/>;
            case 'nodes':
                return <Nodes setPage={setPage}/>;
            case 'leaderboard':
                return <Leaderboard setPage={setPage}/>;
            default:
                return <Landing setPage={setPage}></Landing>;
        }
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
            p={5}
            m="auto"
            mt="10%"
            bg="#2D3748"
            color="white"
            borderRadius="lg"
            borderWidth="1px"
            overflow="hidden"
            maxW="3xl"  // Increased width
        >
            <Box display="flex" flexDirection={["column", "row"]} flex="1" w="full">
                {renderPage()}
            </Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" w="full" pt={4}>
                <FormControl display="flex" alignItems="center">
                    <Image src={useMainnet ? "https://pioneers.dev/coins/ethereum.png" : "https://pioneers.dev/coins/base.png"} boxSize="24px" mr={2} />
                    <FormLabel htmlFor="network-toggle" mb="0" mr={2}>
                        Use {useMainnet ? "Mainnet" : "Base"}
                    </FormLabel>
                    <Switch id="network-toggle" isChecked={useMainnet} onChange={setUseMainnet.toggle} />
                </FormControl>
                <Button
                    leftIcon={<Image src={useMainnet ? "https://pioneers.dev/coins/ethereum.png" : "https://pioneers.dev/coins/base.png"} boxSize="30px" p="1" bgColor="white" borderRadius="full" />}
                    sx={{
                        backgroundColor: '#007bff', // Normal state background color
                        color: 'white', // Text color
                        _hover: {
                            backgroundColor: '#0056b3' // Hover state background color
                        },
                        width: "300px", // Set a specific width or use 'full' for full width
                    }}
                    onClick={() => window.open(useMainnet ? "https://nouns.build/dao/ethereum/0x25EF864904d67e912B9eC491598A7E5A066B102F" : "https://nouns.build/dao/base/0xd0d31f743d5f7e8fcf4add1bdb198f07241a4f23", "_blank")}
                >
                    Become a Pioneer
                </Button>
            </Box>
        </Box>
    );
}
