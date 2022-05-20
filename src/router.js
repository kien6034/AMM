const { ethers } = require("ethers");
const abi = require("../data/abi/router.json")

const MULTIPLIER = 10000000

class Router{
    constructor(routerAddress, wallet, baseCurrency) {
        this.wallet = wallet;
        
        this.router = new ethers.Contract(routerAddress, abi, wallet);
        this.WETH = baseCurrency;
    }

    async init(){
        this.WETH = await this.router.WETH();
    }

    async getFactory(){
        return await this.router.factory();
    }

    async getAmountsOut(amount, tokens){
        try{
            let price = await this.router.getAmountsOut(amount, tokens);
            console.log(price[0].toNumber())
            console.log(price[1].toNumber())
        }
        catch(error){
            try{
                let paths = [tokens[0], this.WETH, tokens[1]];
                let price = await this.router.getAmountsOut(amount, tokens);
                console.log("Got price through bridge")
            }catch(error){
                console.log("Pair not found")
            }
        }
    }

    async getAmountsOutBase(amount, token){
        try {
         
            let price = await this.router.getAmountsOut(amount, [this.WETH,token.address]);
            
            return {
                "pair": `${token.symbol} - WBNB`,
                "basePrice": price[0].mul(MULTIPLIER).div(price[1]).toNumber() / MULTIPLIER
            }
            

        }catch(error){
            return {
                "pair": `${token.symbol} - WBNB`,
                "basePrice": 0
            }      
        }
    }

}


module.exports = Router