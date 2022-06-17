const { ethers, BigNumber } = require("ethers");
require('dotenv').config()

const dexs = require("../data/addresses/dexs.json")
const Wallet = require("./connecters/wallet");
const tokenAbi = require("../data/bep20.json")


const fs = require("fs");




const main = async()=>{
    let wallet = await Wallet.connectWallet();
    console.log(wallet);

   
}




main().catch(error => console.log(error));