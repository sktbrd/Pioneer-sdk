/*
    E2E testing

 */

import { AssetValue } from '@pioneer-platform/helpers';

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | intergration-test | "
import { WalletOption, availableChainsByWallet, Chain } from '@coinmasters/types';
//@ts-ignore
import { getPaths } from '@pioneer-platform/pioneer-coins';
const DB = require('@coinmasters/pioneer-db-sql');
console.log("DB: ",DB)

// console.log(process.env['BLOCKCHAIR_API_KEY'])
// if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars! VITE_BLOCKCHAIR_API_KEY")
// if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars!")
const log = require("@pioneer-platform/loggerdog")()
let assert = require('assert')
let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
let {ChainToNetworkId} = require('@pioneer-platform/pioneer-caip');
let sleep = wait.sleep;

let BLOCKCHAIN = ChainToNetworkId['ETH']
let ASSET = 'FOX'
let ASSET_CAIP = 'eip155:1/slip44:60'
let MIN_BALANCE = process.env['MIN_BALANCE_DOGE'] || "1.0004"
let TEST_AMOUNT = process.env['TEST_AMOUNT'] || "0.005"
let spec = process.env['URL_PIONEER_SPEC'] || 'https://pioneers.dev/spec/swagger.json'
let wss = process.env['URL_PIONEER_SOCKET'] || 'wss://pioneers.dev'

let FAUCET_ETH_ADDRESS = process.env['FAUCET_ETH_ADDRESS']
if(!FAUCET_ETH_ADDRESS) throw Error("Need Faucet Address!")
let FAUCET_ADDRESS = FAUCET_ETH_ADDRESS

console.log("spec: ",spec)
console.log("wss: ",wss)

let txid:string
let IS_SIGNED: boolean


const test_service = async function (this: any) {
    let tag = TAG + " | test_service | "
    try {
        const txDB = new DB.DB({ });
        await txDB.init({});

        console.log(tag,' CHECKPOINT 1');
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

        let blockchains = [BLOCKCHAIN]
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

        // console.log(tag,' CHECKPOINT 2');
        // console.log(tag,' config: ',config);
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

        //
        await app.getPubkeys()
        log.info(tag,"pubkeys: ",app.pubkeys)
        assert(app.pubkeys)
        assert(app.pubkeys[0])

        //get all balances
        let balances1 = await txDB.getBalances()
        log.info("balances1: ",balances1)
        let balanceEthCache = balances1.filter((b:any)=>b.caip === ASSET_CAIP)
        log.info("balanceEthCache: ",balanceEthCache)

        if(!balanceEthCache || balanceEthCache.length === 0){
            //get balance
            //get balance of gas asset
            let balanceEth = await app.getBalance(ASSET_CAIP)
            assert(balanceEth)
            log.info(tag,"balanceEth: ",balanceEth)

            //save into cache
            let saved2 = await txDB.createBalance(balanceEth)
            log.info(tag,"saved2: ",saved2)

            await app.loadBalanceCache([balanceEth])
        } else {
            await app.loadBalanceCache(balances1)
        }
        log.info(tag,"pubkeys: ",app.pubkeys)
        log.info(tag,"balances: ",app.balances)

        let balance = app.balances.filter((e:any) => e.caip === ASSET_CAIP)
        log.info("balance: ",balance)
        log.info("balance: ",balance[0].balance)
        assert(balance)
        assert(balance[0])
        assert(balance[0].balance)




        //verify pubkeys
        // await app.getBalances()
        // log.info(tag,"balances: ",app.balances)
        // verify balances

        // log.info(tag,"pubkeys: ",app.pubkeys)
        // log.info(tag,"balances: ",app.balances)
        // log.info(tag,"nfts: ",app.nfts)
        // log.debug(tag,"wallets: ",app.wallets)
        // log.info(tag,"pubkeys: ",app.pubkeys.length)
        // // log.info(tag,"balances: ",app.balances.length)
        // log.info(tag,"nfts: ",app.nfts.length)
        // log.info(tag,"context: ",app.context)
        // log.info(tag,"assetContext: ",app.assetContext)
        // log.info(tag,"blo: ",app.assetContext)
        // log.info(tag,"assetContext: ",app.assetContext)

        //balances
        // let balance = app.balances.filter((e:any) => e.symbol === ASSET)
        // log.info("balance: ",balance)
        // log.info("balance: ",balance[0].balance)
        // assert(balance)
        // assert(balance[0])
        // assert(balance[0].balance)


        // let fromAddress = await app.swapKit.getAddress(Chain.Ethereum)
        // assert(fromAddress)
        // log.info("fromAddress: ",fromAddress)
        // //send
        // let estimatePayload:any = {
        //     from:fromAddress,
        //     // assetValue,
        //     // feeRate: 10,
        //     memo: '',
        //     recipient: FAUCET_ADDRESS,
        // }
        // log.info("estimatePayload: ",estimatePayload)
        // //verify amount is < max spendable
        // let maxSpendable = await app.swapKit.estimateMaxSendableAmount({chain:Chain.Ethereum, params:estimatePayload})
        // log.info("maxSpendable: ",maxSpendable)
        // assert(maxSpendable)

        // log.info("TEST_AMOUNT: ",typeof(TEST_AMOUNT))
        // let assetValue = AssetValue.fromChainOrSignature(
        //   Chain.Ethereum,
        //   TEST_AMOUNT,
        // );
        // log.info("assetValue: ",assetValue)
        //
        // //send
        // let sendPayload = {
        //     assetValue,
        //     memo: '',
        //     recipient: FAUCET_ADDRESS,
        // }
        // log.info("sendPayload: ",sendPayload)
        // const txHash = await app.swapKit.transfer(sendPayload);
        // log.info("txHash: ",txHash)
        // assert(txHash)

        console.timeEnd('start2end');
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
