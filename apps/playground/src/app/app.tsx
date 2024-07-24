"use client";
import { Select, Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import * as React from 'react';
import { usePioneer } from "@coinmasters/pioneer-react"
import { availableChainsByWallet, WalletOption } from '@coinmasters/types';
import { useState, useEffect } from 'react';

//components
import {
  PioneerButton,
  EvmTransaction
  //@ts-ignore
} from '../../../pioneer-lib/src/index';

import { useOnStartApp } from "../utils/onStart";


let EXAMPLE_ETH_TX = {
  "chainId": 1,
  "data": "0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000649c688300000000000000000000000000000000000000000000000000000000000000020b080000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000002fa3933ffc89d5739200000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000c770eefad204b5180df6a14ee197d99d808ee52d",
  "gasLimit": "0x7a120",
  "to": "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad",
  "value": "0x2386f26fc10000",
  "nonce": "0x75",
  "maxPriorityFeePerGas": "0xcc9b43",
  "maxFeePerGas": "0x0"
}

export default function App() {
  const onStartApp = useOnStartApp();
  const { state } = usePioneer();
  const { api, app, assets, context } = state;
  const [intent, setIntent] = useState('transaction');
  const [tabIndex, setTabIndex] = useState(1);
  // const [txHash, setTxHash] = useState(SAMPLE_SWAP_TXID);
  const [selectedAsset, setSelectedAsset] = useState({ });

  useEffect(() => {
    onStartApp();
  }, []);

  // useEffect(() => {
  //   if(app && app.assetContext) setSelectedAsset(app.assetContext)
  // }, [app, app?.assetContext]);

  const handleTabsChange = (index: any) => {
    setTabIndex(index);
  };

  const onClose = () => {
    //console.log("onClose")
  };

  const onSelect = (asset: any) => {
    //console.log("onSelect: ", asset)
  }

  const onAcceptSign = (tx: any) => {
    //console.log("onAcceptSign: ", tx)
  }

  const setInputAmount = (amount: any) => {
    console.log("setInputAmount: ", amount)
  }

  const handleWalletClick = (wallet: any) => {
    console.log("handleWalletClick: ", wallet)
  }



  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center w-full px-10 py-5 bg-gray-100 dark:bg-gray-800">
        <PioneerButton usePioneer={usePioneer}/>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <EvmTransaction usePioneer={usePioneer} transactio={EXAMPLE_ETH_TX}/>
      </main>

      {/* Footer */}
      <footer className="w-full px-10 py-5 bg-gray-200 dark:bg-gray-900 text-center">
        Powered by <a href="https://pioneers.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500 keychainify-checked">Pioneers</a>
      </footer>
    </>
  );
}
