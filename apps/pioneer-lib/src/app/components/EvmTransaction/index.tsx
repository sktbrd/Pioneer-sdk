import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Flex,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Divider
} from '@chakra-ui/react';
import { caipToNetworkId } from '@pioneer-platform/pioneer-caip';
import React, { useEffect, useState } from 'react';
import RequestModal from './RequestModal';
import RequestFeeCard from './RequestFeeCard';
import RequestDataCard from './RequestDataCard';
import RequestDetailsCard from './RequestDetailsCard';
import RequestMethodCard from './RequestMethodCard';

let SAMPLE_DATA = [

]

export function EvmTransaction({ usePioneer, transaction, onClose }: any) {
  const { state, connectWallet } = usePioneer();
  const { app, assetContext, outboundAssetContext } = state;
  const [isPairing, setIsPairing] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [feeData, setFeeData] = useState({});
  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const [requestSession, setRequestSession] = useState<any>({});
  const [chainId, setChainId] = useState<string | null>(null);
  const [request, setRequest] = useState<any>({});

  //onApprove
  const onApprove = () => {
    // Add your approval logic here
  };

  //onReject
  const onReject = () => {
    // Add your rejection logic here
  };

  //updateFeeData
  const updateFeeData = function (feeData: any, isEIP1559: boolean) {
    console.log("updateFeeData: ", feeData);
    setFeeData(feeData);
    console.log('transaction: ', transaction);
    if (!isEIP1559) {
      transaction.gasPrice = feeData.gasPrice;
      transaction.maxFeePerGas = null;
      transaction.maxPriorityFeePerGas = null;
    } else {
      transaction.gasPrice = null;
      transaction.maxFeePerGas = feeData.maxFeePerGas;
      transaction.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
    }
    setTransaction(transaction);
    console.log('transaction: ', transaction);
  }

  return (
    <Stack spacing={4}>
      <RequestModal
        intention="sign a transaction"
        metadata={''}
        onApprove={onApprove}
        onReject={onReject}
        approveLoader={{ active: isLoadingApprove }}
        rejectLoader={{ active: isLoadingReject }}
      >
        <RequestFeeCard data={transaction} updateFeeData={updateFeeData} chainId={chainId} />
        <Divider my={4} />
        <RequestDataCard data={transaction} />
        <Divider my={4} />
        <RequestDetailsCard chains={[chainId ?? '']} protocol={''} />
        <Divider my={4} />
        <RequestMethodCard methods={['']} />
      </RequestModal>
    </Stack>
  );
}
export default EvmTransaction;
