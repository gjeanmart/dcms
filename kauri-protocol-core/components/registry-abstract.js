'use strict';
(async () => {

    /***********************************
     * CONSTRUCTOR
     ***********************************/
    function RegistryAbstract(instance, web3, account) {
        this.account = account;
        this.instance = instance;
        this.web3 = web3;
    }


    /***********************************
     * VIEWS
     ***********************************/
    RegistryAbstract.prototype.getSpace = async function(spaceId) {
         const result = await this.instance.getContentSpace(this.web3.utils.fromAscii(spaceId));

         return {
             'id': this.web3.utils.toAscii(result[0]).replace(/\u0000/g, ''),
             'owner': result[1],
             'lastRevision': result[2]
         };
    };

    RegistryAbstract.prototype.getRevision = async function (spaceId, revisionHash) {
        const result = await this.instance.getRevision(this.web3.utils.fromAscii(spaceId), revisionHash);

        return {
            'hash': result[0],
            'parent': result[1] || '',
            'author': result[2],
            'state': this.convertState(result[3].toNumber()),
            'timestamp': result[4].toNumber()
        };
    };

    /***********************************
     * EVENTS
     ***********************************/
    RegistryAbstract.prototype.getAllSpaces = async function () {
      var that = this;
      var spaces = {};

      return new Promise( async (resolve, reject) => {
        this.instance.getPastEvents({
          'fromBlock': 0,
          'toBlock': 'latest'
        }, function(error, events) {
          for(var i = 0; i < events.length; i++) {
            if(events[i].event === 'SpaceCreated') {
              spaces[events[i].returnValues['_id']] = {
                'id': that.web3.utils.toAscii(events[i].returnValues['_id']).replace(/\u0000/g, ''),
                'owner': events[i].returnValues['_owner']
              };
            }
          }
          resolve(Object.keys(spaces).map(function(key) {
              return spaces[key];
          }));
        });
      });
    };

    RegistryAbstract.prototype.getAllRevisions = async function (spaceId) {
      var that = this;
      var revisions = {};

      return new Promise( async (resolve, reject) => {
        this.instance.getPastEvents({
          'fromBlock': 0,
          'toBlock': 'latest'
        }, function(error, events) {
          for(var i = 0; i < events.length; i++) {
              if( (   events[i].event === 'RevisionPublished'
                   || events[i].event === 'RevisionPending'
                   || events[i].event === 'RevisionRejected'
                 ) && events[i].returnValues._id === that.web3.utils.padRight(that.web3.utils.fromAscii(spaceId), 64)) {
                  revisions[events[i].returnValues._hash] = {
                      'hash': events[i].returnValues._hash,
                      'parent': events[i].returnValues._parent_hash || '',
                      'author': events[i].returnValues._author,
                      'state': that.convertEventToState(events[i].event),
                      'timestamp': Number(events[i].returnValues._timestamp)
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
    RegistryAbstract.prototype.convertState = function (id) {
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

    RegistryAbstract.prototype.convertEventToState = function (event) {

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

    module.exports = RegistryAbstract;
})();
