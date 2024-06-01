/*
    E2E testing

 */

require("dotenv").config()
require('dotenv').config({path:"../../.env"});
require('dotenv').config({path:"./../../.env"});
require("dotenv").config({path:'../../../.env'})
require("dotenv").config({path:'../../../../.env'})

const TAG  = " | intergration-test | "
import { WalletOption, availableChainsByWallet, getChainEnumValue, Chain } from '@coinmasters/types';
import { AssetValue } from '@pioneer-platform/helpers';
const log = require("@pioneer-platform/loggerdog")()
// let assert = require('assert')
// let SDK = require('@coinmasters/pioneer-sdk')
let wait = require('wait-promise');
// let {ChainToNetworkId} = require('@pioneer-platform/pioneer-caip');
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
        const txDB = new DB.DB({ });
        await txDB.init();

        //get all assets

        //get all chains

        //get all wallets

        //get all txs

        // let txs = await txDB.getAllTransactions()
        // console.log("txs: ",txs)

        //get all paths

        //get all pubkeys

        // let pubkeys = await txDB.getPubkeys({})
        // console.log("pubkeys: ",pubkeys)

        //get pubkeys by networkId
        //get pubkeys by context
        //get pubkeys by networkIds

        //get all balances
        let balances1 = await txDB.getBalances()
        console.log("balances1: ",balances1)



        // let balances = [{
        //     "chain": "ETH",
        //     "identifier": "ETH.ETH",
        //     "decimals": 18,
        //     "type": "Native",
        //     "networkId": "eip155:1",
        //     "caip": "eip155:1/slip44:60",
        //     "symbol": "ETH",
        //     "sourceList": "thorchain",
        //     "assetId": "eip155:1/slip44:60",
        //     "chainId": "eip155:1",
        //     "name": "Ethereum",
        //     "networkName": "Ethereum",
        //     "precision": 18,
        //     "color": "#5C6BC0",
        //     "icon": "https://assets.coincap.io/assets/icons/256/eth.png",
        //     "explorer": "https://etherscan.io",
        //     "explorerAddressLink": "https://etherscan.io/address/",
        //     "explorerTxLink": "https://etherscan.io/tx/",
        //     "relatedAssetKey": "eip155:1/slip44:60",
        //     "integrations": [
        //         "mayachain",
        //         "changelly",
        //         "thorswap",
        //         "rango",
        //         "uniswap",
        //         "chainflip"
        //     ],
        //     "memoless": true,
        //     "balance": "0.NaN",
        //     "pubkey": "0xe6F612699AA300d4C61571a101f726B4c59D0577",
        //     "address": "0xe6F612699AA300d4C61571a101f726B4c59D0577",
        //     "master": "0xe6F612699AA300d4C61571a101f726B4c59D0577",
        //     "context": "keepkey:device.wallet",
        //     "contextType": "keepkey",
        //     "ticker": "ETH",
        //     "priceUsd": 3267.27,
        //     "rank": 2,
        //     "alias": 2,
        //     "source": "coingecko",
        //     "valueUsd": "0"
        // }]
        // let saved2 = await txDB.createBalance(balances[0])
        // console.log("saved2: ",saved2)
        //
        //
        //
        // let balances4 = [{
        //     "chain": "ETH",
        //     "identifier": "ETH.ETH",
        //     "decimals": 18,
        //     "type": "Native",
        //     "networkId": "eip155:1",
        //     "caip": "eip155:1/slip44:60",
        //     "symbol": "ETH",
        //     "sourceList": "thorchain",
        //     "assetId": "eip155:1/slip44:60",
        //     "chainId": "eip155:1",
        //     "name": "Ethereum",
        //     "networkName": "Ethereum",
        //     "precision": 18,
        //     "color": "#5C6BC0",
        //     "icon": "https://assets.coincap.io/assets/icons/256/eth.png",
        //     "explorer": "https://etherscan.io",
        //     "explorerAddressLink": "https://etherscan.io/address/",
        //     "explorerTxLink": "https://etherscan.io/tx/",
        //     "relatedAssetKey": "eip155:1/slip44:60",
        //     "integrations": [
        //         "mayachain",
        //         "changelly",
        //         "thorswap",
        //         "rango",
        //         "uniswap",
        //         "chainflip"
        //     ],
        //     "memoless": true,
        //     "balance": "1002.9999999999",
        //     "pubkey": "0xe6F612699AA300d4C61571a101f726B4c59D0577",
        //     "address": "0xe6F612699AA300d4C61571a101f726B4c59D0577",
        //     "master": "0xe6F612699AA300d4C61571a101f726B4c59D0577",
        //     "context": "keepkey:device.wallet",
        //     "contextType": "keepkey",
        //     "ticker": "ETH",
        //     "priceUsd": 3267.27,
        //     "rank": 2,
        //     "alias": 2,
        //     "source": "coingecko",
        //     "valueUsd": "0"
        // }]
        // let saved3 = await txDB.createBalance(balances4[0])
        // console.log("saved3: ",saved3)
        //
        // //get all balances
        // let balances2 = await txDB.getBalances()
        // console.log("balances2: ",balances2)

        //write pubkeys

        // let pubkeys = [{"type":"address","master":"0x141D9959cAe3853b035000490C03991eB70Fc4aC","address":"0x141D9959cAe3853b035000490C03991eB70Fc4aC","pubkey":"0x141D9959cAe3853b035000490C03991eB70Fc4aC","context":"keepkey:device.wallet","contextType":"keepkey","networks":["eip155:1","eip155:8453"]}]
        // let saved = await txDB.createPubkey(pubkeys[0])
        // console.log("saved: ",saved)

        // let result = await txDB.foo('txid:0x1234')
        // console.log("result: ",result)

        //get all outputs available
        // await txDB.setItem("bar", {foo: "bar"})
        // let result = await txDB.getItem("bar")
        // console.log("result: ",result)
        //search for output

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
