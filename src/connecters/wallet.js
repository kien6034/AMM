const { ethers } = require("ethers");

module.exports.connectWallet = async()=>{
    //Wallet connect 
    const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed1.ninicoin.io');
    let wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    console.log(`Wallet of address: ${wallet.address} is connected`)
    return wallet;
}