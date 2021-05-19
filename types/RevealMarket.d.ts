/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface RevealMarketInterface extends ethers.utils.Interface {
  functions: {
    "claimReveal(uint256)": FunctionFragment;
    "initialize(address,address)": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "requestReveal(uint256[2],uint256[2][2],uint256[2],uint256[9])": FunctionFragment;
    "reveals(uint256)": FunctionFragment;
    "revertIfBadSnarkPerlinFlags(uint256[5],bool)": FunctionFragment;
    "setDarkForestCore(address)": FunctionFragment;
    "setVerifier(address)": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "claimReveal",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [string, string]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "requestReveal",
    values: [
      [BigNumberish, BigNumberish],
      [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      [BigNumberish, BigNumberish],
      [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "reveals",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "revertIfBadSnarkPerlinFlags",
    values: [
      [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      boolean
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "setDarkForestCore",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "setVerifier", values: [string]): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;

  decodeFunctionResult(
    functionFragment: "claimReveal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "requestReveal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "reveals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "revertIfBadSnarkPerlinFlags",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDarkForestCore",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setVerifier",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;

  events: {
    "OwnershipTransferred(address,address)": EventFragment;
    "RevealCollected(address,uint256,uint256,uint256,uint256)": EventFragment;
    "RevealRequested(address,uint256,uint256,uint256,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "OwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RevealCollected"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RevealRequested"): EventFragment;
}

export class RevealMarket extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: RevealMarketInterface;

  functions: {
    claimReveal(
      location: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    initialize(
      _verifierAddress: string,
      _coreAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    requestReveal(
      _a: [BigNumberish, BigNumberish],
      _b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      _c: [BigNumberish, BigNumberish],
      _input: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    reveals(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber, BigNumber] & {
        requester: string;
        location: BigNumber;
        x: BigNumber;
        y: BigNumber;
        value: BigNumber;
      }
    >;

    revertIfBadSnarkPerlinFlags(
      perlinFlags: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      checkingBiome: boolean,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    setDarkForestCore(
      _coreAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setVerifier(
      _verifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  claimReveal(
    location: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  initialize(
    _verifierAddress: string,
    _coreAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  requestReveal(
    _a: [BigNumberish, BigNumberish],
    _b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
    _c: [BigNumberish, BigNumberish],
    _input: [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ],
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  reveals(
    arg0: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, BigNumber, BigNumber, BigNumber, BigNumber] & {
      requester: string;
      location: BigNumber;
      x: BigNumber;
      y: BigNumber;
      value: BigNumber;
    }
  >;

  revertIfBadSnarkPerlinFlags(
    perlinFlags: [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ],
    checkingBiome: boolean,
    overrides?: CallOverrides
  ): Promise<boolean>;

  setDarkForestCore(
    _coreAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setVerifier(
    _verifierAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    claimReveal(
      location: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    initialize(
      _verifierAddress: string,
      _coreAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    requestReveal(
      _a: [BigNumberish, BigNumberish],
      _b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      _c: [BigNumberish, BigNumberish],
      _input: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      overrides?: CallOverrides
    ): Promise<void>;

    reveals(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, BigNumber, BigNumber, BigNumber, BigNumber] & {
        requester: string;
        location: BigNumber;
        x: BigNumber;
        y: BigNumber;
        value: BigNumber;
      }
    >;

    revertIfBadSnarkPerlinFlags(
      perlinFlags: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      checkingBiome: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    setDarkForestCore(
      _coreAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setVerifier(
      _verifierAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    OwnershipTransferred(
      previousOwner?: string | null,
      newOwner?: string | null
    ): TypedEventFilter<
      [string, string],
      { previousOwner: string; newOwner: string }
    >;

    RevealCollected(
      collector?: null,
      loc?: null,
      x?: null,
      y?: null,
      value?: null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, BigNumber, BigNumber],
      {
        collector: string;
        loc: BigNumber;
        x: BigNumber;
        y: BigNumber;
        value: BigNumber;
      }
    >;

    RevealRequested(
      revealer?: null,
      loc?: null,
      x?: null,
      y?: null,
      value?: null
    ): TypedEventFilter<
      [string, BigNumber, BigNumber, BigNumber, BigNumber],
      {
        revealer: string;
        loc: BigNumber;
        x: BigNumber;
        y: BigNumber;
        value: BigNumber;
      }
    >;
  };

  estimateGas: {
    claimReveal(
      location: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    initialize(
      _verifierAddress: string,
      _coreAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    requestReveal(
      _a: [BigNumberish, BigNumberish],
      _b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      _c: [BigNumberish, BigNumberish],
      _input: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    reveals(arg0: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;

    revertIfBadSnarkPerlinFlags(
      perlinFlags: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      checkingBiome: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setDarkForestCore(
      _coreAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setVerifier(
      _verifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    claimReveal(
      location: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    initialize(
      _verifierAddress: string,
      _coreAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    requestReveal(
      _a: [BigNumberish, BigNumberish],
      _b: [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]],
      _c: [BigNumberish, BigNumberish],
      _input: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    reveals(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    revertIfBadSnarkPerlinFlags(
      perlinFlags: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      checkingBiome: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setDarkForestCore(
      _coreAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setVerifier(
      _verifierAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
