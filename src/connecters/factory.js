const { ethers } = require("ethers");
const abi = require("../../data/abi/factory.json");
const pairABI = require("../../data/abi/pair.json");
const TokenStatus = require("../token/tokenStatus");
const Pair = require("../connecters/pair");
const PairFinder = require("../helpers/pairFinder");

const fs = require("fs");
const pairFinder = require("../helpers/pairFinder");
const basePairFile = "./data/allPairs";

class Factory {
    constructor(
        dexName,
        factoryAddress,
        wallet
    ){
        this.dexName = dexName;
        this.factory = new ethers.Contract(factoryAddress, abi, wallet);
        this.wallet = wallet;

        this.factoryAddress = factoryAddress;
    }

  

    getFactory(){
        return this.factory;
    }

    async allPairsLength(){
        return await this.factory.allPairsLength();
    }

    async getTokenPair(index){
        let pairAddr = await this.factory.allPairs(index);
        let pair = new Pair(this.factoryAddress, pairAddr, this.wallet);
        let tokens = await pair.getTokens();
        let expectedLp = await pair.getExpectingLp();

        return {"addr": pairAddr, "token0": tokens[0], "token1": tokens[1], "tvl": expectedLp};
    }

  
    async getPairs(writeMode=true, from, amount){
        if (writeMode == true && from == 0){
            fs.writeFileSync(
                `./data/allPairs/${this.dexName}.json`,
                JSON.stringify({})
              );

            console.log("--- Clear data sucessfully ----");
        }

        console.log(`${this.dexName}: Getting pairs from: ${from} to ${from + amount}`);

        let pairData = await this.getPairFile();
    
        let getPairAddresses = [];
       
        for(let i= from; i< from+amount; i++){
            getPairAddresses.push(this.getTokenPair(i));
            if (i % 1000 == 0 && i > 0){
                await Promise.all(getPairAddresses).then((values)=>{
                    values.map(value=>{
                        let pairId = pairFinder.getPairId([value["token0"], value["token1"]]);
                        pairData[pairId] = value;
                    })
                })

                getPairAddresses = [];
            }
        }

        await Promise.all(getPairAddresses).then((values)=>{
            values.map(value=>{
                let pairId = pairFinder.getPairId([value["token0"], value["token1"]]);
                pairData[pairId] = value;
            })
        })


        if (writeMode == true){
            fs.writeFileSync(
                `./data/allPairs/${this.dexName}.json`,
                JSON.stringify(pairData)
              );

            console.log("Append sucessfully \n");
        }
        
        return pairData;
    }
    
    async getPairFile(){
        try{
            const file = fs.readFileSync(`${basePairFile}/${this.dexName}.json`, 'utf-8');
          
            return  JSON.parse(file);
        }catch(error){
            return {};
        }
    }
}

module.exports = Factory