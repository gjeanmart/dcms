'use strict';
(async () => {

    const RegistryCommon = require('./registry-common.js');

    /***********************************
     * CONSTRUCTOR
     ***********************************/

    function Registry(instance, web3, account) {
        RegistryCommon.call(this, instance, web3, account);
        this.account = account;
        this.instance = instance;
        this.web3 = web3;
    }
    Registry.prototype = Object.create(RegistryCommon.prototype);

    /***********************************
     * TRANSACTIONS
     ***********************************/

    Registry.prototype.createSpace = async function(spaceId, owner) {
        var self = this;

        return new Promise( (resolve, reject) => {
            this.instance.createSpace(spaceId, owner || this.account, {'from': this.account, 'gas': 3000000}).then(async function(tx) {
                resolve(await self.getSpace(spaceId));

            }).catch(function (error) {
                reject(error);
            });
        });
    };

    Registry.prototype.pushRevision = async function(spaceId, revisionHash, parentRevisionHash) {
        var self = this;
        
        return new Promise( (resolve, reject) => {
          this.instance.pushRevision(spaceId, revisionHash, parentRevisionHash || '', {'from': this.account, 'gas': 3000000}).then(async function(tx) {
                resolve(await self.getRevision(spaceId, revisionHash));

            }).catch(function (error) {
                reject(error);
            });
        });
    };

    Registry.prototype.approveRevision = async function(spaceId, revisionHash) {
        var self = this;
        
        return new Promise( (resolve, reject) => {
          this.instance.approveRevision(spaceId, revisionHash, {'from': this.account, 'gas': 3000000}).then(async function(tx) {
                resolve(await self.getRevision(spaceId, revisionHash));

            }).catch(function (error) {
                reject(error);
            });
        });
    };

    Registry.prototype.rejectRevision = async function(spaceId, revisionHash) {
        var self = this;
        
        return new Promise( (resolve, reject) => {
          this.instance.rejectRevision(spaceId, revisionHash, {'from': this.account, 'gas': 3000000}).then(async function(tx) {
                resolve(await self.getRevision(spaceId, revisionHash));

            }).catch(function (error) {
                reject(error);
            });
        });
    };

    module.exports = Registry;
})();
