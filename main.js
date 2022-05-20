const { ethers } = require("ethers");
require('dotenv').config()

const dexs = require("./data/addresses/dexs.json")
const tokenAddresses = require("./data/addresses/tokens.json")

const Pair = require("./src/pair");
const Router = require("./src/router");
const Factory = require("./src/factory");

const AMOUNT= ethers.utils.parseEther("1");
const WETH = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const main = async()=>{
    //Wallet connect 
    const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.ninicoin.io');
    let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    console.log(`Wallet of address: ${wallet.address} is connected`)

    data = {}
    for (let i =0; i< dexs.length; i++){
        //get router
        let routerAddress = dexs[i].router;
        let router = new Router(routerAddress, wallet, WETH);

        let factoryAddress = await router.getFactory();
        console.log("Factory address: ", factoryAddress);
        let factory = new Factory(dexs[i].name ,factoryAddress, wallet);

        let allPairs = await factory.getAllPairs(true);
       
        continue;

        //get price 
        getAmountsOutBase = []

        tokenAddresses.map(token=>{
            let amount = ethers.BigNumber.from("1").pow(18);
            getAmountsOutBase.push(router.getAmountsOutBase(amount, token))
        })

        await Promise.all(getAmountsOutBase).then((values)=>{
            values.map(value=>{
                if (!data[`${value.pair}`]){
                    data[`${value.pair}`] = {};
                }
        
                data[`${value.pair}`][`${dexs[i].dex}`]= value.basePrice
            })
        })

        break;
    }

    console.log(data)
   
}


main().catch(error => console.log(error));