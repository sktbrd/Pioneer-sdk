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
const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId,shortListSymbolToCaip} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;
import {
    getPaths,
    // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
let BLOCKCHAIN_IN = ChainToNetworkId['ETH']
let BLOCKCHAIN_OUT = ChainToNetworkId['BASE']
let ASSET = 'ETH'
let MIN_BALANCE = process.env['MIN_BALANCE_ETH'] || "0.01"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.09"
let spec = process.env['VITE_PIONEER_URL_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'

let TRADE_PAIR  = "ETH_ETH"
let INPUT_ASSET = ASSET
let INPUT_ASSET_CAIP = shortListSymbolToCaip["ETH"]
let OUTPUT_ASSET = "BASE"
let OUTPUT_ASSET_CAIP = shortListSymbolToCaip["BASE"]
if(!OUTPUT_ASSET_CAIP) throw Error("OUTPUT_ASSET_CAIP not found")

console.log("spec: ",spec)
console.log("wss: ",wss)

let txid:string
let IS_SIGNED: boolean

let INVOCATION_ID:any
//de231ea5-0598-41a7-a43f-d8a50648f425
// let INVOCATION_ID = 'de231ea5-0598-41a7-a43f-d8a50648f425'
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
        let blockchains = [BLOCKCHAIN_IN, BLOCKCHAIN_OUT]
        let paths = getPaths(blockchains)
        log.info(tag,"paths: ",paths)
        assert(paths)

        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY,
            wss,
            paths,
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
        //context should match first account
        let context = await app.context
        log.info(tag,"context: ",context)
        assert(context)

        await app.getPubkeys()
        await app.getBalances()
        log.info(tag,"balances: ",app.balances)
        let balance = app.balances.filter((e:any) => e.symbol === ASSET)
        log.info(tag,"balance: ",balance)

        let balanceIn = app.balances.filter((e:any) => e.caip === INPUT_ASSET_CAIP)
        await app.setAssetContext(balanceIn[0]);

        let balanceOut = app.balances.filter((e:any) => e.caip === OUTPUT_ASSET_CAIP)
        log.info(tag,"balanceOut: ",balanceOut)
        assert(balanceOut[0])

        if(balanceOut[0].ticker !== 'ETH') throw Error("Invalid ticker for BASE! given: "+balanceOut[0].ticker)
        assert(balance.length > 0)
        //verify balances
        assert(balanceOut[0])
        log.info(tag,"balanceOut[0]: ",balanceOut[0])
        await app.setOutboundAssetContext(balanceOut[0]);

        //get outbound asset
        log.info(tag,"app: ",app)
        assert(app.outboundAssetContext)
        log.info(tag,"app.outboundAssetContext: ",app.outboundAssetContext)
        let outboundAssetContext = app.outboundAssetContext
        log.info(tag,"outboundAssetContext: ",outboundAssetContext)
        assert(outboundAssetContext)
        if(outboundAssetContext.chain !== OUTPUT_ASSET) throw Error("Wrong output!")

        assert(app.assetContext)
        let pubkeysIn = app.pubkeys.filter((e: any) => e.networks.includes(BLOCKCHAIN_IN));
        let pubkeysOut = app.pubkeys.filter((e: any) => e.networks.includes('eip155:*'));
        assert(pubkeysIn)
        assert(pubkeysOut)
        assert(pubkeysIn[0])
        assert(pubkeysOut[0])
        assert(pubkeysIn[0].address)
        assert(pubkeysOut[0].address)

        //get sender context
        const senderAddress = pubkeysIn[0].address;
        assert(senderAddress)

        const recipientAddress = pubkeysOut[0].address

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
        if(!INVOCATION_ID){
            let result = await app.pioneer.Quote(entry);
            result = result?.data;
            log.info(tag,"result: ",result)

            //
            let selected
            //user selects route
            for(let i = 0; i < result?.length; i++){
                let route = result[i]
                //console.log("route: ", route)
                selected = route.quote
            }

            const outputChain = app.outboundAssetContext?.chain;


            log.info("selected: ", selected);

            //send
            const txHash = await app?.swapKit.swap({
                route:selected,
                recipient: recipientAddress,
                feeOptionKey: FeeOption.Fast,
            });
            log.info("txHash: ",txHash)
        }

        // assert(txHash)

        //TODO monitor TX untill complete

        //TODO check balance
        let status = await app.pioneer.Invocation({invocationId:INVOCATION_ID})
        status = status.data
        log.info("status: ", status)
        assert(status)

        // monitor TX untill complete
        let isComplete = false
        while(!isComplete){
            await sleep(30000)

            //check tx by hash
            const tx = await app.pioneer.Invocation({invocationId:INVOCATION_ID})
            log.info("tx: ",tx)
            if(tx .statusCode > 4){
                isComplete = true
            }

        }

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()

