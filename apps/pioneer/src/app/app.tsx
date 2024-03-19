"use client";
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { usePioneer } from "@coinmasters/pioneer-react"
import { availableChainsByWallet, WalletOption } from '@coinmasters/types';
import { useState, useEffect } from 'react';
import Pioneer from './components/Pioneer';
import Image from 'next/image'; // Import Next.js Image component for the logo
import Swap from './components/Swap';

export default function App() {
  const { onStart } = usePioneer();
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

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center w-full px-10 py-5 bg-gray-100 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          {/* Avatar logo */}
          <Image src="/png/blueMoon.png" alt="Logo" width={50} height={50} className="rounded-full" />
          {/* Website title */}
          <span className="text-xl font-bold">Pioneer SDK</span>
        </div>
        <Pioneer />
      </header>

      {/* Main Content */}
      <main className="flex-grow">

      </main>

      {/* Footer */}
      <footer className="w-full px-10 py-5 bg-gray-200 dark:bg-gray-900 text-center">
        Powered by <a href="https://pioneers.dev" target="_blank" rel="noopener noreferrer" className="text-blue-500">Pioneers</a>
      </footer>
    </>
  );
}
