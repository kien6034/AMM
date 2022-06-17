const { ethers } = require("ethers");
require('dotenv').config()

const dexs = require("./data/addresses/dexs.json")
const tokenAddresses = require("./data/addresses/tokens.json")
const Wallet = require("./src/connecters/wallet");
const Factory = require("./src/connecters/factory");
const Router = require("./src/connecters/router");
const Pair = require("./src/connecters/pair");



const main = async()=>{
    let wallet = await Wallet.connectWallet();
    
    let factoryAddress= "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6";
    let pairAddress=  "0x7Bd46f6Da97312AC2DBD1749f82E202764C0B914";


    let pair = new Pair(factoryAddress, pairAddress, wallet);
    
    let expectedLp = await pair.getExpectingLp();
    console.log(expectedLp);

    let balances = await pair.getBalances();
    console.log(`Balances: ${balances}`);

    let reserves = await pair.getReserves();
    console.log(`Reserves: ${reserves}`);
}


main().catch(error => console.log(error));