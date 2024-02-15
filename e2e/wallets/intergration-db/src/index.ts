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
import { AssetValue } from '@coinmasters/core';
console.log(process.env['BLOCKCHAIR_API_KEY'])
if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars! VITE_BLOCKCHAIR_API_KEY")
if(!process.env['VITE_BLOCKCHAIR_API_KEY']) throw Error("Failed to load env vars!")
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
        const txDB = new DB.DB('MyDatabase', 'transactions');
        await txDB.init();

        // let result = await txDB.foo('txid:0x1234')
        // console.log("result: ",result)

        //get all outputs available
        await txDB.setItem("bar", {foo: "bar"})
        let result = await txDB.getItem("bar")
        console.log("result: ",result)
        //search for output

        console.log("************************* TEST PASS *************************")
    } catch (e) {
        log.error(e)
        //process
        process.exit(666)
    }
}
test_service()
