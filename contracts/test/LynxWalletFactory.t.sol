// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/LynxWalletFactory.sol";

contract TestLynxWalletFactory is Test {

    event LynxWalletCreated(address indexed walletAddress, uint256 indexed block);

    LynxWalletFactory private factory;

    constructor(){
        factory = new LynxWalletFactory(address(this));
    }

    function test_create_fail() public {
        bytes memory err = "Only EOA";
        // vm.prank(vm.addr(1));
        vm.expectRevert(err);
        factory.create();
    }

    function test_create_incomplete() public {
        address eoa = vm.addr(1);
        vm.prank(eoa);
        factory.create();
        assertEq(factory.handlesBackingCount(eoa), 1);
    }

    function test_create_fail_without_request() public {
        address eoa = vm.addr(1);
        bytes memory err = "No create request";
        vm.expectRevert(err);
        factory.authenticateCreateRequest(eoa, "https://mastodon.social/@GloPan", 
            3, "", ""
        );
    }

    function _get_sign(uint256 key,address eoa, string memory username) internal view returns(uint8 v, bytes32 r, bytes32 s) {
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19\x01',
                factory.DOMAIN_SEPARATOR(),
                keccak256(abi.encode(factory.CREATE_TYPEHASH(), eoa, username))
            )
        );
        return vm.sign(key, digest);
    }

    function test_authenticateCreateRequest_half() public {
        address eoa = vm.addr(1);
        string memory username = "https://mastodon.social/@GloPan";
        vm.prank(eoa);
        factory.create();
        (uint8 v, bytes32 r, bytes32 s) = _get_sign(1, eoa, username);
        factory.authenticateCreateRequest(eoa, username, v, r, s);
        assertEq(factory.handlesBackingCount(eoa), 2);
    }

    function test_authenticateCreateRequest_duplicate_fail() public {
        address eoa = vm.addr(1);
        string memory username = "https://mastodon.social/@GloPan";
        vm.prank(eoa);
        factory.create();
        (uint8 v, bytes32 r, bytes32 s) = _get_sign(1, eoa, username);
        factory.authenticateCreateRequest(eoa, username, v, r, s);
        assertEq(factory.handlesBackingCount(eoa), 2);
        bytes memory err =  "Already in mempool";
        vm.expectRevert(err);
        factory.authenticateCreateRequest(eoa, username, v, r, s);

    }

    function test_authenticateCreateRequest_success() public {
        address eoa = vm.addr(1);
        string memory username1 = "https://mastodon.social/@GloPan";
        string memory username2 = "https://mastodon.social/@QasimRashid";
        vm.prank(eoa);
        factory.create();
        (uint8 v, bytes32 r, bytes32 s) = _get_sign(1, eoa, username1);
        factory.authenticateCreateRequest(eoa, username1, v, r, s);
        assertEq(factory.handlesBackingCount(eoa), 2);
        (v, r, s) = _get_sign(1, eoa, username2);
        address wallet = factory.authenticateCreateRequest(eoa, username2, v, r, s);
        assertEq(factory.lynxWallet(wallet), true);
        assertEq(factory.getLynxWalletForHandle(keccak256(abi.encodePacked(eoa))), wallet);
        assertEq(factory.getLynxWalletForHandle(keccak256(abi.encodePacked(username1))), wallet);
        assertEq(factory.getLynxWalletForHandle(keccak256(abi.encodePacked(username2))), wallet);
    }



}