/*
    E2E testing

       This an e2e testing framework targeting node.js containers

       it is the equivalent of the pioneer-react file for a web browser.

       it is the building blocks of a pioneer-cli that run perform transfers as a "skill"
 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | intergration-test | "
import { WalletOption, availableChainsByWallet, getChainEnumValue, NetworkIdToChain, Chain } from '@coinmasters/types';
//@ts-ignore
import { AssetValue } from '@pioneer-platform/helpers';
import type { AssetValue as AssetValueType } from '@pioneer-platform/helpers';
// import { AssetValue as AssetValueType } from '@coinmasters/core';

const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId, shortListSymbolToCaip} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;
import {
    getPaths,
    addressNListToBIP32,
    // @ts-ignore
} from '@pioneer-platform/pioneer-coins';
let spec = process.env['VITE_PIONEER_URL_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
const DB = require('@coinmasters/pioneer-db-sql');
console.log("spec: ",spec)



let txid:string
let IS_SIGNED: boolean



const test_service = async function (this: any) {
    let tag = TAG + " | test_service | "
    try {
        const txDB = new DB.DB({ });
        await txDB.init();

        //(tag,' CHECKPOINT 1');
        console.time('start2init');
        console.time('start2pair');
        console.time('start2Pubkeys');
        console.time('start2BalancesGas');
        console.time('start2BalancesTokens');
        console.time('start2end');

        // if force new user
        const queryKey = "sdk:pair-keepkey:"+Math.random();
        log.info(tag,"queryKey: ",queryKey)
        assert(queryKey)

        const username = "user:"+Math.random()
        assert(username)

        //TODO test enabled blockchain cacheing
        // const AllChainsSupported = availableChainsByWallet['KEEPKEY'];
        // assert(AllChainsSupported)
        // log.info(tag,"AllChainsSupported: ",AllChainsSupported)

        let AllChainsSupported = [
            // 'ETH',
            // 'ARB',
            // 'OP',  //Fast
            // 'MATIC', //SLOW charting
            // 'AVAX', //fast
            // 'BASE', //fast
            // 'BSC', //fast
            'BTC',
            // 'BCH',
            // 'GAIA',
            // 'OSMO',
            // 'XRP',
            // 'DOGE',
            // 'DASH',
            // 'MAYA',
            // 'LTC',
            // 'THOR'
        ]

        let pubkeysCache = await txDB.getPubkeys()
        log.info("pubkeysCache: ",pubkeysCache.length)

        //get balances cache
        let balancesCache = await txDB.getBalances()
        log.info("balancesCache: ",balancesCache.length)

        // const AllChainsSupported = [Chain.Base];
        // const AllChainsSupported = [Chain.Ethereum, Chain.Base];
        // const AllChainsSupported = [Chain.Ethereum, Chain.Base, Chain.BitcoinCash];
        let blockchains = AllChainsSupported.map(
          // @ts-ignore
          (chainStr: any) => ChainToNetworkId[getChainEnumValue(chainStr)],
        );
        log.info(tag,"blockchains: ",blockchains)
        log.info(tag,"blockchains: ",blockchains.length)
        //add custom path
        // let blockchains = [BLOCKCHAIN]
        // let paths:any = []
        let paths = getPaths(blockchains)
        log.info(tag,"paths: ",paths.length)
        assert(paths)

        //add custom btc paths
        //add account 0 p2sh segwit
        if(blockchains.includes('bip122:000000000019d6689c085ae165831e93')){
            paths.push({
                note:"Bitcoin account 0 segwit (p2sh)",
                networks: ['bip122:000000000019d6689c085ae165831e93'],
                script_type:"p2sh-p2wpkh",
                available_scripts_types:['p2pkh','p2sh','p2wpkh','p2sh-p2wpkh'],
                type:"ypub",
                addressNList: [0x80000000 + 49, 0x80000000 + 0, 0x80000000 + 0],
                addressNListMaster: [0x80000000 + 49, 0x80000000 + 0, 0x80000000 + 0, 0, 0],
                curve: 'secp256k1',
                showDisplay: false // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            })
            paths.push({
                note:"Bitcoin account 1 Native Segwit (Bech32)",
                blockchain: 'bitcoin',
                symbol: 'BTC',
                symbolSwapKit: 'BTC',
                networks: ['bip122:000000000019d6689c085ae165831e93'],
                script_type:"p2wpkh", //bech32
                available_scripts_types:['p2pkh','p2sh','p2wpkh','p2sh-p2wpkh'],
                type:"zpub",
                addressNList: [0x80000000 + 84, 0x80000000 + 0, 0x80000000 + 1],
                addressNListMaster: [0x80000000 + 84, 0x80000000 + 0, 0x80000000 + 1, 0, 0],
                curve: 'secp256k1',
                showDisplay: false // Not supported by TrezorConnect or Ledger, but KeepKey should do it
            })
        }

        for(let i = 0; i < paths.length; i++){
            let path = paths[i]
            log.info(tag,"path: ",path)
            assert(path.networks)
        }

        for(let i = 0; i < pubkeysCache.length; i++){
            let pubkey = pubkeysCache[i]
            log.info(tag,"pubkey: ",pubkey)
            assert(pubkey.pubkey)
            assert(pubkey.type)
            assert(pubkey.path)
        }


        let config:any = {
            username,
            queryKey,
            spec,
            keepkeyApiKey:process.env.KEEPKEY_API_KEY,
            paths,
            blockchains,
            pubkeys:pubkeysCache,
            balances:balancesCache,
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
        log.info(tag,"walletKeepKey: ",keepkeyWallet)
        const walletKeepKey = {
            type: WalletOption.KEEPKEY,
            icon: "https://pioneers.dev/coins/keepkey.png",
            chains: availableChainsByWallet[WalletOption.KEEPKEY],
            wallet: keepkeyWallet,
            status: "offline",
            isConnected: false,
        };
        walletsVerbose.push(walletKeepKey);
        // console.time('start2init');
        let resultInit = await app.init(walletsVerbose, {})
        // log.info(tag,"resultInit: ",resultInit)
        console.timeEnd('start2init');

        //
        let BLOCKCHAIN_ADD = {
            name: 'gnosis',
            symbol: 'GNO',
            networkId: 'eip155:100',
            nodes: [
                {
                    networkId: 'eip155:100',
                    url: 'https://rpc.gnosischain.com',
                    type: 'web3'
                }
            ]
        }

        //getBalances

        //getCharts

        //send gas asset

        //add custom token

        //get balance on token

        //send token

        console.log("************************* TEST PASS *************************")
        console.timeEnd('start2end');
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
