"use strict";

(async () => {

    const   constant        = require('./constant'),
            contract        = require("truffle-contract"),
            Client          = new require('node-rest-client').Client,
            Web3            = require('web3');

    function SmartContract(provider, address) {
        this.client = new Client();
        this.provider = provider;
        this.address = address;
        console.log("[INFO] Relayer address: " + address);
    }

    SmartContract.prototype.getContractInstance = async function(contractName) {
        
        return new Promise( (resolve, reject) => {
            let that = this;
            this.client.get(constant._TRUFFLE_ENDPOINT_PROTOCOL+"://"+constant._TRUFFLE_ENDPOINT_HOST+":"+constant._TRUFFLE_ENDPOINT_PORT 
                            + constant._TRUFFLE_ENDPOINT_PATH + "/" 
                            + contractName + "/all", async function (data, response) {

                var c = contract(data);
                c.setProvider(that.provider);

                const result = await c.deployed();
                resolve(result);
            });
        });
    }

    // function metaCreateSpace(bytes32 _id, address _owner, bytes _signature, uint256 _nonce) public returns (bool)
    SmartContract.prototype.metaCreateSpace = async function(id, owner, signature, nonce) {

        return new Promise(async (resolve, reject) => {

            const instance = await this.getContractInstance(constant._CONTRACT_NAME);

            instance.metaCreateSpace(
                    id,
                    owner,
                    signature,
                    parseInt(nonce, 10),
                    { from: this.address, gasPrice: constant._GAS_PRICE }

            ).then(function(tx) {
                resolve(tx.receipt.transactionHash);
            }, function(error) {
                console.log(error);
                reject(error);
            });
        });
    };

    // function metaPushRevision(bytes32 _id, string _hash, string _parent_hash, bytes _signature, uint256 _nonce) public returns (bool)
    SmartContract.prototype.metaPushRevision = async function(id, hash, parentHash, signature, nonce) {

        return new Promise(async (resolve, reject) => {

            const instance = await this.getContractInstance(constant._CONTRACT_NAME);

            instance.metaPushRevision(
                    id,
                    hash,
                    parentHash || "",
                    signature,
                    parseInt(nonce, 10),
                    { from: this.address, gasPrice: constant._GAS_PRICE }

            ).then(function(tx) {
                resolve(tx.receipt.transactionHash);
            }, function(error) {
                console.log(error);
                reject(error);
            });
        });
    };

    // metaApproveRevision(bytes32 _id, string _hash, bytes _signature, uint256 _nonce) public returns (bool)
    SmartContract.prototype.metaApproveRevision = async function(id, hash, signature, nonce) {

        return new Promise(async (resolve, reject) => {

            const instance = await this.getContractInstance(constant._CONTRACT_NAME);

            instance.metaApproveRevision(
                    id,
                    hash,
                    signature,
                    parseInt(nonce, 10),
                    { from: this.address, gasPrice: constant._GAS_PRICE }

            ).then(function(tx) {
                resolve(tx.receipt.transactionHash);
            }, function(error) {
                console.log(error);
                reject(error);
            });
        });
    };

    // metaRejectRevision(bytes32 _id, string _hash, bytes _signature, uint256 _nonce) public returns (bool)
    SmartContract.prototype.metaRejectRevision = async function(id, hash, signature, nonce) {

        return new Promise(async (resolve, reject) => {

            const instance = await this.getContractInstance(constant._CONTRACT_NAME);

            instance.metaRejectRevision(
                    id,
                    hash,
                    signature,
                    parseInt(nonce, 10),
                    { from: this.address, gasPrice: constant._GAS_PRICE }

            ).then(function(tx) {
                resolve(tx.receipt.transactionHash);
            }, function(error) {
                console.log(error);
                reject(error);
            });
        });
    };

    module.exports = SmartContract;

})();
