import { Search2Icon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import QRCode from "qrcode.react";
import { useEffect, useState } from "react";
import { usePioneer } from "../../context";

// Import your OutputSelect component
import OutputSelect from '../../components/OutputSelect'; // Adjust the path as necessary

export default function Receive({ onClose }: any) {
  const { state } = usePioneer();
  const { assetContext } = state;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    if (onClose) onClose(); // Call onClose if provided
  };

  let onSelect = async function(asset: any) {
    console.log("onSelect: ", asset)
  }

  return (
    <div>
      <h1>Receive</h1>
      <h2>CAIP: {assetContext?.caip}</h2>
      <h2>address: {assetContext?.address}</h2>
      {assetContext?.address && <QRCode value={assetContext.address} />}
      <Button onClick={openModal}>Open Modal</Button>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Output Selection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <OutputSelect onClose={closeModal} onlyOwned={false} onSelect={onSelect}/>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
