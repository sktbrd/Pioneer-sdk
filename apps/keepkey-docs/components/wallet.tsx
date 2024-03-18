// app/wallet.tsx
"use client";

import { useState, useEffect } from "react";
//@ts-ignore
import {getPaths} from "@pioneer-platform/pioneer-coins"; // Corrected import to use the new hook
//@ts-ignore
import { ChainToNetworkId, getChainEnumValue, availableChainsByWallet, WalletOption } from '@coinmasters/types';
import { AssetValue } from '@coinmasters/core';

interface KeepKeyWallet {
    type: string;
    icon: string;
    chains: string[];
    wallet: any;
    status: string;
    isConnected: boolean;
}

const getWalletByChain = async (keepkey:any, chain:any) => {
    if (!keepkey[chain]) return null;

    const walletMethods = keepkey[chain].walletMethods;
    const address = await walletMethods.getAddress();
    if (!address) return null;

    let balance = [];
    if (walletMethods.getPubkeys) {
        const pubkeys = await walletMethods.getPubkeys();
        for (const pubkey of pubkeys) {
            const pubkeyBalance = await walletMethods.getBalance([{ pubkey }]);
            balance.push(Number(pubkeyBalance[0].toFixed(pubkeyBalance[0].decimal)) || 0);
        }
        balance = [{ total: balance.reduce((a, b) => a + b, 0), address }];
    } else {
        balance = await walletMethods.getBalance([{address}]);
    }

    return { address, balance };
};


export default function Wallet() {
    const [asset, setAsset] = useState<string>("");
    const [amount, setAmount] = useState<string>("");
    const [keepkey, setKeepkey] = useState<any>(null);
    // const [destination, setDestination] = useState<string>(""); // Add destination state if required
    // const { transfer, isTransferring, error } = useTransfer(); // Corrected to useTransfer
    //useEffect

    //start the context provider
    // useEffect(() => {
    //     initWallet()
    // }, []);

    let initWallet = async (): Promise<KeepKeyWallet> => {
        try {
            // let chains =  [
            //     'ARB',  'AVAX', 'BNB',
            //     'BSC',  'BTC',  'BCH',
            //     'GAIA', 'OSMO', 'XRP',
            //     'DOGE', 'DASH', 'ETH',
            //     'LTC',  'OP',   'MATIC',
            //     'THOR'
            // ]

            const chains = ['BTC', 'ETH']; // Example chains
            const { keepkeyWallet } = await import('@coinmasters/wallet-keepkey');
            const walletKeepKey: KeepKeyWallet = {
                type: 'KEEPKEY',
                icon: 'https://pioneers.dev/coins/keepkey.png',
                chains,
                wallet: keepkeyWallet,
                status: 'offline',
                isConnected: false,
            };

            const allByCaip = chains.map((chainStr) => {
                const chain = getChainEnumValue(chainStr);
                if (chain) {
                    return ChainToNetworkId[chain];
                }
                return undefined;
            });
            const paths = getPaths(allByCaip);
            console.log('paths: ', paths);
            let keepkey:any = {};
            // @ts-ignore
            // Implement the addChain function with additional logging
            function addChain({ chain, walletMethods, wallet }) {
                console.log(`Adding chain: ${chain}`);
                console.log(`Chain data:`, { chain, walletMethods, wallet });
                keepkey[chain] = {
                    walletMethods,
                    wallet
                };
            }

            let keepkeyConfig = {
                apiKey: localStorage.getItem('keepkeyApiKey') || '123',
                pairingInfo: {
                    name: "int-test-package",
                    imageUrl: "",
                    basePath: 'http://localhost:1646/spec/swagger.json',
                    url: 'http://localhost:1646',
                }
            }
            let covalentApiKey = process.env['VITE_COVALENT_API_KEY']
            let ethplorerApiKey = process.env['VITE_ETHPLORER_API_KEY']
            let utxoApiKey = process.env['VITE_BLOCKCHAIR_API_KEY']
            let input = {
                apis: {},
                rpcUrls:{},
                addChain,
                config: { keepkeyConfig, covalentApiKey, ethplorerApiKey, utxoApiKey },
            }
            console.log("input: ",input)

            // Step 1: Invoke the outer function with the input object
            const connectFunction = walletKeepKey.wallet.connect(input);

            // Step 2: Invoke the inner function with chains and paths
            let kkApikey = await connectFunction(chains, paths);
            console.log("kkApikey: ", kkApikey);
            localStorage.setItem('keepkeyApiKey', kkApikey);
            //walletKeepKey
            // console.log("walletKeepKey: ",walletKeepKey.wallet)
            // console.log("connectFunction: ",connectFunction)
            console.log("keepkey: ",keepkey)

            //got balances
            for(let i = 0; i < chains.length; i++) {
                let chain = chains[i]
                let walletData:any = await getWalletByChain(keepkey, chain);
                console.log(chain+ " walletData: ",walletData)
                // keepkey[chain].wallet.address = walletData.address
                keepkey[chain].wallet.balances = walletData.balance
            }

            // Additional setup or connection logic here

            return keepkey;
        } catch (error) {
            console.error(error);
            throw new Error('Failed to initialize wallet');
        }
    };

    const init = async () => {
        try {
            let keepkey = await initWallet();
            console.log("keepkey: ", keepkey);
            setKeepkey(keepkey);
        } catch (error) {
            console.error("Failed to initialize wallet", error);
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!asset || !amount) return;
        // Assume destination is required and add a field for it in your form.
        //if ETH do keepkey.[ETH].transfer
        //useTransfer(keepkey, asset, amount, destination); // Adjusted to include destination
        //await transfer(asset, amount, destination); // Adjusted to include destination
    };

    return (
        <form className="formulary" onSubmit={init}>
            <button type="submit"
                onClick={init}>
                Connect
            </button>

            {/*<select style={{ color: "black" }} value={asset} onChange={(e) => setAsset(e.target.value)}>*/}
            {/*    <option value="">Select Asset</option>*/}
            {/*    <option value="BTC">Bitcoin</option>*/}
            {/*    <option value="ETH">Ethereum</option>*/}
            {/*    /!* Add more assets as needed *!/*/}
            {/*</select>*/}

            {/*<div style={{ color: "black" }}>*/}
            {/*    <input*/}
            {/*        type="text"*/}
            {/*        placeholder="Amount"*/}
            {/*        value={amount}*/}
            {/*        onChange={(e) => setAmount(e.target.value)}*/}
            {/*    />*/}
            {/*</div>*/}
            {/*<br />*/}
            {/*<div style={{ color: "black" }}>*/}
            {/*    <input*/}
            {/*        type="text"*/}
            {/*        placeholder="Destination Address"*/}
            {/*        value={destination}*/}
            {/*        onChange={(e) => setDestination(e.target.value)}*/}
            {/*    />*/}
            {/*</div>*/}

            {/*<button className="sendButton" type="submit" disabled={isTransferring}*/}
            {/*    onClick={handleTransfer}>*/}
            {/*    {isTransferring ? "Transferring..." : "Transfer"}*/}
            {/*</button>*/}
            {/*{error && <p>Error: {error}</p>}*/}

        </form>

    );
}
