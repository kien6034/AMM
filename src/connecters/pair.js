const { ethers, BigNumber } = require("ethers");
const abi = require("../../data/abi/pair.json");
const factoryAbi = require("../../data/abi/factory.json");
const tokenAbi = require("../../data/abi/bep20.json")


require('dotenv').config();


const ADDRESS0 = 0x0000000000000000000000000000000000000000;
const WETH = process.env.WETH;
const WETH_DECIMAL= parseInt(process.env.WETH_DECIMAL);
const MULTIPLIER = 12; // 10^12 
const WETH_SCALE = 3

class Pair {
    constructor(
        factoryAddress,
        pairAddress,
        wallet
    ){
        this.wallet = wallet;
        this.factory = new ethers.Contract(factoryAddress, factoryAbi, this.wallet);
        this.pair = new ethers.Contract(pairAddress, abi, this.wallet);

        this.pairAddress = pairAddress;
        this.factoryAddress = factoryAddress;
    }

    async getReserves(){
        let res = await this.pair.getReserves();

        return [res[0], res[1]];
    }

    // Test function for luna 
    async getReservesBusd(){
        const BUSD ="0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
        let res = await this.getReserves();
        
        let tokens = await this.getTokens();
        if (tokens[0] == BUSD){
            return [res[0], res[1]];
        }
        else{
            return [res[1], res[0]]
        }
    }

    async getTokens(){
        let token0 = await this.pair.token0();
        let token1 = await this.pair.token1();
        return [token0, token1];
    }

    async getBalances(){
        let tokens = await this.getTokens();

        let token0 = new ethers.Contract(tokens[0], tokenAbi, this.wallet);
        let token1 = new ethers.Contract(tokens[1], tokenAbi, this.wallet);

        let balance0 = await token0.balanceOf(this.pairAddress);
        let balance1 = await token1.balanceOf(this.pairAddress);
        return [balance0, balance1];
    }

    findTokenEqualBaseEth(tokens){
        let lowerCaseWeth = WETH.toLowerCase();

        if (tokens[0].toLowerCase() == lowerCaseWeth ){
            return 0;
        }
        else if (tokens[1].toLowerCase() == lowerCaseWeth){
            return 1;
        }

        return NaN
    }

    sortToken(){
        // use this for relativePrices
    }

    async relativePrices(){
        // use this for 2 non-weth check
    }

    async priceToWeth(){
        // use this for weth-based pool check
        let tokens = await this.getTokens();
        let wethPosition = this.findTokenEqualBaseEth(tokens);

        if(isNaN(wethPosition)){
            return 0;
        }
        let reserves = await this.getReserves();

        let wethReserve = BigNumber.from(reserves[wethPosition]);
        let tokenReseve = BigNumber.from(reserves[1-wethPosition]);

        if (tokenReseve == 0){
            return 0;
        }

        let price = wethReserve.mul(BigNumber.from(10).pow(MULTIPLIER)).div(tokenReseve);
        return price;
    }

    async getExpectingLp(){
        let tokens = await this.getTokens();
        let wethPosition = this.findTokenEqualBaseEth(tokens);
        let reserves = await this.getReserves();
        
        if (!isNaN(wethPosition)){ 
            let lp =  BigNumber.from(reserves[wethPosition]).div(BigNumber.from(10).pow(WETH_DECIMAL));
            return lp.toNumber() * 2;
        }
        else{
            // find medium pair
            let token0ToWeth = await this.factory.getPair(tokens[0], WETH);
            let token1ToWeth = await this.factory.getPair(tokens[1], WETH);

            let pairAddress;
            let index;
            if (token0ToWeth != ADDRESS0){
                pairAddress = token0ToWeth;
                index = 0;
            }
            else if(token1ToWeth != ADDRESS0){
                pairAddress = token1ToWeth;
                index = 1;
            }
            else{
                return 0;
            }

            //after this step, for sure we will get WETH-token pair 
            let pair = new Pair(this.factoryAddress, pairAddress, this.wallet);
            let priceToWeth = await pair.priceToWeth();

            let tvl = reserves[index].mul(priceToWeth).mul(2).div(BigNumber.from(10).pow((WETH_DECIMAL + MULTIPLIER - WETH_SCALE)));

            return tvl.toNumber() / Math.pow(10, WETH_SCALE); // js can store up to 2^53 number
        }
    }

    async isWethPair(){
        let tokens = await this.getTokens();
        let wethPosition = this.findTokenEqualBaseEth(tokens);
        
        if (!isNaN(wethPosition)){
            return true;
        }
        return false;
    }
   
}

module.exports = Pair