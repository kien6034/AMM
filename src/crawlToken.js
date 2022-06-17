const { ethers } = require("ethers");
require('dotenv').config()

const dexs = require("../data/addresses/dexs.json")
const tokenAddresses = require("../data/addresses/tokens.json")
const Wallet = require("./connecters/wallet");

const Factory = require("./connecters/factory");
const Router = require("./connecters/router");

const maxRequest = 50;
const DELAY_TIME = 180;
const fs = require("fs");
const runningPath = "./data/running/crawlToken.json"
/**
 * 
 * @dev this function use to crawl all pairs data from pool. 
 * @returns 
 */

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let getAllPairs = async(dexName, factory, allPairLength, runningData)=> {
    console.log(`${dexName} --- Getting ${allPairLength} pairs ----- \n`)

    let from;
    let to;

    for(let i =runningData["pair_index"]; i< allPairLength; i+=maxRequest){
        from = i;
        if (i + maxRequest > allPairLength){
            await factory.getPairs(true, i, allPairLength - i);
            to = allPairLength;
        }
        else{
            await factory.getPairs(true, i, maxRequest);
            to = i + maxRequest;
        }

        //save running data
        runningData["pair_index"] = to;
        fs.writeFileSync(
            `${runningPath}`,
            JSON.stringify(runningData)
          );

        await delay(DELAY_TIME * 1000);
    }
}

const main = async()=>{
    let wallet = await Wallet.connectWallet();
    console.log(wallet.address)    

    data = {}
    
    const file = fs.readFileSync(`${runningPath}`, 'utf-8');
    let runningData;
    try {
        runningData = JSON.parse(file); 
    }catch {
        runningData = {
            "dex_index": 0,
            "pair_index": 0
        }
    }
    

    for (let i =runningData["dex_index"]; i< dexs.length; i++){
        //get router
        let routerAddress = dexs[i].router;
        let router = new Router(routerAddress, wallet);

        let factoryAddress = await router.getFactory();
        console.log("Factory address: ", factoryAddress);
        let factory = new Factory(dexs[i].name ,factoryAddress, wallet);

        let allPairLength = await factory.allPairsLength();
        await getAllPairs(dexs[i].name, factory, allPairLength, runningData);       

        // update running data
        runningData = {
            "dex_index": i + 1,
            "pair_index": 0
        }
        fs.writeFileSync(
            `${runningPath}`,
            JSON.stringify(pairData)
          );
    }

    console.log(data)
   
}


main().catch(error => console.log(error));