import type { Keys, ThornameRegisterParam } from '@coinmasters/helpers';
import {
  AssetValue,
  gasFeeMultiplier,
  getMemoFor,
  getMinAmountByChain,
  SwapKitError,
  SwapKitNumber,
} from '@coinmasters/helpers';
import type { CosmosLikeToolbox } from '@coinmasters/toolbox-cosmos';
import type { AVAXToolbox, BSCToolbox, ETHToolbox, EVMToolbox } from '@coinmasters/toolbox-evm';
import type { UTXOToolbox } from '@coinmasters/toolbox-utxo';
import type {
  AddChainWalletParams,
  EVMChain,
  EVMWalletOptions,
  ExtendParams,
  WalletOption,
} from '@coinmasters/types';
import {
  AGG_SWAP,
  Chain,
  ChainToChainId,
  FeeOption,
  MemoType,
  SWAP_IN,
  SWAP_OUT,
  TCAvalancheDepositABI,
  TCBscDepositABI,
  TCEthereumVaultAbi,
} from '@coinmasters/types';

import type { AGG_CONTRACT_ADDRESS } from '../aggregator/contracts/index.ts';
import { lowercasedContractAbiMapping } from '../aggregator/contracts/index.ts';
import { getSwapInParams } from '../aggregator/getSwapParams.ts';

import { getExplorerAddressUrl, getExplorerTxUrl } from './explorerUrls.ts';
import { getInboundData, getMimirData } from './thornode.ts';
import type {
  CoreTxParams,
  EVMWallet,
  SwapParams,
  ThorchainWallet,
  Wallet,
  WalletMethods,
} from './types.ts';

const getEmptyWalletStructure = () =>
  (Object.values(Chain) as Chain[]).reduce(
    (acc, chain) => {
      acc[chain] = null;
      return acc;
    },
    {} as Record<Chain, null>,
  );

export class SwapKitCore<T = ''> {
  public connectedChains: Wallet = getEmptyWalletStructure();
  public connectedWallets: WalletMethods = getEmptyWalletStructure();
  public readonly stagenet: boolean = false;

  constructor({ stagenet }: { stagenet?: boolean } | undefined = {}) {
    this.stagenet = !!stagenet;
  }

  getAddress = (chain: Chain) => this.connectedChains[chain]?.address || '';
  getExplorerTxUrl = (chain: Chain, txHash: string) => getExplorerTxUrl({ chain, txHash });
  getWallet = <T extends Chain>(chain: Chain) => this.connectedWallets[chain] as WalletMethods[T];
  getExplorerAddressUrl = (chain: Chain, address: string) =>
    getExplorerAddressUrl({ chain, address });
  getBalance = async (chain: Chain, refresh?: boolean) => {
    if (!refresh) return this.connectedChains[chain]?.balance || [];
    const wallet = await this.getWalletByChain(chain);

    return wallet?.balance || [];
  };

  swap = async ({ streamSwap, recipient, route, feeOptionKey }: SwapParams) => {
    const { quoteMode } = route.meta;
    const evmChain = quoteMode.startsWith('ERC20-')
      ? Chain.Ethereum
      : quoteMode.startsWith('ARC20-')
      ? Chain.Avalanche
      : Chain.BinanceSmartChain;
    console.log('quoteMode', quoteMode);
    console.log('evmChain', evmChain);
    if (!route.complete) throw new SwapKitError('core_swap_route_not_complete');
    console.log('swap checkpoint1', evmChain);
    try {
      if (AGG_SWAP.includes(quoteMode)) {
        const walletMethods = this.connectedWallets[evmChain];
        if (!walletMethods?.sendTransaction) {
          throw new SwapKitError('core_wallet_connection_not_found');
        }

        const transaction = streamSwap ? route?.streamingSwap?.transaction : route?.transaction;
        if (!transaction) throw new SwapKitError('core_swap_route_transaction_not_found');

        const { isHexString, parseUnits } = await import('ethers');
        const { data, from, to, value } = route.transaction;

        const params = {
          data,
          from,
          to: to.toLowerCase(),
          chainId: BigInt(ChainToChainId[evmChain]),
          value: value
            ? new SwapKitNumber({
                value: !isHexString(value) ? parseUnits(value, 'wei').toString(16) : value,
              }).baseValueBigInt
            : 0n,
        };
        console.log('checkpoint 2 swap params', params);
        return walletMethods.sendTransaction(params, feeOptionKey) as Promise<string>;
      }

      if (SWAP_OUT.includes(quoteMode)) {
        if (!route.calldata.fromAsset) throw new SwapKitError('core_swap_asset_not_recognized');
        const asset = await AssetValue.fromString(route.calldata.fromAsset);
        if (!asset) throw new SwapKitError('core_swap_asset_not_recognized');

        const { address: recipient } = await this.#getInboundDataByChain(asset.chain);
        const {
          contract: router,
          calldata: { amountIn, memo, memoStreamingSwap },
        } = route;
        console.log('checkpoint 3 getInboundDataByChain', recipient);
        const assetValue = asset.add(SwapKitNumber.fromBigInt(BigInt(amountIn), asset.decimal));
        const swapMemo = (streamSwap ? memoStreamingSwap || memo : memo) as string;
        console.log('checkpoint 4 deposit', {
          assetValue,
          memo: swapMemo,
          feeOptionKey,
          router,
          recipient,
        });
        return this.deposit({ assetValue, memo: swapMemo, feeOptionKey, router, recipient });
      }

      if (SWAP_IN.includes(quoteMode)) {
        const { calldata, contract: contractAddress } = route;
        if (!contractAddress) throw new SwapKitError('core_swap_contract_not_found');

        const walletMethods = this.connectedWallets[evmChain];
        const from = this.getAddress(evmChain);
        if (!walletMethods?.sendTransaction || !from) {
          throw new SwapKitError('core_wallet_connection_not_found');
        }
        console.log('checkpoint 5 from', from);
        const { getProvider, toChecksumAddress } = await import('@coinmasters/toolbox-evm');
        const provider = getProvider(evmChain);
        const abi = lowercasedContractAbiMapping[contractAddress.toLowerCase()];

        if (!abi) throw new SwapKitError('core_swap_contract_not_supported', { contractAddress });
        console.log('checkpoint 6 abi', abi);
        const contract = await walletMethods.createContract?.(contractAddress, abi, provider);
        console.log('checkpoint 7 contract: ', contract);
        // TODO: (@Towan) Contract evm methods should be generic
        // @ts-expect-error
        const tx = await contract.populateTransaction.swapIn?.(
          ...getSwapInParams({
            streamSwap,
            toChecksumAddress,
            contractAddress: contractAddress as AGG_CONTRACT_ADDRESS,
            recipient,
            calldata,
          }),
          { from },
        );
        console.log('checkpoint 8 tx: ', tx);
        return walletMethods.sendTransaction(tx, feeOptionKey) as Promise<string>;
      }

      throw new SwapKitError('core_swap_quote_mode_not_supported', { quoteMode });
    } catch (error) {
      throw new SwapKitError('core_swap_transaction_error', error);
    }
  };

  getWalletByChain = async (chain: Chain) => {
    const address = this.getAddress(chain);
    if (!address) return null;

    const balance = (await this.getWallet(chain)?.getBalance(address)) ?? [
      AssetValue.fromChainOrSignature(chain),
    ];

    this.connectedChains[chain] = {
      address,
      balance,
      walletType: this.connectedChains[chain]?.walletType as WalletOption,
    };

    return { ...this.connectedChains[chain] };
  };

  approveAssetValue = (assetValue: AssetValue, contractAddress?: string) =>
    this.#approve({ assetValue, type: 'approve', contractAddress });

  isAssetValueApproved = (assetValue: AssetValue, contractAddress?: string) =>
    this.#approve<boolean>({ assetValue, contractAddress, type: 'checkOnly' });

  validateAddress = ({ address, chain }: { address: string; chain: Chain }) =>
    this.getWallet(chain)?.validateAddress?.(address);

  transfer = async (params: CoreTxParams & { router?: string }) => {
    const walletInstance = this.connectedWallets[params.assetValue.chain];
    if (!walletInstance) throw new SwapKitError('core_wallet_connection_not_found');

    try {
      return await walletInstance.transfer(this.#prepareTxParams(params));
    } catch (error) {
      throw new SwapKitError('core_swap_transaction_error', error);
    }
  };

  deposit = async ({
    assetValue,
    recipient,
    router,
    ...rest
  }: CoreTxParams & { router?: string }) => {
    const { chain, symbol, ticker } = assetValue;
    const walletInstance = this.connectedWallets[chain];
    if (!walletInstance) throw new SwapKitError('core_wallet_connection_not_found');

    const params = this.#prepareTxParams({ assetValue, recipient, router, ...rest });
    console.log('deposit params: ', params);
    try {
      switch (chain) {
        case Chain.THORChain: {
          const wallet = walletInstance as ThorchainWallet;
          return await (recipient === '' ? wallet.deposit(params) : wallet.transfer(params));
        }

        case Chain.Ethereum:
        case Chain.BinanceSmartChain:
        case Chain.Avalanche: {
          const { getChecksumAddressFromAsset } = await import('@coinmasters/toolbox-evm');

          const abi =
            chain === Chain.Avalanche
              ? TCAvalancheDepositABI
              : chain === Chain.BinanceSmartChain
              ? TCBscDepositABI
              : TCEthereumVaultAbi;

          let inputs = {
            abi,
            contractAddress:
              router || ((await this.#getInboundDataByChain(chain as EVMChain)).router as string),
            funcName: 'depositWithExpiry',
            funcParams: [
              recipient,
              getChecksumAddressFromAsset({ chain, symbol, ticker }, chain),
              // TODO: (@Towan) Re-Check on that conversion 🙏
              assetValue.baseValueBigInt.toString(),
              params.memo,
              rest.expiration || new Date().getTime(),
            ],
            txOverrides: { from: params.from },
          }
          console.log('inputs; ', inputs);
          let result = await walletInstance.call(inputs)
          console.log('result; ', result);
          return result
        }

        default: {
          return await walletInstance.transfer(params);
        }
      }
    } catch (error: any) {
      const errorMessage = (error?.message || error?.toString()).toLowerCase();
      const isInsufficientFunds = errorMessage?.includes('insufficient funds');
      const isGas = errorMessage?.includes('gas');
      const isServer = errorMessage?.includes('server');
      const errorKey: Keys = isInsufficientFunds
        ? 'core_transaction_deposit_insufficient_funds_error'
        : isGas
        ? 'core_transaction_deposit_gas_error'
        : isServer
        ? 'core_transaction_deposit_server_error'
        : 'core_transaction_deposit_error';

      throw new SwapKitError(errorKey, error);
    }
  };

  /**
   * TC related Methods
   */
  createLiquidity = async ({
    runeAssetValue,
    assetValue,
  }: {
    runeAssetValue: AssetValue;
    assetValue: AssetValue;
  }) => {
    if (runeAssetValue.lte(0) || assetValue.lte(0)) {
      throw new SwapKitError('core_transaction_create_liquidity_invalid_params');
    }

    let runeTx = '';
    let assetTx = '';

    try {
      runeTx = await this.#depositToPool({
        assetValue: runeAssetValue,
        memo: getMemoFor(MemoType.DEPOSIT, {
          ...assetValue,
          address: this.getAddress(assetValue.chain),
        }),
      });
    } catch (error) {
      throw new SwapKitError('core_transaction_create_liquidity_rune_error', error);
    }

    try {
      assetTx = await this.#depositToPool({
        assetValue,
        memo: getMemoFor(MemoType.DEPOSIT, {
          ...assetValue,
          address: this.getAddress(Chain.THORChain),
        }),
      });
    } catch (error) {
      throw new SwapKitError('core_transaction_create_liquidity_asset_error', error);
    }

    return { runeTx, assetTx };
  };

  addLiquidity = async ({
    poolIdentifier,
    runeAssetValue,
    assetValue,
    runeAddr,
    assetAddr,
    isPendingSymmAsset,
    mode = 'sym',
  }: {
    poolIdentifier: string;
    runeAssetValue: AssetValue;
    assetValue: AssetValue;
    isPendingSymmAsset?: boolean;
    runeAddr?: string;
    assetAddr?: string;
    mode?: 'sym' | 'rune' | 'asset';
  }) => {
    const [chain, ...symbolPath] = poolIdentifier.split('.') as [Chain, string];
    const isSym = mode === 'sym';
    const runeTransfer = runeAssetValue?.gt(0) && (isSym || mode === 'rune');
    const assetTransfer = assetValue?.gt(0) && (isSym || mode === 'asset');
    const includeRuneAddress = isPendingSymmAsset || runeTransfer;
    const runeAddress = includeRuneAddress ? runeAddr || this.getAddress(Chain.THORChain) : '';
    const assetAddress = isSym || mode === 'asset' ? assetAddr || this.getAddress(chain) : '';

    if (!runeTransfer && !assetTransfer) {
      throw new SwapKitError('core_transaction_add_liquidity_invalid_params');
    }
    if (includeRuneAddress && !runeAddress) {
      throw new SwapKitError('core_transaction_add_liquidity_no_rune_address');
    }

    let runeTx, assetTx;
    const sharedParams = { chain, symbol: symbolPath.join('.') };

    if (runeTransfer && runeAssetValue) {
      try {
        runeTx = await this.#depositToPool({
          assetValue: runeAssetValue,
          memo: getMemoFor(MemoType.DEPOSIT, { ...sharedParams, address: assetAddress }),
        });
      } catch (error) {
        throw new SwapKitError('core_transaction_add_liquidity_rune_error', error);
      }
    }

    if (assetTransfer && assetValue) {
      try {
        assetTx = await this.#depositToPool({
          assetValue,
          memo: getMemoFor(MemoType.DEPOSIT, { ...sharedParams, address: runeAddress }),
        });
      } catch (error) {
        throw new SwapKitError('core_transaction_add_liquidity_asset_error', error);
      }
    }

    return { runeTx, assetTx };
  };

  withdraw = async ({
    memo,
    assetValue,
    percent,
    from,
    to,
  }: {
    memo?: string;
    assetValue: AssetValue;
    percent: number;
    from: 'sym' | 'rune' | 'asset';
    to: 'sym' | 'rune' | 'asset';
  }) => {
    const targetAsset =
      to === 'rune'
        ? AssetValue.fromChainOrSignature(Chain.THORChain)
        : (from === 'sym' && to === 'sym') || from === 'rune' || from === 'asset'
        ? undefined
        : assetValue;

    try {
      const txHash = await this.#depositToPool({
        assetValue: getMinAmountByChain(from === 'asset' ? assetValue.chain : Chain.THORChain),
        memo:
          memo ||
          getMemoFor(MemoType.WITHDRAW, {
            symbol: assetValue.symbol,
            chain: assetValue.chain,
            ticker: assetValue.ticker,
            basisPoints: Math.max(10000, Math.round(percent * 100)),
            targetAssetString: targetAsset?.toString(),
            singleSide: false,
          }),
      });

      return txHash;
    } catch (error) {
      throw new SwapKitError('core_transaction_withdraw_error', error);
    }
  };

  savings = async ({
    assetValue,
    memo,
    percent,
    type,
  }: { assetValue: AssetValue; memo?: string } & (
    | { type: 'add'; percent?: undefined }
    | { type: 'withdraw'; percent: number }
  )) => {
    const memoType = type === 'add' ? MemoType.DEPOSIT : MemoType.WITHDRAW;
    const memoString =
      memo ||
      getMemoFor(memoType, {
        ticker: assetValue.ticker,
        symbol: assetValue.symbol,
        chain: assetValue.chain,
        singleSide: true,
        basisPoints: percent ? Math.max(10000, Math.round(percent * 100)) : undefined,
      });

    return this.#depositToPool({ assetValue, memo: memoString });
  };

  loan = ({
    assetValue,
    memo,
    minAmount,
    type,
  }: {
    assetValue: AssetValue;
    memo?: string;
    minAmount: AssetValue;
    type: 'open' | 'close';
  }) =>
    this.#depositToPool({
      assetValue,
      memo:
        memo ||
        getMemoFor(type === 'open' ? MemoType.OPEN_LOAN : MemoType.CLOSE_LOAN, {
          asset: assetValue.toString(),
          minAmount: minAmount.toString(),
          address: this.getAddress(assetValue.chain),
        }),
    });

  nodeAction = ({
    type,
    assetValue,
    address,
  }: { address: string } & (
    | { type: 'bond' | 'unbond'; assetValue: AssetValue }
    | { type: 'leave'; assetValue?: undefined }
  )) => {
    const memoType =
      type === 'bond' ? MemoType.BOND : type === 'unbond' ? MemoType.UNBOND : MemoType.LEAVE;
    const memo = getMemoFor(memoType, {
      address,
      unbondAmount: type === 'unbond' ? assetValue.baseValueNumber : undefined,
    });

    return this.#thorchainTransfer({
      memo,
      assetValue: type === 'bond' ? assetValue : getMinAmountByChain(Chain.THORChain),
    });
  };

  registerThorname = ({
    assetValue,
    ...param
  }: ThornameRegisterParam & { assetValue: AssetValue }) =>
    this.#thorchainTransfer({ assetValue, memo: getMemoFor(MemoType.THORNAME_REGISTER, param) });

  extend = ({ wallets, config, apis = {}, rpcUrls = {} }: ExtendParams<T>) => {
    try {
      console.log('wallets: ', wallets);
      wallets.forEach((wallet) => {
        console.log('wallet: ', wallet);
        // @ts-expect-error ANCHOR - Not Worth
        this[wallet.connectMethodName] = wallet.connect({
          addChain: this.#addConnectedChain,
          config: config || {},
          apis,
          rpcUrls,
        });
      });
    } catch (error) {
      throw new SwapKitError('core_extend_error', error);
    }
  };

  estimateMaxSendableAmount = async ({
    chain,
    params,
  }: {
    chain: Chain;
    params: { from: string; recipient: string; assetValue: AssetValue };
  }) => {
    const walletMethods = this.getWallet<typeof chain>(chain);

    switch (chain) {
      case Chain.Arbitrum:
      case Chain.Avalanche:
      case Chain.BinanceSmartChain:
      case Chain.Ethereum:
      case Chain.Optimism:
      case Chain.Polygon: {
        const { estimateMaxSendableAmount } = await import('@coinmasters/toolbox-evm');
        return estimateMaxSendableAmount({
          ...params,
          toolbox: walletMethods as EVMToolbox,
        });
      }

      case Chain.Bitcoin:
      case Chain.BitcoinCash:
      case Chain.Dogecoin:
      case Chain.Litecoin:
        return (walletMethods as UTXOToolbox).estimateMaxSendableAmount(params);

      case Chain.Binance:
      case Chain.THORChain:
      case Chain.Cosmos: {
        const { estimateMaxSendableAmount } = await import('@coinmasters/toolbox-cosmos');
        return estimateMaxSendableAmount({
          ...params,
          toolbox: walletMethods as CosmosLikeToolbox,
        });
      }

      default:
        throw new SwapKitError('core_estimated_max_spendable_chain_not_supported');
    }
  };

  /**
   * Wallet connection methods
   */
  connectXDEFI = async (_chains: Chain[]): Promise<void> => {
    throw new SwapKitError('core_wallet_xdefi_not_installed');
  };
  connectEVMWallet = async (_chains: Chain[] | Chain, _wallet: EVMWalletOptions): Promise<void> => {
    throw new SwapKitError('core_wallet_evmwallet_not_installed');
  };
  connectWalletconnect = async (_chains: Chain[], _options?: any): Promise<void> => {
    throw new SwapKitError('core_wallet_walletconnect_not_installed');
  };
  connectKeystore = async (_chains: Chain[], _phrase: string): Promise<void> => {
    throw new SwapKitError('core_wallet_keystore_not_installed');
  };
  connectKeepKey = async (_chains: Chain[]): Promise<void> => {
    throw new SwapKitError('core_wallet_keepkey_not_installed');
  };
  connectLedger = async (_chains: Chain, _derivationPath: number[]): Promise<void> => {
    throw new SwapKitError('core_wallet_ledger_not_installed');
  };
  connectTrezor = async (_chains: Chain, _derivationPath: number[]): Promise<void> => {
    throw new SwapKitError('core_wallet_trezor_not_installed');
  };
  connectKeplr = async (_chain: Chain): Promise<void> => {
    throw new SwapKitError('core_wallet_keplr_not_installed');
  };
  connectOkx = async (_chains: Chain[]): Promise<void> => {
    throw new SwapKitError('core_wallet_okx_not_installed');
  };
  disconnectChain = (chain: Chain) => {
    this.connectedChains[chain] = null;
    this.connectedWallets[chain] = null;
  };

  #getInboundDataByChain = async (chain: Chain) => {
    if (chain === Chain.THORChain) {
      return {
        gas_rate: '0',
        router: '0',
        address: '',
        halted: false,
        chain: Chain.THORChain,
      };
    }
    const inboundData = await getInboundData(this.stagenet);
    const chainAddressData = inboundData.find((item) => item.chain === chain);

    if (!chainAddressData) throw new SwapKitError('core_inbound_data_not_found');
    if (chainAddressData?.halted) throw new SwapKitError('core_chain_halted');

    return chainAddressData;
  };

  #addConnectedChain = ({ chain, wallet, walletMethods }: AddChainWalletParams) => {
    this.connectedChains[chain] = wallet;
    this.connectedWallets[chain] = walletMethods;
  };

  #approve = async <T = string>({
    assetValue: { baseValueBigInt, address, chain, isGasAsset, isSynthetic },
    type = 'checkOnly',
    contractAddress,
  }: {
    assetValue: AssetValue;
    type?: 'checkOnly' | 'approve';
    contractAddress?: string;
  }) => {
    const isEVMChain = [Chain.Ethereum, Chain.Avalanche, Chain.BinanceSmartChain].includes(chain);
    const isNativeEVM = isEVMChain && isGasAsset;

    if (isNativeEVM || !isEVMChain || isSynthetic) return true;

    const walletMethods = this.connectedWallets[chain as EVMChain];
    const walletAction = type === 'checkOnly' ? walletMethods?.isApproved : walletMethods?.approve;

    if (!walletAction) throw new SwapKitError('core_wallet_connection_not_found');

    const from = this.getAddress(chain);

    if (!address || !from) throw new SwapKitError('core_approve_asset_address_or_from_not_found');

    const spenderAddress =
      contractAddress || ((await this.#getInboundDataByChain(chain)).router as string);

    return walletAction({
      amount: baseValueBigInt,
      assetAddress: address,
      from,
      spenderAddress,
    }) as Promise<T>;
  };

  #depositToPool = async ({
    assetValue,
    memo,
    feeOptionKey = FeeOption.Fast,
  }: {
    assetValue: AssetValue;
    memo: string;
    feeOptionKey?: FeeOption;
  }) => {
    const {
      gas_rate,
      router,
      address: poolAddress,
    } = await this.#getInboundDataByChain(assetValue.chain);
    const feeRate = (parseInt(gas_rate) || 0) * gasFeeMultiplier[feeOptionKey];

    return this.deposit({
      assetValue,
      recipient: poolAddress,
      memo,
      router,
      feeRate,
    });
  };

  #thorchainTransfer = async ({ memo, assetValue }: { assetValue: AssetValue; memo: string }) => {
    const mimir = await getMimirData(this.stagenet);

    // check if trading is halted or not
    if (mimir['HALTCHAINGLOBAL'] >= 1 || mimir['HALTTHORCHAIN'] >= 1) {
      throw new SwapKitError('core_chain_halted');
    }

    return this.deposit({ assetValue, recipient: '', memo });
  };

  #prepareTxParams = ({ assetValue, ...restTxParams }: CoreTxParams & { router?: string }) => ({
    ...restTxParams,
    memo: restTxParams.memo || '',
    from: this.getAddress(assetValue.chain),
    assetValue,
  });
}
