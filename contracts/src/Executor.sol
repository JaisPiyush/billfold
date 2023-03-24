// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./LynxWalletFactory.sol";
import "./ILynxWallet.sol";

contract Executor {

    event TxnCallSubmitted(bytes4 indexed func, bytes32 indexed txnHash, address indexed exec);
    event ExecutorRegisterd(address indexed exec);

    mapping(address => bool) public isRegisterdExecutor;
    uint256 public totalExecutors = 0;

    // bytes32 keccak256(txnHash, data)
    mapping(bytes32 => uint256) private callSubmissionCount;
    // bytes32 keccack256(txnHash, msg,sender)
    mapping(bytes32 => bool) private hasCallSubmitted;
    // bytes32 keccack256(txnHash, data)
    mapping(bytes32 => bool) public hasCallExecuted;

    address public immutable factory;
    address public immutable owner;


    modifier onlyRegisterdExecutor {
        require(isRegisterdExecutor[msg.sender], "NotReg");
        _;
    }

    constructor(address exec) {
        owner = msg.sender;
        factory  = address(new LynxWalletFactory(address(this)));
        _registerExecutor(exec);
    }
    
    function _isPassingVoteCount(uint256 vote) internal view returns(bool) {
        return (vote * 100) >= totalExecutors * 51;
    }


    function _registerExecutor(address exec) internal {
        isRegisterdExecutor[exec] = true;
        totalExecutors += 1;
        emit ExecutorRegisterd(exec);
    }

    function registerExecutor(address exec) external onlyRegisterdExecutor {
        _registerExecutor(exec);
    }

    function _perform_consensus(bytes32 txnHash, bytes4 sig, bytes memory data) 
        internal returns(bytes32 callKey) {
        callKey = keccak256(abi.encodePacked(txnHash, data));
        require(!hasCallExecuted[callKey], "Already executed");
        bytes32 hasCallSubmittedKey = keccak256(abi.encodePacked(txnHash, msg.sender));
        require(!hasCallSubmitted[hasCallSubmittedKey], "Duplicate");
        hasCallSubmitted[hasCallSubmittedKey] = true;
        callSubmissionCount[callKey] += 1;
        emit TxnCallSubmitted(sig, txnHash, msg.sender);
    }


    function lynx_create(bytes32 txnHash, address eoa, string memory username, uint8 v, 
        bytes32 r, bytes32 s) external onlyRegisterdExecutor returns(address) {
            bytes32 callKey = _perform_consensus(txnHash, msg.sig, msg.data);
            if (_isPassingVoteCount(callSubmissionCount[callKey])) {
                address wallet = LynxWalletFactory(factory).authenticateCreateRequest(eoa, username, v, r, s);
                hasCallExecuted[callKey] = true;
                return wallet;
            }
            return address(0);
    }

    function lynx_call(bytes32 txnHash, bytes32 sender, address to,
        uint256 value, bytes memory data)
        external onlyRegisterdExecutor returns(bytes memory) {
            bytes32 callKey = _perform_consensus(txnHash, msg.sig, msg.data);
            if (_isPassingVoteCount(callSubmissionCount[callKey])){
                bool success; bytes memory ret;
                LynxWalletFactory _fac = LynxWalletFactory(factory);
                if (to == address(0) || _fac.lynxWallet(to)) {
                    to = _fac.getLynxWalletForHandle(sender);
                    require(_fac.getLynxWalletForHandle(sender) == to, "Cannot call");
                    (success, ret) = address(to).call{value:value}(data);
                } else {
                    address wallet = _fac.getLynxWalletForHandle(sender);
                    ret = ILynxWallet(wallet).call(to, value, data);
                    success = true;
                }
                require(success, "Failed Lynx call");
                return ret;
            }
            return new bytes(0);
    }


    

}