"use client";
import { Select, Image } from '@chakra-ui/react';
import * as React from 'react';
import { usePioneer } from "@coinmasters/pioneer-react"
import { useState, useEffect } from 'react';

//components
import {
  PioneerButton,
  Pioneer,
  Basic,
  Portfolio,
  Transfer,
  Assets,
  Asset,
  Amount,
  Quote,
  Quotes,
  Swap,
  Track,
  SignTransaction,
  Paths,
  Pubkeys,
  Wallets,
  Blockchains,
  Balances,
  Setup,
  Classic,
  Nfts,
  Chat
  //@ts-ignore
} from '../../../pioneer-lib/src/index';

// import {
//   Pioneer,
//   Basic,
//   Portfolio,
//   Transfer,
//   Assets,
//   Asset,
//   Amount,
//   Quote,
//   Quotes,
//   Swap,
//   Track,
//   SignTransaction
//   //@ts-ignore
// } from '@coinmasters/pioneer-lib';


import { useOnStartApp } from "../utils/onStart";

export default function App() {
  const onStartApp = useOnStartApp();
  const { state } = usePioneer();
  const { api, app, assets, context } = state;
  const [intent, setIntent] = useState('classic');
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

  // Function to determine which component to render based on intent
  const renderComponent = () => {
    // Your switch case logic here, similar to the original
    switch (intent) {
      case 'basic':
        return <Basic usePioneer={usePioneer}/>;
        break;
      case 'setup':
        return <Setup usePioneer={usePioneer}/>;
        break;
      case 'pioneer':
        return <Pioneer usePioneer={usePioneer}/>;
        break;
      case 'pioneerbutton':
        return <PioneerButton usePioneer={usePioneer}/>;
        break;
      case 'blockchains':
        return <Blockchains usePioneer={usePioneer}/>;
        break;
      case 'balances':
        return <Balances usePioneer={usePioneer} onSelect={onSelect} />;
        break;
      case 'asset':
        return <Asset usePioneer={usePioneer} onClose={onClose} onSelect={onSelect} asset={selectedAsset}/>;
        break;
      case 'amount':
        return <Amount usePioneer={usePioneer} onClose={onClose} asset={selectedAsset} setInputAmount={setInputAmount}/>;
        break;
      case 'assetsOut':
        return <Assets usePioneer={usePioneer} onClose={onClose} onSelect={onSelect} filters={{onlyOwned: false, noTokens: false, hasPubkey:false, memoless:true, integrations:  ['changelly', 'rango', 'uniswap']}}/>;
        break;
      case 'assets':
        return <Assets usePioneer={usePioneer} onClose={onClose} onSelect={onSelect} filters={{onlyOwned: false, noTokens: false, hasPubkey:false, memoless:true }}/>;
        break;
      case 'nfts':
        return <Nfts usePioneer={usePioneer} onClose={onClose} onSelect={onSelect} filters={{onlyOwned: false, noTokens: false, hasPubkey:false, memoless:true }}/>;
        break;
      case 'wallets':
        return <Wallets usePioneer={usePioneer} handleWalletClick={handleWalletClick}/>;
        break;
      case 'transfer':
        return <Transfer usePioneer={usePioneer} />;
        break;
      // case 'sign':
      //   return <SignTransaction usePioneer={usePioneer} setTxHash={setTxHash} onClose={onClose} quote={SAMPLE_DATA[0]}/>;
      //   break;
      case 'portfolio':
        return <Portfolio usePioneer={usePioneer} />;
        break;
      case 'classic':
        return <Classic usePioneer={usePioneer}/>;
        break;
      case 'pubkeys':
        return <Pubkeys usePioneer={usePioneer}/>;
        break;
      case 'chat':
        return <Chat usePioneer={usePioneer} />;
        break;
      // case 'search':
      //   return <Search usePioneer={usePioneer} />;
      //   break;
      case 'paths':
        return <Paths usePioneer={usePioneer} networkId={'eip155:1'}/>;
        break;
      // case 'quote':
      //   return <Quote quote={SAMPLE_DATA[0]} onAcceptSign={onAcceptSign}/>;
      //   break;
      // case 'quotes':
      //   return <Quotes onClose={onClose} onSelectQuote={onSelect} Quotes={SAMPLE_DATA}/>;
      //   break;
      // case 'track':
      //   return <Track txHash={SAMPLE_SWAP_TXID}/>;
      case 'swaps':
      case 'swap':
        return <Swap usePioneer={usePioneer}/>;
        break;
      // Handle other cases as needed
      default:
        return <div>No valid intent selected</div>;
    }
  };

  const handleIntentChange = (event: any) => {
    setIntent(event.target.value);
  };


  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center w-full px-10 py-5 bg-transparent dark:bg-gray-900 rounded-lg">
        <div className="flex items-center gap-4  ">
          {/* Avatar logo */}
          <Image src="/png/pioneerMan.png" alt="Logo" boxSize={'160px'} className="rounded-full" />
          {/* Website title */}
          <span className="text-xl font-bold">Pioneer SDK</span>
          <Select onChange={handleIntentChange} placeholder="Select Component" width="auto">
            <option value="basic">Basic</option>
            <option value="pioneer">Pioneer</option>
            <option value="transfer">Transfer</option>
            <option value="blockchains">Blockchains</option>
            <option value="quote">Quote</option>
            <option value="asset">Asset</option>
            <option value="assets">Assets</option>
            <option value="assetsOut">Assets Output</option>
            <option value="amount">amount</option>
            <option value="sign">sign</option>
            <option value="wallets">Wallets</option>
            <option value="pubkeys">Pubkeys</option>
            <option value="classic">Classic</option>
            <option value="assets">Assets</option>
            <option value="track">Track</option>
            <option value="swap">Swap</option>
          </Select>
        </div>
        <PioneerButton usePioneer={usePioneer}/>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {renderComponent()}
      </main>

      {/* Footer */}
      <footer className="w-full px-10 py-5 bg-gray-200 dark:bg-gray-900 text-center">
        Powered by <a href="https://pioneers.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500 keychainify-checked">Pioneers</a>
      </footer>
    </>
  );
}
