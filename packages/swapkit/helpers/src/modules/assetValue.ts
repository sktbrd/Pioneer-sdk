import type {
  CoinGeckoList,
  MayaList,
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
import { BaseDecimal, Chain } from '@coinmasters/types';

import type { CommonAssetString } from '../helpers/asset.ts';
import { getAssetType, getCommonAssetInfo, getDecimal, isGasAsset } from '../helpers/asset.ts';
import { validateIdentifier } from '../helpers/validators.ts';

import type { NumberPrimitives } from './bigIntArithmetics.ts';
import { BigIntArithmetics, formatBigIntToSafeValue } from './bigIntArithmetics.ts';
import type { SwapKitValueType } from './swapKitNumber.ts';

type TokenTax = { buy: number; sell: number };

const safeValue = (value: NumberPrimitives, decimal: number) =>
  typeof value === 'bigint'
    ? formatBigIntToSafeValue({ value, bigIntDecimal: decimal, decimal })
    : value;

type AssetValueParams = { decimal: number; value: SwapKitValueType; tax?: TokenTax } & (
  | { chain: Chain; symbol: string }
  | { identifier: string }
);

type TCTokenNames = (typeof ThorchainList)['tokens'][number]['identifier'];

type TokenNames =
  | TCTokenNames
  | (typeof CoinGeckoList)['tokens'][number]['identifier']
  | (typeof MayaList)['tokens'][number]['identifier']
  | (typeof PancakeswapETHList)['tokens'][number]['identifier']
  | (typeof PancakeswapList)['tokens'][number]['identifier']
  | (typeof PangolinList)['tokens'][number]['identifier']
  | (typeof StargateARBList)['tokens'][number]['identifier']
  | (typeof SushiswapList)['tokens'][number]['identifier']
  | (typeof TraderjoeList)['tokens'][number]['identifier']
  | (typeof WoofiList)['tokens'][number]['identifier']
  | (typeof UniswapList)['tokens'][number]['identifier']
  | (typeof PioneerList)['tokens'][number]['identifier'];

let staticTokensMap:
  | Map<TokenNames, { tax?: TokenTax; decimal: number; identifier: string }>
  | undefined;

const getStaticToken = (identifier: TokenNames) => {
  if (!staticTokensMap) {
    throw new Error('Static assets not loaded, call await AssetValue.loadStaticAssets() first');
  }
  //console.log('getStaticToken: staticTokensMap: ', staticTokensMap);
  //console.log('getStaticToken: identifier: ', identifier.toUpperCase());
  const tokenInfo = staticTokensMap.get(identifier.toUpperCase() as TokenNames);

  return tokenInfo || { decimal: BaseDecimal.THOR, identifier: '' };
};

const createAssetValue = async (assetString: string, value: NumberPrimitives = 0) => {
  validateIdentifier(assetString);

  const decimal = await getDecimal(getAssetInfo(assetString));
  const parsedValue = safeValue(value, decimal);

  return new AssetValue({ decimal, value: parsedValue, identifier: assetString });
};

export class AssetValue extends BigIntArithmetics {
  address?: string;
  chain: Chain;
  isGasAsset = false;
  isSynthetic = false;
  symbol: string;
  tax?: TokenTax;
  ticker: string;
  type: ReturnType<typeof getAssetType>;

  constructor(params: AssetValueParams) {
    const identifier =
      'identifier' in params ? params.identifier : `${params.chain}.${params.symbol}`;
    console.log('identifier: ', identifier);

    let value;
    if (params.value instanceof BigIntArithmetics) {
      value = params.value;
    } else {
      value = { decimal: params.decimal, value: params.value };
    }
    console.log('value: ', value);
    super(value);

    // super(
    //   params.value instanceof BigIntArithmetics
    //     ? params.value
    //     : { decimal: params.decimal, value: params.value },
    // );

    const assetInfo = getAssetInfo(identifier);
    console.log('assetInfo: ', assetInfo);
    this.type = getAssetType(assetInfo);
    this.chain = assetInfo.chain;
    this.ticker = assetInfo.ticker;
    this.symbol = assetInfo.symbol;
    this.address = assetInfo.address;
    this.isSynthetic = assetInfo.isSynthetic;
    this.isGasAsset = assetInfo.isGasAsset;

    this.tax = params.tax;
  }

  toString(short = false) {
    const shortFormat = this.isSynthetic ? this.symbol : this.ticker;

    return short
      ? // ETH/THOR-0xa5f2211b9b8170f694421f2046281775e8468044 | USDT
        shortFormat
      : // THOR.ETH/ETH | ETH.USDT-0x1234567890
        `${this.chain}.${this.symbol}`;
  }

  toUrl() {
    return this.isSynthetic ? `${this.chain}.${this.symbol.replace('/', '.')}` : this.toString();
  }

  eq({ chain, symbol }: { chain: Chain; symbol: string }) {
    return this.chain === chain && this.symbol === symbol;
  }

  static async fromString(assetString: string, value: NumberPrimitives = 0) {
    return createAssetValue(assetString, value);
  }

  // static fromStringSync(assetString: string, value: NumberPrimitives = 0) {
  //   const { isSynthetic, symbol, chain, isGasAsset, ticker, address } = getAssetInfo(assetString);
  //   console.log('getAssetInfo: ', { isSynthetic, symbol, chain, isGasAsset, ticker, address });
  //   const { tax, decimal, identifier: tokenIdentifier } = getStaticToken(assetString as unknown as TokenNames);
  //   console.log('getStaticToken: ', { tax, decimal, tokenIdentifier });
  //
  //   // Convert value to a BigInt if necessary
  //   let safeValue = (val: NumberPrimitives, decimal: number): BigInt => {
  //     if (typeof val === 'bigint') {
  //       return val;
  //     } else if (typeof val === 'number') {
  //       return BigInt(val * Math.pow(10, decimal));
  //     } else {
  //       return BigInt(0);
  //     }
  //   };
  //
  //   const parsedValue = safeValue(value, decimal);
  //   console.log('parsedValue: ', parsedValue);
  //
  //   let asset: AssetValue | undefined;
  //
  //   if (tokenIdentifier) {
  //     console.log('tokenIdentifier is truthy'); // Indicates tokenIdentifier has a value considered true in a boolean context
  //     asset = new AssetValue({
  //       tax,
  //       decimal,
  //       identifier: tokenIdentifier,
  //       value: parsedValue,
  //     });
  //   } else if (isSynthetic) {
  //     console.log('isSynthetic is true'); // Indicates the asset is synthetic
  //     asset = new AssetValue({
  //       tax,
  //       decimal: 8, // Synthetic assets use a fixed decimal value
  //       identifier: assetString,
  //       value: parsedValue,
  //     });
  //   } else {
  //     asset = undefined;
  //   }
  //
  //   return asset;
  // }

  static fromStringSync(assetString: string, value: NumberPrimitives = 0) {
    const { isSynthetic, symbol, chain, isGasAsset, ticker, address } = getAssetInfo(assetString);
    console.log('getAssetInfo: ', { isSynthetic, symbol, chain, isGasAsset, ticker, address });
    const {
      tax,
      decimal,
      identifier: tokenIdentifier,
    } = getStaticToken(assetString as unknown as TokenNames);
    console.log('getStaticToken: ', { tax, decimal, tokenIdentifier });
    const parsedValue = value === 0 ? BigInt(0) : safeValue(value, decimal);
    console.log('parsedValue: ', parsedValue);
    let asset: AssetValue | undefined;

    if (tokenIdentifier) {
      console.log('tokenIdentifier is truthy'); // Indicates tokenIdentifier has a value considered true in a boolean context
      asset = new AssetValue({
        tax,
        decimal,
        identifier: tokenIdentifier,
        value: parsedValue,
      });
    } else if (isSynthetic) {
      console.log('isSynthetic is true'); // Indicates the asset is synthetic
      asset = new AssetValue({
        tax,
        decimal: 8, // Synthetic assets use a fixed decimal value
        identifier: assetString,
        value: parsedValue,
      });
    } else {
      //console.log('No valid condition met'); // Neither condition is true, asset is left undefined
      asset = undefined;
    }

    return asset;
  }

  static async fromIdentifier(
    assetString: `${Chain}.${string}` | `${Chain}/${string}` | `${Chain}.${string}-${string}`,
    value: NumberPrimitives = 0,
  ) {
    return createAssetValue(assetString, value);
  }

  static fromIdentifierSync(identifier: TokenNames, value: NumberPrimitives = 0) {
    const { decimal, identifier: tokenIdentifier } = getStaticToken(identifier);
    const parsedValue = safeValue(value, decimal);

    return new AssetValue({ decimal, identifier: tokenIdentifier, value: parsedValue });
  }

  static fromChainOrSignature(assetString: CommonAssetString, value: NumberPrimitives = 0) {
    const { decimal, identifier } = getCommonAssetInfo(assetString);
    if (!decimal || !identifier) throw Error('unknown coin! ' + assetString);
    const parsedValue = safeValue(value, decimal);

    return new AssetValue({ value: parsedValue, decimal, identifier });
  }

  static async loadStaticAssets() {
    return new Promise<{ ok: true } | { ok: false; message: string; error: any }>(
      async (resolve, reject) => {
        try {
          const {
            // Omit ThorchainList from import to avoid decimals conflict (TC uses 8 for all)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ThorchainList: _ThorchainList,
            NativeList,
            ...tokensPackage
          } = await import('@coinmasters/tokens');
          const tokensMap = [NativeList, ...Object.values(tokensPackage)].reduce(
            (acc, { tokens }) => {
              tokens.forEach(({ identifier, chain, ...rest }) => {
                const decimal = 'decimals' in rest ? rest.decimals : BaseDecimal[chain as Chain];

                acc.set(identifier as TokenNames, { identifier, decimal });
              });

              return acc;
            },
            new Map<TokenNames, { decimal: number; identifier: string }>(),
          );

          staticTokensMap = tokensMap;

          resolve({ ok: true });
        } catch (error) {
          console.error(error);
          reject({
            ok: false,
            error,
            message:
              "Couldn't load static assets. Ensure you have installed @coinmasters/tokens package",
          });
        }
      },
    );
  }
}

export const getMinAmountByChain = (chain: Chain) => {
  const asset = AssetValue.fromChainOrSignature(chain);

  switch (chain) {
    case Chain.Bitcoin:
    case Chain.Litecoin:
    case Chain.Dash:
    case Chain.Zcash:
    case Chain.BitcoinCash:
      return asset.set(0.00010001);

    case Chain.Dogecoin:
      return asset.set(1.00000001);

    case Chain.Base:
    case Chain.Arbitrum:
    case Chain.Avalanche:
    case Chain.Ethereum:
      return asset.set(0.00000001);

    case Chain.THORChain:
    case Chain.Mayachain:
      return asset.set(0.0000000001);

    default:
      return asset.set(0.00000001);
  }
};

const getAssetInfo = (identifier: string) => {
  const isSynthetic = identifier.slice(0, 14).includes('/');
  const [synthChain, synthSymbol] = identifier.split('.').pop()!.split('/');
  const adjustedIdentifier =
    identifier.includes('.') && !isSynthetic ? identifier : `${Chain.THORChain}.${synthSymbol}`;

  const [chain, symbol] = adjustedIdentifier.split('.') as [Chain, string];
  const [ticker, address] = (isSynthetic ? synthSymbol : symbol).split('-') as [string, string?];

  return {
    address: address?.toLowerCase(),
    chain,
    isGasAsset: isGasAsset({ chain, symbol }),
    isSynthetic,
    symbol:
      (isSynthetic ? `${synthChain}/` : '') +
      (address ? `${ticker}-${address?.toLowerCase() ?? ''}` : symbol),
    ticker,
  };
};
