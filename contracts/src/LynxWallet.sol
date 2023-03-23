// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract LynxWallet {

    address public eoa;

    address private immutable executor;
    address private immutable factory;

    string public username1;
    string public username2;

    bytes32 public username1Hash;
    bytes32 public username2Hash;

    uint256 public nonce;


    modifier onlyExecutor {
        require(msg.sender == executor, "UnAUTH");
        _;
    }

    modifier onlyFactory {
        require(msg.sender == factory, "UnAUTH");
        _;
    }

    constructor(address _eoa, address _executor, string memory _username1, string memory _username2) {
        eoa = _eoa;
        executor = _executor;
        factory = msg.sender;
        username1 = _username1;
        username2 = _username2;

        username1Hash = keccak256(abi.encodePacked(username1));
        username2Hash = keccak256(abi.encodePacked(username2));
        
    }


    // send function to send native currency
    
    // Recover function to reset EOA

    // call to execute contract calls
    ///  -- Calls directly from EOA (Single factor auth)
    ///  -- Calls with two factor auth (EOA and media)
    ///  -- Calls directly from media (Single factor auth)




}