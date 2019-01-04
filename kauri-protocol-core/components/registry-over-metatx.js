'use strict';
(async () => {
    const RegistryAbstract = require('./registry-abstract.js');
    const axios = require('axios');
    const DELAY_MS = 3000;

    /***********************************
     * CONSTRUCTOR
     ***********************************/
    function RegistryOverMetatx(instance, web3, account) {
        RegistryAbstract.call(this, instance, web3, account);
        this.account = account;
        this.instance = instance;
        this.web3 = web3;
    }
    RegistryOverMetatx.prototype = Object.create(RegistryAbstract.prototype);

    /***********************************
     * TRANSACTIONS
     ***********************************/
    RegistryOverMetatx.prototype.createSpace = async function(spaceId, owner) {

        return new Promise( async (resolve, reject) => {
            const nonce = await this.getNonce();
            const hash = await this.getMetaCreateSpaceHash(spaceId, owner, nonce);
            const signature = await this.sign(hash);

            const resp = await axios.post(process.env.REACT_APP_METATX_ENDPOINT + '/relay/space', {
              'id': spaceId,
              'owner': owner,
              'nonce': nonce,
              'signature': signature
            });

            setTimeout(function() {
                resolve(self.getSpace(spaceId));
            }, DELAY_MS);
        });
    };

    RegistryOverMetatx.prototype.pushRevision = async function(spaceId, revisionHash, parentRevisionHash) {

        return new Promise( async (resolve, reject) => {
            const nonce = await this.getNonce();
            const hash = await this.getMetaPushRevisionHash(spaceId, revisionHash, parentRevisionHash, nonce);
            const signature = await this.sign(hash);

            const resp = await axios.post(process.env.REACT_APP_METATX_ENDPOINT + '/relay/revision', {
              'id': spaceId,
              'hash': revisionHash,
              'parentHash': parentRevisionHash,
              'nonce': nonce,
              'signature': signature
            });

            setTimeout(function() {
                resolve(self.getSpace(spaceId));
            }, DELAY_MS);
        });
    };

    RegistryOverMetatx.prototype.approveRevision = async function(spaceId, revisionHash) {

        return new Promise( async (resolve, reject) => {
            const nonce = await this.getNonce();
            const hash = await this.getMetaApproveRevisionHash(spaceId, revisionHash, nonce);
            const signature = await this.sign(hash);

            const resp = await axios.post(process.env.REACT_APP_METATX_ENDPOINT + '/relay/revision/approve', {
              'id': spaceId,
              'hash': revisionHash,
              'nonce': nonce,
              'signature': signature
            });

            setTimeout(function() {
                resolve(self.getSpace(spaceId));
            }, DELAY_MS);
        });
    };

    RegistryOverMetatx.prototype.rejectRevision = async function(spaceId, revisionHash) {

        return new Promise( async (resolve, reject) => {
            const nonce = await this.getNonce();
            const hash = await this.getMetaRejectRevisionHash(spaceId, revisionHash, nonce);
            const signature = await this.sign(hash);

            const resp = await axios.post(process.env.REACT_APP_METATX_ENDPOINT + '/relay/revision/reject', {
              'id': spaceId,
              'hash': revisionHash,
              'nonce': nonce,
              'signature': signature
            });

            setTimeout(function() {
                resolve(self.getSpace(spaceId));
            }, DELAY_MS);
        });
    };

    /***********************************
     * VIEWS
     ***********************************/
    RegistryOverMetatx.prototype.getMetaCreateSpaceHash = async function(id, owner, nonce) {
        return await this.instance.metaCreateSpaceHash(this.web3.utils.fromAscii(id), owner, nonce);
    };

    RegistryOverMetatx.prototype.getMetaPushRevisionHash = async function(id, hash, parentHash, nonce) {
        return await this.instance.metaPushRevisionHash(this.web3.utils.fromAscii(id), hash, parentHash || "", nonce);
    };

    RegistryOverMetatx.prototype.getMetaApproveRevisionHash = async function(id, hash, nonce) {
        return await this.instance.metaApproveRevisionHash(this.web3.utils.fromAscii(id), hash, nonce);
    };

    RegistryOverMetatx.prototype.getMetaRejectRevisionHash = async function(id, hash, nonce) {
        return await this.instance.metaRejectRevisionHash(this.web3.utils.fromAscii(id), hash, nonce);
    };

    RegistryOverMetatx.prototype.getNonce = async function() {
        return await this.instance.getNonce(this.account);
    };

    /***********************************
     * UTILS
     ***********************************/
    RegistryOverMetatx.prototype.sign = async function(message) {
        var self = this;

        return new Promise( (resolve, reject) => {
            this.web3.currentProvider.sendAsync({ id: 1, method: 'personal_sign', params: [this.account, message] },
                function(err, data) {
                    if(err) {
                        reject(err);
                    }
                    resolve(data.result);
                }
            );
        });
    };

    module.exports = RegistryOverMetatx;
})();
