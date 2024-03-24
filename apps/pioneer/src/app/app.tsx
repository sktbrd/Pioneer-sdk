"use client";
import { Select, Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { usePioneer } from "@coinmasters/pioneer-react"
import { availableChainsByWallet, WalletOption } from '@coinmasters/types';
import { useState, useEffect } from 'react';
//components
import Pioneer from './components/Pioneer';
import Basic from './components/Basic';
import Asset from './components/Asset';
import Swap from './components/Swap';


import Image from 'next/image'; // Import Next.js Image component for the logo


export default function App() {
  const { onStart } = usePioneer();
  const [intent, setIntent] = useState('asset');
  const [tabIndex, setTabIndex] = useState(1);
  let onStartApp = async function(){
    try{
      let walletsVerbose = []
      const { keepkeyWallet } = await import("@coinmasters/wallet-keepkey");
      console.log('keepkeyWallet: ', keepkeyWallet);

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
      console.log('walletKeepKey: ', walletKeepKey);
      walletsVerbose.push(walletKeepKey);
      console.log('walletsVerbose: ', walletsVerbose);
      onStart(walletsVerbose, pioneerSetup);
    }catch(e){
      console.error("Failed to start app!")
    }
  }
  useEffect(() => {
    onStartApp();
  }, []);

  const handleTabsChange = (index: any) => {
    setTabIndex(index);
  };

  // Function to determine which component to render based on intent
  const renderComponent = () => {
    // Your switch case logic here, similar to the original
    switch (intent) {
      case 'basic':
        return <Basic />;
        break;
      case 'asset':
        return <Asset onSelect={onSelect} filters={{onlyOwned: false, noTokens: false}}/>;
        break;
      case 'swap':
        return <Swap />;
        break;
      // Handle other cases as needed
      default:
        return <div>No valid intent selected</div>;
    }
  };

  const handleIntentChange = (event: any) => {
    setIntent(event.target.value);
  };

  const onSelect = (asset: any) => {
    console.log("onSelect: ", asset)
  }

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center w-full px-10 py-5 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          {/* Avatar logo */}
          <Image src="/png/blueMoon.png" alt="Logo" width={50} height={50} className="rounded-full" />
          {/* Website title */}
          <span className="text-xl font-bold">Pioneer SDK</span>
          <Select onChange={handleIntentChange} placeholder="Select Component" width="auto">
            <option value="basic">Basic</option>
            <option value="asset">Asset</option>
            <option value="swap">Swap</option>
          </Select>
        </div>
        <Pioneer />
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {renderComponent()}
      </main>

      {/* Footer */}
      <footer className="w-full px-10 py-5 bg-gray-200 dark:bg-gray-900 text-center">
        Powered by <a href="https://pioneers.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500">Pioneers</a>
      </footer>
    </>
  );
}
