import type { DepositParam, TransferParams } from '@coinmasters/toolbox-cosmos';
import type {
  TransactionType,
  UTXOTransferParams,
  UTXOWalletTransferParams,
} from '@coinmasters/toolbox-utxo';
import type { ConnectWalletParams, Witness } from '@coinmasters/types';
import { Chain, DerivationPath, WalletOption } from '@coinmasters/types';
import type { Psbt } from 'bitcoinjs-lib';

type KeystoreOptions = {
  ethplorerApiKey?: string;
  blockchairApiKey?: string;
  covalentApiKey?: string;
  stagenet?: boolean;
};

type Params = KeystoreOptions & {
  api?: any;
  rpcUrl?: string;
  chain: Chain;
  phrase: string;
  index: number;
};

const getWalletMethodsForChain = async ({
  api,
  rpcUrl,
  chain,
  phrase,
  ethplorerApiKey,
  covalentApiKey,
  blockchairApiKey,
  index,
  stagenet,
}: Params) => {
  const derivationPath = `${DerivationPath[chain]}/${index}`;

  switch (chain) {
    case Chain.Base:
    case Chain.BinanceSmartChain:
    case Chain.Avalanche:
    case Chain.Ethereum: {
      if (chain === Chain.Ethereum && !ethplorerApiKey) {
        throw new Error('Ethplorer API key not found');
      } else if (!covalentApiKey) {
        throw new Error('Covalent API key not found');
      }

      const { HDNodeWallet } = await import('ethers');
      const { getProvider, ETHToolbox, AVAXToolbox, BASEToolbox, BSCToolbox } = await import(
        '@coinmasters/toolbox-evm'
      );

      const provider = getProvider(chain, rpcUrl);
      const wallet = HDNodeWallet.fromPhrase(phrase).connect(provider);
      const params = { api, provider, signer: wallet };

      let toolbox;
      switch (chain) {
        case Chain.Ethereum:
          toolbox = ETHToolbox({ ...params, ethplorerApiKey: ethplorerApiKey! });
          break;
        case Chain.Avalanche:
          toolbox = AVAXToolbox({ ...params, covalentApiKey: covalentApiKey! });
          break;
        case Chain.Base:
          toolbox = BASEToolbox({ ...params, covalentApiKey: covalentApiKey! });
          break;
        default:
          toolbox = BSCToolbox({ ...params, covalentApiKey: covalentApiKey! });
      }

      return {
        address: wallet.address,
        walletMethods: {
          ...toolbox,
          getAddress: () => wallet.address,
        },
      };
    }

    case Chain.BitcoinCash: {
      const { BCHToolbox } = await import('@coinmasters/toolbox-utxo');
      const toolbox = BCHToolbox({ rpcUrl, apiKey: blockchairApiKey, apiClient: api });
      const keys = await toolbox.createKeysForPath({ phrase, derivationPath });
      const address = toolbox.getAddressFromKeys(keys);

      const signTransaction = async ({
        builder,
        utxos,
      }: Awaited<ReturnType<typeof toolbox.buildBCHTx>>) => {
        utxos.forEach((utxo, index) => {
          builder.sign(index, keys, undefined, 0x41, (utxo.witnessUtxo as Witness).value);
        });

        return builder.build();
      };

      const walletMethods = {
        ...toolbox,
        getAddress: () => address,
        transfer: (
          params: UTXOWalletTransferParams<
            Awaited<ReturnType<typeof toolbox.buildBCHTx>>,
            TransactionType
          >,
        ) => toolbox.transfer({ ...params, from: address, signTransaction }),
      };

      return { address, walletMethods };
    }

    case Chain.Bitcoin:
    case Chain.Dogecoin:
    case Chain.Litecoin: {
      const params = { rpcUrl, apiKey: blockchairApiKey, apiClient: api };

      const { BTCToolbox, LTCToolbox, DOGEToolbox } = await import('@coinmasters/toolbox-utxo');

      const toolbox =
        chain === Chain.Bitcoin
          ? BTCToolbox(params)
          : chain === Chain.Litecoin
            ? LTCToolbox(params)
            : DOGEToolbox(params);

      const keys = await toolbox.createKeysForPath({ phrase, derivationPath });
      const address = toolbox.getAddressFromKeys(keys);

      const signTransaction = async (psbt: Psbt) => {
        psbt.signAllInputs(keys);

        return psbt;
      };

      return {
        address,
        walletMethods: {
          ...toolbox,
          getAddress: () => address,
          transfer: (params: UTXOTransferParams) =>
            toolbox.transfer({ ...params, from: address, signTransaction }),
        },
      };
    }

    case Chain.Binance: {
      const { BinanceToolbox } = await import('@coinmasters/toolbox-cosmos');
      const toolbox = BinanceToolbox();
      const privkey = await toolbox.createKeyPair(phrase);
      const address = await toolbox.getAddressFromMnemonic(phrase);

      const transfer = ({ assetValue, recipient, memo }: TransferParams) =>
        toolbox.transfer({
          from: address,
          recipient,
          assetValue,
          privkey,
          memo,
        });

      return {
        address,
        walletMethods: { ...toolbox, transfer, getAddress: () => address },
      };
    }

    case Chain.Cosmos: {
      const { GaiaToolbox } = await import('@coinmasters/toolbox-cosmos');
      const toolbox = GaiaToolbox({ server: api });
      const signer = await toolbox.getSigner(phrase);
      const address = await toolbox.getAddressFromMnemonic(phrase);

      const transfer = ({ assetValue, recipient, memo }: TransferParams) =>
        toolbox.transfer({
          from: address,
          recipient,
          signer,
          assetValue,
          memo,
        });

      return {
        address,
        walletMethods: { ...toolbox, transfer, getAddress: () => address },
      };
    }

    case Chain.Kujira: {
      const { KujiraToolbox } = await import('@coinmasters/toolbox-cosmos');
      const toolbox = KujiraToolbox({ server: api });
      const signer = await toolbox.getSigner(phrase);
      const address = await toolbox.getAddressFromMnemonic(phrase);

      const transfer = ({ assetValue, recipient, memo }: TransferParams) =>
        toolbox.transfer({
          from: address,
          recipient,
          signer,
          assetValue,
          memo,
        });

      return {
        address,
        walletMethods: { ...toolbox, transfer, getAddress: () => address },
      };
    }

    case Chain.Maya:
    case Chain.THORChain: {
      const { MayaToolbox, ThorchainToolbox } = await import('@coinmasters/toolbox-cosmos');
      const toolbox =
        chain === Chain.THORChain ? ThorchainToolbox({ stagenet }) : MayaToolbox({ stagenet });
      const address = await toolbox.getAddressFromMnemonic(phrase);
      const signer = await toolbox.getSigner(phrase);

      const transfer = async ({ assetValue, recipient, memo }: TransferParams) =>
        toolbox.transfer({
          from: address,
          recipient,
          signer,
          assetValue,
          memo,
        });

      const deposit = async ({ assetValue, memo }: DepositParam) => {
        return toolbox.deposit({ assetValue, memo, from: address, signer });
      };

      const walletMethods = { ...toolbox, deposit, transfer, getAddress: () => address };

      return { address, walletMethods };
    }

    default:
      throw new Error(`Unsupported chain ${chain}`);
  }
};

const connectKeystore =
  ({
    addChain,
    apis,
    rpcUrls,
    config: { covalentApiKey, ethplorerApiKey, blockchairApiKey, utxoApiKey, stagenet },
  }: ConnectWalletParams) =>
  async (chains: Chain[], phrase: string, index: number = 0) => {
    const promises = chains.map(async (chain) => {
      const { address, walletMethods } = await getWalletMethodsForChain({
        index,
        chain,
        api: apis[chain as Chain.Avalanche],
        rpcUrl: rpcUrls[chain],
        covalentApiKey,
        ethplorerApiKey,
        phrase,
        blockchairApiKey: blockchairApiKey || utxoApiKey,
        stagenet,
      });

      addChain({
        chain,
        walletMethods,
        wallet: { address, balance: [], walletType: WalletOption.KEYSTORE },
      });
    });

    await Promise.all(promises);

    return true;
  };

export const keystoreWallet = {
  connectMethodName: 'connectKeystore' as const,
  connect: connectKeystore,
};
