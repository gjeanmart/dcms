'use strict';
(async () => {
    const RegistryCommon = require('./registry-common.js');
    const axios = require('axios');
    const DELAY_MS = 3000; 

    /***********************************
     * CONSTRUCTOR
     ***********************************/

    function RegistryOverMetatx(instance, web3, account) {
        RegistryCommon.call(this, instance, web3, account);
        this.account = account;
        this.instance = instance;
        this.web3 = web3;
    }
    RegistryOverMetatx.prototype = Object.create(RegistryCommon.prototype);

    /***********************************
     * TRANSACTIONS
     ***********************************/

    RegistryOverMetatx.prototype.createSpace = async function(spaceId, owner) {
        var self = this;

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
        var self = this;
        
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
        var self = this;
        
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
        var self = this;
        
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
        var self = this;

        return new Promise( (resolve, reject) => {
            this.instance.metaCreateSpaceHash(id, owner, nonce).then(async function(res) {
                resolve(res);
            }).catch(function (error) {
                reject(error);
            });
        });
    };

    RegistryOverMetatx.prototype.getMetaPushRevisionHash = async function(id, hash, parentHash, nonce) {
        var self = this;

        return new Promise( (resolve, reject) => {
            this.instance.metaPushRevisionHash(id, hash, parentHash || "", nonce).then(async function(res) {
                resolve(res);
            }).catch(function (error) {
                reject(error);
            });
        });
    };

    RegistryOverMetatx.prototype.getMetaApproveRevisionHash = async function(id, hash, nonce) {
        var self = this;

        return new Promise( (resolve, reject) => {
            this.instance.metaApproveRevisionHash(id, hash, nonce).then(async function(res) {
                resolve(res);
            }).catch(function (error) {
                reject(error);
            });
        });
    };

    RegistryOverMetatx.prototype.getMetaRejectRevisionHash = async function(id, hash, nonce) {
        var self = this;

        return new Promise( (resolve, reject) => {
            this.instance.metaRejectRevisionHash(id, hash, nonce).then(async function(res) {
                resolve(res);
            }).catch(function (error) {
                reject(error);
            });
        });
    };

    RegistryOverMetatx.prototype.getNonce = async function() {
        var self = this;

        return new Promise( (resolve, reject) => {
            this.instance.getNonce(this.account).then(async function(res) {
                resolve(res);
            }).catch(function (error) {
                reject(error);
            });
        });
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
