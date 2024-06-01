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
const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId, shortListSymbolToCaip} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;
import axios from 'axios';

import {
    getPaths,
    // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
let BLOCKCHAIN_IN = ChainToNetworkId['DOGE']
let BLOCKCHAIN_OUT = ChainToNetworkId['BCH']
let ASSET_IN = shortListSymbolToCaip['DOGE']
let ASSET_OUT = shortListSymbolToCaip['BCH']
let ASSET = 'DOGE'
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "250"
let spec = process.env['VITE_PIONEER_URL_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'


let TRADER_ADDRESS = process.env['TRADER_ADDRESS']
if(!TRADER_ADDRESS) throw Error("Need TRADER_ADDRESS!")

let OUTPUT_ASSET = "BCH"
console.log("spec: ",spec)
console.log("wss: ",wss)

let txid:string
let IS_SIGNED: boolean
let INVOCATION_ID: any
// let INVOCATION_ID = 'unk4imcb04oannfr'


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

        let blockchains = [BLOCKCHAIN_IN, BLOCKCHAIN_OUT]
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

        //get assets
        let assets = app.assets
        log.info(tag,"assets: ",assets[0])
        log.info(tag,"assets: ",assets.length)
        assert(assets)

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

        let assetinfoIn = app.assets.find((asset: { caip: any }) => asset.caip === ASSET_IN)
        log.info(tag,"assetinfoIn: ",assetinfoIn)
        assert(assetinfoIn)
        if(assetinfoIn.integrations.indexOf('changelly') == -1) throw Error("Failed! missing changelly integration IN")

        let assetinfoOut = app.assets.find((asset: { caip: any; symbol: any; }) => asset.caip === ASSET_OUT)
        log.info(tag,"assetinfoOut: ",assetinfoOut)
        assert(assetinfoOut)
        if(assetinfoIn.integrations.indexOf('changelly') == -1) throw Error("Failed! missing changelly integration OUT")


        await app.getPubkeys()


        let assetinfoIn1 = app.assets.find((asset: { caip: any }) => asset.caip === ASSET_IN)
        log.info(tag,"assetinfoIn: ",assetinfoIn1)
        assert(assetinfoIn1)
        assert(assetinfoIn1.address)

        let assetinfoOut1 = app.assets.find((asset: { caip: any; symbol: any; }) => asset.caip === ASSET_OUT)
        log.info(tag,"assetinfoOut: ",assetinfoOut1)
        assert(assetinfoOut1)
        assert(assetinfoOut1.address)

        await app.getBalances()

        let assetinfoIn2 = app.assets.find((asset: { caip: any }) => asset.caip === ASSET_IN)
        log.info(tag,"assetinfoIn2: ",assetinfoIn2)
        assert(assetinfoIn2)
        assert(assetinfoIn2.balance)

        let assetinfoOut2 = app.assets.find((asset: { caip: any; symbol: any; }) => asset.caip === ASSET_OUT)
        log.info(tag,"assetinfoOut2: ",assetinfoOut2)
        assert(assetinfoOut2)
        assert(assetinfoOut2.balance)

        log.info(tag,"balances: ",app.balances)
        let balance = app.balances.filter((e:any) => e.symbol === ASSET)
        log.info(tag,"balance: ",balance)
        assert(balance.length > 0)
        //verify balances
        //get asset context
        await app.setAssetContext(balance[0])
        let balanceOut = app.balances.filter((e:any) => e.symbol === OUTPUT_ASSET)
        await app.setOutboundAssetContext(balanceOut[0]);

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

        //balance
        let balanceIn = app.assetContext.balance
        log.info(tag,"balanceIn: ",balanceIn)
        assert(balanceIn)
        if(balanceIn < parseFloat(TEST_AMOUNT)) {
            throw Error("YOUR BROKE! Failed! balanceIn < TEST_AMOUNT: "+TEST_AMOUNT)
        }
        //TODO fee estimate check

        // create assetValue
        const assetString = `${ASSET}.${ASSET}`;
        // @ts-ignore
        console.log('assetString: ', assetString);
        await AssetValue.loadStaticAssets();
        log.info("TEST_AMOUNT: ",TEST_AMOUNT)
        log.info("TEST_AMOUNT: ",typeof(TEST_AMOUNT))
        const assetValue = AssetValue.fromStringSync(assetString, parseFloat(TEST_AMOUNT));
        log.info("assetValue: ",assetValue)

        if(!INVOCATION_ID) {
            //get receiver context
            const entry = {
                trader: TRADER_ADDRESS,
                affiliate: TRADER_ADDRESS,
                sellAsset: app.assetContext,
                sellAmount: parseFloat(TEST_AMOUNT).toPrecision(3),
                buyAsset: app.outboundAssetContext,
                memoless: true,
                recipientAddress,
                slippage: '3',
            };

            //quote
            log.info(tag, "entry: ", entry)
            let result = await app.pioneer.Quote(entry);
            result = result?.data;
            log.info(tag, "result: ", result)
            log.info(tag, "result: ", result[0].quote)
            log.info(tag, "result: ", result[0].quote.id)
            let quoteId = result[0].quote.id
            assert(quoteId)
            log.info(tag, 'quoteId: ', quoteId)

            //quoteId
            //verify quote exists
            //TODO
            const quoteResponse = await axios.get(`https://swaps.pro/api/v1/quotes/${quoteId}`);
            log.info('Quote details:', quoteResponse.data);
            assert(quoteResponse.data);


            //verify trader exists
            const traderResponse = await axios.get(`https://swaps.pro/api/v1/traders/${TRADER_ADDRESS}`);
            log.info('Trader details:', traderResponse.data);
            assert(traderResponse.data);


            // let selected
            // let selectedId
            // //user selects route
            // for (let i = 0; i < result?.length; i++) {
            //     let route = result[i]
            //     //detect if erroed
            //     if (route.integration === 'changelly') {
            //         selected = route.quote.route
            //         selectedId = route.quote.id
            //
            //         break;
            //     }
            //     //log amountOut
            //
            //     //log fee
            // }
            let selected = result[0]
            log.info(tag, "selected: ", selected)
            let selectedId = quoteId
            assert(selected)
            INVOCATION_ID = selectedId

            let tx = selected.quote.txs[0]
            console.log("tx: ", tx)
            let addressTo = tx.txParams.address
            console.log("addressTo: ", addressTo)
            assert(addressTo)

            //sendTx
            let sendPayload = {
                assetValue,
                memo: '',
                recipient: addressTo,
            }
            log.info("sendPayload: ",sendPayload)
            const txHash = await app.swapKit.transfer(sendPayload);
            log.info("txHash: ",txHash)
        }

        //get quote status
        //get invocationId

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

        //TODO check balance

        //verify trade exists

        //verify PRO

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()

