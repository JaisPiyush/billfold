async function runScript() {
  const contracts = ["Executor.sol", "LynxWallet.sol", "LynxWalletFactory.sol"];

  for (const contract of contracts) {
    const cmd = Deno.run({
      cmd: [
        "typechain",
        "--target",
        "ethers-v5",
        "--out-dir",
        "./abi/",
        `./contracts/out/${contract}/*.json`,
      ],
      stdout: "piped",
      stderr: "piped",
    });
    const status = await cmd.status();
    if (status.success) {
      console.log(`Compilation completed ${contract}`);
    } else {
      console.error(`Compilation failed ${contract}`);
    }
    cmd.close();
  }
}

if (import.meta.main) {
  runScript();
}
