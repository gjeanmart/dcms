"use strict";
(async () => {

	const   ipfsAPI = require('ipfs-api'),
            CID     = require('cids'),
            URL     = require('url-parse');

    function IPFS(url) {
        var urlParsed = new URL(url);
    	this.ipfs = ipfsAPI(urlParsed.hostname, urlParsed.port, {protocol: urlParsed.protocol.slice(0, -1)});
    }

    IPFS.prototype.storeContent = async function(content) {
        const files = await this.ipfs.add(content, {'cid-version': 1});

        return files[0].hash;
    };

    IPFS.prototype.getContent = async function(revisionHash, path) {
        revisionHash = CID.isCID(revisionHash) ? revisionHash : new CID(revisionHash);

        return await this.ipfs.files.cat(revisionHash.toBaseEncodedString() + path);
    };

    IPFS.prototype.storeRevision = async function(revision) {
        const cid = await this.ipfs.dag.put(revision, { format: 'dag-cbor', hashAlg: 'sha2-256' });

        return cid.toBaseEncodedString();
    };

    IPFS.prototype.getRevision = async function(revisionHash) {
        revisionHash = CID.isCID(revisionHash) ? revisionHash : new CID(revisionHash);

        return await this.ipfs.dag.get(revisionHash, '/');
    };

    IPFS.prototype.bufferToCID = function(data) {
        var cid = new CID(data);
        return cid.toBaseEncodedString();
    };

    /***********************************
     * UTILS
     ***********************************/

    module.exports = IPFS;
})();
