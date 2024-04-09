/*
    E2E testing

 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | e2e-test | "
import { WalletOption, availableChainsByWallet, FeeOption, Chain } from '@coinmasters/types';
const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId, ChainToCaip} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;
import {
    getPaths,
    // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
let BLOCKCHAIN_IN = ChainToNetworkId['ETH']
let BLOCKCHAIN_OUT = ChainToNetworkId['BASE']
let ASSET = 'BASE'
let MIN_BALANCE = process.env['MIN_BALANCE_ETH'] || "0.01"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.009"
let spec = process.env['VITE_PIONEER_URL_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
let OUTPUT_ASSET = "ETH"

console.log("spec: ",spec)
console.log("wss: ",wss)

let txid:string
let IS_SIGNED: boolean

const test_service = async function (this: any) {
    let tag = TAG + " | test_service | "
    try {
        //(tag,' CHECKPOINT 1');
        console.time('start2paired');
        console.time('start2build');
        console.time('start2broadcast');
        console.time('start2end');
        //if force new user
        const queryKey = "sdk:pair-keepkey:"+Math.random();
        log.info(tag,"queryKey: ",queryKey)
        // const queryKey = "key:66fefdd6-7ea9-48cf-8e69-fc74afb9c45412"
        assert(queryKey)

        const username = "user:"+Math.random()
        assert(username)

        //add custom path
        let pathsAdd:any = [
        ]

        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY,
            wss,
            paths:pathsAdd,
            // @ts-ignore
            ethplorerApiKey:
            // @ts-ignore
              process.env.VITE_ETHPLORER_API_KEY || 'EK-xs8Hj-qG4HbLY-LoAu7',
            // @ts-ignore
            covalentApiKey:
            // @ts-ignore
              process.env.VITE__COVALENT_API_KEY || 'cqt_rQ6333MVWCVJFVX3DbCCGMVqRH4q',
            // @ts-ignore
            utxoApiKey: process.env.VITE_BLOCKCHAIR_API_KEY || 'B_s9XK926uwmQSGTDEcZB3vSAmt5t2',
            // @ts-ignore
            walletConnectProjectId:
            // @ts-ignore
              process.env.VITE_WALLET_CONNECT_PROJECT_ID || '18224df5f72924a5f6b3569fbd56ae16',
        };

        //console.log(tag,' CHECKPOINT 2');
        //console.log(tag,' config: ',config);
        let app = new SDK.SDK(spec,config)
        const walletsVerbose: any = [];
        const { keepkeyWallet } = await import("@coinmasters/wallet-keepkey");
        //log.info(tag,"walletKeepKey: ",keepkeyWallet)
        const walletKeepKey = {
            type: WalletOption.KEEPKEY,
            icon: "https://pioneers.dev/coins/keepkey.png",
            chains: availableChainsByWallet[WalletOption.KEEPKEY],
            wallet: keepkeyWallet,
            status: "offline",
            isConnected: false,
        };
        walletsVerbose.push(walletKeepKey);

        let resultInit = await app.init(walletsVerbose, {})
        log.info(tag,"resultInit: ",resultInit)
        log.info(tag,"wallets: ",app.wallets.length)

        let blockchains = [BLOCKCHAIN_IN, BLOCKCHAIN_OUT, ChainToNetworkId['ETH']]
        log.info(tag,"blockchains: ",blockchains)

        //get paths for wallet
        let paths = getPaths(blockchains)
        log.info("paths: ",paths.length)

        // @ts-ignore
        //HACK only use 1 path per chain
        //TODO get user input (performance or find all funds)
        let optimized:any = [];
        blockchains.forEach((network: any) => {
            const pathForNetwork = paths.filter((path: { network: any; }) => path.network === network).slice(-1)[0];
            if (pathForNetwork) {
                optimized.push(pathForNetwork);
            }
        });
        log.info("optimized: ", optimized.length);
        app.setPaths(optimized)
        let pairObject = {
            type:WalletOption.KEEPKEY,
            blockchains
        }
        resultInit = await app.pairWallet(pairObject)
        log.info(tag,"resultInit: ",resultInit)
        assert(app.keepkeyApiKey)
        if(!process.env.KEEPKEY_API_KEY || process.env.KEEPKEY_API_KEY !== app.keepkeyApiKey){
            log.alert("SET THIS IN YOUR ENV AS KEEPKEY_API_KEY: ",app.keepkeyApiKey)
        }

        //check pairing
        // //context should match first account
        let context = await app.context
        log.info(tag,"context: ",context)
        assert(context)


        await app.getPubkeys()
        await app.getBalances()
        log.info(tag,"balances: ",app.balances)
        let balance = app.balances.filter((e:any) => e.symbol === ASSET)
        log.info(tag,"balance: ",balance)


        //
        await app.getAssets()
        log.info(tag,"assets: ",app.assets.length)
        log.info(tag,"caip: ",ChainToCaip[ASSET])
        let assetIn = app.assets.filter((b:any) => b.caip === ChainToCaip[Chain.Base])
        log.info(tag,"assetIn: ",assetIn)
        assert(assetIn[0])
        assert(assetIn[0].caip)
        assert(assetIn[0].ticker)
        await app.setAssetContext(assetIn[0]);
        assert(app.assetContext)
        assert(app.assetContext.caip)
        assert(app.assetContext.ticker)

        let assetOut = app.assets.filter((b:any) => b.caip === ChainToCaip[Chain.Ethereum])
        assert(assetOut[0])
        assert(assetOut[0].caip)
        assert(assetOut[0].ticker)
        await app.setOutboundAssetContext(assetOut[0]);
        assert(app.outboundAssetContext)
        assert(app.outboundAssetContext.caip)
        assert(app.outboundAssetContext.ticker)

        //get outbound asset
        let outboundAssetContext = await app.outboundAssetContext
        log.info(tag,"outboundAssetContext: ",outboundAssetContext)
        assert(outboundAssetContext)
        if(outboundAssetContext.chain !== OUTPUT_ASSET) throw Error("Wrong output!")

        assert(app.assetContext)
        assert(app.assetContext.address)
        assert(app.assetContext.address)

        //get sender context
        const senderAddress = app.assetContext.address;
        assert(senderAddress)

        const recipientAddress =
          app.outboundAssetContext.address || app.swapKit.getAddress(app.outboundAssetContext.chain);
        assert(recipientAddress)

        let buyAsset;
        if (app.outboundAssetContext.contract) {
            buyAsset = `${app.outboundAssetContext.chain}.${app.outboundAssetContext.symbol}-${app.outboundAssetContext.contract}`;
        } else {
            buyAsset = `${app.outboundAssetContext.chain}.${app.outboundAssetContext.symbol}`;
        }
        assert(buyAsset)


        //get receiver context
        const entry = {
            sellAsset: app.assetContext,
            sellAmount: parseFloat(TEST_AMOUNT).toPrecision(3),
            buyAsset:app.outboundAssetContext,
            senderAddress,
            recipientAddress,
            slippage: '3',
        };

        //quote
        log.info(tag,"entry: ",entry)
        let result = await app.pioneer.Quote(entry);
        result = result?.data;
        log.info(tag,"result: ",result)

        //
        let selected
        //user selects route
        for(let i = 0; i < result?.length; i++){
            let route = result[i]
            console.log("route: ", route)
            selected = route.quote
        }

        const outputChain = app.outboundAssetContext?.chain;

        const address = app?.swapKit.getAddress(outputChain);
        log.info("address: ", address);


        log.info("selected: ", selected);

        //send
        const txHash = await app?.swapKit.swap({
            route:selected,
            recipient: address,
            feeOptionKey: FeeOption.Fast,
        });
        log.info("txHash: ",txHash)
        // assert(txHash)

        //TODO monitor TX untill complete

        //TODO check balance


        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()

