'use strict';
(async () => {

	const   fs                  = require('fs'),
            solc                = require('solc'),
	        truffleContract     = require('truffle-contract');


    let Web3Utils = {

        'getCurrentAccount': async (web3) => {
            return new Promise( (resolve, reject) => {
                web3.eth.getCoinbase((err, res) => {
                    if(err) reject(err);
                    resolve(res);
                })
            });
        },

        'fetchContract': async (source, web3, contractAddress) => {
            return new Promise( (resolve, reject) => {
                let contract = truffleContract(compileContract(source.path, source.name));
                contract.setProvider(web3.currentProvider);

                contract.at(contractAddress).then(function(instance) {
                    resolve(instance);
                });
            });
        },

        'deployContract': async (source, web3, fromAddress) => {
            return new Promise( (resolve, reject) => {
                let contract = truffleContract(compileContract(source.path, source.name));
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


    /***********************************
     * UTILS
     ***********************************/

    let compileContract = function(path, name) {
        let source = fs.readFileSync(path, 'utf8');
        let compiledContract = solc.compile(source, 1);
        let abi = compiledContract.contracts[':'+name].interface;
        let bytecode = compiledContract.contracts[':'+name].bytecode;

        return {
            'abi': abi,
            'unlinked_binary': bytecode
        };
    };
    
    module.exports = Web3Utils;
})();
