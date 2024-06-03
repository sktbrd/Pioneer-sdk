import { ChevronLeftIcon, RepeatIcon, AddIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Text,
  Spinner,
  IconButton,
  Stack,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';
import {
  getPaths,
  // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
import React, { useEffect, useState } from 'react';
import { Blockchains } from '../Blockchains';
import { Asset } from '../Asset';
import { Pubkey } from '../Pubkey';
import { Balance } from '../Balance';
import { WalletOption, prefurredChainsByWallet } from '@coinmasters/types';
import {
  ChainToNetworkId,
  getChainEnumValue,
  //@ts-ignore
} from '@pioneer-platform/pioneer-caip';

export function Classic({ usePioneer }: any) {
  const { state, connectWallet } = usePioneer();
  const { app, assets } = state;
  const [assetContext, setAssetContext] = useState(app?.assetContext);
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    isOpen: isSettingsOpen,
    onOpen: onSettingsOpen,
    onClose: onSettingsClose,
  } = useDisclosure();
  const {
    isOpen: isAddAssetOpen,
    onOpen: onAddAssetOpen,
    onClose: onAddAssetClose,
  } = useDisclosure();

  let onStart = async function () {
    if (app && app.pairWallet && !isConnecting) {
      console.log('App loaded... connecting');
      await connectWallet('KEEPKEY');
      setIsConnecting(true);
    } else {
      console.log('App not loaded yet... can not connect');
    }
  };

  useEffect(() => {
    onStart();
  }, [app, app?.assetContext, assets]);

  useEffect(() => {
    setAssetContext(app?.assetContext);
  }, [app, app?.assetContext]);

  useEffect(() => {
    if (assets) console.log("assets", assets);
  }, [app, assets]);

  const onSelect = (asset: any) => {
    console.log("onSelect", asset);
    if (asset.caip) {
      app.setAssetContext(asset);
    } else {
      console.error('invalid asset', asset);
    }
  };

  const onClose = async () => {
    console.log("onClose");
    await app?.setAssetContext(null);
    console.log('app.assetContext', app?.assetContext);
    setAssetContext(null);
  };

  const onRefresh = async () => {
    console.log("onRefresh");
    if (app) {
      console.log("blockchains", app.blockchains);
      let paths = getPaths(app.blockchains);
      console.log("paths", paths);
      await app.setPaths(paths);
      await app.getAssets();
      await app.getPubkeys();
      await app.getBalances();
      console.log("assets", assets);
    }
  };

  const onAdd = () => {
    onAddAssetOpen();
  };

  return (
    <Flex direction="column" height="100vh">
      <Flex alignItems="center" p={4} borderBottom="1px solid #ccc">
        {assetContext ? (
          <IconButton
            icon={<ChevronLeftIcon />}
            aria-label="Go back"
            onClick={onClose}
          />
        ) : (
          <IconButton
            icon={<SettingsIcon />}
            aria-label="Settings"
            onClick={onSettingsOpen}
          />
        )}
        <Text ml={4} fontWeight="bold">Assets</Text>
        <IconButton
          icon={<RepeatIcon />}
          aria-label="Refresh"
          onClick={onRefresh}
          ml="auto"
        />
      </Flex>
      <Flex flex="1" overflowY="auto">
        <Stack width="100%">
          {assetContext ? (
            <Asset usePioneer={usePioneer} onClose={onClose} asset={app?.assetContext} />
          ) : (
            <>
              {!assets || assets.size === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="100vh">
                  <Spinner size="xl" />
                  blockchains{app?.blockchains?.length}
                  Loading....
                </Flex>
              ) : (
                <>
                  {[...assets.values()].map((asset: any, index: any) => (
                    <Box key={index} p={4} mb={2} borderRadius="md">
                      <Flex>
                        <Avatar size='xl' src={asset.icon} />
                        <Box ml={3}>
                          <Text fontWeight="bold">{asset.name}</Text>
                          {app.pubkeys
                            .filter((pubkey: any) => {
                              if (asset.networkId.startsWith('eip155')) {
                                return pubkey.networks.some((networkId: any) => networkId.startsWith('eip155'));
                              }
                              return pubkey.networks.includes(asset.networkId);
                            })
                            .map((pubkey: any, index: any) => (
                              <Pubkey key={index} usePioneer={usePioneer} pubkey={pubkey} />
                            ))}
                          {app.balances
                            .filter((balance: any) => balance.caip === asset.caip)
                            .map((balance: any, index: any) => (
                              <Balance key={index} usePioneer={usePioneer} balance={balance} />
                            ))}
                        </Box>
                        <Button ml="auto" onClick={() => onSelect(asset)}>
                          Select
                        </Button>
                      </Flex>
                    </Box>
                  ))}
                </>
              )}
            </>
          )}
        </Stack>
      </Flex>
      <Flex alignItems="center" p={4} borderTop="1px solid #ccc">
        <Text>KeepKey</Text>
        <IconButton
          icon={<AddIcon />}
          aria-label="Add"
          onClick={onAdd}
          ml="auto"
        />
      </Flex>
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
            Settings For Your KeepKey
          </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {/*<Button variant="ghost" w="100%">*/}
              {/*  Change Label*/}
              {/*</Button>*/}
              {/*<Button variant="ghost" w="100%">*/}
              {/*  Change PIN*/}
              {/*</Button>*/}
              {/*<Button variant="ghost" w="100%">*/}
              {/*  Wipe Device*/}
              {/*</Button>*/}
              {/*<Button variant="ghost" w="100%">*/}
              {/*  Contact Support*/}
              {/*</Button>*/}
              <Button variant="ghost" w="100%">
                About KeepKey
              </Button>
              {/*<Button variant="ghost" w="100%">*/}
              {/*  Acknowledgements*/}
              {/*</Button>*/}
              {/*<Button variant="ghost" w="100%">*/}
              {/*  Log in to ShapeShift*/}
              {/*</Button>*/}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isAddAssetOpen} onClose={onAddAssetClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Asset</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Blockchains usePioneer={usePioneer} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default Classic;
