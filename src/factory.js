const { ethers } = require("ethers");
const abi = require("../data/abi/factory.json");
const pairABI = require("../data/abi/pair.json");

const fs = require("fs");


class Factory {
    constructor(
        dexName,
        factoryAddress,
        wallet
    ){
        this.dexName = dexName;
        this.factory = new ethers.Contract(factoryAddress, abi, wallet);
        this.wallet = wallet;
    }

    getFactory(){
        return this.factory;
    }

    async getTokenPair(index){
        let pairAddr = await this.factory.allPairs(index);
        let pair = new ethers.Contract(pairAddr, pairABI, this.wallet);
        let token0 = await pair.token0();
        let token1 = await pair.token1();

        return {"addr": pairAddr, "token0": token0, "token1": token1};
    }

    /**
     * @dev this is a extermely heavy function. Only call it to update pair data. 
     */
    async getAllPairs(writeMode){
        let allPairsLength = await this.factory.allPairsLength();

        let getPairAddresses = [];
        let allTokenPairs = [];
        for(let i= 0; i< 1; i++){
            getPairAddresses.push(this.getTokenPair(i));
            if (i % 1000 == 0 && i > 0){
                await Promise.all(getPairAddresses).then((values)=>{
                    values.map(value=>{
                        allTokenPairs.push(value);
                    })
                })

                getPairAddresses = [];
            }
        }

        await Promise.all(getPairAddresses).then((values)=>{
            values.map(value=>{
                allTokenPairs.push(value);
            })
        })

        if (writeMode == true){
            fs.writeFileSync(
                `./data/allPairs/${this.dexName}.json`,
                JSON.stringify(allTokenPairs)
              );
        }
        
        return allTokenPairs;
    }
}

module.exports = Factory