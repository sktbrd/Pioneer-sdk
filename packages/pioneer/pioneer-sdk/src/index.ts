/*

     Pioneer SDK
        A typescript sdk for integrating cryptocurrency wallets info apps

 */
// import loggerdog from "@pioneer-platform/loggerdog";
// @ts-ignore
// import * as Events from "@pioneer-platform/pioneer-events";
// @ts-ignore
// @ts-ignore
// import * as LoggerModule from "@pioneer-platform/loggerdog";
// const log = LoggerModule.default();

import type { AssetValue } from '@coinmasters/core';
import { EVMChainList, SwapKitCore } from '@coinmasters/core';
import {
  CoinGeckoList,
  MayaList,
  NativeList,
  OneInchList,
  PancakeswapETHList,
  PancakeswapList,
  PangolinList,
  PioneerList,
  StargateARBList,
  SushiswapList,
  ThorchainList,
  TraderjoeList,
  UniswapList,
  WoofiList,
} from '@coinmasters/tokens';
// import {
//   CoinGeckoList,
//   MayaList,
//   NativeList,
//   OneInchList,
//   PancakeswapETHList,
//   PancakeswapList,
//   PangolinList,
//   PioneerList,
//   StargateARBList,
//   SushiswapList,
//   ThorchainList,
//   TraderjoeList,
//   UniswapList,
//   WoofiList,
// } from '@coinmasters/tokens';
import { Chain, NetworkIdToChain } from '@coinmasters/types';
// @ts-ignore
import {
  caipToNetworkId,
  caipToThorchain,
  ChainToNetworkId,
  shortListSymbolToCaip,
  tokenToCaip,
} from '@pioneer-platform/pioneer-caip';
// @ts-ignore
import Pioneer from '@pioneer-platform/pioneer-client';
// @ts-ignore
import { assetData } from '@pioneer-platform/pioneer-discovery';
import EventEmitter from 'events';

let MEMOLESS_INTERGRATIONS = ['changelly', 'chainflip'];

const TAG = ' | Pioneer-sdk | ';

export interface PioneerSDKConfig {
  appName?: string;
  appIcon?: string;
  blockchains: any;
  username: string;
  queryKey: string;
  spec: string;
  wss: string;
  paths: any;
  keepkeyApiKey: string;
  ethplorerApiKey: string;
  covalentApiKey: string;
  utxoApiKey: string;
  walletConnectProjectId: string;
}

export class SDK {
  // @ts-ignore
  public status: string;

  public username: string;

  public queryKey: string;

  public wss: string;

  // @ts-ignore
  public spec: any;

  public ethplorerApiKey: string;

  public covalentApiKey: string;

  public utxoApiKey: string;

  public walletConnectProjectId: string;

  // @ts-ignore
  public context: string;

  public assetContext: any;

  // @ts-ignore
  public blockchainContext: any;

  // @ts-ignore
  public pubkeyContext: any;

  // @ts-ignore
  public outboundAssetContext: any;

  // @ts-ignore
  public outboundBlockchainContext: any;

  // @ts-ignore
  public outboundPubkeyContext: any;

  public swapKit: SwapKitCore | null;

  public pioneer: any;

  // @ts-ignore
  public paths: any[];

  public pubkeys: any[];

  public wallets: any[];

  public balances: any[];

  public assets: any[];

  public assetsMap: any;

  // @ts-ignore
  public nfts: any[];

  public events: any;

  // @ts-ignore
  public pairWallet: (options: any) => Promise<any>;

  // public startSocket: () => Promise<any>;
  // public stopSocket: () => any;
  // public sendToAddress: (tx:any) => Promise<any>;
  // public swapQuote: (tx:any) => Promise<any>;
  // public build: (tx:any) => Promise<any>;
  // public sign: (tx:any, wallet:any) => Promise<any>;
  // public broadcast: (tx:any) => Promise<any>;
  public setContext: (context: string) => Promise<{ success: boolean }>;

  // @ts-ignore
  public refresh: () => Promise<any>;

  // public setPubkeyContext: (pubkeyObj:any) => Promise<boolean>;
  // @ts-ignore
  public setAssetContext: (asset: any) => Promise<any>;

  // @ts-ignore
  public setOutboundAssetContext: (asset: any) => Promise<any>;

  // @ts-ignore
  public keepkeyApiKey: string;

  public isPioneer: string | null;

  // @ts-ignore
  public loadBalanceCache: (balances: any) => Promise<void>;
  public loadPubkeyCache: (pubkeys: any) => Promise<void>;
  public getPubkeys: (networkIds?: string[]) => Promise<any[]>;
  public getBalances: () => Promise<boolean>;
  public blockchains: any[];
  public clearWalletState: () => Promise<boolean>;
  public setBlockchains: (blockchains: any) => Promise<void>;
  public appName: string;
  public appIcon: any;
  public init: (walletsVerbose: any, setup: any) => Promise<any>;
  public verifyWallet: () => Promise<void>;
  public setPaths: (blockchains: any) => Promise<void>;
  public getAssets: (filter?: string) => Promise<any>;
  constructor(spec: string, config: PioneerSDKConfig) {
    this.status = 'preInit';
    this.appName = 'pioneer-sdk';
    this.appIcon = 'https://pioneers.dev/coins/pioneerMan.png';
    // this.spec = spec || config.spec || 'http://127.0.0.1:9001/spec/swagger.json';
    this.spec = spec || config.spec || 'https://pioneers.dev/spec/swagger';
    this.wss = config.wss || 'wss://pioneers.dev';
    this.username = config.username;
    this.queryKey = config.queryKey;
    this.keepkeyApiKey = config.keepkeyApiKey;
    this.ethplorerApiKey = config.ethplorerApiKey;
    this.covalentApiKey = config.covalentApiKey;
    this.utxoApiKey = config.utxoApiKey;
    this.walletConnectProjectId = config.walletConnectProjectId;
    this.paths = [];
    this.blockchains = [];
    this.pubkeys = [];
    this.balances = [];
    this.nfts = [];
    this.isPioneer = null;
    this.pioneer = null;
    this.swapKit = null;
    this.context = '';
    this.pubkeyContext = null;
    this.assetContext = null;
    this.blockchainContext = null;
    this.outboundAssetContext = null;
    this.outboundBlockchainContext = null;
    this.outboundPubkeyContext = null;
    this.wallets = [];
    this.events = new EventEmitter();
    this.init = async function (walletsVerbose: any, setup: any) {
      const tag = `${TAG} | init | `;
      try {
        if (!this.username) throw Error('username required!');
        if (!this.queryKey) throw Error('queryKey required!');
        if (!this.wss) throw Error('wss required!');
        if (!walletsVerbose) throw Error('walletsVerbose required!');
        if (!setup) throw Error('setup required!');
        if (!this.wallets) throw Error('wallets required!');
        if (!this.ethplorerApiKey) throw Error('ethplorerApiKey required!');
        if (!this.covalentApiKey) throw Error('covalentApiKey required!');
        if (!this.utxoApiKey) throw Error('utxoApiKey required!');
        if (!this.walletConnectProjectId) throw Error('walletConnectProjectId required!');
        const PioneerClient = new Pioneer(config.spec, config);
        this.pioneer = await PioneerClient.init();
        if (!this.pioneer) throw Error('Fialed to init pioneer server!');

        //this.wallets = walletsVerbose
        this.wallets = walletsVerbose;
        let walletArray = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.wallets.length; i++) {
          let walletVerbose = this.wallets[i];
          let wallet = walletVerbose.wallet;
          walletArray.push(wallet);
        }
        // log.info("wallets",this.wallets)

        // init swapkit
        this.swapKit = new SwapKitCore();

        // log.info(tag,"this.swapKit: ",this.swapKit)
        const { ethplorerApiKey } = this;
        const { covalentApiKey } = this;
        const { utxoApiKey } = this;
        if (!utxoApiKey) throw Error('Unable to get utxoApiKey!');
        const { walletConnectProjectId } = this;
        const stagenet = false;
        const configKit = {
          config: {
            ethplorerApiKey,
            covalentApiKey,
            utxoApiKey,
            walletConnectProjectId,
            stagenet,
            keepkeyConfig: {
              apiKey: this.keepkeyApiKey,
              pairingInfo: {
                name: this.appName,
                imageUrl: this.appIcon,
                basePath: 'http://localhost:1646/spec/swagger.json',
                url: 'http://localhost:1646',
              },
            },
          },
          wallets: walletArray,
        };
        // log.info(tag, "configKit: ", configKit);
        await this.swapKit.extend(configKit);
        this.events.emit('SET_STATUS', 'init');
        // done registering, now get the user
        // this.refresh()
        if (!this.pioneer) throw Error('Failed to init pioneer server!');

        await this.getAssets();
        this.setAssetContext(
          this.assetsMap.get('bip122:000000000019d6689c085ae165831e93/slip44:0'),
        );
        this.setOutboundAssetContext(this.assetsMap.get('eip155:1/slip44:60'));

        return this.pioneer;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.setPaths = async function (paths: any) {
      try {
        if (!paths) throw Error('paths required!');
        //log.debug('setPaths called! paths: ', paths);
        this.paths = paths;
        this.events.emit('SET_PATHS', this.paths);
      } catch (e) {
        console.error('Failed to load balances! e: ', e);
      }
    };
    this.setBlockchains = async function (blockchains: any) {
      try {
        if (!blockchains) throw Error('blockchains required!');
        //log.debug('setBlockchains called! blockchains: ', blockchains);
        this.blockchains = blockchains;
        this.events.emit('SET_BLOCKCHAINS', this.blockchains);
      } catch (e) {
        console.error('Failed to load balances! e: ', e);
      }
    };
    this.loadBalanceCache = async function (balances: any) {
      try {
        if (balances.length === 0) throw Error('No balances to load!');
        const combinedBalances = [...this.balances, ...balances];

        //get extended info for each balance

        // Remove duplicates based on .caip property
        this.balances = combinedBalances.reduce((acc, currentItem) => {
          if (!acc.some((item: { caip: any }) => item.caip === currentItem.caip)) {
            acc.push(currentItem);
          }
          return acc;
        }, []);

        //update assets
        this.assets = this.assets.map((asset: any) => {
          const caipKey = asset.caip.toLowerCase(); // assuming 'caip' is the key in assets similar to balances
          const balance = this.balances.find((b: any) => b.caip.toLowerCase() === caipKey);

          if (balance) {
            // If a matching balance is found, create a new asset object with updated data
            const updatedAsset = {
              ...asset,
              balance: balance.balance,
              valueUsd: balance.valueUsd,
            };

            // Update the assetsMap with the new asset data
            this.assetsMap.set(caipKey, updatedAsset);
            return updatedAsset;
          } else {
            // If no matching balance, return the asset unchanged
            return asset;
          }
        });

        this.assets.sort((a, b) => b.valueUsd - a.valueUsd);
        this.balances.sort((a, b) => b.valueUsd - a.valueUsd);
        this.events.emit('SET_BALANCES', this.balances);
        if (this.balances.length > 0) {
          this.setContext(this.balances[0].context);
          this.setAssetContext(this.balances[0]);
          this.setOutboundAssetContext(this.balances[1]);
        }
      } catch (e) {
        console.error('Failed to load balances! e: ', e);
      }
    };
    this.loadPubkeyCache = async function (pubkeys: any) {
      try {
        if (pubkeys.length === 0) throw Error('No pubkeys to load!');
        const combinedPubkeys = [...this.pubkeys, ...pubkeys];

        // Remove duplicates based on .pubkey property
        this.pubkeys = combinedPubkeys.reduce((acc, currentItem) => {
          if (!acc.some((item: { pubkey: any }) => item.pubkey === currentItem.pubkey)) {
            acc.push(currentItem);
          }
          return acc;
        }, []);

        //combine pubkeys with balances
        //update assets
        const pubkeysMap = new Map();
        this.pubkeys.forEach((pubkey: any) => {
          pubkey.networks.forEach((network: any) => {
            if (!pubkeysMap.has(network)) {
              pubkeysMap.set(network, []);
            }
            pubkeysMap.get(network).push(pubkey);
          });
        });

        // Iterate over assets and update them based on matching conditions
        this.assets.forEach((existingAsset: any, index: any) => {
          const networkId = existingAsset.networkId;
          let matchedPubkey = null;

          if (networkId.includes('eip155')) {
            // Handle 'eip155' specifically
            const matchPubkeys = pubkeysMap.get('eip155:1');
            if (matchPubkeys && matchPubkeys.length > 0) {
              matchedPubkey = matchPubkeys[0]; // Assuming the first match is acceptable
            }
          } else {
            // Check for a direct match in other networks
            if (pubkeysMap.has(networkId)) {
              const matchPubkeys = pubkeysMap.get(networkId);
              if (matchPubkeys && matchPubkeys.length > 0) {
                matchedPubkey = matchPubkeys[0]; // Assuming the first match is acceptable
              }
            }
          }

          if (matchedPubkey) {
            // Update the asset and the map entry
            const updatedAsset: any = {
              ...existingAsset,
              balance: matchedPubkey.balance,
              valueUsd: matchedPubkey.valueUsd,
            };
            this.assets[index] = updatedAsset;
            this.assetsMap.set(existingAsset.caip.toLowerCase(), updatedAsset);
          }
        });

        this.events.emit('SET_PUBKEYS', this.pubkeys);
      } catch (e) {
        console.error('Failed to load pubkeys! e: ', e);
      }
    };
    this.verifyWallet = async function () {
      try {
        if (this.paths.length === 0) throw Error('No paths to verify!');
        if (this.blockchains.length === 0) throw Error('No blockchains to verify!');

        //log.debug('Verifying paths for blockchains...');
        for (let i = 0; i < this.blockchains.length; i++) {
          let blockchain = this.blockchains[i];
          //log.debug(`Checking paths for blockchain: ${blockchain}`);
          let pathsForChain;
          if (blockchain.indexOf('eip155') > -1) {
            //log.debug('ETH like detected!');
            //all eip155 blockchains use the same path
            pathsForChain = this.paths.filter((path) => path.network === 'eip155:1');
            pathsForChain = Chain.Ethereum;
          } else {
            //get paths for each blockchain
            pathsForChain = this.paths.filter((path) => path.network === blockchain);
          }
          if (pathsForChain.length === 0) {
            console.error(`Available paths: ${JSON.stringify(this.paths)}`);
            throw Error(`No paths for blockchain: ${blockchain}`);
          }
        }
        //log.debug('All blockchains have paths.');
      } catch (e) {
        console.error('Failed to verify wallet: ', e);
        throw e;
      }
    };
    this.pairWallet = async function (options: any) {
      const tag = `${TAG} | pairWallet | `;
      try {
        let wallet = options.type;
        let blockchains = options.blockchains;
        if (!wallet) throw Error('Must have wallet to pair! (Invalid params into pairWallet)');
        if (!this.swapKit) throw Error('SwapKit not initialized!');
        if (!blockchains) throw Error('Must have blockchains to pair!');
        let ledgerApp;
        if (options.ledgerApp) {
          ledgerApp = options.ledgerApp;
        }
        if (options.type === 'KEYSTORE') {
          if (!options.seed) throw Error('Must have seed to pair keystore!');
        }
        this.blockchains = blockchains;
        //console.log('this.wallets: ', this.wallets);
        const walletSelected = this.wallets.find((w: any) => w.type === wallet);
        if (!walletSelected) throw Error('Wallet not found!');
        //console.log('NetworkIdToChain: ', NetworkIdToChain);
        let AllChainsSupported = blockchains.map(
          (networkId: string | number) =>
            NetworkIdToChain[networkId] ||
            (() => {
              throw new Error(`(NetworkIdToChain) Missing NetworkId: ${networkId}`);
            })(),
        );

        await this.verifyWallet();

        let resultPair: string;
        switch (walletSelected.type) {
          case 'KEEPKEY':
            this.keepkeyApiKey =
              (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
                AllChainsSupported,
                this.paths,
              )) || '';
            resultPair = 'success';
            break;
          case 'METAMASK':
            resultPair =
              (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
                AllChainsSupported,
              )) || '';
            break;
          case 'KEYSTORE':
            resultPair =
              (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
                AllChainsSupported,
                options.seed,
                0,
              )) || '';
            break;
          case 'LEDGER':
            try {
              if (!ledgerApp) throw Error('Ledger app required for ledger pairing!');

              if (ledgerApp === 'ETH') {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i = 0; i < EVMChainList.length; i++) {
                  resultPair =
                    (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
                      EVMChainList[i],
                      this.paths,
                    )) || '';
                }
              } else {
                resultPair =
                  (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
                    ledgerApp,
                    this.paths,
                  )) || '';
              }
            } catch (e: any) {
              console.error('Failed to pair ledger! e: ', e);
              if (e.toString().indexOf('LockedDeviceError') > -1) {
                return { error: 'LockedDeviceError' };
              }
              if (e.toString().indexOf('claimInterface') > -1) {
                return { error: 'claimInterface' };
              }
              if (e.toString().indexOf('decorateAppAPIMethods') > -1) {
                return { error: 'WrongAppError' };
              }
              if (e.toString().indexOf('TransportStatusError') > -1) {
                return { error: 'WrongAppError' };
              }
              return { error: 'Unknown Error' };
            }
            break;

          default:
            resultPair =
              (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
                AllChainsSupported,
              )) || '';
            break;
        }

        if (resultPair) {
          // update
          const matchingWalletIndex = this.wallets.findIndex((w) => w.type === wallet);
          //log.debug(tag, 'matchingWalletIndex: ', matchingWalletIndex);
          // get balances
          // @ts-ignore
          let context;
          if (wallet === 'LEDGER' && ledgerApp !== 'ETH') {
            context = 'ledger:ledger.wallet'; //placeholder until we know eth address
          } else {
            // console.log('this.swapKit: ', this.swapKit);
            //console.log('wallet: ', wallet);
            context = `${wallet.toLowerCase()}:device.wallet`;

            // isPioneer?
            // get pioneer status
            let pioneerInfo = await this.pioneer.GetPioneer({
              address: context,
            });
            pioneerInfo = pioneerInfo.data;
            //log.debug('pioneerInfo: ', pioneerInfo);
            if (pioneerInfo.isPioneer) {
              this.isPioneer = pioneerInfo.image;
            }
          }

          // log.info(tag, "context: ", context);
          this.events.emit('CONTEXT', context);
          // add context to wallet
          //@ts-ignore
          // this.wallets[matchingWalletIndex].context = context;
          //@ts-ignore
          // this.wallets[matchingWalletIndex].connected = true;
          this.wallets[matchingWalletIndex].status = 'connected';
          this.setContext(context);
          // this.refresh(context);
        } else {
          throw Error(`Failed to pair wallet! ${walletSelected.type}`);
        }

        return resultPair;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.clearWalletState = async function () {
      const tag = `${TAG} | clearWalletState | `;
      try {
        // @ts-ignore
        this.context = null;
        this.paths = [];
        this.blockchains = [];
        this.pubkeys = [];
        return true;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    //@ts-ignore
    this.getAssets = async function (filter?: string) {
      try {
        const tag = `${TAG} | getAssets | `;
        console.log(tag, 'filter: ', filter);

        let tokenMap = new Map();
        let chains = new Set();
        let chainTokenCounts = {};
        this.assetsMap = new Map();

        // Function to add tokens with their source list
        const addTokens = (tokens, sourceList) => {
          tokens.forEach((token) => {
            chains.add(token.chain);
            chainTokenCounts[token.chain] = (chainTokenCounts[token.chain] || 0) + 1;
            let expandedInfo = tokenToCaip(token);
            if (expandedInfo.caip) {
              expandedInfo.sourceList = sourceList;
              let assetInfoKey = expandedInfo.caip.toLowerCase();
              let assetInfo = assetData[assetInfoKey];
              if (assetInfo) {
                let combinedInfo = { ...expandedInfo, ...assetInfo, integrations: [] }; // Prepare integration array
                tokenMap.set(assetInfoKey, combinedInfo);
              }
            }
          });
        };

        // Add tokens from various lists with their source
        [
          NativeList,
          MayaList,
          CoinGeckoList,
          OneInchList,
          PancakeswapETHList,
          PancakeswapList,
          PangolinList,
          PioneerList,
          StargateARBList,
          SushiswapList,
          ThorchainList,
          TraderjoeList,
          UniswapList,
          WoofiList,
        ].forEach((list: any) => addTokens(list.tokens, list.name));

        // Get integration support by asset and enrich the token map with this data
        let integrationSupport = await this.pioneer.SupportByAsset();
        integrationSupport = integrationSupport.data || {};
        console.log('integrationSupport: ', integrationSupport);

        // Enrich tokenMap directly with integration support
        Object.keys(integrationSupport).forEach((key) => {
          integrationSupport[key].forEach((id) => {
            if (id) {
              let asset = tokenMap.get(id.toLowerCase());
              if (asset) {
                if (MEMOLESS_INTERGRATIONS.indexOf(key) > -1) asset.memoless = true;
                asset.integrations.push(key);
              }
            }
          });
        });

        // Process all assets to enrich with additional data such as balances
        let allAssets = Array.from(tokenMap.values()).map((asset) => {
          const balanceObj = this.balances.find(
            (b) => b.caip.toLowerCase() === asset.caip.toLowerCase(),
          );
          const valueUsd = balanceObj ? parseFloat(balanceObj.valueUsd) : 0;
          const balance = balanceObj ? balanceObj.balance : '';

          const searchNetworkId =
            balanceObj && balanceObj.networkId.includes('155') ? 'eip155:1' : asset.networkId;
          const pubkeyObj = this.pubkeys.find((pubkey) =>
            pubkey.networks.includes(searchNetworkId),
          );
          const pubkey = pubkeyObj ? pubkeyObj.pubkey : null;
          const address = pubkeyObj ? pubkeyObj.master || pubkeyObj.address : null;

          return { ...asset, balance, valueUsd, pubkey, address };
        });

        this.assetsMap = tokenMap; // Update the main map to include all enriched assets
        this.assets = allAssets; // Also keep a separate array if needed
        console.log('Processed Assets: ', allAssets);
        return allAssets;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };
    this.getPubkeys = async function (networkIds?: string[]) {
      const tag = `${TAG} | getPubkeys | `;
      try {
        if (this.paths.length === 0) throw Error('No paths found!');
        if (!this.swapKit) throw Error('SwapKit not initialized!');

        // If no specific networkIds are requested, use all available in paths
        if (!networkIds || networkIds.length === 0) {
          networkIds = this.paths.map((path) => path.network);
        }

        let pubkeysNew: any[] = [];

        // Filter paths first by requested networkIds to minimize wallet accesses
        let filteredPaths = this.paths.filter((path) => networkIds.includes(path.network));

        for (let path of filteredPaths) {
          let chain: Chain = NetworkIdToChain[path.network];
          let pubkey: any = {};
          pubkey.type = path.type;
          let address = await this.swapKit?.getAddress(chain);
          if (!address) throw Error(`Failed to get address for ${chain}`);

          pubkey.master = address;
          if (path.type === 'address') {
            pubkey.address = address;
            pubkey.pubkey = address;
          } else if (path.type === 'xpub' || path.type === 'zpub') {
            let pubkeys = await this.swapKit?.getWallet(chain)?.getPubkeys();
            if (!pubkeys) throw Error(`Failed to get pubkeys for ${chain}`);
            let pubkeyForPath = pubkeys.find(
              (p: any) => p.addressNList.toString() === path.addressNList.toString(),
            );
            if (!pubkeyForPath) throw Error(`Failed to get pubkey for path in ${chain}`);
            pubkey.pubkey = pubkeyForPath.xpub || pubkeyForPath.zpub;
          }

          pubkey.context = this.context;
          pubkey.networks = [path.network];
          if (path.network === 'eip155:1') {
            pubkey.networks = [
              path.network,
              ...(path.network === 'eip155:1'
                ? this.blockchains.filter((blockchain) => blockchain.includes('eip155'))
                : []),
            ];
          }

          // Ensure networks are unique
          pubkey.networks = Array.from(new Set(pubkey.networks));
          pubkeysNew.push(pubkey);
        }
        // Cache and return the processed pubkeys
        this.pubkeys = pubkeysNew;
        const pubkeysMap = new Map();
        this.pubkeys.forEach((pubkey: any) => {
          pubkey.networks.forEach((network: any) => {
            if (!pubkeysMap.has(network)) {
              pubkeysMap.set(network, []);
            }
            pubkeysMap.get(network).push(pubkey);
          });
        });

        // Iterate over assets and update them based on matching conditions
        this.assets.forEach((existingAsset: any, index: any) => {
          const networkId = existingAsset.networkId;
          let matchedPubkey = null;

          if (networkId.includes('eip155')) {
            // Handle 'eip155' specifically
            const matchPubkeys = pubkeysMap.get('eip155:1');
            if (matchPubkeys && matchPubkeys.length > 0) {
              matchedPubkey = matchPubkeys[0]; // Assuming the first match is acceptable
            }
          } else {
            // Check for a direct match in other networks
            if (pubkeysMap.has(networkId)) {
              const matchPubkeys = pubkeysMap.get(networkId);
              if (matchPubkeys && matchPubkeys.length > 0) {
                matchedPubkey = matchPubkeys[0]; // Assuming the first match is acceptable
              }
            }
          }

          if (matchedPubkey) {
            console.log('matchedPubkey: ', matchedPubkey);
            // Update the asset and the map entry
            const updatedAsset: any = {
              ...existingAsset,
              pubkey: matchedPubkey.pubkey,
              address: matchedPubkey.address || matchedPubkey.master,
              master: matchedPubkey.master,
            };
            console.log('updatedAsset: ', updatedAsset);
            this.assets[index] = updatedAsset;
            this.assetsMap.set(existingAsset.caip.toLowerCase(), updatedAsset);
          }
        });

        this.events.emit('SET_PUBKEYS', pubkeysNew);
        return pubkeysNew;
      } catch (e) {
        console.error(tag, 'Error: ', e);
        throw e;
      }
    };
    this.getBalances = async function () {
      const tag = `${TAG} | getBalances | `;
      try {
        if (!this.assets || this.assets.length === 0) await this.getAssets();
        const assetDetailsMap = this.assets;
        //verify context
        //log.debug('getBalances this.blockchains: ', this.blockchains);
        console.log('this.blockchains: ', this.blockchains);
        let balances = [];
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.blockchains.length; i++) {
          const blockchain = this.blockchains[i];
          let chain: Chain = NetworkIdToChain[blockchain];
          //get balances for each pubkey
          console.log('getWalletByChain: ', chain);
          let walletForChain = await this.swapKit?.getWalletByChain(chain);
          console.log(chain + ' walletForChain: ', walletForChain);
          if (walletForChain && walletForChain.balance) {
            // @ts-ignore
            console.log('walletForChain.balance: ', walletForChain.balance);
            for (let j = 0; j < walletForChain.balance.length; j++) {
              // @ts-ignore
              let balance: AssetValue = walletForChain?.balance[j];
              //log.info('balance: ', balance);

              //log.debug('balance: ', balance);
              let balanceString: any = {};
              if (!balance.chain || !balance.type || !balance.address) {
                console.error('chain: ', balance);
                // console.error('chain: ', balance[0]);
                // console.error('chain: ', balance[0].chain);
                // console.error('symbol: ', balance[0].symbol);
                // console.error('ticker: ', balance[0].ticker);
                // console.error('type: ', balance[0].type);
                console.error('Missing required properties for balance: ', balance);
              } else {
                //caip
                try {
                  let balanceToCaip = function (balance: any) {
                    try {
                      let caip;
                      if (balance.type !== 'Native') {
                        // For ERC20 tokens
                        let networkId = ChainToNetworkId[balance.chain];
                        if (!networkId) throw new Error(`Unsupported chain: ${balance.chain}`);
                        caip = `${networkId}/erc20:${balance.symbol.split('-')[1]}`;
                      } else {
                        //assume native?

                        // For native tokens, use the identifier as it is
                        // @ts-ignore
                        caip = shortListSymbolToCaip[balance.chain];
                      }
                      if (!caip) {
                        console.error('Failed to convert balance to caip: ', balance);
                      }

                      return caip;
                    } catch (e) {
                      console.error(e);
                      return null;
                    }
                  };
                  let caip = balanceToCaip(balance);
                  console.log('balanceToCaip: result: ', caip);
                  if (caip) {
                    //log.info("balance: ",balance)
                    //Assuming these properties already exist in each balance
                    balanceString.context = this.context;
                    balanceString.caip = caip;
                    balanceString.identifier = caipToThorchain(caip, balance.ticker);
                    balanceString.networkId = caipToNetworkId(caip);
                    balanceString.address = balance.address;
                    balanceString.symbol = balance.symbol;
                    balanceString.chain = balance.chain;
                    balanceString.ticker = balance.ticker;
                    // balanceString.address = balance.address;
                    balanceString.type = balance.type;
                    if (balance.toFixed) {
                      balanceString.balance = balance.toFixed(balance.decimal).toString();
                    } else {
                      console.error("invalid balance! doesn't have toFixed: ", balance);
                      throw Error('Invalid balance!');
                    }
                    let assetInfo = assetDetailsMap.filter(
                      (e: any) => e.caip.toLowerCase() === caip.toLowerCase(),
                    );
                    assetInfo = assetInfo[0];
                    console.log('assetInfo: ', assetInfo);
                    balances.push({ ...assetInfo, ...balanceString });
                  } else {
                    console.error('Failed to get caip for balance: ', balance);
                  }
                } catch (e) {
                  console.error('e: ', e);
                  console.error('Invalid balance!: ', balance);
                }
              }
            }
          }
        }
        //log.debug('PRE-register balances: ', balances);
        const register: any = {
          username: this.username,
          blockchains: [],
          publicAddress: 'none',
          context: 'none',
          walletDescription: {
            context: 'none',
            type: 'none',
          },
          data: {
            pubkeys: this.pubkeys,
            balances,
          },
          queryKey: this.queryKey,
          auth: 'lol',
          provider: 'lol',
        };
        //log.debug('register: ', register);
        console.log('register: ', JSON.stringify(register));
        const result = await this.pioneer.Register(register);
        //log.debug('result: ', result);
        //log.debug('result: ', result.data);
        //log.debug('result: ', result.data.balances);

        if (result.data.balances) {
          //log.debug('Setting balances!');
          this.balances = result.data.balances;
          this.events.emit('SET_BALANCES', result.data.balances);

          //update assets
          this.assets = this.assets.map((asset: any) => {
            const caipKey = asset.caip;
            const balance = this.balances.find(
              (b: any) => b.caip.toLowerCase() === caipKey.toLowerCase(),
            );

            if (balance) {
              console.log('MATCH balance: ', balance);
              // If a matching balance is found, create a new asset object with updated data
              const updatedAsset = {
                ...asset,
                balance: balance.balance,
                valueUsd: balance.valueUsd,
              };
              console.log('updatedAsset: ', updatedAsset);
              // Update the assetsMap with the new asset data
              this.assetsMap.set(caipKey, updatedAsset);
              return updatedAsset;
            } else {
              // If no matching balance, return the asset unchanged
              return asset;
            }
          });
          this.assets.sort((a, b) => b.valueUsd - a.valueUsd);
          this.balances.sort((a, b) => b.valueUsd - a.valueUsd);
          this.events.emit('SET_BALANCES', this.balances);
          if (this.balances.length > 0) {
            this.setContext(this.balances[0].context);
            this.setAssetContext(this.balances[0]);
            this.setOutboundAssetContext(this.balances[1]);
          }
        }

        return true;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    // @ts-ignore
    this.refresh = async function () {
      const tag = `${TAG} | refresh | `;
      try {
        // log.info(tag, "walletWithContext: ", walletWithContext);
        return true;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.setContext = async function (context: string) {
      const tag = `${TAG} | setContext | `;
      try {
        this.context = context;
        this.events.emit('SET_CONTEXT', context);
        return { success: true };
      } catch (e) {
        console.error(tag, e);
        throw e;
      }
    };
    this.setAssetContext = async function (asset: any) {
      const tag = `${TAG} | setAssetContext | `;
      try {
        if (!asset.caip) {
          console.error('Invalid asset caip is required!');
          throw Error('Invalid asset caip is required!');
        }
        //get verbose info
        if (!this.assets || this.assets.length === 0) await this.getAssets();
        //
        let priceData = await this.pioneer.MarketInfo({ caip: asset.caip });
        priceData = priceData.data || {};
        console.log('priceData: ', priceData);

        let allAssets = this.assets;
        let assetInfo = allAssets.find(
          (a: any) => a.caip.toLowerCase() === asset.caip.toLowerCase(),
        );
        const balanceObj = this.balances.find(
          (balance: any) => balance.caip.toLowerCase() === asset.caip.toLowerCase(),
        );
        console.log('balanceObj: ', balanceObj);
        const valueUsd = balanceObj ? parseFloat(balanceObj.valueUsd) : 0;
        const priceUsd = priceData.priceUsd || 0;
        const context = balanceObj ? balanceObj.context : 'external';
        const balance = balanceObj ? balanceObj.balance : '';

        // Condense the assetIdSearch assignment
        let assetIdSearch = asset.networkId.includes('eip155') ? 'eip155:1' : asset.networkId;

        // Attempt to find a corresponding pubkey object that includes the asset's networkId
        const pubkeyObj = this.pubkeys.find((pubkey: any) =>
          pubkey.networks.includes(assetIdSearch),
        );
        console.log('pubkeyObj: ', pubkeyObj);

        // Extract the pubkey value if the pubkeyObj is found
        const pubkey = pubkeyObj ? pubkeyObj.pubkey : null;
        // Set the asset's address to pubkey.master or pubkey.address if available
        const address = pubkeyObj ? pubkeyObj.master || pubkeyObj.address : null;
        console.log('assetInfo: ', assetInfo);
        console.log('valueUsd: ', valueUsd);
        console.log('priceUsd: ', priceUsd);
        console.log('context: ', context);
        console.log('balance: ', balance);
        console.log('pubkey: ', pubkey);
        console.log('address: ', address);

        this.assetContext = { ...assetInfo, valueUsd, priceUsd, context, balance, pubkey, address };
        this.events.emit('SET_ASSET_CONTEXT', {
          ...assetInfo,
          valueUsd,
          priceUsd,
          context,
          balance,
          pubkey,
          address,
        });
        return { success: true };
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.setOutboundAssetContext = async function (asset: any) {
      const tag = `${TAG} | setOutputAssetContext | `;
      try {
        if (!asset.caip) {
          console.error('Invalid asset caip is required!');
          throw Error('Invalid asset caip is required!');
        }
        let priceData = await this.pioneer.MarketInfo({ caip: asset.caip });
        priceData = priceData.data || {};
        console.log('priceData: ', priceData);
        if (asset && this.outboundAssetContext !== asset) {
          if (!this.assets || this.assets.length === 0) await this.getAssets();
          let allAssets = this.assets;
          let assetInfo = allAssets.find(
            (a: any) => a.caip.toLowerCase() === asset.caip.toLowerCase(),
          );
          const balanceObj = this.balances.find(
            (balance: any) => balance.caip.toLowerCase() === asset.caip.toLowerCase(),
          );
          const valueUsd = balanceObj ? parseFloat(balanceObj.valueUsd) : 0;
          const priceUsd = priceData.priceUsd || 0;
          const context = balanceObj ? balanceObj.context : 'external';
          const balance = balanceObj ? balanceObj.balance : '';
          // Attempt to find a corresponding pubkey object that includes the asset's networkId
          const pubkeyObj = this.pubkeys.find((pubkey: any) =>
            pubkey.networks.includes(asset.networkId),
          );
          // Extract the pubkey value if the pubkeyObj is found
          const pubkey = pubkeyObj ? pubkeyObj.pubkey : null;
          // Set the asset's address to pubkey.master or pubkey.address if available
          const address = pubkeyObj ? pubkeyObj.master || pubkeyObj.address : null;

          this.outboundAssetContext = {
            ...assetInfo,
            valueUsd,
            context,
            priceUsd,
            balance,
            pubkey,
            address,
          };
          this.events.emit('SET_OUTBOUND_ASSET_CONTEXT', {
            ...assetInfo,
            valueUsd,
            priceUsd,
            context,
            balance,
            pubkey,
            address,
          });
          return { success: true };
        }
        return { success: false, error: `already asset context=${asset}` };
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
  }
}

export default SDK;
