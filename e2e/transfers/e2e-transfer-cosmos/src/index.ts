/*
    E2E testing

 */
//@ts-ignore
import { getPaths } from '@pioneer-platform/pioneer-coins';

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})


import { WalletOption, availableChainsByWallet, Chain } from '@coinmasters/types';
import { AssetValue } from '@pioneer-platform/helpers';
import { caipToNetworkId } from '@pioneer-platform/pioneer-caip/lib';
// console.log(process.env['BLOCKCHAIR_API_KEY'])
// if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars! VITE_BLOCKCHAIR_API_KEY")
// if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars!")
const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId, ChainToCaip} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;

let BLOCKCHAIN = ChainToNetworkId['GAIA']
let ASSET = 'GAIA'
const TAG  = " | intergration-test | " + ASSET + " | "
let MIN_BALANCE = process.env['MIN_BALANCE_OSMO'] || "0.004"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.001"
// let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'
let FAUCET_ATOM_ADDRESS = process.env['FAUCET_ATOM_ADDRESS']
if(!FAUCET_ATOM_ADDRESS) throw Error("Need Faucet Address!")
let FAUCET_ADDRESS = FAUCET_ATOM_ADDRESS


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
        assert(BLOCKCHAIN)
        let blockchains = [BLOCKCHAIN]
        console.log(tag,"blockchains: ",blockchains)
        let paths = getPaths(blockchains)

        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY,
            wss,
            paths,
            blockchains,
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
        // log.info(tag,"resultInit: ",resultInit)
        log.info(tag,"wallets: ",app.wallets.length)



        // //connect
        // assert(blockchains)
        // assert(blockchains[0])
        log.info(tag,"blockchains: ",blockchains)
        let pairObject = {
            type:WalletOption.KEEPKEY,
            blockchains
        }
        resultInit = await app.pairWallet(pairObject)
        log.info(tag,"resultInit: ",resultInit)

        //check pairing
        // //context should match first account
        let context = await app.context
        log.info(tag,"context: ",context)
        assert(context)


        assert(app.pubkeys)
        assert(app.pubkeys[0])

        //verify state
        let assets = app.assetsMap;
        log.info(tag, "assets: ", assets);
        assert(assets);

        log.info(tag, "ASSET: ", ASSET);
        log.info(tag, "ChainToCaip[ASSET]: ", ChainToCaip[ASSET]);
        log.info(tag, "caip: ", ChainToCaip[ASSET]);
        log.info(tag, "asset: ", assets.get(ChainToCaip[ASSET])); // Use `get` method for Map
        assert(assets.get(ChainToCaip[ASSET])); // Corrected this line

        await app.getBalances()
        log.info(tag,"balances: ",app.balances)
        assert(app.balances)
        assert(app.balances[0])
        log.info(tag,"balances: ",app.balances[0])

        log.info(tag,"assetContext: ",ChainToCaip[ASSET])
        log.info(tag,"asset: ",assets.get(ChainToCaip[ASSET]))
        assert(assets.get(ChainToCaip[ASSET]))
        await app.setAssetContext(assets.get(ChainToCaip[ASSET]))
        log.info(tag,"assetContext: ",app.assetContext)
        assert(app.assetContext)
        assert(app.assetContext.caip)
        // assert(app.assetContext.ticker)


        //verify balances
        await AssetValue.loadStaticAssets();
        const assetStringToken = 'GAIA.ATOM';
        let assetValue = AssetValue.fromStringSync(assetStringToken, TEST_AMOUNT);
        log.info(tag,"assetValue: ",assetValue)
        assert(assetValue)
        log.info(tag,"networkId: ",caipToNetworkId(app.assetContext.caip))

        //sendMax
        let pubkeys = app.pubkeys.filter((e: any) => e.networks.includes(caipToNetworkId(app.assetContext.caip)));
        log.info(tag,"pubkeys: ",pubkeys)
        assert(pubkeys)
        assert(pubkeys[0])
        assert(pubkeys[0].address)

        log.info(tag,"pubkeys[0].address: ",pubkeys[0].address)
        //send
        let estimatePayload:any = {
            pubkeys,
            caip:app.assetContext.caip,
            memo: '',
            recipient: FAUCET_ADDRESS,
        }
        let maxSpendable = await app.swapKit.estimateMaxSendableAmount({chain:Chain.Cosmos, params:estimatePayload})
        log.info("maxSpendable: ",maxSpendable)

        // //send
        let sendPayload = {
            assetValue,
            // assetValue:maxSpendable,
            // isMax: true,
            memo: '',
            recipient: FAUCET_ADDRESS,
        }
        log.info("sendPayload: ",sendPayload)
        const txHash = await app.swapKit.transfer(sendPayload);
        log.info("txHash: ",txHash)
        assert(txHash)

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
