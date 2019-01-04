'use strict';
(async () => {

    const fs               = require('fs');
    const homedir          = require('os').homedir();
    const filename         = '.kauri.config.json';
    const configFile       = homedir + '/' + filename;
    const path             = require("path");
    const HDWalletProvider = require('truffle-hdwallet-provider');
    const Web3             = require('web3');
    const contract         = path.resolve(__dirname) + '/../kauri-protocol-contracts/build/contracts/ContentSpaceRegistry.json';

    let Config = { };

    Config.load = function(args) {

        if(!args) {
            if(!this.exists()) {
                throw "Please configure a registry by using the command 'kauri init'";
            }
            args = this.read();
        }

        // Web3
        let provider;
        if(args.mnemonic) {
            provider = new HDWalletProvider(args.mnemonic, args.connections.ethereum, args.index || 0, 1);
        } else {
            provider = new Web3.providers.HttpProvider(args.connections.ethereum);
        }
        let web3 = new Web3(provider);

        return {
            'connections': {
                'ethereum': args.connections.ethereum,
                'ipfs': args.connections.ipfs
            },
            'registryArtifact': JSON.parse(fs.readFileSync(contract, 'utf8')),
            'registryAddress': args.registry,
            'web3': web3,
            'enableMetaTx': args.enableMetaTx
        };
    };

    Config.write = function(conf) {
        let data = JSON.stringify(conf);
        fs.writeFileSync(configFile, data);
    };

    Config.read = function() {
        let data = fs.readFileSync(configFile);
        return JSON.parse(data);
    };

    Config.delete = function() {
        fs.unlinkSync(configFile);
    };

    Config.exists = function() {
        return fs.existsSync(configFile);
    }

    module.exports = Config;
})();
