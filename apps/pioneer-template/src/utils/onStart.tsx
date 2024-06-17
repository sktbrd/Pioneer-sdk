// src/utils/onStartApp.tsx
import { usePioneer } from "@coinmasters/pioneer-react";
import { WalletOption, availableChainsByWallet } from '@coinmasters/types';

export const useOnStartApp = () => {
    const { onStart } = usePioneer();

    const onStartApp = async () => {
        try {
            let walletsVerbose = [];
            const { keepkeyWallet } = await import("@coinmasters/wallet-keepkey");

            const pioneerSetup: any = {
                appName: "KeepKey Vault",
                appIcon: "https://i.imgur.com/0UxjLIF.png",
            };

            const walletKeepKey = {
                type: WalletOption.KEEPKEY,
                icon: "https://pioneers.dev/coins/keepkey.png",
                chains: availableChainsByWallet[WalletOption.KEEPKEY],
                wallet: keepkeyWallet,
                status: "offline",
                isConnected: false,
            };

            walletsVerbose.push(walletKeepKey);

            //set keepkey as last connected wallet
            localStorage.setItem("lastConnectedWallet", WalletOption.KEEPKEY);

            console.log('onStart called!')
            onStart(walletsVerbose, pioneerSetup);
        } catch (e) {
            console.error("Failed to start app!", e);
        }
    };

    return onStartApp;
};
