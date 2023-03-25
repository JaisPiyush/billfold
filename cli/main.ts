import { parse } from "https://deno.land/std/flags/mod.ts";
import Prompt from "https://deno.land/x/prompt/mod.ts";
import axiod from "https://deno.land/x/axiod/mod.ts";
import { ethers } from "ethers";
import { decode } from "https://deno.land/std@0.180.0/encoding/base64.ts";
import "https://deno.land/std@0.181.0/dotenv/load.ts";
import { LynxWallet__factory } from "../abi/factories/LynxWallet__factory.ts";
import { LynxWalletFactory__factory } from "../abi/factories/LynxWalletFactory__factory.ts";
import type { LynxWallet } from "../abi/LynxWallet.ts";
import type { LynxWalletFactory } from "../abi/LynxWalletFactory.ts";

const PRIVATE_KEY = Deno.env.get("PRIVATE_KEY") as string;
const factoryAddress = Deno.env.get("FACTORY_ADDRESS") as string;
const rpc = Deno.env.get("RPC_URL") as string;

type ArgsType = { _: string[] } & Record<string, number | boolean | string>;

class LynxCmdHandler {
  readonly provider: ethers.providers.JsonRpcProvider;
  readonly wallet: ethers.Wallet;
  readonly factory: LynxWalletFactory;
  lynxWallet?: LynxWallet;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(rpc);
    this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
    this.factory = LynxWalletFactory__factory.connect(
      factoryAddress,
      this.wallet
    );
  }

  public async run(opts: ArgsType): Promise<void> {
    const args = opts["_"];
    switch (args[0]) {
      case "signMessage":
        return await this.signMessage(opts);
    }
  }

  private _getUint8Array(message: string): Uint8Array {
    return message.indexOf("0x") === 0
      ? ethers.utils.arrayify(message)
      : ethers.utils.toUtf8Bytes(message);
  }

  private async _signMessage(message: string): Promise<string> {
    const digest = this._getUint8Array(message);
    return await this.wallet.signMessage(digest);
  }

  public async signMessage(args: ArgsType): Promise<void> {
    console.log(
      "Signed Message: ",
      await this._signMessage(args["message"] as string),
      "\n"
    );
  }

  public async getLynxWallet(opts: ArgsType): Promise<void> {
    const sender = opts["sender"] || this.wallet.address;
    const res = await this.factory.getLynxWalletForHandle();
  }
}

async function main(args: string[]) {
  const handler = new LynxCmdHandler();
  await handler.run(parse(args));
}

await main(Deno.args);
