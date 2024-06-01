/*
    E2E testing

 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | intergration-test | "
import { WalletOption, availableChainsByWallet, getChainEnumValue } from '@coinmasters/types';
import { AssetValue } from '@pioneer-platform/helpers';
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
let spec = process.env['VITE_PIONEER_URL_SPEC'] || 'https://pioneers.dev/spec/swagger.json'

console.log("spec: ",spec)

const DB = require('@coinmasters/pioneer-db');
console.log("DB: ",DB)

let txid:string
let IS_SIGNED: boolean

const test_service = async function (this: any) {
    let tag = TAG + " | test_service | "
    try {
        //(tag,' CHECKPOINT 1');
        console.time('start2build');
        console.time('start2broadcast');
        console.time('start2end');
        //if force new user
        const queryKey = "sdk:pair-keepkey:"+Math.random();
        log.info(tag,"queryKey: ",queryKey)
        assert(queryKey)

        const username = "user:"+Math.random()
        assert(username)

        const txDB = new DB.DB({ });
        await txDB.init();

        const AllChainsSupported = availableChainsByWallet['KEEPKEY'];
        let blockchains = AllChainsSupported.map(
          // @ts-ignore
          (chainStr: any) => ChainToNetworkId[getChainEnumValue(chainStr)],
        );
        // let blockchains = [ChainToNetworkId['ETH']]
        let paths = getPaths(blockchains);
        assert(paths)
        log.info(tag,"paths: ",paths)
        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY,
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
        console.time('start2init');
        let resultInit = await app.init(walletsVerbose, {})
        console.timeEnd('start2init');
        // log.info(tag,"resultInit: ",resultInit)
        log.info(tag,"wallets: ",app.wallets.length)

        let txsCache = await txDB.getAllTransactions()
        let pubkeysCache = await txDB.getPubkeys({})
        let balancesCache = await txDB.getBalances({})
        // log.info(tag,"txsCache: ",app.txsCache.length)
        // log.info(tag,"pubkeysCache: ",app.pubkeysCache.length)
        log.info(tag,"balancesCache: ",app.balancesCache)

        if(pubkeysCache.length == 0){
            log.info(tag,"DB empty: ",pubkeysCache)
            //add mm to pubkeys
            let pubkeysMM = [
                  {"type":"address",
                      "master":"0xe6F612699AA300d4C61571a101f726B4c59D0577",
                      "address":"0xe6F612699AA300d4C61571a101f726B4c59D0577",
                      "pubkey":"0xe6F612699AA300d4C61571a101f726B4c59D0577","context":"metamask:device.wallet","contextType":"metamask",
                      "networks":["eip155:1","eip155:8453"]
                  }
              ]
            let saved = await txDB.createPubkey(pubkeysMM[0])
            pubkeysCache = await txDB.getPubkeys({})
        }
        log.info(tag,"pubkeysCache: ",pubkeysCache)
        assert(pubkeysCache)

        //load pubkeys
        console.time('loadPubkeyCache');
        await app.loadPubkeyCache(pubkeysCache)
        console.timeEnd('loadPubkeyCache');

        //load balances
        await app.loadBalanceCache(balancesCache)

        let pubkeys = app.pubkeys
        log.info(tag,"app.pubkeys: ",pubkeys)
        assert(pubkeys)
        if(pubkeys.length == 0) throw Error("Failed to load pubkey cache")


        // //connect
        // assert(blockchains)
        // assert(blockchains[0])

        // log.info(tag,"blockchains: ",blockchains.length)
        console.time('start2paired');
        let pairObject = {
            type:WalletOption.KEEPKEY,
            blockchains
        }
        console.time('pairWallet');
        resultInit = await app.pairWallet(pairObject)
        console.timeEnd('pairWallet');
        console.timeEnd('start2paired'); // End timing for pairing
        log.debug(tag,"resultInit: ",resultInit)

        //check pairing
        // //context should match first account
        let context = await app.context
        log.info(tag,"context: ",context)
        assert(context)

        log.info(tag,"assets: ",app.assets.length)
        log.info(tag,"pubkeys: ",app.pubkeys.length)
        log.info(tag,"balances: ",app.balances.length)

        // log.info(tag,"swapkit: ",app)
        log.info(tag,"swapkit: ",app.swapKit)

        // console.time('start2getPubkeys');
        // //init start2end: 9.129s
        //
        // //With getPubkeys
        await app.getPubkeys()
        console.timeEnd('start2getPubkeys');
        log.info(tag,"***** pubkeys: ",app.pubkeys)
        log.info(tag,"***** pubkeys: ",app.pubkeys.length)
        // // assert(app.pubkeys)
        // // assert(app.pubkeys[0])
        // //if(app.pubkeys.length !== 2) throw Error("Failed to get ALL pubkeys")
        // // let assetinfoIn = app.pubkeys.find((asset: { caip: any }) => asset.caip === ASSET_IN)
        // // assert(assetinfoIn)
        //
        //
        console.time('start2getBalances');
        // await app.getBalances()
        if(app.balances.length == 0){
            log.info("Getting balances manually!")
            await app.getBalances()
        } else {
            log.info("Getting balances from cache!")
        }
        // log.info(tag,"balances: ",app.balances)
        log.info(tag,"balances: ",app.balances.length)
        console.timeEnd('start2getBalances');
        // console.timeEnd('start2end');

        //update cache
        for(let i = 0; i < app.balances.length; i++){
            let balance = app.balances[i]
            let saved = await txDB.createBalance(balance)
            log.info('saved: ',saved)
        }

        //Pre OPT
        //start2end: 17.147s
        //start2end: 18.052s

        //Post OPT
        //start2end: 1.664s

        //query username by address
        // log.info("pubkeys: ",JSON.stringify(app.pubkeys))

        console.timeEnd('start2end');
        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
