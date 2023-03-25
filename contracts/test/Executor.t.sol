// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Executor.sol";

contract TestExecutor is Test {

    event ExecutorRegisterd(address indexed exec);
    event TxnCallSubmitted(bytes32 indexed txnHash, bytes4 indexed sig, bytes data);
    event LynxWalletCreateRequest(bytes32 sender, bytes handle, uint256 indexed vote, uint256 indexed block);
    event LynxWalletCreated(address walletAddress, address indexed eoa, string indexed handle1, string indexed handle2, uint256 block);

    Executor private executor;
    LynxWalletFactory private factory;
    address e2;
    address e3;
    string username1 = "https://mastodon.social/@GloPan";
    string username2 = "https://mastodon.social/@QasimRashid";

    constructor() {
        executor = new Executor(address(this));
        factory = LynxWalletFactory(executor.factory());
        e2 = vm.addr(24);
        e3 = vm.addr(25);
        executor.registerExecutor(e2);
        executor.registerExecutor(e3);
    }

    function test_registerExecutor_fail() public {
        bytes memory err = "NotReg";
        vm.expectRevert(err);
        vm.prank(vm.addr(1));
        executor.registerExecutor(vm.addr(2));
    }

    function test_registerExecutor() public {
        vm.expectEmit(true, false, false, false);
        emit ExecutorRegisterd(vm.addr(2));
        executor.registerExecutor(vm.addr(2));
    }

    function _get_sign(uint256 key,address eoa, string memory username) internal view returns(uint8 v, bytes32 r, bytes32 s) {

        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19Ethereum Signed Message:\n32',
                keccak256(abi.encodePacked(factory.DOMAIN_SEPARATOR(),factory.CREATE_TYPEHASH(), eoa, username))
            )
        );
        return vm.sign(key, digest);
    }

    function test_lynx_create_consensus() public {
        address eoa = vm.addr(40);
        uint8 v; bytes32 r; bytes32 s;
        vm.prank(eoa);
        factory.create();
        (v,r,s) = _get_sign(40, eoa, username1);
        bytes32 txH1 = keccak256(abi.encodePacked("123"));
        // bytes32 txH2 = keccak256(abi.encodePacked("124"));
        address wallet = executor.lynx_create(
            txH1,
            eoa, username1, v,r,s
        );
        assertEq(wallet, address(0));
        vm.expectEmit(true, true, true, false);
        emit LynxWalletCreateRequest(
            keccak256(abi.encodePacked(username1)),
            abi.encode(username1),
            2, block.number
        );
        vm.prank(e2);
        wallet = executor.lynx_create(
            txH1,
            eoa, username1, v,r,s
        );
        assertEq(wallet, address(0));
    }

    function test_lynx_create() public {
        address eoa = vm.addr(40);
        uint8 v; bytes32 r; bytes32 s;
        vm.prank(eoa);
        factory.create();
        (v,r,s) = _get_sign(40, eoa, username1);
        bytes32 txH1 = keccak256(abi.encodePacked("123"));
        bytes32 txH2 = keccak256(abi.encodePacked("124"));
        address wallet = executor.lynx_create(
            txH1,
            eoa, username1, v,r,s
        );
        assertEq(wallet, address(0));
        vm.expectEmit(true, true, true, false);
        emit LynxWalletCreateRequest(
            keccak256(abi.encodePacked(username1)),
            abi.encode(username1),
            2, block.number
        );
        vm.prank(e2);
        wallet = executor.lynx_create(
            txH1,
            eoa, username1, v,r,s
        );
        assertEq(wallet, address(0));
        // Second username
        (v,r,s) = _get_sign(40, eoa, username2);
        wallet = executor.lynx_create(
            txH2,
            eoa, username2, v,r,s
        );
        assertEq(wallet, address(0));
        
        vm.expectEmit(true, true, true, false);
        emit LynxWalletCreateRequest(
            keccak256(abi.encodePacked(username2)),
            abi.encode(username2),
            3, block.number
        );
        vm.prank(e2);
        wallet = executor.lynx_create(
            txH2,
            eoa, username2, v,r,s
        );
        if (wallet == address(0)) {
            fail();
        }
    }




}