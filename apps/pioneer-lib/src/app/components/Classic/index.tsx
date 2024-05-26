import { ChevronLeftIcon, RepeatIcon, AddIcon, SettingsIcon } from '@chakra-ui/icons';
import {
  Avatar, Box, Button, Flex, Text, Spinner, IconButton, Stack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, useDisclosure
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
  getChainEnumValue
  //@ts-ignore
} from '@pioneer-platform/pioneer-caip';

export function Classic({ usePioneer }: any) {
  const { state } = usePioneer();
  const { app } = state;
  const [assetContext, setAssetContext] = useState(app?.assetContext);
  const { isOpen, onOpen, onClose: onCloseModal } = useDisclosure();

  let onStart = async function(){
    try{
      if(app && app.pairWallet){
        let walletType = WalletOption.KEEPKEY;
        const cachedBlockchains = JSON.parse(localStorage.getItem(`cache:blockchains:${walletType}`) || '[]');
        const blockchains = cachedBlockchains.length > 0 ? cachedBlockchains : (prefurredChainsByWallet[walletType] || [])
          .map((chain: any) => ChainToNetworkId[getChainEnumValue(chain)])
          .filter((networkId:any) => networkId !== undefined);

        console.log('onStart blockchains', blockchains);
        const pairObject = { type: WalletOption.KEEPKEY, blockchains };
        const resultInit = await app.pairWallet(pairObject);
        console.log("resultInit: ", resultInit);
      } else {
        console.log('App not loaded yet... can not connect');
      }
    }catch(e){
      console.error("onStart error", e);
    }
  }

  useEffect(() => {
    onStart();
  }, [app, app?.assetContext]);

  useEffect(() => {
    setAssetContext(app?.assetContext);
  }, [app, app?.assetContext]);

  const onSelect = (asset: any) => {
    console.log("onSelect", asset);
    if (asset.caip) {
      app.setAssetContext(asset);
    } else {
      console.error('invalid asset', asset);
    }
  }

  const onClose = async () => {
    console.log("onClose");
    await app?.setAssetContext(null);
    console.log('app.assetContext', app?.assetContext);
    setAssetContext(null);
  }

  const onRefresh = async () => {
    console.log("onRefresh");
    if(app){
      console.log("blockchains", app.blockchains);
      let paths = getPaths(app.blockchains);
      console.log("paths", paths);
      await app.setPaths(paths);
      await app.getPubkeys();
      await app.getBalances();
      console.log("app.assets", app.assets);
    }
  }

  const onAdd = () => {
    console.log("onAdd");
    // Add your logic for the "+" button here
  }

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
            onClick={onOpen}
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
            <Asset usePioneer={usePioneer} onClose={onClose} asset={app?.assetContext}/>
          ) : (
            <>
              {!app?.assets || app.assets.size === 0 ? (
                <Flex justifyContent="center" alignItems="center" height="100vh">
                  <Spinner size="xl" />
                  blockchains{app?.blockchains.length}
                  Loading....
                </Flex>
              ) : (
                <>
                  {[...app.assets.values()].map((asset: any, index: any) => (
                    <Box key={index} p={4} mb={2} borderRadius="md">
                      <Flex>
                        <Avatar size='xl' src={asset.icon} />
                        <Box ml={3}>
                          <Text fontWeight="bold">{asset.name}</Text>
                          {app.pubkeys
                            .filter((pubkey: any) => pubkey.networks.includes(asset.networkId))
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
      <Modal isOpen={isOpen} onClose={onCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
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
