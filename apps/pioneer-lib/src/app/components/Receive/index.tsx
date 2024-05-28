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
import { useEffect, useState } from "react";
// @ts-ignore
import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';
import { getWalletBadgeContent } from '../WalletIcon';

export function Receive({ usePioneer, onClose }: any) {
  const { state } = usePioneer();
  const { app, assetContext, context } = state;
  const [walletType, setWalletType] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
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
      setSelectedAddress(assetContext.pubkeys[0].address || assetContext.pubkeys[0].master);
    }
  }, [assetContext]);

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
              <Select value={selectedAddress} onChange={handleAddressChange}>
                {assetContext?.pubkeys?.map((pubkey: any, index: number) => (
                  <option key={index} value={pubkey.address || pubkey.master}>
                    <Flex align="center">
                      <Avatar size="sm" src={avatarUrl} mr={2} />
                      <Text>{pubkey.address || pubkey.master}</Text>
                    </Flex>
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
