import { ChevronLeftIcon } from '@chakra-ui/icons';
import {
  Avatar, Box, Button, Flex, Input, InputGroup, InputLeftElement, Stack, Text, Spinner, Checkbox, IconButton
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Asset } from '../Asset';
import { Pubkey } from '../Pubkey';
import { Balance } from '../Balance';

export function Classic({ usePioneer }: any) {
  const { state } = usePioneer();
  const { app } = state;
  const [assetContext, setAssetContext] = useState(app.assetContext);

  useEffect(() => {
    setAssetContext(app.assetContext);
  }, [app.assetContext]);

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
    await app.setAssetContext(null);
    console.log('app.assetContext', app.assetContext);
    setAssetContext(null);
  }

  return (
    <Stack>
      <Flex alignItems="center" p={4} borderBottom="1px solid #ccc">
        <IconButton
          icon={<ChevronLeftIcon />}
          aria-label="Go back"
          onClick={onClose}
        />
        <Text ml={4} fontWeight="bold">Assets</Text>
      </Flex>
      {assetContext ? (
        <Asset usePioneer={usePioneer} onClose={onClose} asset={app.assetContext}/>
      ) : (
        <>
          {app?.assets.length === 0 ? (
            <Flex justifyContent="center" alignItems="center" height="100vh">
              <Spinner size="xl" />
              blockchains{app?.blockchains.length}
              Loading....
            </Flex>
          ) : (
            <>
              {app?.assets.map((asset: any, index: any) => (
                <Box key={index} p={4} mb={2} borderRadius="md">
                  <Flex>
                    <Avatar size='xl' src={asset.icon} />
                    <Box ml={3}>
                      <Text fontWeight="bold">{asset.name}</Text>
                      {asset?.pubkeys && (
                        <>
                          {asset?.pubkeys.map((pubkey: any, index: any) => (
                            <Pubkey key={index} usePioneer={usePioneer} pubkey={pubkey} />
                          ))}
                        </>
                      )}
                      {asset?.balances && (
                        <>
                          {asset?.balances.map((balance: any, index: any) => (
                            <Balance key={index} usePioneer={usePioneer} balance={balance} />
                          ))}
                        </>
                      )}
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
  );
}

export default Classic;
