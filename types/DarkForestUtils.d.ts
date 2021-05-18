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
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface DarkForestUtilsInterface extends ethers.utils.Interface {
  functions: {
    "revertIfBadSnarkPerlinFlags(uint256[5],bool)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "revertIfBadSnarkPerlinFlags",
    values: [
      [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      boolean
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "revertIfBadSnarkPerlinFlags",
    data: BytesLike
  ): Result;

  events: {};
}

export class DarkForestUtils extends BaseContract {
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

  interface: DarkForestUtilsInterface;

  functions: {
    revertIfBadSnarkPerlinFlags(
      perlinFlags: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      checkingBiome: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  revertIfBadSnarkPerlinFlags(
    perlinFlags: [
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BigNumberish
    ],
    checkingBiome: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
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
  };

  filters: {};

  estimateGas: {
    revertIfBadSnarkPerlinFlags(
      perlinFlags: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      checkingBiome: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    revertIfBadSnarkPerlinFlags(
      perlinFlags: [
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish,
        BigNumberish
      ],
      checkingBiome: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}