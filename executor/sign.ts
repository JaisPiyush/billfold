import { ethers } from "ethers";

const DOMAIN_SEP =
  "0x232279e4e75de2f8611c6d91ebbc12055a6a9e2221c163734ac8a7f1691b1723";
const CREATE_TYPEHASH =
  "0xabb20bc6692aa7ccc25bc3d0757c9c80ad85e92ee95affec6b59b4d10745e3c7";

const key = "9c693686ac391774dd6c5f633caf79c8cb30e77d9bc4ae39e9cba7c59b184fc0";

const username = "elonmusk";
const wallet = new ethers.Wallet(key);
const eoa = await wallet.getAddress();
const message = `${DOMAIN_SEP}${CREATE_TYPEHASH}${eoa}${username}`;
const digest = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));

console.log(eoa, digest);
const sig = await wallet.signMessage(
  ethers.utils.arrayify(
    "0x6f81146205f88c5587a2ba2a26dbf1332d16252a89fe8bf4fc047d310bf8d844"
  )
);
console.log(sig);
const split = ethers.utils.splitSignature(sig);
console.log(split);
