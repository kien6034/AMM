const { ethers, Wallet } = require("ethers");
require('dotenv').config()


const TokenStatus = require("./token/tokenStatus");
const allPairs = require("../data/allPairs/test.json")


const MAX_SEQUENCE = 50;
const MAX_DELAY = 60;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))


const main = async()=>{ 
    let helper = new TokenStatus();
    console.log(helper.getSequence());
    
    for(let i =0; i < allPairs.length; i++){
        let status0 = await helper.checkTokenTransparency(allPairs[i]["token0"]);
        let status1 = await helper.checkTokenTransparency(allPairs[i]["token1"]);

        await helper.setTokenStatus(allPairs[i]["token0"], status0);
        await helper.setTokenStatus(allPairs[i]["token1"], status1);
        
        //get sequence 
        let sequence = helper.getSequence();
        if(sequence> MAX_SEQUENCE){
            helper.resetSequence();
            await delay(MAX_DELAY * 1000);
        }

    }
}



main().catch(error => console.log(error));