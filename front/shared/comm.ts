import { LynxWalletFactory__factory } from "../../abi/factories/LynxWalletFactory__factory.ts";
import type { LynxWalletFactory } from "../../abi/LynxWalletFactory.ts";
import { LynxWallet__factory } from "../../abi/factories/LynxWallet__factory.ts";
import type { LynxWallet } from "../../abi/LynxWallet.ts";
import axiod from "https://deno.land/x/axiod/mod.ts";
import { ethers } from "ethers";

interface WalletDetailCardData {
  address: string;
  eoa: string;
  username1: string;
  username2: string;
  spendingLimit: ethers.BigNumber;
}

export class LynxWalletHandler {
  readonly provider: ethers.providers.Provider;
  readonly factory: LynxWalletFactory;
  lynxWallet?: LynxWallet;
  static nodeUrl = "http://localhost:9090";

  readonly rpcUrl: string;

  constructor(
    provider: ethers.providers.Provider,
    factory: LynxWalletFactory,
    rpcUrl: string
  ) {
    this.provider = provider;
    this.factory = factory;
    this.rpcUrl = rpcUrl;
  }

  public static async from(ethereum?: any) {
    const res = await axiod<{ rpc: string; executor: string; factory: string }>(
      LynxWalletHandler.nodeUrl
    );
    const provider =
      ethereum !== undefined
        ? new ethers.providers.Web3Provider(ethereum)
        : new ethers.providers.JsonRpcProvider(res.data.rpc);
    const factory = LynxWalletFactory__factory.connect(
      res.data.factory,
      provider
    );
    return new LynxWalletHandler(provider, factory, res.data.rpc);
  }

  public async getEOAHash(): Promise<string> {
    const signer = (this.provider as ethers.providers.Web3Provider).getSigner();
    return ethers.utils.keccak256(
      ethers.utils.arrayify(await signer.getAddress())
    );
  }

  public async getSenderHash(sender?: string): Promise<string> {
    if (sender === undefined) {
      return await this.getEOAHash();
    } else if (sender.indexOf("0x") === 0) {
      return ethers.utils.keccak256(ethers.utils.arrayify(sender));
    }
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(sender));
  }

  public async getLynxWalletAddress(
    sender?: string
  ): Promise<[string, boolean]> {
    const address = await this.factory.getLynxWalletForHandle(
      await this.getSenderHash(sender)
    );
    return [address, address !== ethers.constants.AddressZero];
  }

  public setLynxWallet(address: string) {
    this.lynxWallet = LynxWallet__factory.connect(address, this.provider);
  }

  private async _getInfo(address: string): Promise<WalletDetailCardData> {
    if (this.lynxWallet === undefined) {
      this.setLynxWallet(address);
    }
    return {
      address,
      eoa: (await this.lynxWallet?.eoa()) as string,
      username1: (await this.lynxWallet?.username1()) as string,
      username2: (await this.lynxWallet?.username2()) as string,
      spendingLimit:
        (await this.lynxWallet?.spendingLimitPerHandler()) as ethers.BigNumber,
    };
  }

  public async getInfo(address?: string): Promise<WalletDetailCardData> {
    if (this.lynxWallet === undefined && address === undefined)
      throw new Error("No wallet address");
    if (address === undefined) {
      return await this._getInfo(this.lynxWallet?.address as string);
    }
    return await this._getInfo(address);
  }
}
