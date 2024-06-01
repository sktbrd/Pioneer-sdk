/*
    E2E testing

 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | e2e-test | "
import { WalletOption, availableChainsByWallet, FeeOption } from "@coinmasters/types";
import { AssetValue } from '@pioneer-platform/helpers';
console.log(process.env['BLOCKCHAIR_API_KEY'])
if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars! VITE_BLOCKCHAIR_API_KEY")
if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars!")
const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;
import {
    getPaths,
    // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
let BLOCKCHAIN_IN = ChainToNetworkId['XRP']
let BLOCKCHAIN_OUT = ChainToNetworkId['BCH']
let ASSET = 'XRP'
let MIN_BALANCE = process.env['MIN_BALANCE_BCH'] || "0.01"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "80"
let spec = process.env['VITE_PIONEER_URL_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'

let TRADE_PAIR  = "XRP_BCH"
let INPUT_ASSET = ASSET
let OUTPUT_ASSET = "BCH"

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
            utxoApiKey: process.env.VITE_BLOCKCHAIR_API_KEY,
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

        resultInit = await app.pairWallet('KEEPKEY',blockchains)
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


        await app.getBalances()
        log.info(tag,"balances: ",app.balances)
        let balance = app.balances.filter((e:any) => e.symbol === ASSET)
        log.info(tag,"balance: ",balance)
        assert(balance.length > 0)
        //verify balances

        // create assetValue
        const assetString = `${ASSET}.${ASSET}`;
        // @ts-ignore
        console.log('assetString: ', assetString);
        await AssetValue.loadStaticAssets();
        log.info("TEST_AMOUNT: ",TEST_AMOUNT)
        log.info("TEST_AMOUNT: ",typeof(TEST_AMOUNT))
        const assetValue = AssetValue.fromStringSync(assetString, parseFloat(TEST_AMOUNT));
        log.info("assetValue: ",assetValue)

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
        let result = await app.pioneer.Quote(entry);
        result = result?.data;
        log.info(tag,"result: ",result)


        const outputChain = app.outboundAssetContext?.chain;

        const address = app?.swapKit.getAddress(outputChain);
        log.info("address: ", address);

        //
        let selected
        //user selects route
        for(let i = 0; i < result?.length; i++){
            let route = result[i]
            console.log("route: ", route)
            //detect if erroed
            if(route.integration === 'changelly'){
                selected = route.quote
                break;
            }
            //log amountOut

            //log fee
        }

        //send
        const txHash = await app?.swapKit.swap({
            route:selected,
            recipient: address,
            feeOptionKey: FeeOption.Fast,
        });
        log.info("txHash: ",txHash)
        assert(txHash)
        
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

