import {
  ARBToolbox,
  AVAXToolbox,
  BSCToolbox,
  ETHToolbox,
  getProvider,
  MATICToolbox,
  OPToolbox,
} from '@coinmasters/toolbox-evm';
import type { ConnectWalletParams, EVMChain } from '@coinmasters/types';
import { Chain, WalletOption } from '@coinmasters/types';
import * as core from '@shapeshiftoss/hdwallet-core';
import * as ledgerWebUSB from '@shapeshiftoss/hdwallet-ledger-webusb';

import { cosmosWalletMethods } from './chains/cosmos.js';
import { LedgerSigner } from './chains/evm.ts';
import { thorChainWalletMethods } from './chains/thorchain.js';
import { utxoWalletMethods } from './chains/utxo.js';


export const LEDGER_SUPPORTED_CHAINS = [
  Chain.Arbitrum,
  Chain.Avalanche,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.BitcoinCash,
  Chain.Cosmos,
  Chain.Dogecoin,
  Chain.Ethereum,
  Chain.Litecoin,
  Chain.Optimism,
  Chain.Polygon,
  Chain.THORChain,
] as const;

type LedgerOptions = {
  ethplorerApiKey?: string;
  utxoApiKey?: string;
  covalentApiKey?: string;
};

export type LedgerParams = LedgerOptions & {
  wallet: any;
  chain: Chain;
  rpcUrl?: string;
  api?: any;
  paths?: any;
};

const getEVMWalletMethods = async ({
  api,
  wallet,
  chain,
  ethplorerApiKey,
  covalentApiKey,
  rpcUrl,
}: any) => {
  const provider = getProvider(chain as EVMChain, rpcUrl);
  const signer = new LedgerSigner({ wallet, chain, provider });
  const address = await signer.getAddress();
  const evmParams = { api, signer, provider };

  switch (chain) {
    case Chain.Ethereum:
      return { ...ETHToolbox({ ...evmParams, ethplorerApiKey }), getAddress: () => address };
    case Chain.BinanceSmartChain:
      return { ...BSCToolbox({ ...evmParams, covalentApiKey }), getAddress: () => address };
    case Chain.Arbitrum:
      return { ...ARBToolbox({ ...evmParams, covalentApiKey }), getAddress: () => address };
    case Chain.Optimism:
      return { ...OPToolbox({ ...evmParams, covalentApiKey }), getAddress: () => address };
    case Chain.Polygon:
      return { ...MATICToolbox({ ...evmParams, covalentApiKey }), getAddress: () => address };
    case Chain.Avalanche:
      return { ...AVAXToolbox({ ...evmParams, covalentApiKey }), getAddress: () => address };
    default:
      throw new Error('Chain not supported');
  }
};

const getToolbox = async (params: LedgerParams) => {
  const { wallet, api, rpcUrl, chain, ethplorerApiKey, covalentApiKey, utxoApiKey, paths } = params;

  switch (chain) {
    case Chain.BinanceSmartChain:
    case Chain.Arbitrum:
    case Chain.Optimism:
    case Chain.Polygon:
    case Chain.Avalanche:
    case Chain.Ethereum: {
      if (chain === Chain.Ethereum && !ethplorerApiKey)
        throw new Error('Ethplorer API key not found');
      if (chain !== Chain.Ethereum && !covalentApiKey)
        throw new Error('Covalent API key not found');
      const walletMethods = await getEVMWalletMethods({
        wallet,
        api,
        chain,
        covalentApiKey,
        ethplorerApiKey,
        rpcUrl,
      });

      return { address: walletMethods.getAddress(), walletMethods };
    }
    case Chain.Binance: {
      const walletMethods = await binanceWalletMethods({ wallet });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.Cosmos: {
      const walletMethods = await cosmosWalletMethods({ wallet, api });
      // @ts-ignore
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.THORChain: {
      const walletMethods = await thorChainWalletMethods({ wallet, stagenet: false });
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    case Chain.Bitcoin:
    case Chain.BitcoinCash:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      let params = {
        api,
        wallet,
        chain,
        stagenet: false,
        utxoApiKey,
        paths,
      };
      const walletMethods = await utxoWalletMethods(params);
      let address = await walletMethods.getAddress();
      return { address, walletMethods };
    }
    default:
      throw new Error('Chain not supported');
  }
};

const connectLedger =
  ({
    apis,
    rpcUrls,
    addChain,
    config: { covalentApiKey, ethplorerApiKey = 'freekey', utxoApiKey },
  }: ConnectWalletParams) =>
  async (chains: (typeof LEDGER_SUPPORTED_CHAINS)[number], paths) => {
    console.log('Checkpoint 1 :paths: ', paths);
    console.log('Checkpoint 2 :chains: ', chains);

    const keyring = new core.Keyring();
    const ledgerWebUSBAdapter = ledgerWebUSB.WebUSBLedgerAdapter.useKeyring(keyring);
    //TODO is this ever usefull? does not work in firefox
    //const ledgerWebHIDAdapter = ledgerWebHID.WebHIDLedgerAdapter.useKeyring(keyring);

    //use HID if no webusb

    let walletLedger = await ledgerWebUSBAdapter.pairDevice();
    if (walletLedger) {
      console.log('walletLedger: ', walletLedger);
      // pair metamask
      let deviceId = await wallet.getDeviceID();
      console.log('deviceId: ', deviceId);
      // get all accounts

      for (const chain of chains) {
        const { address, walletMethods } = await getToolbox({
          wallet: walletLedger,
          api: apis[chain],
          rpcUrl: rpcUrls[chain],
          chain,
          covalentApiKey,
          ethplorerApiKey,
          utxoApiKey,
          paths,
        });

        addChain({
          chain,
          walletMethods,
          wallet: { address, balance: [], walletType: WalletOption.METAMASK },
        });
      }
    }
    return true;
  };

export const ledgerWallet = {
  connectMethodName: 'connectLedger' as const,
  connect: connectLedger,
  isDetected: () => true,
};
