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
    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Events      
    //
    event SpaceCreated(bytes32 _id, address _owner);
    event RevisionPending(bytes32 _id, string _hash, string _parent_hash, address _author);
    event RevisionPublished(bytes32 _id, string _hash, string _parent_hash, address _author);
    event RevisionApproved(bytes32 _id, string _hash, string _parent_hash, address _by);
    event RevisionRejected(bytes32 _id, string _hash, string _parent_hash, address _by);
    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Constructor      
    //

    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Functions      
    //
	function createSpace(bytes32 _id, address _owner) public {

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
			space.owner = msg.sender;
		} else {
			space.owner = _owner;

		}

		spaces[_id] = space; 

		// Events
		emit SpaceCreated(_id, _owner);
	}

	function pushRevision(bytes32 _id, string _hash, string _parent_hash) public {

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
		revision.author = msg.sender;
		revision.state = (msg.sender == spaces[_id].owner) ? State.PUBLISHED : State.PENDING;
		revision.timestamp = now;

		spaces[_id].revisions[_hash] = revision;

		// Increase total revision
		spaces[_id].total++;

		// Link the last reivision hash to the space
		spaces[_id].lastRevision = _hash;


		// Events
		if(spaces[_id].revisions[_hash].state == State.PUBLISHED) {
			emit RevisionPublished(_id, _hash, _parent_hash, msg.sender);
		} else {
			emit RevisionPending(_id, _hash, _parent_hash, msg.sender);
		}
	}

	function approveRevision(bytes32 _id, string _hash) public {

		// Validation
		require(_id[0] != 0, "_id cannot be empty");
		require(bytes(_hash).length != 0, "_hash cannot be empty");
		require(spaces[_id].exists, "Space doesn't exist");
		require(spaces[_id].revisions[_hash].exists, "Revisions doesn't exist on this space");
		require(spaces[_id].revisions[_hash].state == State.PENDING, "Revisions isn't pending");
		require(spaces[_id].owner == msg.sender, "Only owner can approve a revison");


		// Storage
		spaces[_id].revisions[_hash].state = State.PUBLISHED;


		// Events
		emit RevisionApproved(_id, _hash, spaces[_id].revisions[_hash].parent, msg.sender);
		emit RevisionPublished(_id, _hash, spaces[_id].revisions[_hash].parent, spaces[_id].revisions[_hash].author);
	}	

	function rejectRevision(bytes32 _id, string _hash) public {
		
		// Validation
		require(_id[0] != 0, "_id cannot be empty");
		require(bytes(_hash).length  != 0, "_hash cannot be empty");
		require(spaces[_id].exists, "Space doesn't exist");
		require(spaces[_id].revisions[_hash].exists, "Revisions doesn't exist on this space");
		require(spaces[_id].revisions[_hash].state == State.PENDING, "Revisions isn't pending");
		require(spaces[_id].owner == msg.sender, "Only owner can reject a revison");


		// Storage
		spaces[_id].revisions[_hash].state = State.REJECTED;


		// Events
		emit RevisionRejected(_id, _hash, spaces[_id].revisions[_hash].parent, msg.sender);
	}	
    ////////////////////////////////////////////////////


    ////////////////////////////////////////////////////
    // Views      
    //
    function getContentSpace(bytes32 _id) public view returns  (bytes32, address, string) {

		require(spaces[_id].exists, "Space doesn't exist");

        return (spaces[_id].id, spaces[_id].owner, spaces[_id].lastRevision); 
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

    function getRevision(bytes32 _id, string _hash) public view returns  (string, string, address, State) {
		require(spaces[_id].exists, "Space doesn't exist");
		require(spaces[_id].revisions[_hash].exists, "Revisions doesn't exist on this space");

    	return (spaces[_id].revisions[_hash].hash, spaces[_id].revisions[_hash].parent, spaces[_id].revisions[_hash].author, spaces[_id].revisions[_hash].state);
    }

	////////////////////////////////////////////////////
}