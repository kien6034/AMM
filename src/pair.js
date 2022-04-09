const { ethers } = require("ethers");
const abi = require("../data/abi/pair.json");

const ADDRESS0 = 0x0000000000000000000000000000000000000000;

class Pair {
    constructor(
        factory,
        wallet,
        token0,
        token1
    ){
        this.factory = factory;
        this.wallet = wallet;
        this.token0 = token0;
        this.token1 = token1
    }

    async getPair(){
        const pairAddress = await this.factory.getPair(this.token0, this.token1);
        
        if (pairAddress != ADDRESS0){
            //get pair contract
            const pair = new ethers.Contract(pairAddress, abi, this.wallet);
            this.pair = pair;
        }
        else{

        }
    }

    async getReserves(){
        return await this.pair.getReserves()
    }
}

module.exports = Pair