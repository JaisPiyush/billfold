// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;


contract TransactionManager {

    event Transaction(bytes32 indexed txnHash, uint256 indexed block, uint256 indexed timestamp);
    event WhiteListedTxnCreator(address indexed creator,uint256 indexed block, uint256 indexed timestamp );


    struct TxnData {
        bytes data;
        bytes ret;
    }

    mapping(address => bool) public whitelistedTxnCreator;
    mapping(address => bool) private canWhiteListTxnCreator;
    mapping(bytes32 => bool) public txnStatus;
    mapping(bytes32 => TxnData) public txnData;

    modifier onlyTxnCreator {
        require(whitelistedTxnCreator[msg.sender], "UnAUTH");
        _;
    }


    constructor(address factory) {
        canWhiteListTxnCreator[factory] = true;
        _whitelistTxnCreator(factory);

    }

    function _whitelistTxnCreator(address creator) internal {
        whitelistedTxnCreator[creator] = true;
        emit WhiteListedTxnCreator(creator, block.number, block.timestamp);
    }

    function whiteListTxnCreator(address creator) external {
        require(canWhiteListTxnCreator[msg.sender], "Cannot whitelist");
        _whitelistTxnCreator(creator);
    }

    // function addTxn(bytes32 txnHash, bytes memory data, bytes memory ret) external onlyTxnCreator {
    //     txnStatus[txnHash] = 
    // }

    
}