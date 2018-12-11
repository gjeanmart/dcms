'use strict';
(async () => {

  let ContentSpaceRegistry = artifacts.require('ContentSpaceRegistry.sol');
  let catchRevert = require('./exceptions.js').catchRevert;
  let EthUtil = require('ethereumjs-util');
  let instance;

  contract('ContentSpaceRegistry', function(accounts) {

    before(function() {
        return ContentSpaceRegistry.deployed().then(function(inst) {
            instance = inst;
        });
    });

    /*******************
     * HAPPY PATH
     ********************/
    it('should create a space', async () => {
        const spaceId = 'HelloWorld0';
        const owner = accounts[0];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);
    });

    it('should publish a revision', async () => {
        const spaceId = 'HelloWorld1';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx1';
        const owner = accounts[0];
        const author = accounts[0];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision = await pushRevision(spaceId, revisionHash, null, {'from': author});
        assert.equal(revision.hash, revisionHash);
        assert.equal(revision.author, author);
        assert.equal(revision.state, 'PUBLISHED');
    });

    it('should be pending', async () => {
        const spaceId = 'HelloWorld2';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx2';
        const owner = accounts[0];
        const author = accounts[1];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision = await pushRevision(spaceId, revisionHash, null,{'from': author});
        assert.equal(revision.hash, revisionHash);
        assert.equal(revision.author, author);
        assert.equal(revision.state, 'PENDING');
    });

    it('should be published after approval', async () => {
        const spaceId = 'HelloWorld3';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx3';
        const owner = accounts[0];
        const author = accounts[1];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision1 = await pushRevision(spaceId, revisionHash, null,{'from': author});
        assert.equal(revision1.hash, revisionHash);
        assert.equal(revision1.author, author);
        assert.equal(revision1.state, 'PENDING');

        const revision2 = await approveRevision(spaceId, revisionHash, {'from': owner});
        assert.equal(revision2.hash, revisionHash);
        assert.equal(revision2.author, author);
        assert.equal(revision2.state, 'PUBLISHED');
    });

    it('should be rejected after rejection', async () => {
        const spaceId = 'HelloWorld4';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx4';
        const owner = accounts[0];
        const author = accounts[1];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision1 = await pushRevision(spaceId, revisionHash, null,{'from': author});
        assert.equal(revision1.hash, revisionHash);
        assert.equal(revision1.author, author);
        assert.equal(revision1.state, 'PENDING');

        const revision2 = await rejectRevision(spaceId, revisionHash, {'from': owner});
        assert.equal(revision2.hash, revisionHash);
        assert.equal(revision2.author, author);
        assert.equal(revision2.state, 'PUBLISHED');
    });

    it('should have two revisions', async () => {
        const spaceId = 'HelloWorld20';
        const revisionHash1 = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx4';
        const revisionHash2 = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx5';
        const owner = accounts[0];
        const author = accounts[0];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision1 = await pushRevision(spaceId, revisionHash1, null,{'from': author});
        assert.equal(revision1.hash, revisionHash1);
        assert.equal(revision1.parent, '');
        assert.equal(revision1.author, author);
        assert.equal(revision1.state, 'PUBLISHED');

        const revision2 = await pushRevision(spaceId, revisionHash2, revisionHash1,{'from': author});
        assert.equal(revision2.hash, revisionHash2);
        assert.equal(revision2.parent, revisionHash1);
        assert.equal(revision2.author, author);
        assert.equal(revision2.state, 'PUBLISHED');
    });

    it('should have a lastRevision', async () => {
        const spaceId = 'HelloWorld21';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx1';
        const owner = accounts[0];
        const author = accounts[0];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision = await pushRevision(spaceId, revisionHash, null, {'from': author});
        assert.equal(revision.hash, revisionHash);
        assert.equal(revision.author, author);
        assert.equal(revision.state, 'PUBLISHED');

        const testSpace = await getSpace(spaceId);
        assert.equal(testSpace.id, spaceId);
        assert.equal(testSpace.owner, owner);
        assert.equal(testSpace.lastRevision, revisionHash);
    });


    /*******************
     * EXCEPTION
     ********************/
    it('should throw an exception because space already exists', async () => {
      const spaceId = 'HelloWorld5';
      const owner = accounts[0];

      const space = await createSpace(spaceId, owner, {'from': owner});
      assert.equal(space.id, spaceId);
      assert.equal(space.owner, owner);

      await catchRevert(createSpace(spaceId, owner, {'from': owner}));
    });

    it('should throw an exception because space doesn\'t exist', async () => {
        const spaceId = 'HelloWorld6';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx5';
        const owner = accounts[0];
        const author = accounts[0];

        await catchRevert(pushRevision(spaceId, revisionHash, null, {'from': author}));
    });

    it('should throw an exception because revision already exist', async () => {
        const spaceId = 'HelloWorld7';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx7';
        const owner = accounts[0];
        const author = accounts[0];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision = await pushRevision(spaceId, revisionHash, null, {'from': author});
        assert.equal(revision.hash, revisionHash);
        assert.equal(revision.author, author);
        assert.equal(revision.state, 'PUBLISHED');

        await catchRevert(pushRevision(spaceId, revisionHash, null, {'from': author}));
    });

    it('should throw an exception because author can\'t approve revision', async () => {
        const spaceId = 'HelloWorld8';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx8';
        const owner = accounts[0];
        const author = accounts[1];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision = await pushRevision(spaceId, revisionHash, null, {'from': author});
        assert.equal(revision.hash, revisionHash);
        assert.equal(revision.author, author);
        assert.equal(revision.state, 'PENDING');
        
        await catchRevert(approveRevision(spaceId, revisionHash, {'from': author}));
    });

    it('should throw an exception because author can\'t approve revision', async () => {
        const spaceId = 'HelloWorld9';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx9';
        const owner = accounts[0];
        const author = accounts[1];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision = await pushRevision(spaceId, revisionHash, null, {'from': author});
        assert.equal(revision.hash, revisionHash);
        assert.equal(revision.author, author);
        assert.equal(revision.state, 'PENDING');
        
        await catchRevert(approveRevision(spaceId, revisionHash, {'from': author}));
    });

    it('should throw an exception because author revision doesn\'t exist', async () => {
        const spaceId = 'HelloWorld10';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx10';
        const owner = accounts[0];
        const author = accounts[1];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);
        
        await catchRevert(approveRevision(spaceId, revisionHash, {'from': owner}));
    });

    it('should throw an exception because author revision not pending', async () => {
        const spaceId = 'HelloWorld11';
        const revisionHash = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx11';
        const owner = accounts[0];
        const author = accounts[0];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision = await pushRevision(spaceId, revisionHash, null, {'from': author});
        assert.equal(revision.hash, revisionHash);
        assert.equal(revision.author, author);
        assert.equal(revision.state, 'PUBLISHED');
        
        await catchRevert(approveRevision(spaceId, revisionHash, {'from': author}));
    });


    it('should not accept a second revision without parent', async () => {
        const spaceId = 'HelloWorld12';
        const revisionHash1 = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx4';
        const revisionHash2 = 'zdpuAsTWohStBokD3tDRuFDSpveBTtQrZbfHZKjjBoLYRrvx5';
        const owner = accounts[0];
        const author = accounts[0];

        const space = await createSpace(spaceId, owner, {'from': owner});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);

        const revision1 = await pushRevision(spaceId, revisionHash1, null, {'from': author});
        assert.equal(revision1.hash, revisionHash1);
        assert.equal(revision1.parent, '');
        assert.equal(revision1.author, author);
        assert.equal(revision1.state, 'PUBLISHED');

        await catchRevert(pushRevision(spaceId, revisionHash2, null, {'from': author}));
    });


    /*******************
     * META TRANSACTION
     ********************/
    it('should create a space with metatransaction', async () => {
        const etherless = {
          "privatekey": "43f2ee33c522046e80b67e96ceb84a05b60b9434b0ee2e3ae4b1311b9f5dcc46",
          "account": "0xbd2e9caf03b81e96ee27ad354c579e1310415f39"
        }

        const spaceId = 'HelloWorld Meta1';
        const owner = etherless.account;
        const relayer = accounts[1];

        const nonce = await getNonce(owner);
        const hash = await metaCreateSpaceHash(spaceId, owner, nonce);
        const signature = await sign(etherless.privatekey, hash);

        const space = await metaCreateSpace(spaceId, owner, nonce, signature, {'from': relayer});
        assert.equal(space.id, spaceId);
        assert.equal(space.owner, owner);
    })
  });



  async function getInstance() {

    return new Promise( (resolve, reject) => {
      ContentSpaceRegistry.deployed().then(function(instance) {
         resolve(instance)
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  async function createSpace(spaceId, owner, args) {

    return new Promise( (resolve, reject) => {
      instance.createSpace(spaceId, owner, args).then(async function(tx) {
        resolve(await getSpace(spaceId));
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  async function getSpace(spaceId) {

    return new Promise(async (resolve, reject) => {
      instance.getContentSpace.call(spaceId).then(function(result) {
        resolve({
          'id': web3.toAscii(result[0]).replace(/\u0000/g, ''),
          'owner': result[1],
          'lastRevision': result[2]
        });
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  async function pushRevision(spaceId, revisionHash, parentRevisionHash, args) {

    return new Promise( (resolve, reject) => {
      instance.pushRevision(spaceId, revisionHash, parentRevisionHash || '', args).then(async function(tx) {
        resolve(await getRevision(spaceId, revisionHash));
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  async function approveRevision(spaceId, revisionHash, args) {

    return new Promise( (resolve, reject) => {
      instance.approveRevision(spaceId, revisionHash, args).then(async function(tx) {
        resolve(await getRevision(spaceId, revisionHash));
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  async function rejectRevision(spaceId, revisionHash, args) {

    return new Promise( (resolve, reject) => {
      instance.approveRevision(spaceId, revisionHash, args).then(async function(tx) {
        resolve(await getRevision(spaceId, revisionHash));
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  async function getRevision(spaceId, revisionHash) {

    return new Promise(async (resolve, reject) => {
      instance.getRevision.call(spaceId, revisionHash).then(function(result) {
        resolve({
          'hash': result[0],
          'parent': result[1],
          'author': result[2],
          'state': convertState(result[3].toNumber())
        });
      }).catch(function (error) {
        reject(error);
      });
    });
  };


  async function metaCreateSpace(spaceId, owner, nonce, signature, args) {

    return new Promise( (resolve, reject) => {
      instance.metaCreateSpace(spaceId, owner, signature, nonce, args).then(async function(tx) {
        resolve(await getSpace(spaceId));
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  async function metaCreateSpaceHash(spaceId, owner, nonce) {

    return new Promise( (resolve, reject) => {
      instance.metaCreateSpaceHash(spaceId, owner, nonce).then(async function(res) {
        resolve(res);
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  async function getNonce(address) {

    return new Promise( (resolve, reject) => {
      instance.getNonce(address).then(async function(res) {
        resolve(res);
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  async function sign(pk, message) {

    var msgHash = EthUtil.hashPersonalMessage(new Buffer(message));
    var signature = EthUtil.ecsign(msgHash, new Buffer(pk, 'hex')); 
    var signatureRPC = EthUtil.toRpcSig(signature.v, signature.r, signature.s)

    return signatureRPC;
  };


  function convertState(id) {

    switch(id) {
      case 0:
          return 'PENDING';
      case 1:
          return 'REJECTED';
      case 2:
          return 'PUBLISHED';
      default:
          throw 'Bad id'
    } 
  };


})();


