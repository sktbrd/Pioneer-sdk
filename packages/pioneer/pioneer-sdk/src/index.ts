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

import { EVMChainList, SwapKitCore, WalletOption } from '@coinmasters/core';
// import { NativeList } from '@coinmasters/tokens';
import {
  //   CoinGeckoList,
  //   MayaList,
  NativeList,
  //   OneInchList,
  //   PancakeswapETHList,
  //   PancakeswapList,
  //   PangolinList,
  PioneerList,
  //   StargateARBList,
  //   SushiswapList,
  //   ThorchainList,
  //   TraderjoeList,
  //   UniswapList,
  //   WoofiList,
} from '@coinmasters/tokens';
import type { Chain } from '@coinmasters/types';
import { NetworkIdToChain } from '@coinmasters/types';
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
import {
  getPaths,
  // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
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

  public contextType: string;

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
  public setContextType: (contextType: string) => Promise<{ success: boolean }>;

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
  public getPubkeys: (wallets?: string[]) => Promise<any[]>;
  public getBalances: (filter?: any) => Promise<boolean>;
  public blockchains: any[];
  public clearWalletState: () => Promise<boolean>;
  public setBlockchains: (blockchains: any) => Promise<void>;
  public setBalances: (balances: any) => Promise<void>;
  public appName: string;
  public appIcon: any;
  public init: (walletsVerbose: any, setup: any) => Promise<any>;
  public verifyWallet: () => Promise<void>;
  public setPaths: (paths: any) => Promise<void>;
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
    this.paths = config.paths || [];
    this.blockchains = config.blockchains || [];
    this.pubkeys = [];
    this.balances = [];
    this.nfts = [];
    this.isPioneer = null;
    this.pioneer = null;
    this.swapKit = null;
    this.context = '';
    this.contextType = WalletOption.KEEPKEY;
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
        if (!this.wallets) throw Error('wallets required!');
        if (!this.paths) throw Error('wallets required!');
        if (!this.ethplorerApiKey) throw Error('ethplorerApiKey required!');
        if (!this.covalentApiKey) throw Error('covalentApiKey required!');
        if (!this.utxoApiKey) throw Error('utxoApiKey required!');
        if (!this.walletConnectProjectId) throw Error('walletConnectProjectId required!');
        const PioneerClient = new Pioneer(config.spec, config);
        this.pioneer = await PioneerClient.init();
        if (!this.pioneer) throw Error('Fialed to init pioneer server!');
        console.log(tag, 'setup: ', setup);
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
        console.log(tag, 'this.paths: ', this.paths);
        if (this.blockchains.length > 0) this.setPaths(getPaths(this.blockchains));

        // init swapkit
        this.swapKit = new SwapKitCore();

        await this.getAssets();

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
        //console.log(tag, 'configKit: ', configKit);
        await this.swapKit.extend(configKit);
        this.events.emit('SET_STATUS', 'init');

        //@TODO load user
        // let user = await this.pioneer.User();
        // console.log(tag, 'user: ', user);
        // if (!this.pioneer) throw Error('Failed to init pioneer server!');

        //if user
        //if pubkeys load
        //if balances load

        //else defaults
        // this.setAssetContext(
        //   this.assetsMap.get('bip122:000000000019d6689c085ae165831e93/slip44:0'),
        // );
        // this.setOutboundAssetContext(this.assetsMap.get('eip155:1/slip44:60'));

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
    this.setBalances = async function (balances: any) {
      try {
        if (!balances) throw new Error('balances required!');

        // Remove duplicates based on .ref
        const uniqueBalances = balances.reduce((acc: any, balance: any) => {
          const existingIndex = acc.findIndex((b: any) => b.ref === balance.ref);
          if (existingIndex !== -1) {
            acc[existingIndex] = balance;
          } else {
            acc.push(balance);
          }
          return acc;
        }, []);

        this.balances = uniqueBalances;
        // this.events.emit('SET_BLOCKCHAINS', this.balances);

        // // Update balances in assets
        // // eslint-disable-next-line @typescript-eslint/prefer-for-of
        // for (let i = 0; i < this.balances.length; i++) {
        //   const balance = this.balances[i];
        //   const asset = this.assetsMap.get(balance.caip);
        //
        //   if (asset) {
        //     // Ensure asset.balances exists and is an array
        //     asset.balances = asset.balances || [];
        //     asset.balances.push(balance);
        //     this.assetsMap.set(balance.caip, asset);
        //
        //     // Find and update the asset in this.assets array
        //     const assetIndex = this.assets.findIndex((a: any) => a.caip === balance.caip);
        //     if (assetIndex !== -1) {
        //       this.assets[assetIndex].balances = this.assets[assetIndex].balances || [];
        //       this.assets[assetIndex].balances.push(balance);
        //     } else {
        //       // If asset is not found, add it to this.assets array
        //       this.assets.push({ ...asset, balances: [balance] });
        //     }
        //   }
        // }

        //refresh assetContext
        //this.setAssetContext(this.assetContext);

        // Emit updated assets and balances
        // this.events.emit('SET_ASSETS', this.assetsMap);
        // this.events.emit('SET_BALANCES', this.balances);
      } catch (e) {
        console.error('Failed to load balances! e: ', e);
      }
    };
    this.loadBalanceCache = async function (balances: any) {
      try {
        if (balances.length === 0) throw Error('No balances to load!');
        const combinedBalances = [...this.balances, ...balances];

        // Remove duplicates based on .caip and .ref properties
        const uniqueBalances = combinedBalances.reduce((acc, currentItem) => {
          if (
            !acc.some(
              (item: { caip: any; ref: any }) =>
                item.caip === currentItem.caip && item.ref === currentItem.ref,
            )
          ) {
            acc.push(currentItem);
          }
          return acc;
        }, []);

        this.setBalances(uniqueBalances);

        // Update assets
        // this.assets = this.assets.map((asset: any) => {
        //   const caipKey = asset.caip.toLowerCase();
        //   const balances = this.balances.filter((b: any) => b.caip.toLowerCase() === caipKey);
        //
        //   const contextCaipMap = new Map();
        //   const uniqueBalances = balances.filter((balance: any) => {
        //     const key = `${balance.context}:${balance.caip}`;
        //     if (!contextCaipMap.has(key)) {
        //       contextCaipMap.set(key, true);
        //       return true;
        //     }
        //     return false;
        //   });
        //
        //   if (uniqueBalances.length > 0) {
        //     const updatedAsset: any = {
        //       ...asset,
        //       balances: uniqueBalances,
        //     };
        //     this.assetsMap.set(caipKey, updatedAsset);
        //     return updatedAsset;
        //   } else {
        //     return asset;
        //   }
        // });
      } catch (e) {
        console.error('Failed to load balances! e: ', e);
      }
    };
    // this.loadBalanceCache = async function (balances: any) {
    //   try {
    //     if (balances.length === 0) throw Error('No balances to load!');
    //     const combinedBalances = [...this.balances, ...balances];
    //
    //     //get extended info for each balance
    //
    //     // Remove duplicates based on .caip property
    //     this.balances = combinedBalances.reduce((acc, currentItem) => {
    //       if (!acc.some((item: { caip: any }) => item.caip === currentItem.caip)) {
    //         acc.push(currentItem);
    //       }
    //       return acc;
    //     }, []);
    //
    //     //update assets
    //     this.assets = this.assets.map((asset: any) => {
    //       const caipKey = asset.caip.toLowerCase(); // assuming 'caip' is the key in assets similar to balances
    //       const balances = this.balances.filter((b: any) => b.caip.toLowerCase() === caipKey);
    //
    //       const contextCaipMap = new Map();
    //       const uniqueBalances = balances.filter((balance: any) => {
    //         const key = `${balance.context}:${balance.caip}`;
    //         if (!contextCaipMap.has(key)) {
    //           contextCaipMap.set(key, true);
    //           return true;
    //         }
    //         return false;
    //       });
    //
    //       if (uniqueBalances.length > 0) {
    //         const updatedAsset: any = {
    //           ...asset,
    //           balances: uniqueBalances,
    //         };
    //         this.assetsMap.set(caipKey, updatedAsset);
    //         return updatedAsset;
    //       } else {
    //         return asset;
    //       }
    //     });
    //
    //     this.assets.sort((a, b) => b.valueUsd - a.valueUsd);
    //     this.balances.sort((a, b) => b.valueUsd - a.valueUsd);
    //     this.events.emit('SET_BALANCES', this.balances);
    //     if (this.balances.length > 0) {
    //       this.setContext(this.balances[0].context);
    //       this.setAssetContext(this.balances[0]);
    //       if (this.balances[1]) this.setOutboundAssetContext(this.balances[1]);
    //     }
    //   } catch (e) {
    //     console.error('Failed to load balances! e: ', e);
    //   }
    // };
    this.loadPubkeyCache = async function (pubkeys: any) {
      try {
        if (pubkeys.length === 0) throw Error('No pubkeys to load!');
        const combinedPubkeys = [...this.pubkeys, ...pubkeys];
        console.log('combinedPubkeys: ', combinedPubkeys);
        // Remove duplicates based on .pubkey property
        this.pubkeys = combinedPubkeys.reduce((acc, currentItem) => {
          if (!acc.some((item: { pubkey: any }) => item.pubkey === currentItem.pubkey)) {
            acc.push(currentItem);
          }
          return acc;
        }, []);
        console.log('checkpoint 1 this.pubkeys: ', this.pubkeys);

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
        // this.assets.forEach((existingAsset: any, index: any) => {
        //   const networkId = existingAsset.networkId;
        //   let matchedPubkeys = [];
        //
        //   if (networkId.includes('eip155')) {
        //     // Handle 'eip155' specifically
        //     const pubkeys = pubkeysMap.get('eip155:1');
        //     if (pubkeys && pubkeys.length > 0) {
        //       matchedPubkeys = pubkeys; // Attach all matched pubkeys
        //     }
        //   } else {
        //     // Check for a direct match in other networks
        //     if (pubkeysMap.has(networkId)) {
        //       const pubkeys = pubkeysMap.get(networkId);
        //       if (pubkeys && pubkeys.length > 0) {
        //         matchedPubkeys = pubkeys; // Attach all matched pubkeys
        //       }
        //     }
        //   }
        //
        //   if (matchedPubkeys.length > 0) {
        //     const contextAddressMap = new Map();
        //     const uniqueMatchedPubkeys = matchedPubkeys.filter((pubkey: any) => {
        //       const key = `${pubkey.context}:${pubkey.address}`;
        //       if (!contextAddressMap.has(key)) {
        //         contextAddressMap.set(key, true);
        //         return true;
        //       }
        //       return false;
        //     });
        //     // Update the asset to include all matched pubkeys' balances and USD values
        //     const updatedAsset: any = {
        //       ...existingAsset,
        //       pubkeys: uniqueMatchedPubkeys,
        //     };
        //     this.assets[index] = updatedAsset;
        //     this.assetsMap.set(existingAsset.caip.toLowerCase(), updatedAsset);
        //   }
        // });
        console.log('new pubkeys: ', this.pubkeys);
        this.events.emit('SET_PUBKEYS', this.pubkeys);
      } catch (e) {
        console.error('Failed to load pubkeys! e: ', e);
      }
    };
    // this.verifyWallet = async function () {
    //   try {
    //     if (this.paths.length === 0) throw Error('No paths to verify!');
    //     if (this.blockchains.length === 0) throw Error('No blockchains to verify!');
    //
    //     //log.debug('Verifying paths for blockchains...');
    //     // eslint-disable-next-line @typescript-eslint/prefer-for-of
    //     for (let i = 0; i < this.blockchains.length; i++) {
    //       let blockchain = this.blockchains[i];
    //       //log.debug(`Checking paths for blockchain: ${blockchain}`);
    //       let pathsForChain;
    //       if (blockchain.indexOf('eip155') > -1) {
    //         //log.debug('ETH like detected!');
    //         //all eip155 blockchains use the same path
    //         pathsForChain = this.paths.filter((path) => path.network === 'eip155:1');
    //         pathsForChain = Chain.Ethereum;
    //       } else {
    //         //get paths for each blockchain
    //         pathsForChain = this.paths.filter((path) => path.network === blockchain);
    //       }
    //       if (pathsForChain.length === 0) {
    //         console.error(`Available paths: ${JSON.stringify(this.paths)}`);
    //         throw Error(`No paths for blockchain: ${blockchain}`);
    //       }
    //     }
    //     //log.debug('All blockchains have paths.');
    //   } catch (e) {
    //     console.error('Failed to verify wallet: ', e);
    //     throw e;
    //   }
    // };
    this.pairWallet = async function (options: any) {
      const tag = `${TAG} | pairWallet | `;
      try {
        console.log(tag, 'pairWallet options: ', options);
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

        // await this.verifyWallet();

        let resultPair: string;
        console.log(tag, 'type: ', walletSelected.type);
        switch (walletSelected.type) {
          case 'KEEPKEY':
            this.keepkeyApiKey =
              (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
                AllChainsSupported,
                this.paths,
              )) || '';
            console.log(tag, 'this.keepkeyApiKey: ', this.keepkeyApiKey);
            resultPair = 'success';
            break;
          case 'WALLETCONNECT':
            resultPair =
              (await (this.swapKit as any)[walletSelected.wallet.connectMethodName]([
                EVMChainList[0],
              ])) || '';
            break;
          case 'EVM':
            resultPair =
              (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
                EVMChainList[0],
              )) || '';
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
          console.log(tag, 'matchingWalletIndex: ', matchingWalletIndex);
          // get balances
          // @ts-ignore
          let context;
          if (wallet === 'LEDGER' && ledgerApp !== 'ETH') {
            context = 'ledger:ledger.wallet'; //placeholder until we know eth address
          } else {
            // console.log('this.swapKit: ', this.swapKit);
            console.log('wallet: ', wallet);
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

          this.events.emit('CONTEXT', context);
          // add context to wallet
          //@ts-ignore
          // this.wallets[matchingWalletIndex].context = context;
          //@ts-ignore
          // this.wallets[matchingWalletIndex].connected = true;
          this.wallets[matchingWalletIndex].status = 'connected';
          this.setContext(context);
          // console.log('assets pre: ', this.assets.length);
          // await this.getAssets();
          // console.log('assets post: ', this.assets.length);

          await this.getPubkeys();
          await this.getBalances();
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
        this.contextType = WalletOption.KEEPKEY;
        this.paths = [];
        this.blockchains = [];
        this.pubkeys = [];
        return true;
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    /*
      Get Asset Rules

      asset MUST have a balance if a token to be tracked
      asset MUST have a pubkey to be tracked

     */
    //@ts-ignore
    this.getAssets = async function (filterParams?: any) {
      try {
        const tag = `${TAG} | getAssets | `;
        //console.log(tag, 'filter: ', filter);
        if (!this.assetsMap || !this.assetsMap.length) {
          console.log('No cached assets, loading...');
          let tokenMap = new Map();
          let chains = new Set();
          let chainTokenCounts = {};
          this.assetsMap = new Map();
          let allAssets = [];
          // Function to add tokens with their source list
          const addTokens = (tokens, sourceList) => {
            tokens.forEach((token) => {
              chains.add(token.chain);
              chainTokenCounts[token.chain] = (chainTokenCounts[token.chain] || 0) + 1;
              // console.log('*** token: ', token);
              let expandedInfo = tokenToCaip(token);
              if (expandedInfo.caip) {
                expandedInfo.sourceList = sourceList;
                let assetInfoKey = expandedInfo.caip.toLowerCase();
                let assetInfo = assetData[assetInfoKey];
                if (assetInfo) {
                  let combinedInfo = { ...expandedInfo, ...assetInfo, integrations: [] }; // Prepare integration array
                  if (this.blockchains.includes(combinedInfo.networkId)) {
                    // const balances = this.balances.filter(
                    //   (b) => b.caip.toLowerCase() === combinedInfo.caip.toLowerCase(),
                    // );
                    // const pubkeys = this.pubkeys.filter((pubkey: any) =>
                    //   pubkey.networks.includes(combinedInfo.networkId),
                    // );
                    // combinedInfo = { ...combinedInfo, balances, pubkeys };
                    tokenMap.set(assetInfoKey, combinedInfo);
                    allAssets.push(combinedInfo);
                  } else {
                    // console.error('***  Skipping token: ', token);
                    // console.error('***  Not in supported blockchains: ', this.blockchains);
                  }
                } else {
                  // console.error('Missing assetInfo for: ', token);
                }
              } else {
                console.error('***  expandedInfo: ', expandedInfo);
                console.error('***  Failed to expand token: ', token);
              }
            });
          };

          // Add tokens from various lists with their source
          [
            NativeList,
            // MayaList,
            // CoinGeckoList,
            // OneInchList,
            // PancakeswapETHList,
            // PancakeswapList,
            // PangolinList,
            PioneerList,
            // StargateARBList,
            // SushiswapList,
            // ThorchainList,
            // TraderjoeList,
            // UniswapList,
            // WoofiList,
          ].forEach((list: any) => addTokens(list.tokens, list.name));

          // Get integration support by asset and enrich the token map with this data
          if (this.pioneer) {
            let integrationSupport = await this.pioneer.SupportByAsset();
            integrationSupport = integrationSupport.data || {};
            //console.log('integrationSupport: ', integrationSupport);

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
          }

          console.log('tokenMap: ', Object.keys(tokenMap).length);
          // Process all assets to enrich with additional data such as balances, and pubkeys
          // let allAssets = Array.from(tokenMap.values()).map((asset) => {
          //   const balances = this.balances.filter(
          //     (b) => b.caip.toLowerCase() === asset.caip.toLowerCase(),
          //   );
          //   const pubkeys = this.pubkeys.filter((pubkey: any) =>
          //     pubkey.networks.includes(asset.networkId),
          //   );
          //   console.log('matched pubkeyObj for asset');
          //   console.log('balances: ', balances);
          //   console.log('pubkeys: ', pubkeys);
          //   return { ...asset, balances, pubkeys };
          // });

          console.log('Processed Assets: ', allAssets.length);
          //filter assets for blockchain
          this.assetsMap = tokenMap; // Update the main map to include all enriched assets
          this.events.emit('SET_ASSETS', this.assetsMap);
          //default
          if (!filterParams)
            filterParams = {
              hasPubkey: true,
              onlyOwned: false,
              noTokens: true,
            };
        }

        // if (filterParams) {
        //   const logMessages = [];
        //
        //   logMessages.push(`${tag} Applying filters...`, filterParams);
        //   logMessages.push(`${tag} Total assets before filtering: ${this.assets.length}`);
        //
        //   // Filter by Search Query
        //   let currentAssets = this.assets;
        //   if (filterParams.searchQuery) {
        //     const normalizedSearchQuery = filterParams.searchQuery.toLowerCase();
        //     currentAssets = currentAssets.filter((asset) => {
        //       const assetName = asset.name ? asset.name.toLowerCase() : '';
        //       return assetName.includes(normalizedSearchQuery);
        //     });
        //     logMessages.push(`${tag} Assets after search query filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Ownership Presence
        //   if (filterParams.onlyOwned) {
        //     currentAssets = currentAssets.filter(
        //       (asset) => asset.balances && asset.balances.length > 0,
        //     );
        //     logMessages.push(`${tag} Assets after ownership filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Token Type
        //   logMessages.push(`${tag} Before token type filter: ${currentAssets.length}`);
        //   if (filterParams.noTokens) {
        //     currentAssets = currentAssets.filter((asset) => asset.type !== 'token');
        //     logMessages.push(`${tag} Assets after token type filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Memoless
        //   if (filterParams && filterParams.memoless && filterParams.memoless !== null) {
        //     currentAssets = currentAssets.filter((asset: any) => asset.memoless === true);
        //     logMessages.push(`${tag} Assets after memo-less filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Public Key Presence
        //   if (filterParams.hasPubkey) {
        //     currentAssets = currentAssets.filter(
        //       (asset) => asset.pubkeys && asset.pubkeys.length > 0,
        //     );
        //     logMessages.push(
        //       `${tag} Assets after public key presence filter: ${currentAssets.length}`,
        //     );
        //   }
        //
        //   // Filter by Required Integration
        //   if (filterParams && filterParams.integrations && filterParams.integrations.length > 0) {
        //     logMessages.push(
        //       `${tag} Looking for integrations in assets: ${filterParams.integrations.join(', ')}`,
        //     );
        //
        //     currentAssets = currentAssets.filter((asset) => {
        //       if (!asset.integrations) {
        //         logMessages.push(`${tag} Asset ${asset.name} has no integrations.`);
        //         return false;
        //       }
        //
        //       const hasRequiredIntegration = filterParams.integrations.some((integration: any) =>
        //         asset.integrations.includes(integration),
        //       );
        //
        //       if (!hasRequiredIntegration) {
        //         logMessages.push(
        //           `${tag} Asset ${
        //             asset.name
        //           } does not include required integrations. Asset integrations: ${asset.integrations.join(
        //             ', ',
        //           )}`,
        //         );
        //       }
        //
        //       return hasRequiredIntegration;
        //     });
        //
        //     logMessages.push(
        //       `${tag} Assets after required integration filter: ${currentAssets.length}`,
        //     );
        //   }
        //
        //   // Filter by Required networkId
        //   if (filterParams && filterParams.networks && filterParams.networks.length > 0) {
        //     currentAssets = currentAssets.filter(
        //       (asset) =>
        //         asset.networkId && // Ensure the asset has a networkId defined
        //         filterParams.networks.includes(asset.networkId), // Check if the asset's networkId is in the list of required networks
        //     );
        //     logMessages.push(
        //       `${tag} Assets after required networks filter: ${currentAssets.length}`,
        //     );
        //   }
        //
        //   // Filter by Asset Context (if applicable)
        //   if (this.assetContext) {
        //     currentAssets = currentAssets.filter((asset) => asset.caip !== this.assetContext.caip);
        //     logMessages.push(`${tag} Assets after asset context filter: ${currentAssets.length}`);
        //   }
        //
        //   logMessages.push(`${tag} Total assets after all filters: ${currentAssets.length}`);
        //   //nerfed
        //   console.log(logMessages.join('\n'));
        //   return currentAssets;
        // } else {
        //   return this.assets || [];
        // }

        // if (filterParams) {
        //   console.log(tag, 'Applying filters...', filterParams);
        //
        //   // Initial assets count
        //   console.log(tag, `Total assets before filtering: ${this.assets.length}`);
        //
        //   // Filter by Search Query
        //   let currentAssets = this.assets;
        //   if (filterParams.searchQuery) {
        //     const normalizedSearchQuery = filterParams.searchQuery.toLowerCase();
        //     currentAssets = currentAssets.filter((asset) => {
        //       const assetName = asset.name ? asset.name.toLowerCase() : '';
        //       return assetName.includes(normalizedSearchQuery);
        //     });
        //     console.log(tag, `Assets after search query filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Ownership Presence
        //   if (filterParams.onlyOwned) {
        //     currentAssets = currentAssets.filter(
        //       (asset) => asset.balances && asset.balances.length > 0,
        //     );
        //     console.log(tag, `Assets after ownership filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Token Type
        //   console.log(tag, `Before token type filter: ${currentAssets.length}`);
        //   if (filterParams.noTokens) {
        //     currentAssets = currentAssets.filter((asset) => asset.type !== 'token');
        //     console.log(tag, `Assets after token type filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Memoless
        //   if (filterParams && filterParams.memoless && filterParams.memoless !== null) {
        //     currentAssets = currentAssets.filter((asset: any) => asset.memoless === true);
        //     console.log(tag, `Assets after memo-less filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Public Key Presence
        //   if (filterParams.hasPubkey) {
        //     currentAssets = currentAssets.filter(
        //       (asset) => asset.pubkeys && asset.pubkeys.length > 0,
        //     );
        //     console.log(tag, `Assets after public key presence filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Required Integration
        //   if (filterParams && filterParams.integrations && filterParams.integrations.length > 0) {
        //     console.log(
        //       tag,
        //       `Looking for integrations in assets: ${filterParams.integrations.join(', ')}`,
        //     );
        //
        //     currentAssets = currentAssets.filter((asset) => {
        //       if (!asset.integrations) {
        //         console.log(tag, `Asset ${asset.name} has no integrations.`);
        //         return false;
        //       }
        //
        //       const hasRequiredIntegration = filterParams.integrations.some((integration: any) =>
        //         asset.integrations.includes(integration),
        //       );
        //
        //       if (!hasRequiredIntegration) {
        //         console.log(
        //           tag,
        //           `Asset ${
        //             asset.name
        //           } does not include required integrations. Asset integrations: ${asset.integrations.join(
        //             ', ',
        //           )}`,
        //         );
        //       }
        //
        //       return hasRequiredIntegration;
        //     });
        //
        //     console.log(tag, `Assets after required integration filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Required networkId
        //   if (filterParams && filterParams.networks && filterParams.networks.length > 0) {
        //     currentAssets = currentAssets.filter(
        //       (asset) =>
        //         asset.networkId && // Ensure the asset has a networkId defined
        //         filterParams.networks.includes(asset.networkId), // Check if the asset's networkId is in the list of required networks
        //     );
        //     console.log(tag, `Assets after required networks filter: ${currentAssets.length}`);
        //   }
        //
        //   // Filter by Asset Context (if applicable)
        //   if (this.assetContext) {
        //     currentAssets = currentAssets.filter((asset) => asset.caip !== this.assetContext.caip);
        //     console.log(tag, `Assets after asset context filter: ${currentAssets.length}`);
        //   }
        //
        //   console.log(tag, `Total assets after all filters: ${currentAssets}`);
        //   console.log(tag, `Total assets after all filters: ${currentAssets.length}`);
        //   return currentAssets;
        // } else {
        //   return this.assets || [];
        // }

        return this.assetsMap;
      } catch (e) {
        console.error(e);
        throw e;
      }
    };
    this.getPubkeys = async function (wallets?: any) {
      const tag = `${TAG} | getPubkeys | `;
      try {
        console.log(tag, 'this.blockchains: ', this.blockchains);
        console.log(tag, 'this.paths: ', this.paths);
        if (this.paths.length === 0) throw new Error('No paths found!');
        if (!this.swapKit) throw new Error('SwapKit not initialized!');
        console.log(tag, 'PRE this.pubkeys: ', this.pubkeys.length);
        console.log(tag, 'PRE this.paths: ', this.paths.length);
        console.log(tag, 'PRE this.blockchains: ', this.blockchains);

        let pubkeysNew = [];
        // For each enabled blockchain
        for (let i = 0; i < this.blockchains.length; i++) {
          let blockchain = this.blockchains[i];
          console.log('blockchain: ', blockchain);

          let filteredPaths = this.paths.filter((path) => {
            // Ensure path.networks is defined
            if (!path.networks) {
              console.error('path.networks is undefined for path: ', path);
              return false;
            }

            // Handle special case for eip155
            if (blockchain.startsWith('eip155')) {
              return path.networks.some((network) => network.startsWith('eip155:'));
            }

            // General case
            return path.networks.includes(blockchain);
          });

          console.log('filteredPaths: ', filteredPaths);

          if (!filteredPaths || filteredPaths.length === 0)
            throw new Error('Unable to get pubkey for blockchain: ' + blockchain);

          // Get address for all paths for this blockchain
          for (let path of filteredPaths) {
            let chain: Chain = NetworkIdToChain[blockchain];
            console.log('chain: ', chain);

            if (!chain) throw new Error('missing chain for blockchain!');

            let pubkey: any = {};
            pubkey.type = path.type;
            console.log('path: ', path);

            let address = await this.swapKit?.getAddress(chain);
            if (!address) throw new Error(`Failed to get address for ${chain}`);
            if (address && address.indexOf('bitcoincash:') > -1)
              address = address.replace('bitcoincash:', '');

            pubkey.master = address;

            if (path.type === 'address') {
              pubkey.address = address;
              pubkey.pubkey = address;
            } else if (path.type === 'xpub' || path.type === 'zpub') {
              let pubkeys = await this.swapKit?.getWallet(chain)?.getPubkeys([path]);
              if (!pubkeys) throw new Error(`Failed to get pubkeys for ${chain}`);
              console.log(tag, ' pubkeys: ', pubkeys);
              let pubkeyForPath = pubkeys[0];
              // let pubkeyForPath = pubkeys.find(
              //   (p: any) => p.addressNList.toString() === path.addressNList.toString(),
              // );
              // if (!pubkeyForPath) throw new Error(`Failed to get pubkey for path in ${chain}`);
              if (pubkeyForPath) pubkey.pubkey = pubkeyForPath.xpub || pubkeyForPath.zpub;
            }

            pubkey.context = this.context;
            pubkey.contextType = this.contextType.split(':')[0];
            pubkey.networks = path.networks;
            pubkeysNew.push(pubkey);
          }
        }

        // add pubkeys to this.pubkeys
        pubkeysNew.forEach((newPubkey: any) => {
          const exists = this.pubkeys.some(
            (existingPubkey: any) => existingPubkey.pubkey === newPubkey.pubkey,
          );
          if (!exists) {
            this.pubkeys.push(newPubkey);
          }
        });
        this.events.emit('SET_PUBKEYS', this.pubkeys);

        //update assets
        //@ts-ignore
        // for (let i = 0; i < this.assets.length; i++) {
        //   //lookup pubkeys for asset
        //   const asset = this.assets[i];
        //   const assetPubkeys = [];
        //
        //   // Lookup pubkeys for the asset based on networkId
        //   this.pubkeys.forEach((pubkeyObj: any) => {
        //     if (pubkeyObj.networks && pubkeyObj.networks.includes(asset.networkId)) {
        //       assetPubkeys.push(pubkeyObj);
        //     }
        //   });
        //
        //   // Update the asset's pubkeys array
        //   asset.pubkeys = assetPubkeys;
        //
        //   // Update the assetsMap as well
        //   this.assetsMap.set(asset.caip, asset);
        //
        //   // Update the asset in its place within the this.assets array
        //   this.assets[i] = asset;
        // }

        return pubkeysNew;
      } catch (e) {
        console.error(tag, 'Error: ', e);
        throw e;
      }
    };
    this.getBalances = async function (filter?: any) {
      const tag = `${TAG} | getBalances | `;
      try {
        if (filter) console.log('filter: ', filter);
        if (!this.assets || this.assets.length === 0) await this.getAssets();
        //verify context
        //log.debug('getBalances this.blockchains: ', this.blockchains);
        console.log(tag, 'this.blockchains: ', this.blockchains);
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
            //console.log('walletForChain.balance: ', walletForChain.balance);
            for (let j = 0; j < walletForChain.balance.length; j++) {
              // @ts-ignore
              let balance: AssetValue = walletForChain?.balance[j];
              console.log(tag, 'balance: ', balance);

              //log.debug('balance: ', balance);
              let balanceString: any = {};
              if (!balance.chain || !balance.type) {
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
                  // Construct CAIP identifier for ERC20 or native tokens based on balance type and chain.
                  let caip =
                    balance.type !== 'Native'
                      ? `${ChainToNetworkId[balance.chain]}/erc20:${balance.symbol.split('-')[1]}`
                      : shortListSymbolToCaip[balance.chain];
                  console.log('balanceToCaip: result: caip: ', caip);
                  if (caip) {
                    //log.info("balance: ",balance)
                    //Assuming these properties already exist in each balance
                    balanceString.context = this.context;
                    balanceString.contextType = this.context.split(':')[0];
                    balanceString.caip = caip;
                    balanceString.ref = balanceString.context + caip;
                    balanceString.identifier = caipToThorchain(caip, balance.ticker);
                    balanceString.networkId = caipToNetworkId(caip);
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
                    //update asset
                    // Update the asset in the assetsMap
                    // let assetInMap = this.assetsMap.get(caip.toLowerCase());
                    // if (assetInMap) {
                    //   if (!assetInMap.balances) {
                    //     assetInMap.balances = [];
                    //   }
                    //   assetInMap.balances.push(balanceString);
                    //   this.assetsMap.set(caip.toLowerCase(), assetInMap);
                    // }

                    // Update the asset in the assets array
                    // const assetIndex = this.assets.findIndex(
                    //   (asset: any) => asset.caip.toLowerCase() === caip.toLowerCase(),
                    // );
                    // if (assetIndex !== -1) {
                    //   if (!this.assets[assetIndex].balances) {
                    //     this.assets[assetIndex].balances = [];
                    //   }
                    //   this.assets[assetIndex].balances.push(balanceString);
                    // }
                    //console.log('assetInfo: ', assetInfo);
                    // let assetInfo = this.assets.filter(
                    //   (e: any) => e.caip.toLowerCase() === caip.toLowerCase(),
                    // );
                    // assetInfo = assetInfo[0];
                    // console.log('assetInfo: ', assetInfo);
                    // balances.push({ ...assetInfo, ...balanceString });
                    balances.push(balanceString);
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
        console.log('balances: ', balances);
        if (balances && balances.length > 0) this.setBalances(balances);
        // balances = balances.filter(
        //   (balance, index, self) => index === self.findIndex((b) => b.ref === balance.ref),
        // );

        // console.log('PRE-register balances: ', balances);
        // const register: any = {
        //   username: this.username,
        //   blockchains: [],
        //   publicAddress: 'none',
        //   context: 'none',
        //   walletDescription: {
        //     context: 'none',
        //     type: 'none',
        //   },
        //   data: {
        //     pubkeys: this.pubkeys,
        //     balances,
        //   },
        //   queryKey: this.queryKey,
        //   auth: 'lol',
        //   provider: 'lol',
        // };
        // //log.debug('register: ', register);
        // //console.log('register: ', JSON.stringify(register));
        // const result = await this.pioneer.Register(register);
        // //log.debug('result: ', result);
        // // console.log('result: ', result.data);
        // // console.log('result: ', result.data.balances);
        //
        // if (result.data.balances) {
        //   //log.debug('Setting balances!');
        //   this.balances = result.data.balances;
        //   if (result.data.balances && result.data.balances.length > 0) {
        //     // this.events.emit('SET_BALANCES', result.data.balances);
        //     // this.events.emit('SET_BALANCES', this.balances);
        //   }
        //
        //   //update assets
        //   this.assets = this.assets.map((asset: any) => {
        //     const caipKey = asset.caip;
        //     const balances = this.balances.filter(
        //       (b: any) => b.caip.toLowerCase() === caipKey.toLowerCase(),
        //     );
        //
        //     if (balances) {
        //       //console.log('MATCH balance: ', balance);
        //       // If a matching balance is found, create a new asset object with updated data
        //       const updatedAsset = {
        //         ...asset,
        //         balances,
        //       };
        //       //console.log('updatedAsset: ', updatedAsset);
        //       // Update the assetsMap with the new asset data
        //       this.assetsMap.set(caipKey, updatedAsset);
        //       return updatedAsset;
        //     } else {
        //       // If no matching balance, return the asset unchanged
        //       return asset;
        //     }
        //   });
        //   this.assets.sort((a, b) => b.valueUsd - a.valueUsd);
        //   this.balances.sort((a, b) => b.valueUsd - a.valueUsd);
        //   console.log('init: this.balances: ', this.balances);
        //
        //   // if (this.balances.length > 0) {
        //   //   this.setContext(this.balances[0].context);
        //   //   this.setAssetContext(this.balances[0]);
        //   //   if (this.balances[1]) this.setOutboundAssetContext(this.balances[1]);
        //   // }
        // }

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
        //log.info(tag, "walletWithContext: ", walletWithContext);
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
        this.contextType = context.split(':')[0];
        this.events.emit('SET_CONTEXT', context);
        return { success: true };
      } catch (e) {
        console.error(tag, e);
        throw e;
      }
    };
    this.setContextType = async function (contextType: WalletOption) {
      const tag = `${TAG} | setContextType | `;
      try {
        this.contextType = contextType;
        this.events.emit('SET_CONTEXT_TYPE', contextType);
        return { success: true };
      } catch (e) {
        console.error(tag, e);
        throw e;
      }
    };
    this.setAssetContext = async function (asset: any) {
      const tag = `${TAG} | setAssetContext | `;
      try {
        //accept null
        if (!asset) {
          this.assetContext = null;
          return;
        }
        if (!asset.caip) throw Error('Invalid Asset! missing caip!');
        let assetInfo = this.assetsMap.get(asset.caip);
        //hydrate with price data
        let priceData = await this.pioneer.MarketInfo({ caip: asset.caip });
        priceData = priceData.data || {};
        if (!priceData) console.error('Unable to get price data for asset: ', asset.caip);
        if (priceData) assetInfo = { ...assetInfo, ...priceData };
        // const balances = this.balances.filter(
        //   (b: any) => b.caip.toLowerCase() === asset.caip.toLowerCase(),
        // );
        // const pubkeys = this.pubkeys.filter((pubkey: any) =>
        //   pubkey.networks.includes(asset.networkId),
        // );
        // assetInfo.balances = balances;
        // assetInfo.pubkeys = pubkeys;
        this.events.emit('SET_ASSET_CONTEXT', assetInfo);
        this.assetContext = assetInfo;
        return { success: true };

        // //validate asset before switching
        // if (!asset.caip) {
        //   console.error('**** Invalid asset caip is required!', asset);
        //   throw Error('setAssetContext Invalid asset caip is required!');
        // }
        // //get verbose info
        // if (!this.assets || this.assets.length === 0) await this.getAssets();
        // //
        // let priceData = await this.pioneer.MarketInfo({ caip: asset.caip });
        // priceData = priceData.data || {};
        // console.log('priceData: ', priceData);
        //
        // let allAssets = this.assets;
        // let assetInfo = allAssets.find(
        //   (a: any) => a.caip.toLowerCase() === asset.caip.toLowerCase(),
        // );
        // const balanceObj = this.balances.find(
        //   (balance: any) => balance.caip.toLowerCase() === asset.caip.toLowerCase(),
        // );
        // //console.log('balanceObj: ', balanceObj);
        // const valueUsd = balanceObj ? parseFloat(balanceObj.valueUsd) : 0;
        // const priceUsd = priceData.priceUsd || 0;
        // const context = balanceObj ? balanceObj.context : 'external';
        // const balance = balanceObj ? balanceObj.balance : '';
        //
        // // Condense the assetIdSearch assignment
        // let assetIdSearch = asset.networkId.includes('eip155') ? 'eip155:1' : asset.networkId;
        //
        // // Attempt to find a corresponding pubkey object that includes the asset's networkId
        // const pubkeyObj = this.pubkeys.find((pubkey: any) =>
        //   pubkey.networks.includes(assetIdSearch),
        // );
        // //console.log('pubkeyObj: ', pubkeyObj);
        //
        // // Extract the pubkey value if the pubkeyObj is found
        // const pubkey = pubkeyObj ? pubkeyObj.pubkey : null;
        // // Set the asset's address to pubkey.master or pubkey.address if available
        // const address = pubkeyObj ? pubkeyObj.master || pubkeyObj.address : null;
        // //console.log('assetInfo: ', assetInfo);
        // //console.log('valueUsd: ', valueUsd);
        // //console.log('priceUsd: ', priceUsd);
        // //console.log('context: ', context);
        // //console.log('balance: ', balance);
        // //console.log('pubkey: ', pubkey);
        // //console.log('address: ', address);
        //
        // this.assetContext = { ...assetInfo, valueUsd, priceUsd, context, balance, pubkey, address };
        // this.events.emit('SET_ASSET_CONTEXT', {
        //   ...assetInfo,
        //   valueUsd,
        //   priceUsd,
        //   context,
        //   balance,
        //   pubkey,
        //   address,
        // });
        return { success: true };
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.setOutboundAssetContext = async function (asset: any) {
      const tag = `${TAG} | setOutputAssetContext | `;
      try {
        //accept null
        if (!asset) {
          this.outboundAssetContext = null;
          return;
        }
        if (!asset.caip) throw Error('Invalid Asset! missing caip!');
        let assetInfo = this.assetsMap.get(asset.caip);
        if (assetInfo) return { success: false, error: 'caip not found! caip: ' + asset.caip };
        //hydrate with price data
        let priceData = await this.pioneer.MarketInfo({ caip: asset.caip });
        priceData = priceData.data || {};
        if (!priceData) console.error('Unable to get price data for asset: ', asset.caip);
        if (priceData) assetInfo = { ...assetInfo, ...priceData };
        // const balances = this.balances.filter(
        //   (b: any) => b.caip.toLowerCase() === asset.caip.toLowerCase(),
        // );
        // const pubkeys = this.pubkeys.filter((pubkey: any) =>
        //   pubkey.networks.includes(asset.networkId),
        // );
        // assetInfo.balances = balances;
        // assetInfo.pubkeys = pubkeys;
        this.events.emit('SET_ASSET_CONTEXT', assetInfo);
        this.outboundAssetContext = assetInfo;
        return { success: true };

        // console.log(tag, 'setOutboundAssetContext: ', asset);
        // if (!asset || !asset.caip) {
        //   console.error('**** 8 ** Invalid asset caip is required!', asset);
        //   throw Error('setOutboundAssetContext Invalid asset caip is required!');
        // }
        // let priceData = await this.pioneer.MarketInfo({ caip: asset.caip });
        // priceData = priceData.data || {};
        // // console.log('priceData: ', priceData);
        // if (asset && this.outboundAssetContext !== asset) {
        //   if (!this.assets || this.assets.length === 0) await this.getAssets();
        //   let allAssets = this.assets;
        //   let assetInfo = allAssets.find(
        //     (a: any) => a.caip.toLowerCase() === asset.caip.toLowerCase(),
        //   );
        //   const balanceObj = this.balances.find(
        //     (balance: any) => balance.caip.toLowerCase() === asset.caip.toLowerCase(),
        //   );
        //   const valueUsd = balanceObj ? parseFloat(balanceObj.valueUsd) : 0;
        //   const priceUsd = priceData.priceUsd || 0;
        //   const context = balanceObj ? balanceObj.context : 'external';
        //   const balance = balanceObj ? balanceObj.balance : '';
        //   // Attempt to find a corresponding pubkey object that includes the asset's networkId
        //   const pubkeyObj = this.pubkeys.find((pubkey: any) =>
        //     pubkey.networks.includes(asset.networkId),
        //   );
        //   // Extract the pubkey value if the pubkeyObj is found
        //   const pubkey = pubkeyObj ? pubkeyObj.pubkey : null;
        //   // Set the asset's address to pubkey.master or pubkey.address if available
        //   const address = pubkeyObj ? pubkeyObj.master || pubkeyObj.address : null;
        //
        //   this.outboundAssetContext = {
        //     ...assetInfo,
        //     valueUsd,
        //     context,
        //     priceUsd,
        //     balance,
        //     pubkey,
        //     address,
        //   };
        //   this.events.emit('SET_OUTBOUND_ASSET_CONTEXT', {
        //     ...assetInfo,
        //     valueUsd,
        //     priceUsd,
        //     context,
        //     balance,
        //     pubkey,
        //     address,
        //   });
        //   return { success: true };
        // }
        // return { success: false, error: `already asset context=${asset}` };
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
  }
}

export default SDK;
