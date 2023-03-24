/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "./common.ts";

export interface ExecutorInterface extends utils.Interface {
  functions: {
    "factory()": FunctionFragment;
    "hasCallExecuted(bytes32)": FunctionFragment;
    "isRegisterdExecutor(address)": FunctionFragment;
    "lynx_call(bytes32,bytes32,address,uint256,bytes)": FunctionFragment;
    "lynx_create(bytes32,address,string,uint8,bytes32,bytes32)": FunctionFragment;
    "registerExecutor(address)": FunctionFragment;
    "totalExecutors()": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "factory"
      | "hasCallExecuted"
      | "isRegisterdExecutor"
      | "lynx_call"
      | "lynx_create"
      | "registerExecutor"
      | "totalExecutors"
  ): FunctionFragment;

  encodeFunctionData(functionFragment: "factory", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "hasCallExecuted",
    values: [PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "isRegisterdExecutor",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "lynx_call",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "lynx_create",
    values: [
      PromiseOrValue<BytesLike>,
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "registerExecutor",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "totalExecutors",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "factory", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "hasCallExecuted",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isRegisterdExecutor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lynx_call", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "lynx_create",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "registerExecutor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalExecutors",
    data: BytesLike
  ): Result;

  events: {
    "ExecutorRegisterd(address)": EventFragment;
    "TxnCallSubmitted(bytes4,bytes32,address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ExecutorRegisterd"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "TxnCallSubmitted"): EventFragment;
}

export interface ExecutorRegisterdEventObject {
  exec: string;
}
export type ExecutorRegisterdEvent = TypedEvent<
  [string],
  ExecutorRegisterdEventObject
>;

export type ExecutorRegisterdEventFilter =
  TypedEventFilter<ExecutorRegisterdEvent>;

export interface TxnCallSubmittedEventObject {
  func: string;
  txnHash: string;
  exec: string;
}
export type TxnCallSubmittedEvent = TypedEvent<
  [string, string, string],
  TxnCallSubmittedEventObject
>;

export type TxnCallSubmittedEventFilter =
  TypedEventFilter<TxnCallSubmittedEvent>;

export interface Executor extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ExecutorInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    factory(overrides?: CallOverrides): Promise<[string]>;

    hasCallExecuted(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isRegisterdExecutor(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    lynx_call(
      txnHash: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    lynx_create(
      txnHash: PromiseOrValue<BytesLike>,
      eoa: PromiseOrValue<string>,
      username: PromiseOrValue<string>,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    registerExecutor(
      exec: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    totalExecutors(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  factory(overrides?: CallOverrides): Promise<string>;

  hasCallExecuted(
    arg0: PromiseOrValue<BytesLike>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isRegisterdExecutor(
    arg0: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<boolean>;

  lynx_call(
    txnHash: PromiseOrValue<BytesLike>,
    sender: PromiseOrValue<BytesLike>,
    to: PromiseOrValue<string>,
    value: PromiseOrValue<BigNumberish>,
    data: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  lynx_create(
    txnHash: PromiseOrValue<BytesLike>,
    eoa: PromiseOrValue<string>,
    username: PromiseOrValue<string>,
    v: PromiseOrValue<BigNumberish>,
    r: PromiseOrValue<BytesLike>,
    s: PromiseOrValue<BytesLike>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  registerExecutor(
    exec: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  totalExecutors(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    factory(overrides?: CallOverrides): Promise<string>;

    hasCallExecuted(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isRegisterdExecutor(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<boolean>;

    lynx_call(
      txnHash: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    lynx_create(
      txnHash: PromiseOrValue<BytesLike>,
      eoa: PromiseOrValue<string>,
      username: PromiseOrValue<string>,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<string>;

    registerExecutor(
      exec: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    totalExecutors(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    "ExecutorRegisterd(address)"(
      exec?: PromiseOrValue<string> | null
    ): ExecutorRegisterdEventFilter;
    ExecutorRegisterd(
      exec?: PromiseOrValue<string> | null
    ): ExecutorRegisterdEventFilter;

    "TxnCallSubmitted(bytes4,bytes32,address)"(
      func?: PromiseOrValue<BytesLike> | null,
      txnHash?: PromiseOrValue<BytesLike> | null,
      exec?: PromiseOrValue<string> | null
    ): TxnCallSubmittedEventFilter;
    TxnCallSubmitted(
      func?: PromiseOrValue<BytesLike> | null,
      txnHash?: PromiseOrValue<BytesLike> | null,
      exec?: PromiseOrValue<string> | null
    ): TxnCallSubmittedEventFilter;
  };

  estimateGas: {
    factory(overrides?: CallOverrides): Promise<BigNumber>;

    hasCallExecuted(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isRegisterdExecutor(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    lynx_call(
      txnHash: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    lynx_create(
      txnHash: PromiseOrValue<BytesLike>,
      eoa: PromiseOrValue<string>,
      username: PromiseOrValue<string>,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    registerExecutor(
      exec: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    totalExecutors(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    factory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    hasCallExecuted(
      arg0: PromiseOrValue<BytesLike>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isRegisterdExecutor(
      arg0: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lynx_call(
      txnHash: PromiseOrValue<BytesLike>,
      sender: PromiseOrValue<BytesLike>,
      to: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      data: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    lynx_create(
      txnHash: PromiseOrValue<BytesLike>,
      eoa: PromiseOrValue<string>,
      username: PromiseOrValue<string>,
      v: PromiseOrValue<BigNumberish>,
      r: PromiseOrValue<BytesLike>,
      s: PromiseOrValue<BytesLike>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    registerExecutor(
      exec: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    totalExecutors(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}