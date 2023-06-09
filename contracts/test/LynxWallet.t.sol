// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/LynxWallet.sol";
import "../src/LynxWalletFactory.sol";


contract Demo {

    fallback() external payable {}

    function getAddr() external view returns(address) {
        return address(this);
    }

    function recv() external payable returns(uint256) {
        return msg.value;
    }
}

contract TestLynxWallet is Test {

    event Transfer(address indexed from,address indexed to, uint256 indexed amount);
    event ResetEOA(address indexed from,address indexed eoa, uint256 indexed timestamp);

    LynxWalletFactory private factory;
    Demo demo = new Demo();
    LynxWallet private wallet;
    address private eoa;
    string username1 = "https://mastodon.social/@GloPan";
    string username2 = "https://mastodon.social/@QasimRashid";

    constructor() {
        factory = new LynxWalletFactory(address(this));
        eoa = vm.addr(1);
        vm.prank(eoa);
        factory.create();
        uint8 v; bytes32 r; bytes32 s;
        (v,r,s) = _get_sign(1, eoa, username1);
        factory.authenticateCreateRequest(eoa, username1, v, r, s);
        (v,r,s) = _get_sign(1, eoa, username2);
        address _wallet = factory.authenticateCreateRequest(eoa, username2, v, r, s);
        wallet = LynxWallet(payable(_wallet));
        vm.deal(_wallet, 10 ether);

    }

    function _get_sign(uint256 key,address _eoa, string memory username) internal view returns(uint8 v, bytes32 r, bytes32 s) {
        bytes32 digest = keccak256(
            abi.encodePacked(
                '\x19Ethereum Signed Message:\n32',
                keccak256(abi.encodePacked(factory.DOMAIN_SEPARATOR(),factory.CREATE_TYPEHASH(), eoa, username))
            )
        );
        return vm.sign(key, digest);
    }

    function test_parameters() public {
        assertEq(wallet.eoa(), eoa);
        assertEq(wallet.username1(), username1);
        assertEq(wallet.username2(), username2);
    }

    function test_raw_fund_transfer() public {
        (bool s, bytes memory r) = address(wallet).call{value: 10 ether}("");
        assertEq(s, true);
    }


    function test_send_below_limit() public {
        uint256 value = 0.5 ether;
        address to = vm.addr(2);
        vm.expectEmit(true, true, true, false);
        emit Transfer(address(wallet) , to, value);
        vm.prank(eoa);
        wallet.send(to, value);
        assertEq(address(to).balance, value);
    }

    function test_send_above_limit_seq_fail() public {
        uint256 value = 2 ether;
        address to = vm.addr(2);
        vm.prank(eoa);
        bool transfered = wallet.send(to, value);
        assertEq(transfered, false);
        bytes memory err = "Already submitted";
        vm.expectRevert(err);
        vm.prank(eoa);
        wallet.send(to,value);
    }

    function test_send_above_limit_seq() public {
        uint256 value = 2 ether;
        address to = vm.addr(2);
        vm.prank(eoa);
        bool transfered = wallet.send(to, value);
        assertEq(transfered, false);
        vm.expectEmit(true, true, true, false);
        emit Transfer(address(wallet) , to, value);
        vm.prank(address(this));
        transfered = wallet.send(to,value);
        assertEq(transfered, true);

    }

    function test_updateSpendingLimit() public {
        uint256 limit = 2 ether;
        vm.prank(address(this));
        bool updated = wallet.updateSpendingLimit(limit);
        assertEq(updated, false);
        vm.prank(eoa);
        updated = wallet.updateSpendingLimit(limit);
        assertEq(updated, true);
        assertEq(wallet.spendingLimitPerHandler(), limit);
    }

    function test_recover_eoa_fail() public {
        address newEOA = vm.addr(1000);
        bytes32 eoaHash = keccak256(abi.encodePacked(eoa));
        wallet.recoverEOA(keccak256(abi.encodePacked(username1)), newEOA);
        bytes memory err = "UnAUTH";
        vm.expectRevert(err);
        vm.prank(eoa);
        wallet.recoverEOA(eoaHash, newEOA);
    }

    function test_recover() public {
        address newEOA = vm.addr(1000);
        wallet.recoverEOA(keccak256(abi.encodePacked(username1)), newEOA);
        vm.expectEmit(true, true, false, false);
        emit ResetEOA(address(wallet) , newEOA, block.timestamp);
        wallet.recoverEOA(keccak256(abi.encodePacked(username2)), newEOA);
        assertEq(wallet.eoa(), newEOA);
    }

    function test_call_empty_zero_value() public {
        bytes memory data = abi.encodeWithSelector(Demo.getAddr.selector, abi.encode(""));
        bytes memory ret = wallet.call(address(demo), 0, data);
        address retAddr = abi.decode(ret, (address));
        assertEq(retAddr, address(demo));
    }

    function test_call_with_value()  public {
        uint256 value = 0.5 ether;
        bytes memory data = abi.encodeWithSelector(Demo.recv.selector, abi.encode(""));
        bytes memory ret = wallet.call(address(demo), value, data);
        uint256 retValue = abi.decode(ret, (uint256));
        assertEq(retValue, value);
    }









}
