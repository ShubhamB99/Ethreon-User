pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './SafeMath.sol';
import './EthreonBase.sol';

contract Ethreon is Patron, Creator {

    // Structure to store subscribers and their end date
    // struct SubscribersData {
    //     address patronAddress;
    //     uint endSubscription;
    // }

    // Mapping to get all the patrons subscribed to creator
    // mapping (address => SubscribersData[]) Subscribers;
    mapping (address => address[]) Subscribers;
    // Mappings to prevent double subscription
    mapping(address => mapping(address => bool)) isCreatorSubscribed;       // For all patrons
    // mapping(address => mapping(address => bool)) isUserSubscribed;          // For all creators

    // Event flagging new subscription to highlight creator
    event NewSubscription(address _creator);
    // Event to flag already existing subscription
    event AlreadySubscribed();
    // Event flagging addition of creator image
    event ImageAdded();
    // Event flagging addition of content by creator
    event ContentAdded();

    // Function for patron to subscribe to new creator
    function newSubscription(address _creator) public isPatronRegistered {
        require(alreadyRegisteredCreator[_creator], "Not a registered creator!");
        if (isCreatorSubscribed[msg.sender][_creator]) {
            emit AlreadySubscribed();
        }
        else {
            Subscribers[_creator].push(msg.sender);             //SubscribersData(msg.sender, now + 30 days));
            Subscriptions[msg.sender].push(_creator);
            isCreatorSubscribed[msg.sender][_creator] = true;
            emit NewSubscription(_creator);
        }
    }

    // Function to add image for the creator
    function addCreatorImage(string memory _imageHash) public isCreatorRegistered {
        require(bytes(_imageHash).length > 0, "Not a valid image hash!");
        CreatorData[msg.sender].imageHash = _imageHash;
        emit ImageAdded();
    }

    // Function to add content by the creator
    function addCreatorContent(string memory _contentHash) public isCreatorRegistered {
        require(bytes(_contentHash).length > 0, "Not a valid image hash!");
        CreatorData[msg.sender].contentHash = _contentHash;
        emit ContentAdded();
    }

    // Function to return string of content hash to registered patron
    function getContent(address _creator) public view isPatronRegistered returns (string memory ) {
        require(alreadyRegisteredCreator[_creator], "Not a registered creator!");
        // require(Subscribers[_creator].isValue, "No subscribers of this creator yet!");
        address[] memory users = Subscribers[_creator];
        for (uint i = 0; i < users.length; i++) {
            if (users[i] == msg.sender) {
                return CreatorData[_creator].contentHash;
                //if (users[i].endSubscription > now) {
                //    return CreatorData[_creator].contentHash;
                //}
            }
        }
        return "";                // Should never reach here ideally
    }
}