import {
  Avatar,
  Box,
  Button,
  Flex,
  Text,
  Badge,
  useClipboard,
  Table,
  Tbody,
  Tr,
  Td,
  Select,
} from "@chakra-ui/react";
import QRCode from "qrcode.react";
import React, { useEffect, useState } from 'react';
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import { getWalletBadgeContent } from '../WalletIcon';
import { Pubkey } from '../Pubkey';

export function Receive({ usePioneer, onClose }: any) {
  const { state } = usePioneer();
  const { app, assetContext, context } = state;
  const [walletType, setWalletType] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [pubkeys, setPubkeys] = useState([]);
  const { hasCopied, onCopy } = useClipboard(selectedAddress);

  useEffect(() => {
    if (assetContext && COIN_MAP_LONG[assetContext.chain as keyof typeof COIN_MAP_LONG]) {
      const newAvatarUrl = `https://pioneers.dev/coins/${COIN_MAP_LONG[assetContext.chain as keyof typeof COIN_MAP_LONG]}.png`;
      setAvatarUrl(newAvatarUrl);
    }
  }, [assetContext]);

  useEffect(() => {
    if (context) {
      setWalletType(context.split(':')[0]);
    }
  }, [context, app]);

  useEffect(() => {
    if (assetContext?.pubkeys?.length > 0) {
      const initialAddress = assetContext.pubkeys[0].address || assetContext.pubkeys[0].master;
      setSelectedAddress(initialAddress);
    }
  }, [assetContext]);

  useEffect(() => {
    if (app.pubkeys) {
      const filteredPubkeys = app.pubkeys.filter((pubkey: any) => {
        if (assetContext?.networkId?.startsWith('eip155')) {
          return pubkey.networks.some((networkId: any) => networkId.startsWith('eip155'));
        }
        return pubkey.networks.includes(assetContext?.networkId);
      });
      setPubkeys(filteredPubkeys);
      if (filteredPubkeys.length > 0) {
        setSelectedAddress(filteredPubkeys[0].address || filteredPubkeys[0].master);
      }
    }
  }, [app.pubkeys, assetContext]);

  const handleAddressChange = (event: any) => {
    setSelectedAddress(event.target.value);
  };

  return (
    <Box border="1px" borderColor="white" p={4}>
      <Flex align="center" justify="center" mb={4}>
        <Avatar size="xxl" src={avatarUrl}>
          {getWalletBadgeContent(walletType, '8em')}
        </Avatar>
      </Flex>

      <Text fontSize="xl" fontWeight="bold" textAlign="center">Receive</Text>
      <Table variant="simple">
        <Tbody>
          <Tr>
            <Td>Chain</Td>
            <Td><Badge>{assetContext?.chain}</Badge></Td>
          </Tr>
          <Tr>
            <Td>CAIP</Td>
            <Td>{assetContext?.caip}</Td>
          </Tr>
          <Tr>
            <Td>Address</Td>
            <Td>
              {/*{pubkeys.map((pubkey: any, index: any) => (*/}
              {/*  <Pubkey key={index} usePioneer={usePioneer} pubkey={pubkey} />*/}
              {/*))}*/}
              <Select value={selectedAddress} onChange={handleAddressChange}>
                {pubkeys.map((pubkey: any, index: any) => (
                  <option key={index} value={pubkey.address || pubkey.master}>
                    {pubkey.address || pubkey.master}
                  </option>
                ))}
              </Select>
            </Td>
          </Tr>
        </Tbody>
      </Table>

      {selectedAddress && (
        <Flex align="center" justify="center" my={4}>
          <QRCode value={selectedAddress} />
        </Flex>
      )}
      <Flex align="center" justify="center" my={4}>
        <Button onClick={onCopy} mx={2}>{hasCopied ? 'Copied' : 'Copy Address'}</Button>
      </Flex>
    </Box>
  );
}
export default Receive;
