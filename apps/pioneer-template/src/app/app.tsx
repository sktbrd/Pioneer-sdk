"use client";
import { Select, Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import * as React from 'react';
import { usePioneer } from "@coinmasters/pioneer-react"
import { availableChainsByWallet, WalletOption } from '@coinmasters/types';
import { useState, useEffect } from 'react';

//components
import {
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
  Pubkeys,
  Wallets,
  Blockchains,
  Balances,
  Classic
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
import Image from 'next/image';


export default function App() {
  const { onStart, state } = usePioneer();
  const { api, app, assets, context } = state;
  const [intent, setIntent] = useState('classic');
  const [tabIndex, setTabIndex] = useState(1);
  // const [txHash, setTxHash] = useState(SAMPLE_SWAP_TXID);
  const [selectedAsset, setSelectedAsset] = useState({ });

  let onStartApp = async function(){
    try{
      console.log("onStartApp")
      let walletsVerbose = []
      const { keepkeyWallet } = await import("@coinmasters/wallet-keepkey");
      //console.log('keepkeyWallet: ', keepkeyWallet);

      const pioneerSetup: any = {
        appName: "Pioneer Template",
        appIcon: "https://pioneers.dev/coins/pioneerMan.png",
      };
      const walletKeepKey = {
        type: WalletOption.KEEPKEY,
        icon: "https://pioneers.dev/coins/keepkey.png",
        chains: availableChainsByWallet[WalletOption.KEEPKEY],
        wallet: keepkeyWallet,
        status: "offline",
        isConnected: false,
      };
      //console.log('walletKeepKey: ', walletKeepKey);
      walletsVerbose.push(walletKeepKey);

      //ShapeShift metamask wallet
      // const { metamaskWallet } = await import("@coinmasters/wallet-metamask");
      // const walletMetaMask = {
      //   type: WalletOption.METAMASK,
      //   icon: "https://pioneers.dev/coins/metamask.png",
      //   chains: availableChainsByWallet[WalletOption.METAMASK],
      //   wallet: metamaskWallet,
      //   status: "offline",
      //   isConnected: false,
      // };
      // walletsVerbose.push(walletMetaMask);

      const { evmWallet } = await import("@coinmasters/wallet-evm-extensions");
      const walletMetamask = {
        type: "METAMASK", // TODO
        icon: "https://pioneers.dev/coins/evm.png",
        chains: availableChainsByWallet[WalletOption.METAMASK], // TODO
        wallet: evmWallet,
        status: "offline",
        isConnected: false,
      };
      walletsVerbose.push(walletMetamask);

      // const walletKeplr = {
      //   type: WalletOption.KEPLR,
      //   icon: "https://pioneers.dev/coins/keplr.png",
      //   chains: availableChainsByWallet[WalletOption.KEPLR],
      //   wallet: keplrWallet,
      //   status: "offline",
      //   isConnected: false,
      // };
      // walletsVerbose.push(walletKeplr);
      // const walletKeystore = {
      //   type: WalletOption.KEYSTORE,
      //   icon: "https://pioneers.dev/coins/keystore.png",
      //   chains: availableChainsByWallet[WalletOption.KEYSTORE],
      //   wallet: keystoreWallet,
      //   status: "offline",
      //   isConnected: false,
      // };
      // walletsVerbose.push(walletKeystore);
      // const walletLedger = {
      //   type: WalletOption.LEDGER,
      //   icon: "https://pioneers.dev/coins/ledger.png",
      //   chains: availableChainsByWallet[WalletOption.LEDGER],
      //   wallet: ledgerWallet,
      //   status: "offline",
      //   isConnected: false,
      // };
      // walletsVerbose.push(walletLedger);
      // const walletOKX = {
      //   type: WalletOption.OKX,
      //   icon: "https://pioneers.dev/coins/okx.png",
      //   chains: availableChainsByWallet[WalletOption.OKX],
      //   wallet: okxWallet,
      //   status: "offline",
      //   isConnected: false,
      // };
      // walletsVerbose.push(walletOKX);
      // const walletTrezor = {
      //   type: WalletOption.TREZOR,
      //   icon: "https://pioneers.dev/coins/trezor.png",
      //   chains: availableChainsByWallet[WalletOption.TREZOR],
      //   wallet: trezorWallet,
      //   status: "offline",
      //   isConnected: false,
      // };
      // walletsVerbose.push(walletTrezor);

      const { walletconnectWallet } = await import("@coinmasters/wallet-wc");
      const walletWalletConnect = {
        type: WalletOption.WALLETCONNECT,
        icon: "https://pioneers.dev/coins/walletconnect.png",
        chains: availableChainsByWallet[WalletOption.WALLETCONNECT],
        wallet: walletconnectWallet,
        status: "offline",
        isConnected: false,
      };
      walletsVerbose.push(walletWalletConnect);

      // const walletXDefi = {
      //   type: WalletOption.XDEFI,
      //   icon: "https://pioneers.dev/coins/xdefi.png",
      //   chains: availableChainsByWallet[WalletOption.XDEFI],
      //   wallet: xdefiWallet,
      //   status: "offline",
      //   isConnected: false,
      // };
      // walletsVerbose.push(walletXDefi);

      console.log('walletsVerbose: ', walletsVerbose);
      onStart(walletsVerbose, pioneerSetup);
    }catch(e){
      console.error(e)
      console.error("Failed to start app!")
    }
  }
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
      case 'blockchains':
        return <Blockchains usePioneer={usePioneer}/>;
        break;
      case 'balances':
        return <Balances usePioneer={usePioneer}/>;
        break;
      case 'asset':
        return <Asset usePioneer={usePioneer} onClose={onClose} onSelect={onSelect} asset={selectedAsset}/>;
        break;
      case 'amount':
        return <Amount usePioneer={usePioneer} onClose={onClose} asset={selectedAsset} setInputAmount={setInputAmount}/>;
        break;
      case 'assets':
        return <Assets usePioneer={usePioneer} onClose={onClose} onSelect={onSelect} filters={{onlyOwned: false, noTokens: false, hasPubkey:false }}/>;
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
      <header className="flex justify-between items-center w-full px-10 py-5 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          {/* Avatar logo */}
          <Image src="/png/pioneerMan.png" alt="Logo" width={180} height={150} className="rounded-full" />
          {/* Website title */}
          <span className="text-xl font-bold">Pioneer SDK</span>
          <Select onChange={handleIntentChange} placeholder="Select Component" width="auto">
            <option value="basic">Basic</option>
            <option value="transfer">Transfer</option>
            <option value="blockchains">Blockchains</option>
            <option value="quote">Quote</option>
            <option value="asset">Asset</option>
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
        <Pioneer usePioneer={usePioneer}/>
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
