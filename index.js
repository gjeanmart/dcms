'use strict';
(async () => {

	const 	path 			= require("path"),
			fs      		= require("fs"),
			Web3            = require('web3'),
            HDWalletProvider= require('./core/hdprovider.js'),
            Web3Utils   	= require('./core/web3-utils.js'),
		  	IPFS  			= require('./core/ipfs.js'),
		  	Registry  		= require('./core/registry.js'),
	      	contractSrc     = {
                'path': path.resolve(__dirname) + '/smartcontracts/contracts/ContentSpaceRegistry.sol',
                'name': 'ContentSpaceRegistry'
            };

    function Kauri(ipfs, registry, web3, account) {
    	this.ipfs = ipfs;
    	this.registry = registry;
    	this.web3 = web3;
    	this.account = account;
    }

    Kauri.init = async function(conf) {
    	let ipfs = new IPFS(conf.connections.ipfs);

    	let provider;
    	if(conf.mnemonic) {
    		provider = new HDWalletProvider(conf.mnemonic, conf.connections.ethereum, conf.index || 0, 1)
    	} else {
    		provider = new Web3.providers.HttpProvider(conf.connections.ethereum);
    	}
    	let web3 = new Web3(provider);
    	let account = await Web3Utils.getCurrentAccount(web3);

    	let instance;
    	if(conf.registry == "new") {
    		instance = await Web3Utils.deployContract(contractSrc, web3, account);
    	} else {
    		instance = await Web3Utils.fetchContract(contractSrc, web3, conf.registry);
    	} 

    	let registry = new Registry(instance, web3, account);

        return new Kauri(ipfs, registry, web3);
    };

    Kauri.prototype.createSpace = async function(spaceId, owner) {
        return this.registry.createSpace(spaceId, owner);
    };

    Kauri.prototype.createRevision = async function(spaceId, data, attributes, parent) {
 
    	// Store content on IPFS
       	let contentHash = await this.ipfs.storeContent(data);

        // Parent
        if(!parent) {
            let revisions = await this.registry.getAllRevisions(spaceId);            
            parent = (revisions.length > 0) ? revisions[revisions.length-1].hash : null;
        } else {
            // check if parent is CID and exists
        }

       	// Revision
        let revision = {
        	'@type': 'file',
        	'parent': parent,
        	'content': { "/": contentHash },
        	'metadata': attributes
        };

        return await this.ipfs.storeRevision(revision);
	};

    Kauri.prototype.pushRevision = async function(spaceId, revisionHash) { 

        let revision = await this.getRevision(spaceId, revisionHash);

        return await this.registry.pushRevision(spaceId, revisionHash, revision.parent);
    };

    Kauri.prototype.getRevision = async function(spaceId, revisionHash) {
        let revision = await this.ipfs.getRevision(revisionHash);
        
        if(revision.value["@type"] === "file") {
        	revision.value.content = await this.ipfs.getContent(revisionHash, '/content');
        }
        
        try {
        	let publishedRevision = await this.registry.getRevision(spaceId, revisionHash);
        	revision.value.status = publishedRevision.state;
        	revision.value.author = publishedRevision.author;

        } catch(err) {
        	revision.value.status = "UNPUBLISHED";
        	revision.value.author = "";
        }

        return revision.value;
    };

    Kauri.prototype.getSpace = async function(spaceId) {
        let space = await this.registry.getSpace(spaceId);

        space.revisions = await this.registry.getAllRevisions(spaceId);

        return space;
    };

    Kauri.prototype.getAllSpaces = async function(spaceId) {
        return this.registry.getAllSpaces();
    };
    
    module.exports = Kauri;
})();
