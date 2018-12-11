pragma solidity ^0.4.20;

contract ContentSpaceRegistry {

    ////////////////////////////////////////////////////
    // ENUM      
    //
    enum State { PENDING, REJECTED, PUBLISHED }
    ////////////////////////////////////////////////////

    ////////////////////////////////////////////////////
    // Struct      
    //
    struct ContentSpace { 
        bool exists;
        bytes32 id;
        address owner;
        mapping(string => Revision) revisions;
        uint total;
        string lastRevision;
    }   

    struct Revision { 
        bool exists;
        string hash;
        string parent;
        address author;
        State state;
        uint timestamp;
    }
    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Storage      
    //
    mapping(bytes32 => ContentSpace) spaces;
    mapping(address => uint256) public nonces;
    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Events      
    //
    event SpaceCreated(bytes32 _id, address _owner);
    event RevisionPending(bytes32 _id, string _hash, string _parent_hash, address _author, uint _timestamp);
    event RevisionPublished(bytes32 _id, string _hash, string _parent_hash, address _author, uint _timestamp);
    event RevisionApproved(bytes32 _id, string _hash, string _parent_hash, address _author, address _by, uint _timestamp);
    event RevisionRejected(bytes32 _id, string _hash, string _parent_hash, address _author, address _by, uint _timestamp);
    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Constructor      
    //

    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Meta-functions      
    //
    function metaCreateSpace(bytes32 _id, address _owner, bytes _signature, uint256 _nonce) public returns (bool) {
        address signer = getSigner(metaCreateSpaceHash(_id , _owner, _nonce), _signature, _nonce); 

        return createSpace(_id, _owner, signer); 
    }

    function metaCreateSpaceHash(bytes32 _id, address _owner, uint256 _nonce) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), "createSpace", _id, _owner, _nonce));
    }

    function metaPushRevision(bytes32 _id, string _hash, string _parent_hash, bytes _signature, uint256 _nonce) public returns (bool) {
        address signer = getSigner(metaPushRevisionHash(_id , _hash, _parent_hash, _nonce), _signature, _nonce); 

        return pushRevision(_id, _hash, _parent_hash, signer); 
    }

    function metaPushRevisionHash(bytes32 _id, string _hash, string _parent_hash, uint256 _nonce) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), "pushRevision", _id, _hash, _parent_hash, _nonce));
    }

    function metaApproveRevision(bytes32 _id, string _hash, bytes _signature, uint256 _nonce) public returns (bool) {
        address signer = getSigner(metaApproveRevisionHash(_id , _hash, _nonce), _signature, _nonce); 

        return approveRevision(_id, _hash, signer);
    }

    function metaApproveRevisionHash(bytes32 _id, string _hash, uint256 _nonce) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), "approveRevision", _id, _hash, _nonce));
    }

    function metaRejectRevision(bytes32 _id, string _hash, bytes _signature, uint256 _nonce) public returns (bool) {
        address signer = getSigner(metaRejectRevisionHash(_id , _hash, _nonce), _signature, _nonce); 

        return rejectRevision(_id, _hash, signer);
    }

    function metaRejectRevisionHash(bytes32 _id, string _hash, uint256 _nonce) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), "rejectRevision", _id, _hash, _nonce));
    }
    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Public functions      
    //
    function createSpace(bytes32 _id, address _owner) public returns (bool) {
        return createSpace(_id, _owner, msg.sender); 
    }

    function pushRevision(bytes32 _id, string _hash, string _parent_hash) public returns (bool) {
        return pushRevision(_id, _hash, _parent_hash, msg.sender); 
    }

    function approveRevision(bytes32 _id, string _hash) public returns (bool) {
        return approveRevision(_id, _hash, msg.sender); 
    }

    function rejectRevision(bytes32 _id, string _hash) public returns (bool) {
        return approveRevision(_id, _hash, msg.sender); 
    }
    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Internal Functions      
    //
    function createSpace(bytes32 _id, address _owner, address _sender) internal returns (bool) {

        // Validation
        require(_id[0] != 0, "_id cannot be empty");
        require(_owner != address(0), "_owner cannot be 0x");
        require(!spaces[_id].exists, "Space already exists");


        // Storage
        ContentSpace memory space;
        space.exists = true;
        space.id = _id;
        space.total = 0;

        if(_owner == address(0)) {
            space.owner = _sender;
        } else {
            space.owner = _owner;

        }

        spaces[_id] = space; 

        // Events
        emit SpaceCreated(_id, space.owner);

        return true;
    }

    function pushRevision(bytes32 _id, string _hash, string _parent_hash, address _sender) internal returns (bool) {

        // Validation
        require(_id[0] != 0, "_id cannot be empty");
        require(bytes(_hash).length != 0, "_hash cannot be empty");
        require(spaces[_id].exists, "Space doesn't exist");
        require(!spaces[_id].revisions[_hash].exists, "Revision already exists on this space");
        require((spaces[_id].total == 0 && bytes(_parent_hash).length == 0)
             || (spaces[_id].total > 0 && bytes(_parent_hash).length != 0), "First revision cannot have parent");

        // Storage
        Revision memory revision;
        revision.exists = true;
        revision.hash = _hash;
        revision.parent = _parent_hash;
        revision.author = _sender;
        revision.state = (_sender == spaces[_id].owner) ? State.PUBLISHED : State.PENDING;
        revision.timestamp = now;

        spaces[_id].revisions[_hash] = revision;

        // Increase total revision
        spaces[_id].total++;

        // Events
        if(spaces[_id].revisions[_hash].state == State.PUBLISHED) {
            spaces[_id].lastRevision = _hash;
            emit RevisionPublished(_id, _hash, _parent_hash, _sender, revision.timestamp);
        } else {
            emit RevisionPending(_id, _hash, _parent_hash, _sender, revision.timestamp);
        }

        return true;
    }

    function approveRevision(bytes32 _id, string _hash, address _sender) internal returns (bool)  {

        // Validation
        require(_id[0] != 0, "_id cannot be empty");
        require(bytes(_hash).length != 0, "_hash cannot be empty");
        require(spaces[_id].exists, "Space doesn't exist");
        require(spaces[_id].revisions[_hash].exists, "Revisions doesn't exist on this space");
        require(spaces[_id].revisions[_hash].state == State.PENDING, "Revisions isn't pending");
        require(spaces[_id].owner == _sender, "Only owner can approve a revison");


        // Storage
        spaces[_id].revisions[_hash].state = State.PUBLISHED;
        spaces[_id].lastRevision = _hash;

        // Events
        emit RevisionApproved(_id, _hash, spaces[_id].revisions[_hash].parent, spaces[_id].revisions[_hash].author, _sender, spaces[_id].revisions[_hash].timestamp);
        emit RevisionPublished(_id, _hash, spaces[_id].revisions[_hash].parent, spaces[_id].revisions[_hash].author, spaces[_id].revisions[_hash].timestamp);

        return true;
    }   

    function rejectRevision(bytes32 _id, string _hash, address _sender) internal returns (bool)  {
        
        // Validation
        require(_id[0] != 0, "_id cannot be empty");
        require(bytes(_hash).length  != 0, "_hash cannot be empty");
        require(spaces[_id].exists, "Space doesn't exist");
        require(spaces[_id].revisions[_hash].exists, "Revisions doesn't exist on this space");
        require(spaces[_id].revisions[_hash].state == State.PENDING, "Revisions isn't pending");
        require(spaces[_id].owner == _sender, "Only owner can reject a revison");


        // Storage
        spaces[_id].revisions[_hash].state = State.REJECTED;


        // Events
        emit RevisionRejected(_id, _hash, spaces[_id].revisions[_hash].parent, spaces[_id].revisions[_hash].author, _sender, spaces[_id].revisions[_hash].timestamp);

        return true;
    }   
    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Views      
    //
    function getContentSpace(bytes32 _id) public view returns  (bytes32, address, string) {

        require(spaces[_id].exists, "Space doesn't exist");

        return (spaces[_id].id, spaces[_id].owner, spaces[_id].lastRevision); 
    }

    function getRevision(bytes32 _id, string _hash) public view returns  (string, string, address, State, uint) {
        require(spaces[_id].exists, "Space doesn't exist");
        require(spaces[_id].revisions[_hash].exists, "Revisions doesn't exist on this space");

        return (spaces[_id].revisions[_hash].hash, spaces[_id].revisions[_hash].parent, spaces[_id].revisions[_hash].author, spaces[_id].revisions[_hash].state, spaces[_id].revisions[_hash].timestamp);
    }

    function isPending(bytes32 _id, string _hash) public view returns  (bool) {
        require(spaces[_id].exists, "Space doesn't exist");
        require(spaces[_id].revisions[_hash].exists, "Revisions doesn't exist on this space");

        return spaces[_id].revisions[_hash].state == State.PENDING;
    }

    function isPublished(bytes32 _id, string _hash) public view returns  (bool) {
        require(spaces[_id].exists, "Space doesn't exist");
        require(spaces[_id].revisions[_hash].exists, "Revisions doesn't exist on this space");

        return spaces[_id].revisions[_hash].state == State.PUBLISHED;
    }

    function isRejected(bytes32 _id, string _hash) public view returns  (bool) {
        require(spaces[_id].exists, "Space doesn't exist");
        require(spaces[_id].revisions[_hash].exists, "Revisions doesn't exist on this space");

        return spaces[_id].revisions[_hash].state == State.REJECTED;
    }

    function getNonce(address _id) public view returns(uint) {
        return nonces[_id];
    }
    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // UTILS      
    //
    function getSigner(bytes32 _msg, bytes _signature, uint256 _nonce) internal returns (address){

        address signer = recoverSignature(_msg, _signature); 
        
        require(signer != address(0), "cannot recover the signature");
        require(_nonce == nonces[signer], "wrong nonce");

        nonces[signer]++; // Increment the nonce

        return signer;
    }

    function recoverSignature(bytes32 _msg, bytes _signature) internal pure returns (address){
        bytes32 r;
        bytes32 s;
        uint8 v;
        if (_signature.length != 65) {
          return address(0);
        }
        assembly {
          r := mload(add(_signature, 32))
          s := mload(add(_signature, 64))
          v := byte(0, mload(add(_signature, 96)))
        }
        if (v < 27) {
          v += 27;
        }
        if (v != 27 && v != 28) {
          return address(0);
        } else {
          return ecrecover(keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _msg)
          ), v, r, s);
        }
    }
    ////////////////////////////////////////////////////
}