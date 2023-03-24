// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./LynxWallet.sol";
import "./IExecutor.sol";

contract LynxWalletFactory {

    event LynxWalletCreateRequest(bytes32 sender, uint256 indexed vote, uint256 indexed block);
    event LynxWalletCreated(address indexed walletAddress, uint256 indexed block);
    
    mapping(bytes32 => address) public getLynxWalletForHandle;
    mapping(address => string[]) private eoaMempoolSocialHandles;
    mapping(bytes32 => bool) private inMempool;
    // How many handles (eoa, social1, social2) have supported
    mapping(address => uint256) public handlesBackingCount;

    mapping(address => bool) public lynxWallet;
 
    address public immutable executor;

    bytes32 public immutable DOMAIN_SEPARATOR;
    bytes32 public immutable CREATE_TYPEHASH;

    modifier onlyExecutor {
        require(msg.sender == executor,  "UNAUTH");
        _;
    }
    
    constructor(address _exec) {
        executor = _exec;
        uint chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256('EIP712Domain(string version,uint256 chainId,address verifyingContract)'),
                keccak256(bytes('1')),
                chainId,
                address(this)
            )
        );
        CREATE_TYPEHASH = keccak256(abi.encodePacked("Create(address eoa, string username)"));
    }

    function flush(bytes32 sender) external {
        require(msg.sender == IExecutor(executor).owner(), "FORBID");
        getLynxWalletForHandle[sender] = address(0);
    }


    function create() external {
        require(msg.sender != executor, "Only EOA");
        bytes32 addressHash = keccak256(abi.encodePacked(msg.sender));
        require(getLynxWalletForHandle[addressHash] == address(0), "Wallet exists");
        require(handlesBackingCount[msg.sender] == 0, "Already in process");
        handlesBackingCount[msg.sender] = 1;
        emit LynxWalletCreateRequest(addressHash, handlesBackingCount[msg.sender], block.number);
    }

    function getMessageHash(address eoa, string memory username) public view returns(bytes32) {
        return keccak256(abi.encodePacked(DOMAIN_SEPARATOR,CREATE_TYPEHASH, eoa, username));
    }

    function _authenticateCreateRequest(address eoa, string memory username, uint8 v, bytes32 r, bytes32 s) internal view {
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19Ethereum Signed Message:\n32',
                keccak256(abi.encodePacked(DOMAIN_SEPARATOR,CREATE_TYPEHASH, eoa, username))
            )
        );
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == eoa, "Failed");
    }


    function _createWallet(address eoa) internal returns(address) {
        string[] memory handles = eoaMempoolSocialHandles[eoa];
        address wallet = address(new LynxWallet(eoa, executor, handles[0], handles[1]));
        lynxWallet[wallet] = true;
        bytes32 username0Hash = keccak256(abi.encodePacked(handles[0]));
        bytes32 username1Hash = keccak256(abi.encodePacked(handles[1]));
        getLynxWalletForHandle[keccak256(abi.encodePacked(eoa))] = wallet;
        getLynxWalletForHandle[username0Hash] = wallet;
        getLynxWalletForHandle[username1Hash] = wallet;

        // Reseting 
        delete eoaMempoolSocialHandles[eoa];
        inMempool[username0Hash] = false;
        inMempool[username1Hash] = false;
        handlesBackingCount[eoa] = 0;
        emit LynxWalletCreated(wallet, block.number);
        return wallet;
    }

    function updateEOAForLynxWallet(address prevEOA, address newEOA) external {
        require(lynxWallet[msg.sender], "Only lynx wallet can update");
        getLynxWalletForHandle[keccak256(abi.encodePacked(prevEOA))] = address(0);
        getLynxWalletForHandle[keccak256(abi.encodePacked(newEOA))] = msg.sender;
    }
    

    function authenticateCreateRequest(address eoa, string memory username, uint8 v, bytes32 r, bytes32 s) external onlyExecutor returns(address) {
        
        require(handlesBackingCount[eoa] > 0, "No create request");
        bytes32 addressHash = keccak256(abi.encodePacked(eoa));
        bytes32 usernameHash = keccak256(abi.encodePacked(username));
        require(getLynxWalletForHandle[addressHash] == address(0) || 
            getLynxWalletForHandle[usernameHash] == address(0), "Wallet exists");
        require(!inMempool[usernameHash], "Already in mempool");        
        _authenticateCreateRequest(eoa, username, v, r, s);
        eoaMempoolSocialHandles[eoa].push(username);
        inMempool[usernameHash] = true;
        handlesBackingCount[eoa] += 1;
        emit LynxWalletCreateRequest(usernameHash, 
            handlesBackingCount[eoa], 
            block.number
        );
        if (handlesBackingCount[eoa] == 3) {
            return _createWallet(eoa);
        }
        return address(0);
  
    }
   
    

}