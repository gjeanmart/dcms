'use strict';
(async () => {

	const 	Web3Utils   	= require('./components/web3-utils.js'),
		  	IPFS  			= require('./components/ipfs.js'),
		  	Registry  		= require('./components/registry.js');

    function Kauri(ipfs, registry, web3, account) {
    	this.ipfs = ipfs;
    	this.registry = registry;
    	this.web3 = web3;
    	this.account = account;
    }

    Kauri.init = async function(conf) {
    	let account = await Web3Utils.getCurrentAccount(conf.web3);

    	let instance;
    	if(conf.registryAddress == "new") {
    		instance = await Web3Utils.deployContract(conf.registryArtifact, conf.web3, account);
    	} else {
    		instance = await Web3Utils.fetchContract(conf.registryArtifact, conf.web3, conf.registryAddress);
    	} 

        return new Kauri(
            new IPFS(conf.connections.ipfs), 
            new Registry(instance, conf.web3, account), 
            conf.web3,
            account);
    };

    Kauri.prototype.createSpace = async function(spaceId, owner) {
        return this.registry.createSpace(spaceId, owner);
    };

    Kauri.prototype.createRevision = async function(spaceId, data, attributes, parent) {
 
    	// Store content on IPFS
       	let contentHash = await this.ipfs.storeContent(data);

        // Parent
        let revisions = await this.registry.getAllRevisions(spaceId); 
        if(!parent) { // Get latest revision           
            parent = (revisions.length > 0) ? revisions[revisions.length-1].hash : null;
        } else {
            // TODO check if parent is CID and exists
        }

       	// Revision
        // TODO accept other type (like 'tree')
        let revision = {
        	"@type": "file",
        	"parent": (parent) ? { "/": parent } : null,
        	"content": { "/": contentHash },
        	"metadata": attributes
        };
        return await this.ipfs.storeRevision(revision);
	};

    Kauri.prototype.pushRevision = async function(spaceId, revisionHash) { 
        let revision = await this.getRevision(spaceId, revisionHash);
        let parent = (revision.parent != null) ? this.ipfs.bufferToCID(revision.parent) : null;

        return await this.registry.pushRevision(spaceId, revisionHash, parent);
    };

    Kauri.prototype.approveRevision = async function(spaceId, revisionHash) { 
        return await this.registry.approveRevision(spaceId, revisionHash);
    };

    Kauri.prototype.rejectRevision = async function(spaceId, revisionHash) { 
        return await this.registry.rejectRevision(spaceId, revisionHash);
    };

    Kauri.prototype.getRevision = async function(spaceId, revisionHash) {
        let revision = await this.ipfs.getRevision(revisionHash);
        
        revision.value.space = spaceId;
        revision.value.revisionHash = revisionHash;
        revision.value.parent = (revision.value.parent != null) ? this.ipfs.bufferToCID(revision.value.parent['/']) : null; 

        if(revision.value["@type"] === "file") {
        	revision.value.content = await this.ipfs.getContent(revisionHash, '/content');
        } else if(revision.value["@type"] === "tree") {
            //TODO
        }
        
        try {
        	let publishedRevision = await this.registry.getRevision(spaceId, revisionHash);
        	revision.value.state = publishedRevision.state;
        	revision.value.author = publishedRevision.author;
            revision.value.timestamp = publishedRevision.timestamp.toNumber();

        } catch(err) {
        	revision.value.state = "UNPUBLISHED";
        	revision.value.author = "";
            revision.value.timestamp = null;
        }
        
        return revision.value;
    };

    Kauri.prototype.getSpace = async function(spaceId) {
        return this.registry.getSpace(spaceId);
    };

    Kauri.prototype.getSpaceRevisions = async function(spaceId) {
        return this.registry.getAllRevisions(spaceId);
    };

    Kauri.prototype.getAllSpaces = async function() {
        return this.registry.getAllSpaces();
    };
    
    module.exports = Kauri;
})();
