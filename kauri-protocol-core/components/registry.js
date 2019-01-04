'use strict';
(async () => {

    const RegistryAbstract = require('./registry-abstract.js');

    /***********************************
     * CONSTRUCTOR
     ***********************************/

    function Registry(instance, web3, account) {
        RegistryAbstract.call(this, instance, web3, account);
        this.account = account;
        this.instance = instance;
        this.web3 = web3;
    }
    Registry.prototype = Object.create(RegistryAbstract.prototype);

    /***********************************
     * TRANSACTIONS
     ***********************************/
    Registry.prototype.createSpace = async function(spaceId, owner) {
        var tx = await this.instance.createSpace(this.web3.utils.fromAscii(spaceId), owner || this.account, {'from': this.account, 'gas': 3000000});
        return await this.getSpace(spaceId);
    };

    Registry.prototype.pushRevision = async function(spaceId, revisionHash, parentRevisionHash) {
        await this.instance.pushRevision(this.web3.utils.fromAscii(spaceId), revisionHash, parentRevisionHash || '', {'from': this.account, 'gas': 3000000});
        return await this.getSpace(spaceId);
    };

    Registry.prototype.approveRevision = async function(spaceId, revisionHash) {
        await this.instance.approveRevision(this.web3.utils.fromAscii(spaceId), revisionHash, {'from': this.account, 'gas': 3000000});
        return await this.getSpace(spaceId);
    };

    Registry.prototype.rejectRevision = async function(spaceId, revisionHash) {
        await this.instance.rejectRevision(this.web3.utils.fromAscii(spaceId), revisionHash, {'from': this.account, 'gas': 3000000});
        return await this.getSpace(spaceId);
    };

    module.exports = Registry;
})();
