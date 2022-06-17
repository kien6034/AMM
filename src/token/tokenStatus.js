
const fs = require("fs");
const filePath = "data/token/status.json";
const axios = require('axios').default;

class TokenStatus{
    constructor(){
        this.sequence = 0; // use this to handle api call
    }
    
    resetSequence(){
        this.sequence = 0;
    }

    getSequence(){
        return this.sequence;
    }
    
    async checkTokenTransparency(tokenAddress){
        // GET data in BSCscan'
        let status = await this.getTokenStatus(tokenAddress);
        
        if (status!= undefined){
            return status;
            
        }

        this.sequence += 1;

        const url = `https://api.bscscan.com/api?module=contract&action=getabi&address=${tokenAddress}&apikey=${process.env.BSC_API}`
        await axios.get(url)
        .then(function (response) {
            // handle success
            let data = response['data'];
            if (data["status"] == "0" || data["result"].includes("upgrade")){
                status = false;
            }else{
                status = true;
            }
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            return false;
        })

        return status;
    }


    async setTokenStatus(tokenAddress, status){
        let data = await this.getAllTokenStatus();
        data[tokenAddress] = status;

        try{
            fs.writeFileSync(
                filePath,
                JSON.stringify(data)
            );
        }catch(error){
            console.log("ERROR: Write token to blacklist error: ", error);
        }
    }

    async getAllTokenStatus(){
        try{
            const file = fs.readFileSync(filePath, 'utf-8');
            return  JSON.parse(file);
        }catch(error){
            return {};
        }
    }

    async getTokenStatus(tokenAddress){
        let data = await this.getAllTokenStatus();
        return data[tokenAddress];
    }

}


module.exports = TokenStatus;