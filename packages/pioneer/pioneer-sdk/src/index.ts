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
import { Chain, NetworkIdToChain } from '@coinmasters/types';
// @ts-ignore
import { caipToNetworkId, caipToThorchain, thorchainToCaip, tokenToCaip } from '@pioneer-platform/pioneer-caip';
// @ts-ignore
import { assetData } from '@pioneer-platform/pioneer-discovery'
// @ts-ignore
import Pioneer from '@pioneer-platform/pioneer-client';
import EventEmitter from 'events';

// @ts-ignore
// @ts-ignore
// @ts-ignore

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
  public getAssets: (filter: string) => Promise<any>;
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

        //get user info
        // let userInfo = await this.pioneer.User();
        // userInfo = userInfo.data;
        //
        // if (userInfo) {
        //   log.debug('userInfo: ', userInfo);
        //   if (userInfo.pubkeys) this.pubkeys = userInfo.pubkeys;
        //   if (userInfo.context) this.context = userInfo.context;
        //   if (userInfo.balances) this.balances = userInfo.balances;
        //   if (userInfo.nfts) this.nfts = userInfo.nfts;
        // }

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

        // Remove duplicates based on .caip property
        this.balances = combinedBalances.reduce((acc, currentItem) => {
          if (!acc.some((item: { caip: any }) => item.caip === currentItem.caip)) {
            acc.push(currentItem);
          }
          return acc;
        }, []);

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
            console.log('this.swapKit: ', this.swapKit);
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

    // this.pairWallet = async function (wallet: string, blockchains: any, ledgerApp?: any) {
    //   const tag = `${TAG} | pairWallet | `;
    //   try {
    //     // log.debug(tag, "Pairing Wallet");
    //     if (!wallet) throw Error('Must have wallet to pair!');
    //     if (!this.swapKit) throw Error('SwapKit not initialized!');
    //     if (!blockchains) throw Error('Must have blockchains to pair!');
    //     //log.debug('blockchains: ', blockchains);
    //     this.blockchains = blockchains;
    //     //get paths by blockchains, this allows pre-loaded paths to be inited beforehand
    //     //this.paths = [...getPaths(blockchains), ...this.paths];
    //     //verify at least one path per blockchain
    //     //log.debug('this.paths: ', this.paths);
    //
    //     // filter wallets by type
    //     const walletSelected = this.wallets.find((w: any) => w.type === wallet);
    //     //log.debug(tag, 'walletSelected: ', walletSelected);
    //
    //     //chain by networkId
    //     //log.debug(tag, 'blockchains: ', blockchains);
    //     let AllChainsSupported = blockchains.map(
    //       (caip: string | number) =>
    //         NetworkIdToChain[caip] ||
    //         (() => {
    //           throw new Error(`Missing CAIP: ${caip}`);
    //         })(),
    //     );
    //     //log.debug(tag, 'AllChainsSupported: ', AllChainsSupported);
    //
    //     await this.verifyWallet();
    //
    //     let resultPair: string;
    //     if (walletSelected.type === 'KEEPKEY') {
    //       resultPair =
    //         (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
    //           AllChainsSupported,
    //           this.paths,
    //         )) || '';
    //       //log.debug('resultPair: ', resultPair);
    //       this.keepkeyApiKey = resultPair;
    //     } else if (walletSelected.type === 'METAMASK') {
    //       resultPair =
    //         (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
    //           AllChainsSupported,
    //           this.paths,
    //         )) || '';
    //     } else if (walletSelected.type === 'KEYSTORE') {
    //       resultPair =
    //         (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
    //           AllChainsSupported,
    //           this.paths,
    //         )) || '';
    //     } else if (walletSelected.type === 'LEDGER') {
    //       //log.debug('ledgerApp: ', ledgerApp);
    //       try {
    //         if (!ledgerApp) throw Error('Ledger app required for ledger pairing!');
    //
    //         if (ledgerApp === 'ETH') {
    //           //log.debug('ETH');
    //           //pair all evm chains
    //           // eslint-disable-next-line @typescript-eslint/prefer-for-of
    //           for (let i = 0; i < EVMChainList.length; i++) {
    //             resultPair =
    //               (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
    //                 EVMChainList[i],
    //                 this.paths,
    //               )) || '';
    //             //log.debug('LEDGER resultPair: ', resultPair);
    //           }
    //         } else {
    //           resultPair =
    //             (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
    //               ledgerApp,
    //               this.paths,
    //             )) || '';
    //           //log.debug('LEDGER resultPair: ', resultPair);
    //         }
    //       } catch (e: any) {
    //         console.error('Failed to pair ledger! e: ', e);
    //         // @ts-ignore
    //         if (e.toString().indexOf('LockedDeviceError') > -1) {
    //           //log.debug('LockedDeviceError...');
    //           return {
    //             error: 'LockedDeviceError',
    //           };
    //         }
    //         if (e.toString().indexOf('claimInterface')) {
    //           return {
    //             error: 'claimInterface',
    //           };
    //         }
    //         if (e.toString().indexOf('decorateAppAPIMethods')) {
    //           return {
    //             error: 'WrongAppError',
    //           };
    //         }
    //         if (e.toString().indexOf('TransportStatusError')) {
    //           return {
    //             error: 'WrongAppError',
    //           };
    //         }
    //         return {
    //           error: 'Unknown Error',
    //         };
    //         //TODO no device plugged in
    //         //TODO wrong browser?
    //       }
    //     } else {
    //       resultPair =
    //         (await (this.swapKit as any)[walletSelected.wallet.connectMethodName](
    //           AllChainsSupported,
    //         )) || '';
    //     }
    //     // @ts-ignore
    //     if (resultPair) {
    //       // update
    //       const matchingWalletIndex = this.wallets.findIndex((w) => w.type === wallet);
    //       //log.debug(tag, 'matchingWalletIndex: ', matchingWalletIndex);
    //       // get balances
    //       // @ts-ignore
    //       let context;
    //       if (wallet === 'LEDGER' && ledgerApp !== 'ETH') {
    //         context = 'ledger:ledger.wallet'; //placeholder until we know eth address
    //       } else {
    //         const ethAddress = this.swapKit.getAddress(Chain.Ethereum);
    //         if (!ethAddress) throw Error('Failed to get eth address! can not pair wallet');
    //         context = `${wallet.toLowerCase()}:${ethAddress}.wallet`;
    //
    //         // isPioneer?
    //         // get pioneer status
    //         let pioneerInfo = await this.pioneer.GetPioneer({
    //           address: ethAddress,
    //         });
    //         pioneerInfo = pioneerInfo.data;
    //         //log.debug('pioneerInfo: ', pioneerInfo);
    //         if (pioneerInfo.isPioneer) {
    //           this.isPioneer = pioneerInfo.image;
    //         }
    //       }
    //
    //       // log.info(tag, "context: ", context);
    //       this.events.emit('CONTEXT', context);
    //       // add context to wallet
    //       //@ts-ignore
    //       // this.wallets[matchingWalletIndex].context = context;
    //       //@ts-ignore
    //       // this.wallets[matchingWalletIndex].connected = true;
    //       this.wallets[matchingWalletIndex].status = 'connected';
    //       this.setContext(context);
    //       // this.refresh(context);
    //     } else {
    //       throw Error(`Failed to pair wallet! ${walletSelected.type}`);
    //     }
    //     return resultPair;
    //   } catch (e) {
    //     console.error(tag, 'e: ', e);
    //     // response:
    //     console.error(tag, 'e: ', JSON.stringify(e));
    //     // log.error(tag, "e2: ", e.response)
    //     // log.error(tag, "e3: ", e.response.data)
    //     throw e;
    //   }
    // };
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
    this.getAssets = function (filter) {
      try {
        // const tag = `${TAG} | getAssets | `;
        //log.info(tag, "filter: ", filter);

        console.log("ASSET)DATA: ",Object.keys(assetData).length)

        let tokenMap: any = {};
        let chains = new Set();
        let chainTokenCounts: any = {};

        // Function to add tokens with their source list
        const addTokens = (tokens: any, sourceList: any) => {
          tokens.forEach((token: any) => {
            chains.add(token.chain);
            chainTokenCounts[token.chain] = (chainTokenCounts[token.chain] || 0) + 1;
            //console.log('token PRE: ', token);
            let expandedInfo = tokenToCaip(token);
            if (expandedInfo.caip) {
              expandedInfo.sourceList = sourceList;
              // console.log('expandedInfo: ', expandedInfo);
              //get extended info
              let assetInfo = assetData[expandedInfo.caip.toLowerCase()];
              if(assetInfo){
                let combinedInfo = { ...expandedInfo, ...assetInfo };
                tokenMap[token.identifier] = combinedInfo;
              } else {
                // console.error("UNABLE TO name: ", expandedInfo.caip)
              }
            } else {
              // console.error("UNABLE TO MAKE CAIP: ", token)
            }
          });
        };

        // Add tokens from each list with their source
        addTokens(NativeList.tokens, 'NativeList');
        addTokens(MayaList.tokens, 'MayaList');
        addTokens(CoinGeckoList.tokens, 'CoinGeckoList');
        addTokens(OneInchList.tokens, 'OneInchList');
        addTokens(PancakeswapETHList.tokens, 'PancakeswapETHList');
        addTokens(PancakeswapList.tokens, 'PancakeswapList');
        addTokens(PangolinList.tokens, 'PangolinList');
        addTokens(PioneerList.tokens, 'PioneerList');
        addTokens(StargateARBList.tokens, 'StargateARBList');
        addTokens(SushiswapList.tokens, 'SushiswapList');
        addTokens(ThorchainList.tokens, 'ThorchainList');
        addTokens(TraderjoeList.tokens, 'TraderjoeList');
        addTokens(UniswapList.tokens, 'UniswapList');
        addTokens(WoofiList.tokens, 'WoofiList');

        // Convert the tokenMap back to an array
        let allAssets = Object.values(tokenMap);

        // Convert chains set to array
        // let chainsArray = Array.from(chains);

        //log.info("Combined Asset List: ", allAssets.length);
        //log.info("Combined Asset List: ", allAssets[0]);
        //log.info("Chains: ", chainsArray);

        // Log the number of tokens on each chain
        // for (const [chain, count] of Object.entries(chainTokenCounts)) {
        //   //log.info(`Number of tokens on ${chain}: `, count);
        // }

        return allAssets;
      } catch (e) {
        //log.error(e);
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
        //verify context
        //TODO handle ledger contexts
        // const ethAddress = this.swapKit.getAddress(Chain.Ethereum);
        // if (this.context.indexOf(ethAddress) === -1) this.clearWalletState();
        // // Verify if pubkeys match context
        // if (this.pubkeys.some((pubkey) => pubkey.context !== this.context)) {
        //   this.pubkeys = [];
        // }
        // // Verify if balances match context
        // if (this.balances.some((balance) => balance.context !== this.context)) {
        //   this.balances = [];
        // }
        //TODO if wallet doesn't support blockchains, throw error
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
                  //console.log("balance: PRE: ",balance)
                  let caip = thorchainToCaip(
                    balance.chain,
                    balance.symbol,
                    balance.ticker,
                    balance.type,
                  );
                  //console.log("caip: PRE: ",caip)
                  //log.debug('caip: ', caip);
                  //if (!caip) throw Error('Failed to get caip for balance: ' + JSON.stringify(balance));
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
        //log.debug('register: ', JSON.stringify(register));
        const result = await this.pioneer.Register(register);
        //log.debug('result: ', result);
        //log.debug('result: ', result.data);
        //log.debug('result: ', result.data.balances);

        if (result.data.balances) {
          //log.debug('Setting balances!');
          this.balances = result.data.balances;

          this.events.emit('SET_BALANCES', result.data.balances);

          // TODO pick better default assets (last used)
          this.assetContext = this.balances[0];
          this.events.emit('SET_ASSET_CONTEXT', this.assetContext);

          this.outboundAssetContext = this.balances[1];
          this.events.emit('SET_OUTBOUND_ASSET_CONTEXT', this.outboundAssetContext);
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

        // // get chains of wallet
        // const chains = Object.keys(this.swapKit.connectedWallets);
        // // get address array
        // const addressArray = await Promise.all(
        //   // @ts-ignore
        //   chains.map(this.swapKit.getAddress),
        // );
        // // log.info(tag, "addressArray: ", addressArray);
        //
        // for (let i = 0; i < chains.length; i++) {
        //   const chain = chains[i];
        //   const address = addressArray[i];
        //   const pubkey = {
        //     context: this.context, // TODO this is not right?
        //     // wallet:walletSelected.type,
        //     symbol: chain,
        //     blockchain: COIN_MAP_LONG[chain] || 'unknown',
        //     type: 'address',
        //     caip: shortListSymbolToCaip[chain],
        //     master: address,
        //     pubkey: address,
        //     address,
        //   };
        //   this.pubkeys.push(pubkey);
        // }
        // this.events.emit('SET_PUBKEYS', this.pubkeys);
        // // set pubkeys
        // //log.debug('this.swapKit: ', this.swapKit);
        // // calculate walletDaa
        // const walletDataArray = await Promise.all(
        //   // @ts-ignore
        //   chains.map(this.swapKit.getWalletByChain),
        // );
        // //log.debug(tag, 'walletDataArray: ', walletDataArray);
        // // set balances
        // const balancesSwapKit: any = [];
        // // eslint-disable-next-line @typescript-eslint/prefer-for-of
        // for (let i = 0; i < walletDataArray.length; i++) {
        //   const walletData: any = walletDataArray[i];
        //   // //log.debug(tag, 'walletData: ', walletData);
        //   // const chain = chains[i];
        //   // log.info(tag, "chain: ", chain);
        //   if (walletData) {
        //     // eslint-disable-next-line @typescript-eslint/prefer-for-of
        //     for (let j = 0; j < walletData.balance.length; j++) {
        //       const balance = walletData.balance[j];
        //       // //log.debug('balance: ', balance);
        //       if (balance && balance?.baseValueNumber > 0) {
        //         balance.address = walletData.address;
        //         balance.context = this.context;
        //         balancesSwapKit.push(balance);
        //       }
        //     }
        //   }
        // }
        //
        // //
        // const pubkeysRegister = this.pubkeys.filter((pubkey) => pubkey.context === this.context);
        // const balancesRegister = balancesSwapKit
        //   .map((balance: any) => {
        //     const balanceString: any = {};
        //     // Assuming these properties already exist in each balance
        //     balanceString.context = this.context;
        //     balanceString.address = balance.address;
        //     balanceString.symbol = balance.symbol;
        //     balanceString.caip = shortListSymbolToCaip[balance.symbol];
        //     balanceString.chain = balance.chain;
        //     balanceString.ticker = balance.ticker;
        //     balanceString.type = balance.type;
        //     balanceString.balance = balance.value;
        //     balanceString.context = balance.context;
        //     return balanceString;
        //   })
        //   .filter((balance: any) => balance.context === this.context);
        //
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
        //     pubkeys: pubkeysRegister,
        //     balances: balancesRegister,
        //   },
        //   queryKey: this.queryKey,
        //   auth: 'lol',
        //   provider: 'lol',
        // };
        // //log.debug('register: ', register);
        // //log.debug('register: ', JSON.stringify(register));
        // const result = await this.pioneer.Register(register);
        // //log.debug('result: ', result);
        // //log.debug('result: ', result.data);
        // //log.debug('result: ', result.data.balances);
        //
        // if (result.data.balances) {
        //   //log.debug('Setting balances!');
        //   this.balances = result.data.balances;
        // }
        //
        // // TODO pick better default assets (last used)
        // this.events.emit('SET_BALANCES', result.data.balances);
        //
        // this.assetContext = this.balances[0];
        // this.events.emit('SET_ASSET_CONTEXT', this.assetContext);
        //
        // this.outboundAssetContext = this.balances[1];
        // this.events.emit('SET_OUTBOUND_ASSET_CONTEXT', this.outboundAssetContext);
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
        this.assetContext = asset;
        this.events.emit('SET_ASSET_CONTEXT', asset);
        return { success: true };
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };
    this.setOutboundAssetContext = async function (asset: any) {
      const tag = `${TAG} | setOutputAssetContext | `;
      try {
        if (asset && this.outboundAssetContext !== asset) {
          this.outboundAssetContext = asset;
          this.events.emit('SET_OUTBOUND_ASSET_CONTEXT', asset);
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
