/*
    Pioneer SDK

        A ultra-light bridge to the pioneer platform

              ,    .  ,   .           .
          *  / \_ *  / \_      .-.  *       *   /\'__        *
            /    \  /    \,   ( ₿ )     .    _/  /  \  *'.
       .   /\/\  /\/ :' __ \_   -           _^/  ^/    `--.
          /    \/  \  _/  \-'\      *    /.' ^_   \_   .'\  *
        /\  .-   `. \/     \ /==~=-=~=-=-;.  _/ \ -. `_/   \
       /  `-.__ ^   / .-'.--\ =-=~_=-=~=^/  _ `--./ .-'  `-
      /        `.  / /       `.~-^=-=~=^=.-'      '-._ `._

                             A Product of the CoinMasters Guild
                                              - Highlander

*/
import { SDK } from '@coinmasters/pioneer-sdk';
import { availableChainsByWallet, ChainToNetworkId, getChainEnumValue } from '@coinmasters/types';
import {
  getPaths,
  // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
import EventEmitter from 'eventemitter3';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  // useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';

// import transactionDB from './transactionDB';
import type { ActionTypes, InitialState } from './types';
import { WalletActions } from './types';

const eventEmitter = new EventEmitter();

const initialState: InitialState = {
  status: 'disconnected',
  hardwareError: null,
  openModal: null,
  username: '',
  serviceKey: '',
  queryKey: '',
  context: '',
  intent: '',
  assetContext: '',
  blockchainContext: '',
  pubkeyContext: '',
  outboundContext: null,
  outboundAssetContext: null,
  outboundBlockchainContext: null,
  outboundPubkeyContext: null,
  blockchains: [],
  balances: [],
  pubkeys: [],
  wallets: [],
  walletDescriptions: [],
  totalValueUsd: 0,
  app: null,
  api: null,
};

export interface IPioneerContext {
  state: InitialState;
  username: string | null;
  context: string | null;
  status: string | null;
  hardwareError: string | null;
  totalValueUsd: number | null;
  assetContext: string | null;
  blockchainContext: string | null;
  pubkeyContext: string | null;
  outboundContext: string | null; // Adjusted
  outboundAssetContext: string | null; // Adjusted
  outboundBlockchainContext: string | null; // Adjusted
  outboundPubkeyContext: string | null; // Adjusted
  app: any;
  api: any;
}

// export interface IPioneerContext {
//   state: InitialState;
//   username: string | null;
//   context: string | null;
//   status: string | null;
//   totalValueUsd: number | null;
//   assetContext: string | null;
//   blockchainContext: string | null;
//   pubkeyContext: string | null;
//   app: any;
//   api: any;
// }

const reducer = (state: InitialState, action: ActionTypes) => {
  switch (action.type) {
    case WalletActions.SET_STATUS:
      eventEmitter.emit('SET_STATUS', action.payload);
      return { ...state, status: action.payload };

    case WalletActions.SET_HARDWARE_ERROR:
      // eventEmitter.emit("SET_USERNAME", action.payload);
      return { ...state, hardwareError: action.payload };

    case WalletActions.SET_USERNAME:
      // eventEmitter.emit("SET_USERNAME", action.payload);
      return { ...state, username: action.payload };

    case WalletActions.OPEN_MODAL:
      return { ...state, openModal: action.payload };

    case WalletActions.SET_API:
      return { ...state, api: action.payload };

    case WalletActions.SET_APP:
      return { ...state, app: action.payload };

    case WalletActions.SET_WALLETS:
      return { ...state, wallets: action.payload };

    case WalletActions.SET_INTENT:
      return { ...state, intent: action.payload };

    case WalletActions.SET_CONTEXT:
      // eventEmitter.emit("SET_CONTEXT", action.payload);
      return { ...state, context: action.payload };

    case WalletActions.SET_ASSET_CONTEXT:
      // eventEmitter.emit("SET_ASSET_CONTEXT", action.payload);
      return { ...state, assetContext: action.payload };

    case WalletActions.SET_BLOCKCHAIN_CONTEXT:
      // eventEmitter.emit("SET_BLOCKCHAIN_CONTEXT", action.payload);
      return { ...state, blockchainContext: action.payload };

    case WalletActions.SET_PUBKEY_CONTEXT:
      // eventEmitter.emit("SET_PUBKEY_CONTEXT", action.payload);
      return { ...state, pubkeyContext: action.payload };

    case WalletActions.SET_OUTBOUND_CONTEXT:
      return { ...state, outboundContext: action.payload };

    case WalletActions.SET_OUTBOUND_ASSET_CONTEXT:
      return { ...state, outboundAssetContext: action.payload };

    case WalletActions.SET_OUTBOUND_BLOCKCHAIN_CONTEXT:
      return { ...state, outboundBlockchainContext: action.payload };

    case WalletActions.SET_OUTBOUND_PUBKEY_CONTEXT:
      return { ...state, outboundPubkeyContext: action.payload };

    case WalletActions.SET_BLOCKCHAINS:
      return { ...state, blockchains: action.payload };

    case WalletActions.SET_BALANCES:
      return { ...state, balances: action.payload };

    case WalletActions.SET_PUBKEYS:
      return { ...state, pubkeys: action.payload };

    case WalletActions.ADD_WALLET:
      return { ...state, wallets: [...state.wallets, action.payload] }; // Assuming wallets is an array in the state.

    case WalletActions.RESET_STATE:
      return {
        ...state,
        api: null,
        user: null,
        username: null,
        context: null,
        intent: null,
        status: null,
        hardwareError: null,
        assetContext: null,
        outboundAssetContext: null,
        blockchains: [],
        balances: [],
        pubkeys: [],
      };

    default:
      return state;
  }
};

const PioneerContext = createContext(initialState);

export const PioneerProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  // @ts-ignore
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [isModalOpen, setIsModalOpen] = useState(false);

  // Create transaction entry
  // const createTx = (newTx: any) => {
  //   console.log('CREATE_TX');
  //   transactionDB
  //     .createTransaction(newTx)
  //     .then((id: number) => console.log(`Transaction created with ID: ${id}`))
  //     .catch((err: any) => console.error('Error creating transaction:', err));
  // };

  // Update transaction
  // const updateTx = (txid: string, newState: any) => {
  //   console.log('UPDATE_TX');
  //   transactionDB
  //     .updateTransaction(txid, newState)
  //     .then(() => console.log(`Transaction ${txid} updated to state ${newState}`))
  //     .catch((err: any) => console.error('Error updating transaction:', err));
  // };

  // Read transaction
  // const readTx = async (txid?: string) => {
  //   console.log('READ_TX');
  //   if (txid) {
  //     console.log('txid: ', txid);
  //     return await transactionDB.getTransaction(txid);
  //   } else {
  //     console.log('READ ALL: ');
  //     return await transactionDB.getAllTransactions();
  //   }
  // };

  const resetState = () => {
    console.log('RESET_STATE');
    // @ts-ignore
    dispatch({
      type: WalletActions.RESET_STATE,
      payload: null,
    });
  };

  const setIntent = (intent: string) => {
    console.log('intent modal: ', intent);
    // @ts-ignore
    dispatch({
      type: WalletActions.SET_INTENT,
      payload: intent,
    });
    // Optional: You can also set a message to be displayed in the modal
  };

  const showModal = (modal: string) => {
    console.log('OPEN MODAL: modal: ', modal);
    // @ts-ignore
    dispatch({
      type: WalletActions.OPEN_MODAL,
      payload: modal,
    });
    // Optional: You can also set a message to be displayed in the modal
  };

  const hideModal = () => {
    console.log('CLOSE MODAL');
    // @ts-ignore
    dispatch({
      type: WalletActions.OPEN_MODAL,
      payload: null,
    });
  };

  // TODO add wallet to state
  const clearHardwareError = () => {
    console.log('Clearing hardware error state!');
    // @ts-ignore
    dispatch({
      type: WalletActions.SET_HARDWARE_ERROR,
      payload: null,
    });
  };

  const connectWallet = useCallback(
    async function (wallet: string, chain?: any) {
      try {
        if (state && state?.app) {
          console.log('connectWallet: ', wallet);
          //TODO use these
          // let customPathsForWallet = localStorage.getItem(wallet + ':paths:add');
          // let disabledPathsForWallet = localStorage.getItem(wallet + ':paths:removed');

          type ChainString = keyof typeof ChainToNetworkId; // Assuming ChainToNetworkId's keys are of a specific type.

          const cacheKey = `cache:blockchains:${wallet}`;
          const cachedBlockchains: string[] = JSON.parse(localStorage.getItem(cacheKey) || '[]');

          const getNetworkIdFromChainStr = (chainStr: string): string | undefined => {
            const chainEnum: ChainString | undefined = getChainEnumValue(chainStr) as ChainString;
            return ChainToNetworkId[chainEnum];
          };

          let blockchains =
            cachedBlockchains.length > 0
              ? cachedBlockchains
              : state.app.blockchains.length > 0
                ? state.app.blockchains
                : availableChainsByWallet[wallet]
                    .map(getNetworkIdFromChainStr)
                    .filter((networkId: any): networkId is string => networkId !== undefined);

          console.log('Selected blockchains: ', blockchains);

          console.log('Selected blockchains: ', blockchains);

          //get paths for wallet
          let paths = getPaths(blockchains);
          console.log('paths: ', paths);
          state.app.setPaths(paths);

          //TODO get from localstorage disabled chains
          //TODO get from localStorage added chains!
          let pairParams: any = {
            type: wallet,
            blockchains,
            ledgerApp: chain,
          };
          const successPairWallet = await state.app.pairWallet(pairParams);
          console.log('successPairWallet: ', successPairWallet);
          if (successPairWallet && successPairWallet.error) {
            //push error to state
            console.log('successPairWallet.error: ', successPairWallet.error);
            // @ts-ignore
            dispatch({
              type: WalletActions.SET_HARDWARE_ERROR,
              payload: successPairWallet.error,
            });
          } else {
            if (successPairWallet) localStorage.setItem('keepkeyApiKey', successPairWallet);
            console.log('state.app.assetContext: ', state.app.assetContext);
            console.log('state.app.context: ', state.app.context);

            //add to local storage of connected wallets
            const pairedWallets = JSON.parse(localStorage.getItem('pairedWallets') || '[]');
            const updatedPairedWallets = Array.from(new Set([...pairedWallets, state.app.context]));

            localStorage.setItem('pairedWallets', JSON.stringify(updatedPairedWallets));

            //set last connected wallet
            localStorage.setItem('lastConnectedWallet', state.app.context);

            if (state && state.app) {
              //get pubkeys
              if (state.app.pubkeys) {
                console.log('pubkeys: ', state.app.pubkeys);
                localStorage.setItem('cache:balances:' + wallet, JSON.stringify(state.app.pubkeys));
              }
              //get balances
              if (state.app.balances) {
                console.log('balances: ', state.app.balances);
                localStorage.setItem(
                  'cache:balances:' + wallet,
                  JSON.stringify(state.app.balances),
                );
              }

              // if pioneer set in localStoage
              if (state.app.isPioneer) {
                localStorage.setItem('isPioneer', state.app.isPioneer);
              }
              // @ts-ignore
              dispatch({
                type: WalletActions.SET_CONTEXT,
                payload: state.app.context,
              });
              // @ts-ignore
              dispatch({
                type: WalletActions.SET_ASSET_CONTEXT,
                payload: state.app.assetContext,
              });
              // @ts-ignore
              dispatch({
                type: WalletActions.SET_BLOCKCHAIN_CONTEXT,
                payload: state.app.blockchainContext,
              });
              // @ts-ignore
              dispatch({
                type: WalletActions.SET_PUBKEY_CONTEXT,
                payload: state.app.pubkeyContext,
              });
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
    [state, dispatch],
  );
  // @eslint-ignore
  const onStart = async function (wallets: any, setup: any) {
    try {
      console.log('onStart: ', wallets);
      console.log('setup:', setup);
      if (!wallets) throw Error('wallets is required! onStart');
      // const serviceKey: string | null = localStorage.getItem("serviceKey"); // KeepKey api key
      let queryKey: string | null = localStorage.getItem('queryKey');
      let username: string | null = localStorage.getItem('username');
      const keepkeyApiKey: string | null = localStorage.getItem('keepkeyApiKey');
      // @ts-ignore
      dispatch({ type: WalletActions.SET_USERNAME, payload: username });
      // if auto connecting
      const lastConnectedWallet: string | null = localStorage.getItem('lastConnectedWallet');

      if (!queryKey) {
        queryKey = `key:${uuidv4()}`;
        localStorage.setItem('queryKey', queryKey);
      }
      if (!username) {
        username = `user:${uuidv4()}`;
        username = username.substring(0, 13);
        localStorage.setItem('username', username);
      }
      const blockchains: any = [];

      // @TODO add custom paths from localstorage
      const paths: any = [];
      // const spec =
      //   localStorage.getItem('pioneerUrl') ||
      //   // @ts-ignore
      //   import.meta.env.VITE_PIONEER_URL_SPEC ||
      //   'http://127.0.0.1:9001/spec/swagger.json';
      const spec =
        localStorage.getItem('pioneerUrl') ||
        // @ts-ignore
        'https://pioneers.dev/spec/swagger.json';
      // @ts-ignore
      console.log('spec: ', spec);
      const wss = 'wss://pioneers.dev';
      const configPioneer: any = {
        appName: setup?.appName,
        appIcon: setup?.appIcon,
        blockchains,
        username,
        queryKey,
        keepkeyApiKey,
        spec,
        wss,
        paths,
        // @ts-ignore
        ethplorerApiKey:
          // @ts-ignore
          process.env.NEXT_PUBLIC_ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7',
        // @ts-ignore
        covalentApiKey:
          // @ts-ignore
          process.env.NEXT_PUBLIC_COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q',
        // @ts-ignore
        utxoApiKey:
          process.env.NEXT_PUBLIC_BLOCKCHAIR_API_KEY ||
          setup?.blockchairApiKey ||
          'B_s9XK926uwmQSGTDEcZB3vSAmt5t2',
        // @ts-ignore
        walletConnectProjectId:
          // @ts-ignore
          process.env.VITE_WALLET_CONNECT_PROJECT_ID || '18224df5f72924a5f6b3569fbd56ae16',
      };
      if (!configPioneer.utxoApiKey) throw Error('blockchair api key required!');
      const appInit = new SDK(spec, configPioneer);

      if (appInit.keepkeyApiKey !== keepkeyApiKey) {
        console.log('SAVING API KEY. ');
        localStorage.setItem('keepkeyApiKey', appInit.keepkeyApiKey);
      }

      // @ts-ignore
      console.log('wallets: ', wallets);
      const api = await appInit.init(wallets, setup);

      // set wallets to available wallets
      // @ts-ignore
      console.log('appInit.wallets: ', appInit.wallets);
      // @ts-ignore
      dispatch({ type: WalletActions.SET_API, payload: api });
      // @ts-ignore
      dispatch({ type: WalletActions.SET_APP, payload: appInit });

      // setTimeout(() => {
      //   console.log('STARTING KEEPKEY BRO');
      //   connectWallet('KEEPKEY');
      // }, 2000); // 1000 milliseconds = 1 second

      // events
      // @ts-ignore
      const { events } = appInit;

      const walletActionsArray = Object.values(WalletActions);

      walletActionsArray.forEach((action) => {
        events.on(action, (data: any) => {
          // SET_BALANCES
          if (action === WalletActions.SET_BALANCES) {
            console.log('setting balances for context: ', appInit.context);
            console.log('setting balances: ', data);

            // Remove duplicates based on .caip property
            const uniqueBalances = data.reduce((acc: any, currentItem: any) => {
              if (!acc.some((item: any) => item.caip === currentItem.caip)) {
                acc.push(currentItem);
              }
              return acc;
            }, []);

            if (appInit.context)
              localStorage.setItem(
                appInit.context + ':balanceCache',
                JSON.stringify(uniqueBalances),
              );
          }

          // SET_PUBKEYS
          if (action === WalletActions.SET_PUBKEYS) {
            console.log('setting pubkeys for context: ', appInit.context);

            // Remove duplicates based on .networkId property
            // const uniquePubkeys = data.reduce((acc: any, currentItem: any) => {
            //   if (!acc.some((item: any) => item.networkId === currentItem.networkId)) {
            //     acc.push(currentItem);
            //   }
            //   return acc;
            // }, []);

            if (appInit.context)
              localStorage.setItem(appInit.context + ':pubkeyCache', JSON.stringify(data));
          }
          // @ts-ignore
          dispatch({
            type: action,
            payload: data,
          });
        });
      });

      if (lastConnectedWallet) {
        console.log('Loading from cache!');
        await appInit.setContext(lastConnectedWallet);
        // //get wallet type
        const walletType = lastConnectedWallet.split(':')[0];
        let blockchainsCached = JSON.parse(
          localStorage.getItem('cache:blockchains:' + walletType) || '[]',
        );
        await appInit.setBlockchains(blockchainsCached);
      }

      //add to local storage of connected wallets
      // Retrieve paired wallets from local storage
      const pairedWallets = JSON.parse(localStorage.getItem('pairedWallets') || '[]');

      // Loop over each wallet and load balance and pubkey into cache
      for (const wallet of pairedWallets) {
        // Load balance cache
        let balanceCache = localStorage.getItem('cache:balances:' + wallet);
        balanceCache = balanceCache ? JSON.parse(balanceCache) : [];
        console.log('balanceCache for', wallet, ':', balanceCache);
        await appInit.loadBalanceCache(balanceCache); // Assuming this function exists and is asynchronous

        // Load pubkey cache
        let pubkeyCache = localStorage.getItem(wallet + ':cache:pubkeys');
        pubkeyCache = pubkeyCache ? JSON.parse(pubkeyCache) : [];
        console.log('pubkeyCache for', wallet, ':', pubkeyCache);
        await appInit.loadPubkeyCache(pubkeyCache); // Assuming this function exists and is asynchronous
      }
    } catch (e) {
      console.error(e);
    }
  };

  // end
  const value: any = useMemo(
    () => ({
      state,
      dispatch,
      connectWallet,
      clearHardwareError,
      onStart,
      // createTx,
      // updateTx,
      // readTx,
      showModal,
      hideModal,
      setIntent,
      resetState,
    }),
    [connectWallet, state],
  );

  return <PioneerContext.Provider value={value}>{children}</PioneerContext.Provider>;
};

export interface UsePioneerType {
  state: any;
  dispatch: any;
  onStart: (wallets: any, setup: any) => void;
  setIntent: (intent: any) => void;
  showModal: (modal: any) => void;
  hideModal: () => void;
  clearHardwareError: () => void;
  // createTx: (tx: any) => void;
  // updateTx: (tx: any) => void;
  // readTx: (tx?: any) => void;
  resetState: () => void;
  connectWallet: (wallet: string, chain?: any) => void;
}

export const usePioneer = (): any | null => useContext(PioneerContext);
