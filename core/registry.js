'use strict';
(async () => {

    /***********************************
     * CONSTRUCTOR
     ***********************************/

    function Registry(instance, web3, account) {
        this.account = account;
        this.instance = instance;
        this.web3 = web3;
    }

    /***********************************
     * TRANSACTIONS
     ***********************************/

    Registry.prototype.createSpace = async function(spaceId, owner) {
        var self = this;

        return new Promise( (resolve, reject) => {
            this.instance.createSpace(spaceId, owner || this.account, {'from': this.account, 'gas': 3000000}).then(async function(tx) {
	  			resolve(await self.getSpace(spaceId, self.instance));

	    	}).catch(function (error) {
	    		reject(error);
			});
        });
    };

    Registry.prototype.pushRevision = async function(spaceId, revisionHash, parentRevisionHash) {
         var self = this;

        return new Promise( (resolve, reject) => {
          this.instance.pushRevision(spaceId, revisionHash, parentRevisionHash || '', {'from': this.account, 'gas': 3000000}).then(async function(tx) {
                resolve(await self.getRevision(spaceId, revisionHash, self.instance));

            }).catch(function (error) {
                reject(error);
            });
        });
    };

    /***********************************
     * VIEWS
     ***********************************/

    Registry.prototype.getSpace = async function(spaceId) {
         var self = this;

        return new Promise(async (resolve, reject) => {
            this.instance.getContentSpace.call(spaceId).then(function(result) {
	  			resolve({
	  				'id': self.web3.toAscii(result[0]).replace(/\u0000/g, ''),
	  				'owner': result[1],
                    'lastRevision': result[2]
	  			});

	    	}).catch(function (error) {
                reject(error);
            });;

        });
    };

    Registry.prototype.getRevision = async function (spaceId, revisionHash) {
        var self = this;

        return new Promise(async (resolve, reject) => {
            this.instance.getRevision.call(spaceId, revisionHash).then(function(result) {
                resolve({
                    'hash': result[0],
                    'parent': result[1] || '',
                    'author': result[2],
                    'state': convertState(result[3].toNumber())
                });

            }).catch(function (error) {
                reject(error);
            });
        });
    };

    /***********************************
     * EVENTS
     ***********************************/

    Registry.prototype.getAllSpaces = async function () {
        var self = this;

        return new Promise(async (resolve, reject) => {
            let events = this.instance.SpaceCreated(null, {'fromBlock': 0, 'toBlock': 'latest'});
            events.get(function(error, logs){
                if(error) reject(error);
                resolve(logs.map(log => { return {
                    'id': self.web3.toAscii(log.args['_id']).replace(/\u0000/g, ''),
                    'owner': log.args['_owner']
                }}));
            });
        });
    };

    Registry.prototype.getAllRevisions = async function (spaceId) {
        var self = this;
        
        return new Promise(async (resolve, reject) => {

            let events = this.instance.allEvents({
                'fromBlock': 'earliest', 
                'toBlock': 'latest'
            });
            events.get(function(error, logs){
                if(error) reject(error);
  
                var revisions = {};
                for(var i = 0; i < logs.length; i++) {
                    if( (   logs[i].event === 'RevisionPublished' 
                         || logs[i].event === 'RevisionPending' 
                         || logs[i].event === 'RevisionRejected'
                        ) && logs[i].args._id === self.web3.padRight(self.web3.fromAscii(spaceId), 66)) {

                        revisions[logs[i].args._hash] = {
                            'hash': logs[i].args._hash,
                            'parent': logs[i].args._parent_hash || '',
                            'author': logs[i].args._author,
                            'state': convertEventToState(logs[i].event)
                        };
                    }
                }

                resolve(Object.keys(revisions).map(function(key) {
                    return revisions[key];
                }));
            });
        });
    };



    /***********************************
     * UTILS
     ***********************************/

    let convertState = function (id) {

        switch(id) {
            case 0:
                return 'PENDING';
            case 1:
                return 'REJECTED';
            case 2:
                return 'PUBLISHED';
            default:
                throw 'BadIdException: Unknown identifier ' + id;
        } 
    };

    let convertEventToState = function (event) {

        switch(event) {
            case "RevisionPending":
                return 'PENDING';
            case "RevisionRejected":
                return 'REJECTED';
            case "RevisionPublished":
                return 'PUBLISHED';
            default:
                throw 'BadEventException: Unknown identifier ' + id;
        } 
    };

    module.exports = Registry;
})();
