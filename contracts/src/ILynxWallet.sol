// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;


interface ILynxWallet {
    function call(address to, uint256 value, bytes memory data) external returns(bytes memory);
}