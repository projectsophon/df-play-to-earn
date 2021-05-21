/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type {
  DarkForestCore,
  DarkForestCoreInterface,
} from "../DarkForestCore";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "a",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "b",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "c",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[9]",
        name: "input",
        type: "uint256[9]",
      },
    ],
    name: "checkRevealProof",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "locationId",
        type: "uint256",
      },
    ],
    name: "getRevealedCoords",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "locationId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "x",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "y",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "revealer",
            type: "address",
          },
        ],
        internalType: "struct DarkForestCore.RevealedCoords",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class DarkForestCore__factory {
  static readonly abi = _abi;
  static createInterface(): DarkForestCoreInterface {
    return new utils.Interface(_abi) as DarkForestCoreInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): DarkForestCore {
    return new Contract(address, _abi, signerOrProvider) as DarkForestCore;
  }
}