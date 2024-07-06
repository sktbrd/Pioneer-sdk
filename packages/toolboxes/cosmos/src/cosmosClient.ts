import type { ChainId } from '@coinmasters/types';
import type { StdFee } from '@cosmjs/amino';
import { AssetValue, formatBigIntToSafeValue } from '@pioneer-platform/helpers';
//@ts-ignore
import { ChainToCaip } from '@pioneer-platform/pioneer-caip';
import { base64 } from '@scure/base';

import type { CosmosSDKClientParams, TransferParams } from './types.ts';
import {
  createSigningStargateClient,
  DEFAULT_COSMOS_FEE_MAINNET,
  getDenom,
  getRPC,
} from './util.ts';
const PIONEER_API_URI = 'https://pioneers.dev';
const TAG = ' | CosmosClient | ';

export class CosmosClient {
  server: string;
  chainId: ChainId;
  prefix = '';
  rpcUrl;

  // by default, cosmos chain
  constructor({ server, chainId, prefix = 'cosmos', stagenet = false }: CosmosSDKClientParams) {
    this.rpcUrl = getRPC(chainId, stagenet);
    this.server = server;
    this.chainId = chainId;
    this.prefix = prefix;
  }

  getAddressFromMnemonic = async (mnemonic: string, derivationPath: string) => {
    const wallet = await this.#getWallet(mnemonic, derivationPath);
    const [{ address }] = await wallet.getAccounts();
    return address;
  };

  getPubKeyFromMnemonic = async (mnemonic: string, derivationPath: string) => {
    const wallet = await this.#getWallet(mnemonic, derivationPath);

    return base64.encode((await wallet.getAccounts())[0].pubkey);
  };

  checkAddress = async (address: string) => {
    if (!address.startsWith(this.prefix)) return false;

    try {
      const { normalizeBech32 } = await import('@cosmjs/encoding');
      return normalizeBech32(address) === address.toLocaleLowerCase();
    } catch (err) {
      return false;
    }
  };

  getBalance = async (address: string) => {
    let tag = TAG + ' | getBalance | ';
    try {
      //console.log(tag, 'getBalance: ', address);

      const response = await fetch(`${this.rpcUrl}/api/v1/account/${address}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch balances: ${response.statusText}`);
      }
      const balancesCosmos = await response.json();
      //console.log(tag, 'balancesCosmos: ', balancesCosmos);
      //console.log(tag, 'balancesCosmos: ', balancesCosmos.balance);

      //to SafeValue
      let value = formatBigIntToSafeValue({
        value: balancesCosmos.balance,
        decimal: 6,
      });

      await AssetValue.loadStaticAssets();
      let identifier = 'GAIA.ATOM';
      let balanceCosmos = AssetValue.fromStringSync(identifier, value);
      balanceCosmos.caip = ChainToCaip['GAIA'];
      balanceCosmos.identifier = identifier;
      //console.log(tag, 'balanceCosmos: ', balanceCosmos);

      return balanceCosmos;
    } catch (error) {
      console.error('Failed on node: ', this.rpcUrl);
      console.error('An error occurred:', error);
      return [];
    }
  };

  getAccount = async (address: string) => {
    let tag = TAG + ' | getAccount | ';
    try {
      const response = await fetch(`${this.rpcUrl}/api/v1/account/${address}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch balances: ${response.statusText}`);
      }
      const cosmosInfo = await response.json();
      return cosmosInfo;
    } catch (e) {
      console.error(tag, e);
      throw e;
    }
  };

  broadcast = async (tx: string) => {
    const tag = `${TAG} | broadcast | `;
    try {
      //console.log('tx: ', tx);
      const body = { rawTx: tx };
      //console.log('body: ', body);
      let broadcast = {
        network: 'cosmos',
        serialized: tx,
        invocationId: 'pioneer-sdk:',
        noBroadcast: false,
      };
      const response = await fetch(`${PIONEER_API_URI}/api/v1/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(broadcast),
      });
      //console.log(tag, 'response: ', response);
      if (!response.ok) {
        throw new Error(`Failed to broadcast transaction: ${response.statusText}`);
      }

      const cosmosInfo = await response.json();
      //console.log(tag, 'cosmosInfo: ', cosmosInfo);
      return cosmosInfo.txid;
    } catch (e) {
      console.error(tag, e);
      throw e;
    }
  };

  transfer = async ({
    from,
    recipient,
    assetValue,
    memo = '',
    fee = DEFAULT_COSMOS_FEE_MAINNET,
    signer,
  }: TransferParams) => {
    if (!signer) throw new Error('Signer not defined');

    const signingClient = await createSigningStargateClient(this.rpcUrl, signer);
    const txResponse = await signingClient.sendTokens(
      from,
      recipient,
      [
        {
          denom: getDenom(`u${assetValue.symbol}`).toLowerCase(),
          amount: assetValue.getBaseValue('string'),
        },
      ],
      fee as StdFee,
      memo,
    );

    return txResponse.transactionHash;
  };

  #getWallet = async (mnemonic: string, derivationPath: string) => {
    const { Secp256k1HdWallet } = await import('@cosmjs/amino');
    const { stringToPath } = await import('@cosmjs/crypto');

    return await Secp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: this.prefix,
      hdPaths: [stringToPath(derivationPath)],
    });
  };
}
