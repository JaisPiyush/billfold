import { decode } from "https://deno.land/std@0.180.0/encoding/base64.ts";
import "https://deno.land/std@0.181.0/dotenv/load.ts";
import { Executor__factory } from "../abi/factories/Executor__factory.ts";
import { LynxWalletFactory__factory } from "../abi/factories/LynxWalletFactory__factory.ts";
import type { Executor } from "../abi/Executor.ts";
import type { LynxWalletFactory } from "../abi/LynxWalletFactory.ts";
import { ethers } from "ethers";
import { LynxCallOp, LynxCreateOp, UserOp } from "./types.ts";

export async function fetchTxns(): Promise<string | undefined> {
  const cmd = Deno.run({
    cmd: ["python3", "scraper/main.py"],
    stderr: "piped",
    stdout: "piped",
  });

  const status = await cmd.status();
  if (!status.success) {
    return;
  }

  const output = new TextDecoder().decode(await cmd.output());
  cmd.close();
  return output;
}

function getDecodedData(data: string): string {
  const decodedBinary = decode(data);
  return new TextDecoder().decode(decodedBinary);
}

export class LynxTransactionExecutor {
  readonly executor: Executor;
  readonly factory: LynxWalletFactory;
  readonly wallet: ethers.Wallet;
  readonly provider: ethers.providers.JsonRpcProvider;
  readonly timeInterval = 5000;

  constructor() {
    const executorAddr = Deno.env.get("EXECUTOR_ADDRESS");
    const factoryAddr = Deno.env.get("FACTORY_ADDRESS");
    const rpc = Deno.env.get("RPC_URL");
    const privateKey = Deno.env.get("PRIVATE_KEY");

    if (
      executorAddr === undefined ||
      factoryAddr === undefined ||
      rpc === undefined ||
      privateKey === undefined
    ) {
      throw new Error("missing envs");
    }
    this.provider = new ethers.providers.JsonRpcProvider(rpc);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.executor = Executor__factory.connect(executorAddr, this.wallet);
    this.factory = LynxWalletFactory__factory.connect(factoryAddr, this.wallet);
  }

  public async getSignedProof(
    eoa: string,
    username: string
  ): Promise<[number, string, string]> {
    const hash = await this.factory.getMessageHash(eoa, username);
    const signature = await this.wallet.signMessage(
      ethers.utils.arrayify(hash)
    );
    const splittedSignature = ethers.utils.splitSignature(signature);
    return [splittedSignature.v, splittedSignature.r, splittedSignature.s];
  }

  public getTxnHash(url: string): string {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(url));
  }

  public getSenderBytes(username: string): string {
    if (username.indexOf("0x") === 0) {
      return ethers.utils.keccak256(ethers.utils.arrayify(username));
    }
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(username));
  }

  public async lynxCreate(
    url: string,
    username: string,
    op: LynxCreateOp
  ): Promise<string> {
    const txHash = this.getTxnHash(url);
    await this.executor.lynx_create(
      txHash,
      op.params.eoa,
      username,
      op.params.v,
      op.params.r,
      op.params.s
    );
    return txHash;
  }

  public async lynxCall(
    url: string,
    username: string,
    ops: LynxCallOp
  ): Promise<string> {
    const txHash = this.getTxnHash(url);
    const sender = this.getSenderBytes(username);
    await this.executor.lynx_call(
      txHash,
      sender,
      ops.params.to || ethers.constants.AddressZero,
      ethers.BigNumber.from(ops.params.value || 0),
      ops.params.data || ""
    );
    return txHash;
  }

  public async flush(username: string): Promise<void> {
    await this.factory.flush(this.getSenderBytes(username));
  }

  public async getLynxWalletAddress(username: string): Promise<string> {
    const sender = this.getSenderBytes(username);
    return await this.factory.getLynxWalletForHandle(sender);
  }

  public async consumeSingleTxn(
    url: string,
    data: [string, string]
  ): Promise<void> {
    const decoded = JSON.parse(getDecodedData(data[0])) as UserOp;
    if (
      decoded.method === "lynx_create" &&
      decoded.params.eoa !== undefined &&
      decoded.params.v !== undefined &&
      decoded.params.r !== undefined &&
      decoded.params.s !== undefined
    ) {
      await this.lynxCreate(url, data[1], decoded as LynxCreateOp);
    } else if (
      decoded.method === "lynx_call" &&
      decoded.params.data !== undefined
    ) {
      await this.lynxCall(url, data[1], decoded);
    }
  }

  public async consume(): Promise<void> {
    const txnsString = await fetchTxns();

    if (txnsString === undefined) return;
    const txns = JSON.parse(txnsString) as Record<string, [string, string]>;
    if (Object.keys(txns).length > 0) {
      console.log("Fetched ", Object.keys(txns).length, " transactions");
    }
    for (const [url, txn] of Object.entries(txns)) {
      if (txn[0].length === 0) {
        continue;
      } else {
        this.consumeSingleTxn(url, txn);
      }
    }
  }

  public async poll() {
    await this.consume();
    setTimeout(async () => {
      await this.poll();
    }, this.timeInterval);
  }
}

if (import.meta.main) {
  const executor = new LynxTransactionExecutor();
  await executor.poll();
}