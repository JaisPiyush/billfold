// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

interface ILynxWalletFactory {
    function updateEOAForLynxWallet(address prevEOA, address newEOA) external;
}