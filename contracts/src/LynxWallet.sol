// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./ILynxWalletFactory.sol";

contract LynxWallet {

    event SpendingLimitUpdated(uint256 indexed spendingLimit, uint256 indexed timestamp);
    event Transfer(address indexed to, bytes32 indexed sender, uint256 indexed amount);
    event TwoFactorAuthMessageSubmitted(bytes32 indexed sender, uint256 indexed nonce, bytes32 indexed data);
    event ResetEOA(address indexed eoa, uint256 indexed timestamp);

    address public eoa;

    address private immutable executor;
    address private immutable factory;

    string public username1;
    string public username2;

    bytes32 public username1Hash;
    bytes32 public username2Hash;
    bytes32 public nonEOASenderHash;

    uint256 public nonce;

    mapping(bytes32 => uint256) private twoFactorCallCount;
    mapping(bytes32 => bool) private twoFactorCallSubmitted;

    uint256 public spendingLimitPerHandler = 1 ether;

    modifier onlyExecutor {
        require(msg.sender == executor, "UnAUTH");
        _;
    }

    modifier onlyFactory {
        require(msg.sender == factory, "UnAUTH");
        _;
    }

    modifier onlySender {
        require(msg.sender == eoa || msg.sender == executor, "FORBID");
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
        nonEOASenderHash = keccak256(abi.encodePacked(username1Hash, username2Hash));
        
    }


    function _encodeCallRequest(bytes memory data) internal view returns(bytes32) {
        return keccak256(abi.encodePacked(nonce, data));
    }

    function isTwoFactorAuthenticated(bytes calldata data) public view returns(bool) {
        return twoFactorCallCount[_encodeCallRequest(data)] == 2;
    }


    function _authenticateTwoFactor(bytes32 sender, bytes calldata data) internal returns(bool) {
        bytes32 encodedCallData = _encodeCallRequest(data);
        bytes32 twoFactorCallSubmittedKey = keccak256(abi.encodePacked(sender, nonce, data));
        require(!twoFactorCallSubmitted[twoFactorCallSubmittedKey], "Already submitted");
        twoFactorCallSubmitted[twoFactorCallSubmittedKey] = true;
        if (twoFactorCallCount[encodedCallData] == 1) {
            // Update and return true
            twoFactorCallCount[encodedCallData] = 2;
            emit TwoFactorAuthMessageSubmitted(sender, nonce, encodedCallData);
            nonce = nonce + 1;
            return true;
        }else if(twoFactorCallCount[encodedCallData] == 0) {
           twoFactorCallCount[encodedCallData] = 1;
           emit TwoFactorAuthMessageSubmitted(sender, nonce, encodedCallData);
           return false;
        }else {
            require(false, "Call execution completed");
        }
    }

    function getSender() internal view returns(bytes32){
        if (msg.sender == executor) {
            return nonEOASenderHash;
        }
        return keccak256(abi.encodePacked(msg.sender));
    }

    // Update spending limit
    function updateSpendingLimit(uint256 spendingLimit) external onlySender {
        bytes32 sender = getSender();
        if(_authenticateTwoFactor(sender, msg.data)) {
            spendingLimitPerHandler = spendingLimit;
            emit SpendingLimitUpdated(spendingLimit, block.timestamp);
        }

    }

    // send function to send native currency
    function send(address to, uint256 amount) external onlySender {
        bytes32 sender = getSender();
        if (amount <= spendingLimitPerHandler || _authenticateTwoFactor(sender, msg.data)){
            (bool success, ) = payable(to).call{value: amount}(new bytes(0));
            require(success, "Transfer failed");
            emit Transfer(to, sender, amount);
            return;
        }
    }

    receive() external payable {}

    fallback() external payable {}

    
    // Recover function to reset EOA
    function recoverEOA(bytes32 sender, address newEOA) external onlyExecutor {
        if (_authenticateTwoFactor(sender, msg.data)) {
            ILynxWalletFactory(factory).updateEOAForLynxWallet(eoa, newEOA);
            eoa = newEOA;
            emit ResetEOA(newEOA, block.timestamp);
        }
    }

 
    // call to execute contract calls
    ///  -- Calls directly from EOA (Single factor auth)
    function call(address to, uint256 value, bytes memory data) external onlySender returns(bytes memory) {
        bytes32 sender = getSender();
        if (value <= spendingLimitPerHandler || _authenticateTwoFactor(sender, msg.data)){
            (bool success, bytes memory ret) = address(to).call{value: value}(data);
            require(success, "Call failed");
            return ret;
        }
        return new bytes(0);
    }
    ///  -- Calls with two factor auth (EOA and media)
    ///  -- Calls directly from media (Single factor auth)




}