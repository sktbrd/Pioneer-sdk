import React, { useEffect, useState } from 'react';
import { Box, Stack, Avatar,   FormControl,
  FormLabel,
  Input,
  Checkbox,
  Text,
  VStack, Button } from '@chakra-ui/react';

export default function PubkeyAdd({ usePioneer, onClose, setIsContinueVisable }: any) {
  const { state } = usePioneer();
  const { app } = state;
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);

  useEffect(() => {
    if (app?.pubkeys) {
      //console.log('app?.pubkeys: ', app?.pubkeys);
    }
  }, [app, app?.pubkeys]);

  const handleSave = async function(){
    //TODO validate address!
    // Implement the save logic here
    console.log('Address:', address);
    console.log('Label:', label);
    console.log('Save Address:', saveAddress);
    console.log('context:', saveAddress);
    let cacheKeyPubkeys = 'cache:pubkeys';
    let pubkeyCache = localStorage.getItem(cacheKeyPubkeys);
    let data = pubkeyCache ? JSON.parse(pubkeyCache) : [];
    data.push({ address, label, caip: app?.outboundAssetContext.caip, networks: [app.outboundAssetContext.networkId] });
    localStorage.setItem(cacheKeyPubkeys, JSON.stringify(data));
    let outboundAssetContext = app.outboundAssetContext;
    outboundAssetContext.context = 'external'
    outboundAssetContext.label = label;
    outboundAssetContext.address = address;
    outboundAssetContext.pubkey = address;
    await app.setOutboundAssetContext(outboundAssetContext);
    console.log('pubkey cacheKey: ', data);
    setIsContinueVisable(true);
    onClose(); // Close the modal after saving
  };

  return (
    <Stack>
      <Box>
        <Avatar size="xl" name="Placeholder Icon" src={app.outboundAssetContext.icon}/> {/* Placeholder for avatar icon */}
        <Text>name: {app.outboundAssetContext.name}</Text>
      </Box>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Address</FormLabel>
          <Input
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Label (optional)</FormLabel>
          <Input
            placeholder="Label for the address"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </FormControl>
        <Checkbox
          isChecked={saveAddress}
          onChange={(e) => setSaveAddress(e.target.checked)}
        >
          Save Address
        </Checkbox>
        <Button colorScheme="blue" mr={3} onClick={handleSave}>
          Save
        </Button>
      </VStack>
    </Stack>
  );
}
