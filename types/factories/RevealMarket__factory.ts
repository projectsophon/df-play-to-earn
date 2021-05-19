/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { RevealMarket, RevealMarketInterface } from "../RevealMarket";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "collector",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "loc",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "RevealCollected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "revealer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "loc",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "y",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "RevealRequested",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "startIdx",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endIdx",
        type: "uint256",
      },
    ],
    name: "bulkGetRevealRequests",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "requester",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "location",
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
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "paid",
            type: "bool",
          },
        ],
        internalType: "struct RevealRequest[]",
        name: "ret",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "location",
        type: "uint256",
      },
    ],
    name: "claimReveal",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getNRevealRequests",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "location",
        type: "uint256",
      },
    ],
    name: "getRevealRequest",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "requester",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "location",
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
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "paid",
            type: "bool",
          },
        ],
        internalType: "struct RevealRequest",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "idx",
        type: "uint256",
      },
    ],
    name: "getRevealRequestIds",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_verifierAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "_coreAddress",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[2]",
        name: "_a",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "_b",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "_c",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[9]",
        name: "_input",
        type: "uint256[9]",
      },
    ],
    name: "requestReveal",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[5]",
        name: "perlinFlags",
        type: "uint256[5]",
      },
      {
        internalType: "bool",
        name: "checkingBiome",
        type: "bool",
      },
    ],
    name: "revertIfBadSnarkPerlinFlags",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_coreAddress",
        type: "address",
      },
    ],
    name: "setDarkForestCore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_verifierAddress",
        type: "address",
      },
    ],
    name: "setVerifier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506132d9806100206000396000f3fe6080604052600436106100c25760003560e01c8063715018a61161007f5780638efd2698116100595780638efd2698146102315780639cc432ee1461026e578063e67d97c6146102ab578063f2fde38b146102e8576100c2565b8063715018a6146101c65780637ec1303e146101dd5780638da5cb5b14610206576100c2565b80630c6ca749146100c7578063260cdfdd146100f257806326c7e6181461011b578063485cc955146101585780635437988d146101815780635c63f1f0146101aa575b600080fd5b3480156100d357600080fd5b506100dc610311565b6040516100e99190612c92565b60405180910390f35b3480156100fe57600080fd5b50610119600480360381019061011491906123e1565b61031e565b005b34801561012757600080fd5b50610142600480360381019061013d919061232a565b6106c3565b60405161014f9190612a7c565b60405180910390f35b34801561016457600080fd5b5061017f600480360381019061017a9190612289565b610a21565b005b34801561018d57600080fd5b506101a860048036038101906101a39190612260565b610cb5565b005b6101c460048036038101906101bf91906122c5565b610d75565b005b3480156101d257600080fd5b506101db6114b6565b005b3480156101e957600080fd5b5061020460048036038101906101ff9190612260565b6115f3565b005b34801561021257600080fd5b5061021b6116b3565b60405161022891906129a5565b60405180910390f35b34801561023d57600080fd5b50610258600480360381019061025391906123e1565b6116dd565b6040516102659190612c92565b60405180910390f35b34801561027a57600080fd5b506102956004803603810190610290919061240a565b61172b565b6040516102a29190612a13565b60405180910390f35b3480156102b757600080fd5b506102d260048036038101906102cd91906123e1565b61183c565b6040516102df9190612c77565b60405180910390f35b3480156102f457600080fd5b5061030f600480360381019061030a9190612260565b611950565b005b6000606e80549050905090565b6000606d60008381526020019081526020016000206040518060c00160405290816000820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001600182015481526020016002820154815260200160038201548152602001600482015481526020016005820160009054906101000a900460ff1615151515815250509050600081602001511415610421576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161041890612b57565b60405180910390fd5b600015158160a0015115151461046c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161046390612af7565b60405180910390fd5b6000606660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16630e1d2115846040518263ffffffff1660e01b81526004016104c99190612c92565b608060405180830381600087803b1580156104e357600080fd5b505af11580156104f7573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061051b919061238f565b9050600081600001511415610565576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161055c90612ad7565b60405180910390fd5b60018260a001901515908115158152505081606d60008460200151815260200190815260200160002060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506020820151816001015560408201518160020155606082015181600301556080820151816004015560a08201518160050160006101000a81548160ff021916908315150217905550905050806060015173ffffffffffffffffffffffffffffffffffffffff166108fc83608001519081150290604051600060405180830381858888f1935050505015801561066e573d6000803e3d6000fd5b507f3888ed99072e580a8dbb8d9a4af4867a5b973fe19956442fc0e8ea4cfad027383383602001518460400151856060015186608001516040516106b69594939291906129c0565b60405180910390a1505050565b600060676001015483600060058110610705577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201511461074a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161074190612a97565b60405180910390fd5b81156107da5760676003015483600160058110610790577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151146107d5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107cc90612c37565b60405180910390fd5b610860565b6067600201548360016005811061081a577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201511461085f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161085690612c37565b60405180910390fd5b5b606760050154836002600581106108a0577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151146108e5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016108dc90612bd7565b60405180910390fd5b606760040160009054906101000a900460ff161515600184600360058110610936577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201511415151461097e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161097590612b37565b60405180910390fd5b606760040160019054906101000a900460ff1615156001846004600581106109cf577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015114151514610a17576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a0e90612bf7565b60405180910390fd5b6001905092915050565b600060019054906101000a900460ff1680610a47575060008054906101000a900460ff16155b610a86576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a7d90612b77565b60405180910390fd5b60008060019054906101000a900460ff161590508015610ad6576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b610ade611afc565b82606560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081606660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550606660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166351baf19e6040518163ffffffff1660e01b815260040160e060405180830381600087803b158015610bca57600080fd5b505af1158015610bde573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c0291906123b8565b606760008201518160000160006101000a81548160ff02191690831515021790555060208201518160010155604082015181600201556060820151816003015560808201518160040160006101000a81548160ff02191690831515021790555060a08201518160040160016101000a81548160ff02191690831515021790555060c082015181600501559050508015610cb05760008060016101000a81548160ff0219169083151502179055505b505050565b610cbd611be5565b73ffffffffffffffffffffffffffffffffffffffff16610cdb6116b3565b73ffffffffffffffffffffffffffffffffffffffff1614610d31576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d2890612bb7565b60405180910390fd5b80606560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000606d600083600060098110610db5577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015181526020019081526020016000206040518060c00160405290816000820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001600182015481526020016002820154815260200160038201548152602001600482015481526020016005820160009054906101000a900460ff16151515158152505090506000816020015114610eb5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610eac90612b97565b60405180910390fd5b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663d20293f0868686866040518563ffffffff1660e01b8152600401610f169493929190612a35565b602060405180830381600087803b158015610f3057600080fd5b505af1925050508015610f6157506040513d601f19601f82011682018060405250810190610f5e9190612366565b60015b610fa0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f9790612b17565b60405180910390fd5b80610fe0576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fd790612c17565b60405180910390fd5b506111486040518060a0016040528084600460098110611029577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015181526020018460056009811061106d577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201518152602001846006600981106110b1577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201518152602001846007600981106110f5577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815260200184600860098110611139577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015181525060006106c3565b506000606660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16630e1d2115846000600981106111c3577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201516040518263ffffffff1660e01b81526004016111e49190612c92565b608060405180830381600087803b1580156111fe57600080fd5b505af1158015611212573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611236919061238f565b9050600081600001511461127f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161127690612c57565b60405180910390fd5b60006040518060c001604052803373ffffffffffffffffffffffffffffffffffffffff168152602001856000600981106112e2577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815260200185600260098110611326577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015181526020018560036009811061136a577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815260200134815260200160001515815250905080606d60008360200151815260200190815260200160002060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506020820151816001015560408201518160020155606082015181600301556080820151816004015560a08201518160050160006101000a81548160ff021916908315150217905550905050606e816020015190806001815401808255809150506001900390600052602060002001600090919091909150557f58098afb0a262f96a775a4b450b1ce01543db3541730fa9428dd5baaa1ce1340816000015182602001518360400151846060015185608001516040516114a59594939291906129c0565b60405180910390a150505050505050565b6114be611be5565b73ffffffffffffffffffffffffffffffffffffffff166114dc6116b3565b73ffffffffffffffffffffffffffffffffffffffff1614611532576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161152990612bb7565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a36000603360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6115fb611be5565b73ffffffffffffffffffffffffffffffffffffffff166116196116b3565b73ffffffffffffffffffffffffffffffffffffffff161461166f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161166690612bb7565b60405180910390fd5b80606660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000606e8281548110611719577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b90600052602060002001549050919050565b606082826117399190612e46565b67ffffffffffffffff811115611778577f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6040519080825280602002602001820160405280156117b157816020015b61179e611e48565b8152602001906001900390816117965790505b50905060008390505b82811015611835576117d36117ce826116dd565b61183c565b8285836117e09190612e46565b81518110611817577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020026020010181905250808061182d90612ef3565b9150506117ba565b5092915050565b611844611e48565b6000606d60008481526020019081526020016000206040518060c00160405290816000820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001600182015481526020016002820154815260200160038201548152602001600482015481526020016005820160009054906101000a900460ff1615151515815250509050600081602001511415611947576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161193e90612b57565b60405180910390fd5b80915050919050565b611958611be5565b73ffffffffffffffffffffffffffffffffffffffff166119766116b3565b73ffffffffffffffffffffffffffffffffffffffff16146119cc576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016119c390612bb7565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415611a3c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611a3390612ab7565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a380603360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600060019054906101000a900460ff1680611b22575060008054906101000a900460ff16155b611b61576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611b5890612b77565b60405180910390fd5b60008060019054906101000a900460ff161590508015611bb1576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b611bb9611bed565b611bc1611cc6565b8015611be25760008060016101000a81548160ff0219169083151502179055505b50565b600033905090565b600060019054906101000a900460ff1680611c13575060008054906101000a900460ff16155b611c52576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611c4990612b77565b60405180910390fd5b60008060019054906101000a900460ff161590508015611ca2576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b8015611cc35760008060016101000a81548160ff0219169083151502179055505b50565b600060019054906101000a900460ff1680611cec575060008054906101000a900460ff16155b611d2b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611d2290612b77565b60405180910390fd5b60008060019054906101000a900460ff161590508015611d7b576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b6000611d85611be5565b905080603360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3508015611e455760008060016101000a81548160ff0219169083151502179055505b50565b6040518060c00160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600081526020016000815260200160008152602001600081526020016000151581525090565b6000611ea9611ea484612cd2565b612cad565b90508082856040860282011115611ebf57600080fd5b60005b85811015611eef5781611ed58882612073565b845260208401935060408301925050600181019050611ec2565b5050509392505050565b6000611f0c611f0784612cf8565b612cad565b90508082856020860282011115611f2257600080fd5b60005b85811015611f525781611f388882612236565b845260208401935060208301925050600181019050611f25565b5050509392505050565b6000611f6f611f6a84612d1e565b612cad565b90508082856020860282011115611f8557600080fd5b60005b85811015611fb55781611f9b8882612236565b845260208401935060208301925050600181019050611f88565b5050509392505050565b6000611fd2611fcd84612d44565b612cad565b90508082856020860282011115611fe857600080fd5b60005b858110156120185781611ffe8882612236565b845260208401935060208301925050600181019050611feb565b5050509392505050565b6000813590506120318161325e565b92915050565b6000815190506120468161325e565b92915050565b600082601f83011261205d57600080fd5b600261206a848285611e96565b91505092915050565b600082601f83011261208457600080fd5b6002612091848285611ef9565b91505092915050565b600082601f8301126120ab57600080fd5b60056120b8848285611f5c565b91505092915050565b600082601f8301126120d257600080fd5b60096120df848285611fbf565b91505092915050565b6000813590506120f781613275565b92915050565b60008151905061210c81613275565b92915050565b60006080828403121561212457600080fd5b61212e6080612cad565b9050600061213e8482850161224b565b60008301525060206121528482850161224b565b60208301525060406121668482850161224b565b604083015250606061217a84828501612037565b60608301525092915050565b600060e0828403121561219857600080fd5b6121a260e0612cad565b905060006121b2848285016120fd565b60008301525060206121c68482850161224b565b60208301525060406121da8482850161224b565b60408301525060606121ee8482850161224b565b6060830152506080612202848285016120fd565b60808301525060a0612216848285016120fd565b60a08301525060c061222a8482850161224b565b60c08301525092915050565b6000813590506122458161328c565b92915050565b60008151905061225a8161328c565b92915050565b60006020828403121561227257600080fd5b600061228084828501612022565b91505092915050565b6000806040838503121561229c57600080fd5b60006122aa85828601612022565b92505060206122bb85828601612022565b9150509250929050565b60008060008061022085870312156122dc57600080fd5b60006122ea87828801612073565b94505060406122fb8782880161204c565b93505060c061230c87828801612073565b92505061010061231e878288016120c1565b91505092959194509250565b60008060c0838503121561233d57600080fd5b600061234b8582860161209a565b92505060a061235c858286016120e8565b9150509250929050565b60006020828403121561237857600080fd5b6000612386848285016120fd565b91505092915050565b6000608082840312156123a157600080fd5b60006123af84828501612112565b91505092915050565b600060e082840312156123ca57600080fd5b60006123d884828501612186565b91505092915050565b6000602082840312156123f357600080fd5b600061240184828501612236565b91505092915050565b6000806040838503121561241d57600080fd5b600061242b85828601612236565b925050602061243c85828601612236565b9150509250929050565b60006124528383612561565b60408301905092915050565b600061246a8383612891565b60c08301905092915050565b60006124828383612987565b60208301905092915050565b61249781612e7a565b82525050565b6124a681612e7a565b82525050565b6124b581612d98565b6124bf8184612df8565b92506124ca82612d6a565b8060005b838110156124fb5781516124e28782612446565b96506124ed83612dc4565b9250506001810190506124ce565b505050505050565b600061250e82612da3565b6125188185612e03565b935061252383612d74565b8060005b8381101561255457815161253b888261245e565b975061254683612dd1565b925050600181019050612527565b5085935050505092915050565b61256a81612dae565b6125748184612e14565b925061257f82612d84565b8060005b838110156125b05781516125978782612476565b96506125a283612dde565b925050600181019050612583565b505050505050565b6125c181612dae565b6125cb8184612e1f565b92506125d682612d84565b8060005b838110156126075781516125ee8782612476565b96506125f983612dde565b9250506001810190506125da565b505050505050565b61261881612db9565b6126228184612e2a565b925061262d82612d8e565b8060005b8381101561265e5781516126458782612476565b965061265083612deb565b925050600181019050612631565b505050505050565b61266f81612e8c565b82525050565b61267e81612e8c565b82525050565b6000612691601783612e35565b915061269c82612fab565b602082019050919050565b60006126b4602683612e35565b91506126bf82612fd4565b604082019050919050565b60006126d7601683612e35565b91506126e282613023565b602082019050919050565b60006126fa601e83612e35565b91506127058261304c565b602082019050919050565b600061271d601a83612e35565b915061272882613075565b602082019050919050565b6000612740601383612e35565b915061274b8261309e565b602082019050919050565b6000612763601c83612e35565b915061276e826130c7565b602082019050919050565b6000612786602e83612e35565b9150612791826130f0565b604082019050919050565b60006127a9601883612e35565b91506127b48261313f565b602082019050919050565b60006127cc602083612e35565b91506127d782613168565b602082019050919050565b60006127ef601783612e35565b91506127fa82613191565b602082019050919050565b6000612812601383612e35565b915061281d826131ba565b602082019050919050565b6000612835601483612e35565b9150612840826131e3565b602082019050919050565b6000612858601683612e35565b91506128638261320c565b602082019050919050565b600061287b601783612e35565b915061288682613235565b602082019050919050565b60c0820160008201516128a7600085018261248e565b5060208201516128ba6020850182612987565b5060408201516128cd6040850182612987565b5060608201516128e06060850182612987565b5060808201516128f36080850182612987565b5060a082015161290660a0850182612666565b50505050565b60c082016000820151612922600085018261248e565b5060208201516129356020850182612987565b5060408201516129486040850182612987565b50606082015161295b6060850182612987565b50608082015161296e6080850182612987565b5060a082015161298160a0850182612666565b50505050565b61299081612eb8565b82525050565b61299f81612eb8565b82525050565b60006020820190506129ba600083018461249d565b92915050565b600060a0820190506129d5600083018861249d565b6129e26020830187612996565b6129ef6040830186612996565b6129fc6060830185612996565b612a096080830184612996565b9695505050505050565b60006020820190508181036000830152612a2d8184612503565b905092915050565b600061022082019050612a4b60008301876125b8565b612a5860408301866124ac565b612a6560c08301856125b8565b612a7361010083018461260f565b95945050505050565b6000602082019050612a916000830184612675565b92915050565b60006020820190508181036000830152612ab081612684565b9050919050565b60006020820190508181036000830152612ad0816126a7565b9050919050565b60006020820190508181036000830152612af0816126ca565b9050919050565b60006020820190508181036000830152612b10816126ed565b9050919050565b60006020820190508181036000830152612b3081612710565b9050919050565b60006020820190508181036000830152612b5081612733565b9050919050565b60006020820190508181036000830152612b7081612756565b9050919050565b60006020820190508181036000830152612b9081612779565b9050919050565b60006020820190508181036000830152612bb08161279c565b9050919050565b60006020820190508181036000830152612bd0816127bf565b9050919050565b60006020820190508181036000830152612bf0816127e2565b9050919050565b60006020820190508181036000830152612c1081612805565b9050919050565b60006020820190508181036000830152612c3081612828565b9050919050565b60006020820190508181036000830152612c508161284b565b9050919050565b60006020820190508181036000830152612c708161286e565b9050919050565b600060c082019050612c8c600083018461290c565b92915050565b6000602082019050612ca76000830184612996565b92915050565b6000612cb7612cc8565b9050612cc38282612ec2565b919050565b6000604051905090565b600067ffffffffffffffff821115612ced57612cec612f6b565b5b602082029050919050565b600067ffffffffffffffff821115612d1357612d12612f6b565b5b602082029050919050565b600067ffffffffffffffff821115612d3957612d38612f6b565b5b602082029050919050565b600067ffffffffffffffff821115612d5f57612d5e612f6b565b5b602082029050919050565b6000819050919050565b6000819050602082019050919050565b6000819050919050565b6000819050919050565b600060029050919050565b600081519050919050565b600060029050919050565b600060099050919050565b6000602082019050919050565b6000602082019050919050565b6000602082019050919050565b6000602082019050919050565b600081905092915050565b600082825260208201905092915050565b600081905092915050565b600081905092915050565b600081905092915050565b600082825260208201905092915050565b6000612e5182612eb8565b9150612e5c83612eb8565b925082821015612e6f57612e6e612f3c565b5b828203905092915050565b6000612e8582612e98565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b612ecb82612f9a565b810181811067ffffffffffffffff82111715612eea57612ee9612f6b565b5b80604052505050565b6000612efe82612eb8565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff821415612f3157612f30612f3c565b5b600182019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b7f62616420706c616e657468617368206d696d63206b6579000000000000000000600082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f506c616e6574206973206e6f742072657665616c656400000000000000000000600082015250565b7f72657665616c5265717565737420686173206265656e20636c61696d65640000600082015250565b7f76657269667952657665616c50726f6f66207265766572746564000000000000600082015250565b7f626164207065726c696e206d6972726f72207800000000000000000000000000600082015250565b7f4e6f2072657665616c52657175657374206174206c6f636174696f6e00000000600082015250565b7f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160008201527f647920696e697469616c697a6564000000000000000000000000000000000000602082015250565b7f506c616e657420616c7265616479207265717565737465640000000000000000600082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b7f626164207065726c696e206c656e677468207363616c65000000000000000000600082015250565b7f626164207065726c696e206d6972726f72207900000000000000000000000000600082015250565b7f496e76616c69642072657665616c2070726f6f66000000000000000000000000600082015250565b7f62616420737061636574797065206d696d63206b657900000000000000000000600082015250565b7f506c616e657420616c72656164792072657665616c6564000000000000000000600082015250565b61326781612e7a565b811461327257600080fd5b50565b61327e81612e8c565b811461328957600080fd5b50565b61329581612eb8565b81146132a057600080fd5b5056fea264697066735822122081de808f04c8194d157d273aa316ce42b69d3c2aa32601af3b3b1af3d93f7f2a64736f6c63430008040033";

export class RevealMarket__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<RevealMarket> {
    return super.deploy(overrides || {}) as Promise<RevealMarket>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): RevealMarket {
    return super.attach(address) as RevealMarket;
  }
  connect(signer: Signer): RevealMarket__factory {
    return super.connect(signer) as RevealMarket__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RevealMarketInterface {
    return new utils.Interface(_abi) as RevealMarketInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): RevealMarket {
    return new Contract(address, _abi, signerOrProvider) as RevealMarket;
  }
}
