'use strict';
(async () => {

    const   truffleContract = require('truffle-contract');


    let Web3Utils = {

        'getCurrentAccount': async (web3) => {
            return new Promise( (resolve, reject) => {
                web3.eth.getCoinbase((err, res) => {
                    if(err) reject(err);
                    resolve(res);
                })
            });
        },

        'fetchContract': async (artifact, web3, contractAddress) => {
            return new Promise( (resolve, reject) => {
                let contract = truffleContract(artifact);
                contract.setProvider(web3.currentProvider);

                contract.at(contractAddress).then(function(instance) {
                    resolve(instance);
                });
            });
        },

        'deployContract': async (artifact, web3, fromAddress) => {
            return new Promise( (resolve, reject) => {
                let contract = truffleContract(artifact);
                contract.setProvider(web3.currentProvider);
                contract.new({'from': fromAddress, 'gas': 6500000}).then(function(instance) {
                    resolve(instance);
                });
            });
        },

        'getTransaction': async (web3, transactionHash) => {
            return new Promise( (resolve, reject) => {
                web3.eth.getTransaction(transactionHash, (err, res) => {
                    if(err) reject(err);
                    resolve(res);
                })
            });
        },

    };
    
    module.exports = Web3Utils;
})();
