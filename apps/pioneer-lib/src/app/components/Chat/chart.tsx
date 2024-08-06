/*
   Pioneer SDK (react) Chart

   Concepts:

   * paths
   * pubkeys
   * assets

    State: assetContext
    State: outboundAssetContext

    objects:
    Balance: {
        balance: "0.000205234405364000",
        caip: "eip155:42161/slip44:60",
        chain: "ARB",
        context: "keepkey:device.wallet",
        contextType: "keepkey",
        id: 1,
        identifier: "ARB.ETH",
        networkId: "eip155:42161",
        priceUsd: 3247.1,
        pubkey: undefined,
        ref: "eip155:42161/slip44:60",
        symbol: "ETH",
        ticker: "ETH",
        type: "Native",
        valueUsd: 0.6664166376574444
    }

    Path = {
        "note": "Bitcoin account 0",
        "networks": [
            "bip122:000000000019d6689c085ae165831e93"
        ],
        "script_type": "p2pkh",
        "available_scripts_types": [
            "p2pkh",
            "p2sh",
            "p2wpkh",
            "p2sh-p2wpkh"
        ],
        "type": "xpub",
        "addressNList": [
            2147483692,
            2147483648,
            2147483648
        ],
        "addressNListMaster": [
            2147483692,
            2147483648,
            2147483648,
            0,
            0
        ],
        "curve": "secp256k1",
        "showDisplay": false
    }

    let app = {
        blockchains: [
            "eip155:42161",
            "eip155:43114",
            "eip155:8453",
            "eip155:56",
            "bip122:000000000019d6689c085ae165831e93",
            "bip122:000000000000000000651ef99cb9fcbe",
            "cosmos:cosmoshub-4",
            "cosmos:osmosis-1",
            "ripple:4109c6f2045fc7eff4cde8f9905d19c2",
            "bip122:00000000001a91e3dace36e2be3bf030",
            "bip122:000007d91d1254d60e2dd1ae58038307",
            "cosmos:mayachain-mainnet-v1",
            "eip155:1",
            "bip122:12a765e31ffd4059bada1e25190f6e98",
            "eip155:10",
            "eip155:137",
            "cosmos:thorchain-mainnet-v1"
        ],
        balances: [
            Balance*
        ],
        charts: [
            'covalent', 'zapper'
        ],
        paths: [
            Path*
        ],
        swapkit: {
            createLiquidity: async ({ runeAssetValue: c, assetValue: s }) => {…},
            deposit: async ({ assetValue: c, recipient: s, router: a, ...i }) => {…},
            disconnectChain: (c) => {…},
            estimateMaxSendableAmount: async ({ chain: c, params: s }) => {…},
            extend: ({ wallets: c, config: s, apis: a = {}, rpcUrls: i = {} }) => {…},
            getAddress: async (c, s) => {…},
            getAddressAsync: async (c, s) => {…},
            getBalance: async (c, s, a) => {…},
            getBalances: async (c, s) => {…},
            getExplorerAddressUrl: (c, s) => PQ({ chain: c, address: s }),
            getExplorerTxUrl: (c, s) => NQ({ chain: c, txHash: s }),
            getWallet: (c) => this.connectedWallets[c],
            isAssetValueApproved: (c, s) => {…},
            loan: ({ assetValue: c, memo: s, minAmount: a, type: i }) => {…},
            nodeAction: ({ type: c, assetValue: s, address: a }) => {…},
            performTx: async (c) => {…},
            registerThorname: ({ assetValue: c, ...s }) => {…},
            savings: async ({ assetValue: c, memo: s, percent: a, type: i }) => {…},
            stagenet: false,
            swap: async ({ streamSwap: c, recipient: s, route: a, feeOptionKey: i }) => {…},
            syncWalletByChain: async (c) => {…},
            transfer: async (c) => {…},
            validateAddress: ({ address: c, chain: s }) => {…},
            withdraw: async ({ memo: c, assetValue: s, percent: a, from: i, to: t }) => {…}
        }
    }


    Generative UI:

    basic:
        View Server: username, QueryKey Server	https://pioneers.dev/spec/swagger.json
        Username	user:a6ca0f66
        QueryKey	key:b7c22c33-3083-41ab-9b6d-e0342c095d00
        lastConnected	keepkey:device.wallet
        Asset Context	no wallets paired!
        Address for context	no wallets paired!

    Asset
    Asset page, (required assetContext) to be set

    transfer:
    Transfer page, (required assetContext) to be set

    Classic:
        view all balances in a table

    Portfolio show the pie chart of all balances

    swap:
        Trade assets from one asset to the other


 */

//@ts-ignore
import { ChainToNetworkId, shortListSymbolToCaip } from '@pioneer-platform/pioneer-caip';
// import { COIN_MAP_LONG } from '@pioneer-platform/pioneer-coins';


let chartId = 'pioneer-sdk:0.0.1:intro'

//TODO get latest chart from server
//compare to local chart
//if new chart, update server with ID
//show chartIds available
//if local is known AND scores lower than server, update local chart (optional)

const UI_COMPONENTS = [
    {name: 'Asset', description: 'Displays the asset page, displays balances price and actions buy/sell/transfer'},
    {name: 'Transfer', description: 'Displays the transfer page, allows user to send assets to another address'},
    {name: 'Classic', description: 'Displays a classic table of all balances, shows "all" balances in a table'},
    {name: 'Portfolio', description: 'Displays a pie chart of all balances'},
    {name: 'Swap', description: 'Displays the swap page, allows user to trade assets from one to another'},
]

export const PROMPTS_SYSTEM:any = [
    {
        role: 'system',
        content: [
            `You are an assistant that can call functions to get information.`,
            `- If you need to get the networks address, use the getAddress function.`,
            `- If you need to get the networks balance, use the getBalance function.`,
            'NetworkId is the first half of a CAIP. Here is a list of common networkIds: ' + JSON.stringify(ChainToNetworkId),
            'caip is specific asset identifier. Here is a list of common caips: ' + JSON.stringify(shortListSymbolToCaip),
            'bitcoin (BTC) network is bip122:000000000019d6689c085ae165831e93',
            'bitcoin (BTC) caip is bip122:000000000019d6689c085ae165831e93/slip44:0',
            'function: showComponent You are a generative UI, your options are: '+UI_COMPONENTS.toString(),
            `any time a user mentions an asset you should change the assetContext to that asset with the setAssetContext function.`,
            'Format all outputs in readable markdown format',
            // `- To get all public keys, use the getPubkeys function.`,
            // `- To get all assets, use the getAssets function.`,
            // `- To get all network IDs, use the getNetworkIds function.`,
            // `- To get explorer address URL, use the getExplorerAddressUrl function.`,
            // `- To get explorer transaction URL, use the getExplorerTxUrl function.`,
            // `- To get wallet details, use the getWallet function.`,
            // `- To validate an address, use the validateAddress function.`,
            // `- To perform a transfer, use the transfer function.`,
            // `- To perform a swap, use the swap function.`,
            // `- To estimate the maximum sendable amount, use the estimateMaxSendableAmount function.`,
            // `- To sync a wallet by chain, use the syncWalletByChain function.`,
            // `- To disconnect a chain, use the disconnectChain function.`
        ].join('\n')
    }
];

export const TOOLS:any = [
    {
        name: 'setAssetContext',
        description: 'set the contect of the pioneer SDK. This is the asset you are working with and the UX will render for this asset and networkId.',
        parameters: {
            type: 'object',
            properties: {
                caip: {
                    type: 'string',
                    description: 'the caip for an asset, for instance bitcoin (BTC) caip is bip122:000000000019d6689c085ae165831e93',
                }
            },
            required: ['caip'],
        }
    },
    {
        name: 'shortListNameToCaip',
        description: 'get the caip for an asset, for instance bitcoin (BTC) caip is bip122:000000000019d6689c085ae165831e93',
        parameters: {
            type: 'object',
            properties: {
                network: {
                    type: 'string',
                    description: 'the name of an asset, for example. bitcoin, ethereum, dogecoin, etc',
                }
            },
            required: ['name'],
        }
    },
    {
        name: 'getMarketInfo',
        description: 'get the market info for an asset, for instance bip122:000000000019d6689c085ae165831e93/slip44:0 returns bitcoins price, volume, exchanges,links ect',
        parameters: {
            type: 'object',
            properties: {
                caip: {
                    type: 'string',
                    description: '',
                }
            },
            required: ['caip'],
        }
    },
    {
        name: 'getAddress',
        description: 'Retrieve the address for a specified network. The function takes a networkId, which corresponds to the coin symbol provided by the user. for instance bitcoin (BTC) network is bip122:000000000019d6689c085ae165831e93',
        parameters: {
            type: 'object',
            properties: {
                network: {
                    type: 'string',
                    description: 'the networkId is in format (example) bip122:000000000019d6689c085ae165831e93 is the network for bitcoin (BTC)',
                }
            },
            required: ['network'],
        }
    },
    {
        name: 'getBalance',
        description: 'Retrieve the balance for a specified network. The function takes a networkId, which corresponds to the coin symbol provided by the user. for instance bitcoin (BTC) network is bip122:000000000019d6689c085ae165831e93',
        parameters: {
            type: 'object',
            properties: {
                network: {
                    type: 'string',
                    description: 'the networkId is in format (example) bip122:000000000019d6689c085ae165831e93 is the network for bitcoin (BTC)',
                }
            },
            required: ['network'],
        }
    },
    {
        name: 'showComponent',
        description: 'Show a specific component on the dashboard.',
        parameters: {
            type: 'object',
            properties: {
                component: {
                    type: 'string',
                    description: 'The name of the component to show '+UI_COMPONENTS.map(component => component.name).join(', '),
                }
            },
            required: ['component'],
        }
    },
];
