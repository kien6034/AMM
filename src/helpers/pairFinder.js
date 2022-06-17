function sortTokens(tokens){
    if (tokens[0] < tokens[1]){
        return tokens
    }
    return [tokens[1], tokens[0]]
}


function getPairId(tokens){
    let sortedTokens = sortTokens(tokens);

    let firstIndex = sortedTokens[0].toLowerCase().slice(2, 10);
    let secondIndex = sortedTokens[1].toLowerCase().slice(10, 18);

    return firstIndex.concat(secondIndex);
}

module.exports = {
    sortedTokens: sortTokens,
    getPairId: getPairId
}