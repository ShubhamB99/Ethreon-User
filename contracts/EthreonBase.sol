pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './SafeMath.sol';

contract Patron {

    using SafeMath for uint;

    // Total patrons on platform
    uint public numPatrons;

    // Mapping to keep track of new patrons
    mapping (address => bool) alreadyRegisteredPatron;

    // Mapping to get all the Creator ID's patron has subscribed to
    mapping (address => address[]) Subscriptions;                                   // See implementation of add vs uint

    // Event flagging a new patron
    event NewPatron();
    // Event for welcome back
    event WelcomeBackPatron();

    modifier isPatronRegistered () {
        require(alreadyRegisteredPatron[msg.sender], "User not registered!");
        _;
    }

    // Function to create a new patron from public address and return success
    function newPatronSignup () public {
        if (alreadyRegisteredPatron[msg.sender]) {
            emit WelcomeBackPatron();
        }
        else {
            alreadyRegisteredPatron[msg.sender] = true;
            numPatrons = numPatrons.add(1);
            emit NewPatron();
        }
    }

    // Function to get total number of creators a patron has subscribed to
    function getSubscriptionCount() public view isPatronRegistered returns (uint) {
        return Subscriptions[msg.sender].length;
    }

    // Function to get all creators a patron has subscribed to
    function getSubscriptions() public view isPatronRegistered returns (address[] memory) {
        return Subscriptions[msg.sender];
    }
}

contract Creator {

    using SafeMath for uint;

    // Structure to store data of a creator
    struct CreatorDatastore {
        address owner;
        string imageHash;
        string contentHash;
    }

    // Total creators on platform
    uint public numCreators;

    // Get all creators for frontend
    address[] public allCreators;

    // Mapping to keep track of new creators
    mapping (address => bool) alreadyRegisteredCreator;

    // Mapping to get data of a creator
    mapping (address => CreatorDatastore) public CreatorData;

    // Event flagging a new creator
    event NewCreator();
    // Event for welcome back
    event WelcomeBackCreator();

    modifier isCreatorRegistered () {
        require(alreadyRegisteredCreator[msg.sender], "Creator not registered!");
        _;
    }

    // Function to create a new creator from public address and return success
    function newCreatorSignup () public {
        if (alreadyRegisteredCreator[msg.sender]) {
            emit WelcomeBackCreator();
        }
        else {
            alreadyRegisteredCreator[msg.sender] = true;
            allCreators.push(msg.sender);
            numCreators = numCreators.add(1);
            CreatorData[msg.sender].owner = msg.sender;
            emit NewCreator();
        }
    }
}