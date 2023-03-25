// import { parse } from "https://deno.land/std/flags/mod.ts";
import { encode } from "https://deno.land/std@0.180.0/encoding/base64.ts";
import Prompt from "https://deno.land/x/prompt/mod.ts";
import axiod from "https://deno.land/x/axiod/mod.ts";
import { ethers } from "ethers";
import { decode } from "https://deno.land/std@0.180.0/encoding/base64.ts";
import "https://deno.land/std@0.181.0/dotenv/load.ts";
import { LynxWallet__factory } from "../abi/factories/LynxWallet__factory.ts";
import { LynxWalletFactory__factory } from "../abi/factories/LynxWalletFactory__factory.ts";
import type { LynxWallet } from "../abi/LynxWallet.ts";
import type { LynxWalletFactory } from "../abi/LynxWalletFactory.ts";
import { LynxCallOp } from "../executor/types.ts";

const PRIVATE_KEY = Deno.env.get("PRIVATE_KEY") as string;
const factoryAddress = Deno.env.get("FACTORY_ADDRESS") as string;
const rpc = Deno.env.get("RPC_URL") as string;
const nodeUrl = "http://localhost:9090/";

type ArgsType = { _: string[] } & Record<string, string>;

interface WalletInfo {
  address: string;
  eoa: string;
  profile1: string;
  profile2: string;
  spendingLimit: ethers.BigNumber;
}

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
    const wallet = Deno.env.get("LYNX_WALLET_ADDRESS");
    if (wallet !== undefined) {
      this.lynxWallet = LynxWallet__factory.connect(wallet, this.wallet);
    }
  }

  public async run(opts: ArgsType): Promise<any> {
    const args = opts["_"];
    switch (args[0]) {
      case "signMessage":
        return await this.signMessage(opts);
      case "getLynxWallet":
        return await this.getLynxWallet(opts);
      case "getPubKey":
        return this.getPubKey();
      case "loadWallet":
        return this.loadWallet(opts["address"]);
      case "createHash":
        return await this.getMessageHash();
      case "status":
        return await this.getInfo(opts["address"]);
      case "createStatus":
        return await this.getHandlesBackingCount(opts["eoa"]);
      case "flush":
        return await this.flush(opts);
      case "create":
        return await this.create();
      case "send":
        return await this.send();
      case "recover":
        return await this.recover();
      case "help":
        return this.help();
    }
  }

  private help() {
    console.log("Commands for interaction with Lynx");
    console.log(
      `\n\tsignMessage --message :Generates personal signature for message`
    );
    console.log(
      `\n\tgetLynxWallet --sender(default=eoa) :Fetch LynxWallet address related with sender`
    );
    console.log(`\n\tgetPubKey :Calculates the public key of the signer`);
    console.log(
      `\n\tloadWallet --address :Load LynxWallet contract instance for address`
    );
    console.log(
      `\n\tcreateHash :Calculate verification hash for each social media handle`
    );
    console.log(
      `\n\tstatus --address(default=lynx wallet) :Fetch info from the Lynx wallet `
    );
    console.log(
      `\n\tcreateStatus --eoa :Fetch status of LynxWallet creation related with eoa`
    );
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

  private getPubKey() {
    console.log("Public key: ", this.wallet.address);
  }

  public async getLynxWallet(opts: ArgsType): Promise<void> {
    if (opts["sender"] === undefined && this.lynxWallet !== undefined) {
      console.log("Lynx Wallet: ", this.lynxWallet.address);
      return;
    }

    const sender = (opts["sender"] as string) || this.wallet.address;

    // console.log(opts);
    const res = await this.factory.getLynxWalletForHandle(
      ethers.utils.keccak256(this._getUint8Array(sender))
    );
    if (res === ethers.constants.AddressZero) {
      console.error("No Lynx wallet found associated with ", sender);
    } else {
      console.log("Lynx wallet: ", res);
    }
  }

  private async getMyWallet() {
    return await this.factory.getLynxWalletForHandle(
      ethers.utils.keccak256(this._getUint8Array(this.wallet.address))
    );
  }

  private loadWallet(address: string) {
    this.lynxWallet = LynxWallet__factory.connect(address, this.wallet);
    Deno.env.set("LYNX_WALLET_ADDRESS", address);
  }

  private async _getMessageHash(
    eoa: string,
    username: string
  ): Promise<string> {
    return await this.factory.getMessageHash(eoa, username);
  }

  public async getMessageHash(): Promise<string> {
    const answers = await Prompt.prompts([
      {
        type: "text",
        name: "profile",
        message: "Enter user profile url of social media: ",
      },
    ]);
    const hash = await this._getMessageHash(
      this.wallet.address,
      answers["profile"]
    );
    console.log("Calculated hash: ", hash, "\n");
    return hash;
  }

  private async _getInfo(wallet: LynxWallet) {
    return {
      address: wallet.address,
      eoa: await wallet.eoa(),
      profile1: await wallet.username1(),
      profile2: await wallet.username2(),
      spendingLimit: await wallet.spendingLimitPerHandler(),
    } as WalletInfo;
  }

  private printInfo(info: WalletInfo) {
    console.log("Lynx Wallet: ", info.address);
    console.log("EOA: ", info.eoa);
    console.log("Handle1: ", info.profile1);
    console.log("Handle2: ", info.profile2);
    console.log(
      "Spending Limit: ",
      ethers.utils.formatEther(info.spendingLimit),
      "xDai"
    );
  }

  public async getInfo(address?: string) {
    if (address === undefined && this.lynxWallet !== undefined) {
      return this.printInfo(await this._getInfo(this.lynxWallet));
    } else if (address !== undefined) {
      return this.printInfo(
        await this._getInfo(LynxWallet__factory.connect(address, this.wallet))
      );
    } else {
      const res = await this.factory.getLynxWalletForHandle(
        ethers.utils.keccak256(this._getUint8Array(this.wallet.address))
      );
      if (res === ethers.constants.AddressZero) {
        await this.getHandlesBackingCount();
      } else {
        this.loadWallet(res);
        await this.getInfo(res);
      }
    }
  }

  private async create() {
    const wallet = await this.getMyWallet();
    if (wallet !== ethers.constants.AddressZero) {
      console.log("Lynx Wallet: ", wallet);
      return;
    }

    const count = (
      await this.factory.handlesBackingCount(this.wallet.address)
    ).toNumber();

    this.createEOA(count);
    if (count > 0) {
      await this.createProfile(count);
      console.log("Continue the process after some time for updated results");
    }
  }

  private async createEOA(count: number) {
    if (count === 0) {
      const tx = await this.factory.create();
      console.log("Lynx Wallet creation txn hash: ", tx.hash);
      console.log("Continue the process after some time");
    }
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

  private encodeRequest(data: string): string {
    const encoded = new TextEncoder().encode(data);
    return encode(encoded);
  }

  private getEncodedLynxCall(
    data: string,
    value?: ethers.BigNumber,
    to?: string
  ) {
    const op: LynxCallOp = {
      method: "lynx_call",
      params: {
        data: data,
        to: to,
        value: (value || ethers.BigNumber.from(0)).toHexString(),
      },
    };

    return this.encodeRequest(JSON.stringify(op));
  }

  private getEncodedLynxCreate(arr: [number, string, string]): string {
    const data = {
      method: "lynx_create",
      params: {
        eoa: this.wallet.address,
        v: arr[0],
        r: arr[1],
        s: arr[2],
      },
    };
    return this.encodeRequest(JSON.stringify(data));
  }

  private async createProfile(count: number) {
    const answers = await Prompt.prompts([
      {
        type: "text",
        name: "profile",
        message: `${3 - count} Profile url (Twitter | Mastodon)`,
      },
    ]);
    let arr = await this.getSignedProof(
      this.wallet.address,
      answers["profile"]
    );
    console.log(
      "||| Post the below message on unique twitter account or mastodon account |||\n"
    );
    console.log(this.getEncodedLynxCreate(arr));
    const urls = await Prompt.prompts([
      {
        type: "text",
        name: "url",
        message: "URL of the post (wrong URL will lose you the wallet)",
      },
    ]);
    if (urls["url"].length === 0) {
      return;
    }
    await this.submitRequest(urls["url"]);
  }

  private async submitRequest(url: string) {
    console.log(`Submitting the ${url} as the ownership proof`);
    try {
      const res = await axiod.post(nodeUrl, {
        url: url,
      });
      const txHas = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(url));
      console.log(
        `Txn submitted with ${txHas}, complete the process after completion.`
      );
      console.log(`Query ${this.wallet.address} on block explorer for status`);
    } catch (e) {
      console.log("Failing to submit retry again");
      console.debug("Dev: ", e.message);
    }
  }

  private async getHandlesBackingCount(eoa?: string): Promise<number> {
    const count = (
      await this.factory.handlesBackingCount(eoa || this.wallet.address)
    ).toNumber();
    console.log("Create request source count: ", `${count}/3`);
    return count;
  }

  private async flush(opts: ArgsType) {
    const eoaSender = ethers.utils.keccak256(
      this._getUint8Array(opts["address"] || this.wallet.address)
    );

    this.loadWallet(
      await this.factory.getLynxWalletForHandle(
        ethers.utils.keccak256(
          this._getUint8Array(opts["address"] || this.wallet.address)
        )
      )
    );
    const info = await this._getInfo(this.lynxWallet as LynxWallet);
    const u1Hash = ethers.utils.keccak256(this._getUint8Array(info.profile1));
    const u2Hash = ethers.utils.keccak256(this._getUint8Array(info.profile2));

    await this.factory.flush(eoaSender);
    await this.factory.flush(u1Hash);
    await this.factory.flush(u2Hash);
    console.log("Flushed your wallet");
  }

  private async send() {
    const ans = await Prompt.prompts([
      { type: "text", name: "to", message: "to (address): " },
      {
        type: "text",
        name: "value",
        message: "amount of xDai: ",
        defaultValue: "0",
      },
      {
        type: "text",
        name: "from",
        message:
          "If you want to send from social media then enter the profile url (default = pub key)",
        defaultValue: this.wallet.address,
      },
      {
        type: "text",
        name: "wallet",
        message: "Wallet address",
        defaultValue: this.wallet.address,
      },
    ]);
    const wallet = ans["wallet"];
    this.loadWallet(wallet);
    const info = await this._getInfo(this.lynxWallet as LynxWallet);
    const value = ethers.utils.parseEther(ans["value"]);
    if (
      ans["to"].length === 0 ||
      (ans["from"].indexOf("0x") === 0 && ans["from"] !== this.wallet.address)
    ) {
      return;
    }
    if (ans["from"] === this.wallet.address) {
      const tx = await (this.lynxWallet as LynxWallet).send(ans["to"], value);
      console.log("Txn submitted with txn hash: ", tx.hash);
    } else {
      console.log(
        "||| Post the below message on twitter account or mastodon account |||\n"
      );
      const encodedFunctionSig = this.lynxWallet?.interface.encodeFunctionData(
        "send",
        [ans["to"], value]
      );
      console.log(
        this.getEncodedLynxCall(
          encodedFunctionSig as string,
          ethers.BigNumber.from(0),
          info.address
        )
      );
      const urls = await Prompt.prompts([
        {
          type: "text",
          name: "url",
          message: "URL of the post (wrong URL will lose you the wallet)",
        },
      ]);
      await this.submitRequest(urls["url"]);
    }

    if (value > info.spendingLimit) {
      console.log(
        `Amount is greater than spending limit ${ethers.utils.formatEther(
          info.spendingLimit
        )}xDAI`
      );
      console.log(
        "Perform two factor authentication by sending same transaction with other handles (wallet | social)"
      );
    }
  }

  private async recover() {
    const ans = await Prompt.prompts([
      { type: "text", name: "profile", message: "social media profile url" },
      { type: "text", name: "eoa", message: "Public address of new wallet: " },
    ]);
    const wallet = await this.getMyWallet();
    this.loadWallet(wallet);
    console.log(
      "||| Post the below message on unique twitter account or mastodon account |||\n"
    );
    const encodedSig = this.lynxWallet?.interface.encodeFunctionData(
      "recoverEOA",
      [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ans["profile"])),
        ans["eoa"],
      ]
    );
    console.log(
      this.getEncodedLynxCall(
        encodedSig as string,
        ethers.BigNumber.from(0),
        wallet
      )
    );
    const urls = await Prompt.prompts([
      {
        type: "text",
        name: "url",
        message: "URL of the post (wrong URL will lose you the wallet)",
      },
    ]);
    if (urls["url"].length === 0) {
      return;
    }
    await this.submitRequest(urls["url"]);
    console.log("Complete the process with both the handles");
  }

  /// class ends here
}

function parseArgs(args: string[]): ArgsType {
  const arrs: string[] = [];
  const ret = {} as Record<string, string | string[]>;
  for (const arg of args) {
    if (arg.indexOf("--") == 0) {
      const [key, value] = arg.replace("--", "").split("=");
      ret[key] = value;
    } else {
      arrs.push(arg);
    }
  }

  ret["_"] = arrs;
  return ret as ArgsType;
}

async function main(args: string[]) {
  const handler = new LynxCmdHandler();
  await handler.run(parseArgs(args));
}

await main(Deno.args);
