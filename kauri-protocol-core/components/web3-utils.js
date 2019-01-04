'use strict';
(async () => {

    const   truffleContract = require('truffle-contract');

    let Web3Utils = {
        'getCurrentAccount': async (web3) => {
            return await web3.eth.getCoinbase();
        },
        'fetchContract': async (artifact, web3, contractAddress) => {
            let contract = truffleContract(artifact);
            contract.setProvider(web3.currentProvider);

            return await contract.at(contractAddress);
        },
        'deployContract': async (artifact, web3, fromAddress) => {
            let contract = truffleContract(artifact);
            contract.setProvider(web3.currentProvider);

            return await contract.new({'from': fromAddress, 'gas': 6500000});
        },
        'getTransaction': async (web3, transactionHash) => {
            return await web3.eth.getTransaction(transactionHash);
        }
    };

    module.exports = Web3Utils;
})();
