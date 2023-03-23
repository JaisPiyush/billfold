// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./LynxWallet.sol";

contract LynxWalletFactory {

    event LynxWalletCreated(address indexed walletAddress, uint256 indexed block);
    
    mapping(bytes32 => address) public getLynxWalletForHandle;
    mapping(address => string[]) private eoaMempoolSocialHandles;
    mapping(bytes32 => bool) private inMempool;
    // How many handles (eoa, social1, social2) have supported
    mapping(address => uint256) public handlesBackingCount;
 
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


    function create(address eoa) external {
        bytes32 addressHash = keccak256(abi.encodePacked(eoa));
        require(getLynxWalletForHandle[addressHash] == address(0), "Wallet exists");
        handlesBackingCount[eoa] = 1;
    }

    function _authenticateCreateRequest(address eoa, string memory username, uint8 v, bytes32 r, bytes32 s) internal view {
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                DOMAIN_SEPARATOR,
                keccak256(abi.encode(CREATE_TYPEHASH, eoa, username))
            )
        );
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0) && recoveredAddress == eoa, "Failed");
    }


    function _createWallet(address eoa) internal {
        string[] memory handles = eoaMempoolSocialHandles[eoa];
        address wallet = address(new LynxWallet(eoa, executor, handles[0], handles[1]));
        bytes32 username0Hash = keccak256(abi.encodePacked(handles[0]));
        bytes32 username1Hash = keccak256(abi.encodePacked(handles[1]));
        getLynxWalletForHandle[keccak256(abi.encodePacked(eoa))] = wallet;
        getLynxWalletForHandle[username0Hash] = wallet;
        getLynxWalletForHandle[username1Hash] = wallet;
        emit LynxWalletCreated(wallet, block.number);
    }
    

    function authenticateCreateRequest(address eoa, string memory username, uint8 v, bytes32 r, bytes32 s) external onlyExecutor {
        bytes32 addressHash = keccak256(abi.encodePacked(eoa));
        bytes32 usernameHash = keccak256(abi.encodePacked(username));
        require(getLynxWalletForHandle[addressHash] == address(0), "Wallet exists");
        require(getLynxWalletForHandle[usernameHash] == address(0), "Wallet exists");
        require(!inMempool[usernameHash], "Already in mempool");        
        _authenticateCreateRequest(eoa, username, v, r, s);
        eoaMempoolSocialHandles[eoa].push(username);
        inMempool[usernameHash] = true;
        handlesBackingCount[eoa] += 1;

        if (handlesBackingCount[eoa] == 3) {
            _createWallet(eoa);
        }

    }
   
    

}