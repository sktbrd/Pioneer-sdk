import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Stack,
  Flex,
  Text,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Card,
  Heading,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
  FormErrorMessage,
  Textarea,
  InputGroup,
  InputLeftAddon,
  Select as SelectImported,
} from '@chakra-ui/react';

function Dapp({ usePioneer, onClose, dapp }: any) {
  const { state, hideModal, resetState } = usePioneer();
  const { api, app, balance, context } = state;

  const [tabIndex, setTabIndex] = useState(0);
  const [isError, setIsError] = useState(false);
  const [name, setName] = useState<any>(dapp?.name || '');
  const [homepage, setHomepage] = useState<any>(dapp?.homepage || '');
  const [description, setDescription] = useState<any>(dapp?.description || '');
  const [image, setImage] = useState<any>(dapp?.image || '');
  const [blockchainsSupported, setBlockchainsSupported] = useState<any>(dapp?.blockchainsSupported || []);
  const [protocolsSupported, setProtocolsSupported] = useState<any>(dapp?.protocolsSupported || []);
  const [featuresSupported, setFeaturesSupported] = useState<any>(dapp?.featuresSupported || []);
  const [socialMedia, setSocialMedia] = useState<any>(dapp?.socialMedia || { twitter: '', telegram: '', github: '' });

  const handleInputChangeName = (e:any) => {
    // setUrl(e.target.value);
    // setIsValid(validateURL(e.target.value));
  };
  const handleTabChange = (index:any) => {
    setTabIndex(index);
  };
  const handleInputChangeApp = (e:any) => setName(e.target.value);
  const handleInputChangeImage = (e:any) => setImage(e.target.value);
  // const handleInputChangeMinVersion = (e:any) => setMinVersion(e.target.value);
  const handleInputChangeDescription = (e:any) => setDescription(e.target.value);
  // const handleInputChangeHomepage = (e:any) => setHomepage(e.target.value);
  const handleSocialMediaChange = (e:any) => {
    const { name, value } = e.target;
    setSocialMedia((prevState:any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleInputChange = (setter: any) => (event: any) => setter(event.target.value);

  const onSubmitEdit = () => {
    // Perform the submit logic
    console.log('Submitting changes...');
    // Here you might want to send the data to an API or update some global state
    onClose(); // Close the modal after submission
  };

  return (
    <Stack spacing={4}>
      <Flex alignItems="center">
        <Tabs index={tabIndex} onChange={handleTabChange}>
          <TabList>
            <Tab>Info</Tab>
            {/*<Tab>Reviews</Tab>*/}
            <Tab>Form</Tab>
            <Tab>Vote History</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Card>
                <Box p={4}>
                  <Box display="flex" alignItems="center">
                    <Avatar
                      src={image}
                      size="xl"
                      border="4px solid #000"
                    />
                    <Box ml={4}>
                      <Button
                        colorScheme="blue"
                        size="lg"
                        onClick={() => window.open(app, "_blank")}
                      >
                        Launch App
                      </Button>
                      <Heading as="h3" size="lg" fontWeight="bold">
                        {name}
                      </Heading>
                    </Box>
                  </Box>
                  <Box mt={4}>
                    <Box
                      border="1px solid gray"
                      borderRadius="md"
                      p={2}
                      mt={4}
                    >
                      <Text>
                        <strong>App:</strong> {app}
                      </Text>
                      <Text>
                        <strong>Homepage:</strong> {homepage}
                      </Text>
                      <Text>
                        <strong>Description:</strong> {description}
                      </Text>
                    </Box>

                    <Box
                      border="1px solid gray"
                      borderRadius="md"
                      p={2}
                      mt={4}
                    >
                      <Text fontWeight="bold">
                        Blockchains Supported:
                      </Text>
                      {blockchainsSupported
                        ? blockchainsSupported.map((blockchain: any) => (
                          <Text key={blockchain?.value} pl={4}>
                            - {blockchain?.label}
                          </Text>
                        ))
                        : null}
                      <Button
                        size={"xs"}
                        onClick={() => handleTabChange(1)}
                      >
                        edit
                      </Button>
                    </Box>

                    <Box
                      border="1px solid gray"
                      borderRadius="md"
                      p={2}
                      mt={4}
                    >
                      <Text fontWeight="bold">Protocols Supported:</Text>
                      {protocolsSupported
                        ? protocolsSupported.map((protocol:any) => (
                          <Text key={protocol.value} pl={4}>
                            - {protocol?.label}
                          </Text>
                        ))
                        : null}
                      <Button
                        size={"xs"}
                        onClick={() => handleTabChange(1)}
                      >
                        edit
                      </Button>
                    </Box>

                    <Box
                      border="1px solid gray"
                      borderRadius="md"
                      p={2}
                      mt={4}
                    >
                      <Text fontWeight="bold">Features Supported:</Text>
                      {featuresSupported
                        ? featuresSupported.map((feature:any) => (
                          <Text key={feature.value} pl={4}>
                            - {feature.label}
                          </Text>
                        ))
                        : null}
                      <Button
                        size={"xs"}
                        onClick={() => handleTabChange(1)}
                      >
                        edit
                      </Button>
                    </Box>

                    <Box
                      border="1px solid gray"
                      borderRadius="md"
                      p={2}
                      mt={4}
                    >
                      <Text fontWeight="bold">Social Media:</Text>
                      <Text>
                        <strong>Twitter:</strong> {socialMedia.twitter}
                      </Text>
                      <Text>
                        <strong>Telegram:</strong> {socialMedia.telegram}
                      </Text>
                      <Text>
                        <strong>Github:</strong> {socialMedia.github}
                      </Text>
                      <Button
                        size={"xs"}
                        onClick={() => handleTabChange(1)}
                      >
                        edit
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </TabPanel>
            <TabPanel>
              <ModalHeader>Edit Entry</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl isInvalid={isError}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="string"
                    value={name}
                    onChange={handleInputChangeName}
                  />
                  {!isError ? (
                    <FormHelperText>
                      Enter the name of the app.
                    </FormHelperText>
                  ) : (
                    <FormErrorMessage>name is required.</FormErrorMessage>
                  )}
                </FormControl>
                <FormControl isInvalid={isError}>
                  <FormLabel>Homepage URL</FormLabel>
                  <Input
                    type="email"
                    value={homepage}
                    onChange={handleInputChangeApp}
                  />
                  {!isError ? (
                    <FormHelperText>
                      Homepage is the Landing, generally designed to be
                      indexed by crawlers.
                    </FormHelperText>
                  ) : (
                    <FormErrorMessage>URL is required.</FormErrorMessage>
                  )}
                </FormControl>
                <FormControl isInvalid={isError}>
                  <FormLabel>App URL</FormLabel>
                  <Input
                    type="email"
                    value={app}
                    onChange={handleInputChangeApp}
                  />
                  {!isError ? (
                    <FormHelperText>
                      Enter the URL of the dapp application itself,
                      generally app.serviceName*.com
                    </FormHelperText>
                  ) : (
                    <FormErrorMessage>URL is required.</FormErrorMessage>
                  )}
                </FormControl>
                <FormControl isInvalid={isError}>
                  <div
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      marginTop: "10px",
                    }}
                  >
                    {image && (
                      <img
                        src={image}
                        alt="Image Preview"
                        style={{ width: "100px", height: "100px" }}
                      />
                    )}
                    <FormLabel>Image URL</FormLabel>
                    <Input
                      type="email"
                      value={image}
                      onChange={handleInputChangeImage}
                    />
                  </div>
                  {!isError ? (
                    <FormHelperText>
                      Enter the URL of the image for the Dapp. This MUST
                      be a valid URL and not an encoding!
                    </FormHelperText>
                  ) : (
                    <FormErrorMessage>
                      Image URL is required.
                    </FormErrorMessage>
                  )}
                </FormControl>
                <FormControl isInvalid={isError}>
                  <FormLabel>Dapp Description</FormLabel>
                  <Textarea
                    placeholder="This Dapp is great because it does....."
                    value={description}
                    onChange={handleInputChangeDescription}
                  />
                  {!isError ? (
                    <FormHelperText>
                      Describe the Dapp in a short paragraph.
                    </FormHelperText>
                  ) : (
                    <FormErrorMessage>
                      Description is required.
                    </FormErrorMessage>
                  )}
                </FormControl>
                <FormControl isInvalid={isError}>
                  Blockchains Supported By Dapp
                  {/*<SelectImported*/}
                  {/*  isMulti*/}
                  {/*  name="assets"*/}
                  {/*  options={blockchains}*/}
                  {/*  placeholder="ethereum... bitcoin... avalanche...."*/}
                  {/*  closeMenuOnSelect={true}*/}
                  {/*  value={blockchainsSupported}*/}
                  {/*  // components={{ Option: IconOption }}*/}
                  {/*  onChange={onSelectedBlockchains}*/}
                  {/*></SelectImported>*/}
                  <FormHelperText>
                    Enter all the blockchains that the dapp supports.
                  </FormHelperText>
                </FormControl>
                <FormControl isInvalid={isError}>
                  <FormLabel>Protocols Supported</FormLabel>
                  {/*<SelectImported*/}
                  {/*  isMulti*/}
                  {/*  name="assets"*/}
                  {/*  options={protocols}*/}
                  {/*  placeholder="wallet-connect... wallet-connect-v2... REST...."*/}
                  {/*  closeMenuOnSelect={true}*/}
                  {/*  value={protocolsSupported}*/}
                  {/*  // components={{ Option: IconOption }}*/}
                  {/*  onChange={onSelectedProtocols}*/}
                  {/*></SelectImported>*/}
                </FormControl>
                <FormControl isInvalid={isError}>
                  <FormLabel>Features Supported</FormLabel>
                  {/*<SelectImported*/}
                  {/*  isMulti*/}
                  {/*  name="features"*/}
                  {/*  options={features}*/}
                  {/*  placeholder="basic-transfers... defi-earn...."*/}
                  {/*  closeMenuOnSelect={true}*/}
                  {/*  // components={{ Option: IconOption }}*/}
                  {/*  onChange={onSelectedFeatures}*/}
                  {/*></SelectImported>*/}
                </FormControl>
                <FormControl isInvalid={isError}>
                  <FormLabel>Social Media</FormLabel>
                  <InputGroup>
                    <InputLeftAddon/>
                    <Input
                      type="text"
                      name="twitter"
                      value={socialMedia.twitter}
                      onChange={handleSocialMediaChange}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isInvalid={isError}>
                  <FormLabel>Social Media</FormLabel>
                  <InputGroup>
                    <InputLeftAddon />
                    <Input
                      type="text"
                      name="telegram"
                      value={socialMedia.telegram}
                      onChange={handleSocialMediaChange}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isInvalid={isError}>
                  <FormLabel>Social Media</FormLabel>
                  <InputGroup>
                    <InputLeftAddon />
                    <Input
                      type="text"
                      name="github"
                      value={socialMedia.github}
                      onChange={handleSocialMediaChange}
                    />
                  </InputGroup>
                </FormControl>
              </ModalBody>

              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button onClick={onSubmitEdit} variant="green">
                  Submit changes
                </Button>
              </ModalFooter>
            </TabPanel>
            <TabPanel>
              <FormControl>
                <table>
                  {/*<UpVotesTable />*/}
                  {/*<DownVotesTable />*/}
                </table>
              </FormControl>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>
    </Stack>
  );
}
