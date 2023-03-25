import { ethers } from "ethers";


const username = "elonmusk";

const encoded = ethers.utils.defaultAbiCoder.encode(
  ["bytes"],
  [ethers.utils.toUtf8Bytes(username)]
);
// console.log(encoded);

// const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(username));

console.log(
  ethers.utils.defaultAbiCoder.encode(
    ["address"],
    [ethers.utils.toUtf8Bytes("0x")]
  )
);

async function test() {
  // const exec = new LynxTransactionExecutor();
  const url1 = "https://twitter.com/elonmusk/status/1639138603371491329";
  const url2 = "https://twitter.com/wwwjim/status/1639106974230134784";
  const username = "https://twitter.com/elonmusk";
  const username2 = "https://twitter.com/wwwjim";
  // const eoa = await exec.wallet.getAddress();
}

// await test();
