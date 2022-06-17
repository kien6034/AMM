const { ethers, BigNumber } = require("ethers");
require('dotenv').config()

const dexs = require("../data/addresses/dexs.json")
const tokenAddresses = require("../data/addresses/tokens.json")
const Wallet = require("./connecters/wallet");

const Factory = require("./connecters/factory");
const Router = require("./connecters/router");
const Pair = require("./connecters/pair");


const fs = require("fs");
const tokenAbi = require("../data/abi/bep20.json");
const factoryAbi = require("../data/abi/factory.json");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 
 * @dev this function use to crawl all pairs data from pool. 
 * @returns 
 */
const BUSD = {
    address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    decimal: 18,
}


const LUNA = {
    address: "0x156ab3346823B651294766e23e6Cf87254d68962",
    decimal: 6
}


/**
 * side =0: BUSD => Luna
 * side =1: Luna => BUSD
 */

const main = async()=>{
    let wallet = await Wallet.connectWallet();

    let busd = new ethers.Contract(BUSD.address, tokenAbi, wallet);
    let luna = new ethers.Contract(LUNA.address, tokenAbi, wallet);


    let path;
    let amount;
    let denominator;
   
    
   let routers = [];
   let pairs = [];

    // get price 
    for (let i =0; i< 2; i++){
        //get router
        let routerAddress = dexs[i].router;
        let routerObj = new Router(routerAddress, wallet);
        routers[i] = routerObj.getRouter();
        pairs[i] = new Pair(dexs[i].factory, dexs[i].pair, wallet);
    }   


    let side = 0;
    let diff = 0; 
    while(true){
        let receiveAmounts = [];
        let exactReceiveAmounts = [];
        
        if (side == 0){
            amount = await busd.balanceOf(wallet.address);
            path = [BUSD.address, LUNA.address];
            denominator = LUNA.decimal;
        }
        else{
            amount = await luna.balanceOf(wallet.address);
            path = [LUNA.address, BUSD.address];
            denominator = BUSD.decimal;
        }
    

        for(let i =0; i<2; i++){
            let reserves = await pairs[i].getReservesBusd(); 
            let busdReserve = reserves[0].div(BigNumber.from("10").pow(18)).toNumber()
            let lunaReserve = reserves[1].div(BigNumber.from("10").pow(6)).toNumber()

            let amountOuts = await routers[i].getAmountsOut(amount, path);
            let amountOut = amountOuts[1].div(BigNumber.from("10").pow(denominator));

            receiveAmounts[i] = amountOut;
            exactReceiveAmounts[i] = amountOuts[1];
        }

        let greaterIndex;
        if(receiveAmounts[0] >  receiveAmounts[1]){
            greaterIndex = 0;
        }else{
            greaterIndex = 1;
        }

        let diff = (receiveAmounts[greaterIndex] - receiveAmounts[1-greaterIndex]) /receiveAmounts[greaterIndex] * 100;
        console.log(`Diff: ${diff}%`);

        if (diff >= 1){
            // Check reserve trading in the other pair 
            let new_path = [path[1], path[0]];

            // buy at greater index -> get greater amount 
            let new_amount_in = exactReceiveAmounts[greaterIndex];
            let new_amounts_out = await routers[1-greaterIndex].getAmountsOut(new_amount_in, new_path);

            let amountBeforeTrade = amount.div(BigNumber.from("10").pow((24-denominator - 4)));
            let amountAfterTrade = new_amounts_out[1].div(BigNumber.from("10").pow((24-denominator - 4)));
            console.log(amountBeforeTrade.toNumber(), amountAfterTrade.toNumber())

        }

        await delay(5000)
    }
}


main().catch(error => console.log(error));