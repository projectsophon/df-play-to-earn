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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "reveals",
    outputs: [
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
    ],
    stateMutability: "view",
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
  "0x608060405234801561001057600080fd5b50612796806100206000396000f3fe6080604052600436106100915760003560e01c8063715018a611610059578063715018a61461016a5780637ec1303e146101815780638da5cb5b146101aa578063b07d95e8146101d5578063f2fde38b1461021657610091565b8063260cdfdd1461009657806326c7e618146100bf578063485cc955146100fc5780635437988d146101255780635c63f1f01461014e575b600080fd5b3480156100a257600080fd5b506100bd60048036038101906100b89190611cca565b61023f565b005b3480156100cb57600080fd5b506100e660048036038101906100e19190611c13565b6103d7565b6040516100f39190612114565b60405180910390f35b34801561010857600080fd5b50610123600480360381019061011e9190611b72565b610735565b005b34801561013157600080fd5b5061014c60048036038101906101479190611b49565b6109c9565b005b61016860048036038101906101639190611bae565b610a89565b005b34801561017657600080fd5b5061017f611033565b005b34801561018d57600080fd5b506101a860048036038101906101a39190611b49565b611170565b005b3480156101b657600080fd5b506101bf611230565b6040516101cc919061205f565b60405180910390f35b3480156101e157600080fd5b506101fc60048036038101906101f79190611cca565b61125a565b60405161020d95949392919061207a565b60405180910390f35b34801561022257600080fd5b5061023d60048036038101906102389190611b49565b6112b0565b005b6000606d60008381526020019081526020016000206040518060a00160405290816000820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016001820154815260200160028201548152602001600382015481526020016004820154815250509050600081602001511415610327576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161031e9061216f565b60405180910390fd5b606d6000838152602001908152602001600020600080820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff0219169055600182016000905560028201600090556003820160009055600482016000905550507f3888ed99072e580a8dbb8d9a4af4867a5b973fe19956442fc0e8ea4cfad027383382602001518360400151846060015185608001516040516103cb95949392919061207a565b60405180910390a15050565b600060676001015483600060058110610419577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201511461045e576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104559061212f565b60405180910390fd5b81156104ee57606760030154836001600581106104a4577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151146104e9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104e09061226f565b60405180910390fd5b610574565b6067600201548360016005811061052e577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015114610573576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161056a9061226f565b60405180910390fd5b5b606760050154836002600581106105b4577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151146105f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105f09061220f565b60405180910390fd5b606760040160009054906101000a900460ff16151560018460036005811061064a577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015114151514610692576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610689906121af565b60405180910390fd5b606760040160019054906101000a900460ff1615156001846004600581106106e3577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201511415151461072b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107229061222f565b60405180910390fd5b6001905092915050565b600060019054906101000a900460ff168061075b575060008054906101000a900460ff16155b61079a576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610791906121cf565b60405180910390fd5b60008060019054906101000a900460ff1615905080156107ea576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b6107f261145c565b82606560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555081606660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550606660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166351baf19e6040518163ffffffff1660e01b815260040160e060405180830381600087803b1580156108de57600080fd5b505af11580156108f2573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109169190611ca1565b606760008201518160000160006101000a81548160ff02191690831515021790555060208201518160010155604082015181600201556060820151816003015560808201518160040160006101000a81548160ff02191690831515021790555060a08201518160040160016101000a81548160ff02191690831515021790555060c0820151816005015590505080156109c45760008060016101000a81548160ff0219169083151502179055505b505050565b6109d1611545565b73ffffffffffffffffffffffffffffffffffffffff166109ef611230565b73ffffffffffffffffffffffffffffffffffffffff1614610a45576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a3c906121ef565b60405180910390fd5b80606560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b606560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663d20293f0858585856040518563ffffffff1660e01b8152600401610aea94939291906120cd565b602060405180830381600087803b158015610b0457600080fd5b505af1925050508015610b3557506040513d601f19601f82011682018060405250810190610b329190611c4f565b60015b610b74576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b6b9061218f565b60405180910390fd5b80610bb4576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bab9061224f565b60405180910390fd5b50610d1c6040518060a0016040528083600460098110610bfd577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815260200183600560098110610c41577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815260200183600660098110610c85577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815260200183600760098110610cc9577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815260200183600860098110610d0d577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b602002015181525060006103d7565b506000606660009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16630e1d211583600060098110610d97577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b60200201516040518263ffffffff1660e01b8152600401610db891906122af565b606060405180830381600087803b158015610dd257600080fd5b505af1158015610de6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e0a9190611c78565b90506000816000015114610e53576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e4a9061228f565b60405180910390fd5b60006040518060a001604052803373ffffffffffffffffffffffffffffffffffffffff16815260200184600060098110610eb6577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815260200184600260098110610efa577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815260200184600360098110610f3e577f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6020020151815260200134815250905080606d60008360200151815260200190815260200160002060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550602082015181600101556040820151816002015560608201518160030155608082015181600401559050507f58098afb0a262f96a775a4b450b1ce01543db3541730fa9428dd5baaa1ce13408160000151826020015183604001518460600151856080015160405161102395949392919061207a565b60405180910390a1505050505050565b61103b611545565b73ffffffffffffffffffffffffffffffffffffffff16611059611230565b73ffffffffffffffffffffffffffffffffffffffff16146110af576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016110a6906121ef565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff16603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a36000603360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b611178611545565b73ffffffffffffffffffffffffffffffffffffffff16611196611230565b73ffffffffffffffffffffffffffffffffffffffff16146111ec576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111e3906121ef565b60405180910390fd5b80606660006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b606d6020528060005260406000206000915090508060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060010154908060020154908060030154908060040154905085565b6112b8611545565b73ffffffffffffffffffffffffffffffffffffffff166112d6611230565b73ffffffffffffffffffffffffffffffffffffffff161461132c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611323906121ef565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141561139c576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113939061214f565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff16603360009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a380603360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600060019054906101000a900460ff1680611482575060008054906101000a900460ff16155b6114c1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114b8906121cf565b60405180910390fd5b60008060019054906101000a900460ff161590508015611511576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b61151961154d565b611521611626565b80156115425760008060016101000a81548160ff0219169083151502179055505b50565b600033905090565b600060019054906101000a900460ff1680611573575060008054906101000a900460ff16155b6115b2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115a9906121cf565b60405180910390fd5b60008060019054906101000a900460ff161590508015611602576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b80156116235760008060016101000a81548160ff0219169083151502179055505b50565b600060019054906101000a900460ff168061164c575060008054906101000a900460ff16155b61168b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611682906121cf565b60405180910390fd5b60008060019054906101000a900460ff1615905080156116db576001600060016101000a81548160ff02191690831515021790555060016000806101000a81548160ff0219169083151502179055505b60006116e5611545565b905080603360006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35080156117a55760008060016101000a81548160ff0219169083151502179055505b50565b60006117bb6117b6846122ef565b6122ca565b905080828560408602820111156117d157600080fd5b60005b8581101561180157816117e78882611970565b8452602084019350604083019250506001810190506117d4565b5050509392505050565b600061181e61181984612315565b6122ca565b9050808285602086028201111561183457600080fd5b60005b85811015611864578161184a8882611b1f565b845260208401935060208301925050600181019050611837565b5050509392505050565b600061188161187c8461233b565b6122ca565b9050808285602086028201111561189757600080fd5b60005b858110156118c757816118ad8882611b1f565b84526020840193506020830192505060018101905061189a565b5050509392505050565b60006118e46118df84612361565b6122ca565b905080828560208602820111156118fa57600080fd5b60005b8581101561192a57816119108882611b1f565b8452602084019350602083019250506001810190506118fd565b5050509392505050565b6000813590506119438161271b565b92915050565b600082601f83011261195a57600080fd5b60026119678482856117a8565b91505092915050565b600082601f83011261198157600080fd5b600261198e84828561180b565b91505092915050565b600082601f8301126119a857600080fd5b60056119b584828561186e565b91505092915050565b600082601f8301126119cf57600080fd5b60096119dc8482856118d1565b91505092915050565b6000813590506119f481612732565b92915050565b600081519050611a0981612732565b92915050565b600060608284031215611a2157600080fd5b611a2b60606122ca565b90506000611a3b84828501611b34565b6000830152506020611a4f84828501611b34565b6020830152506040611a6384828501611b34565b60408301525092915050565b600060e08284031215611a8157600080fd5b611a8b60e06122ca565b90506000611a9b848285016119fa565b6000830152506020611aaf84828501611b34565b6020830152506040611ac384828501611b34565b6040830152506060611ad784828501611b34565b6060830152506080611aeb848285016119fa565b60808301525060a0611aff848285016119fa565b60a08301525060c0611b1384828501611b34565b60c08301525092915050565b600081359050611b2e81612749565b92915050565b600081519050611b4381612749565b92915050565b600060208284031215611b5b57600080fd5b6000611b6984828501611934565b91505092915050565b60008060408385031215611b8557600080fd5b6000611b9385828601611934565b9250506020611ba485828601611934565b9150509250929050565b6000806000806102208587031215611bc557600080fd5b6000611bd387828801611970565b9450506040611be487828801611949565b93505060c0611bf587828801611970565b925050610100611c07878288016119be565b91505092959194509250565b60008060c08385031215611c2657600080fd5b6000611c3485828601611997565b92505060a0611c45858286016119e5565b9150509250929050565b600060208284031215611c6157600080fd5b6000611c6f848285016119fa565b91505092915050565b600060608284031215611c8a57600080fd5b6000611c9884828501611a0f565b91505092915050565b600060e08284031215611cb357600080fd5b6000611cc184828501611a6f565b91505092915050565b600060208284031215611cdc57600080fd5b6000611cea84828501611b1f565b91505092915050565b6000611cff8383611d89565b60408301905092915050565b6000611d178383612041565b60208301905092915050565b611d2c8161242a565b82525050565b611d3b816123a5565b611d4581846123ed565b9250611d5082612387565b8060005b83811015611d81578151611d688782611cf3565b9650611d73836123c6565b925050600181019050611d54565b505050505050565b611d92816123b0565b611d9c81846123f8565b9250611da782612391565b8060005b83811015611dd8578151611dbf8782611d0b565b9650611dca836123d3565b925050600181019050611dab565b505050505050565b611de9816123b0565b611df38184612403565b9250611dfe82612391565b8060005b83811015611e2f578151611e168782611d0b565b9650611e21836123d3565b925050600181019050611e02565b505050505050565b611e40816123bb565b611e4a818461240e565b9250611e558261239b565b8060005b83811015611e86578151611e6d8782611d0b565b9650611e78836123e0565b925050600181019050611e59565b505050505050565b611e978161243c565b82525050565b6000611eaa601783612419565b9150611eb5826124e3565b602082019050919050565b6000611ecd602683612419565b9150611ed88261250c565b604082019050919050565b6000611ef0601583612419565b9150611efb8261255b565b602082019050919050565b6000611f13601a83612419565b9150611f1e82612584565b602082019050919050565b6000611f36601383612419565b9150611f41826125ad565b602082019050919050565b6000611f59602e83612419565b9150611f64826125d6565b604082019050919050565b6000611f7c602083612419565b9150611f8782612625565b602082019050919050565b6000611f9f601783612419565b9150611faa8261264e565b602082019050919050565b6000611fc2601383612419565b9150611fcd82612677565b602082019050919050565b6000611fe5601483612419565b9150611ff0826126a0565b602082019050919050565b6000612008601683612419565b9150612013826126c9565b602082019050919050565b600061202b601783612419565b9150612036826126f2565b602082019050919050565b61204a81612468565b82525050565b61205981612468565b82525050565b60006020820190506120746000830184611d23565b92915050565b600060a08201905061208f6000830188611d23565b61209c6020830187612050565b6120a96040830186612050565b6120b66060830185612050565b6120c36080830184612050565b9695505050505050565b6000610220820190506120e36000830187611de0565b6120f06040830186611d32565b6120fd60c0830185611de0565b61210b610100830184611e37565b95945050505050565b60006020820190506121296000830184611e8e565b92915050565b6000602082019050818103600083015261214881611e9d565b9050919050565b6000602082019050818103600083015261216881611ec0565b9050919050565b6000602082019050818103600083015261218881611ee3565b9050919050565b600060208201905081810360008301526121a881611f06565b9050919050565b600060208201905081810360008301526121c881611f29565b9050919050565b600060208201905081810360008301526121e881611f4c565b9050919050565b6000602082019050818103600083015261220881611f6f565b9050919050565b6000602082019050818103600083015261222881611f92565b9050919050565b6000602082019050818103600083015261224881611fb5565b9050919050565b6000602082019050818103600083015261226881611fd8565b9050919050565b6000602082019050818103600083015261228881611ffb565b9050919050565b600060208201905081810360008301526122a88161201e565b9050919050565b60006020820190506122c46000830184612050565b92915050565b60006122d46122e5565b90506122e08282612472565b919050565b6000604051905090565b600067ffffffffffffffff82111561230a576123096124a3565b5b602082029050919050565b600067ffffffffffffffff8211156123305761232f6124a3565b5b602082029050919050565b600067ffffffffffffffff821115612356576123556124a3565b5b602082029050919050565b600067ffffffffffffffff82111561237c5761237b6124a3565b5b602082029050919050565b6000819050919050565b6000819050919050565b6000819050919050565b600060029050919050565b600060029050919050565b600060099050919050565b6000602082019050919050565b6000602082019050919050565b6000602082019050919050565b600081905092915050565b600081905092915050565b600081905092915050565b600081905092915050565b600082825260208201905092915050565b600061243582612448565b9050919050565b60008115159050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b61247b826124d2565b810181811067ffffffffffffffff8211171561249a576124996124a3565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6000601f19601f8301169050919050565b7f62616420706c616e657468617368206d696d63206b6579000000000000000000600082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f4e6f2052657665616c206174206c6f636174696f6e0000000000000000000000600082015250565b7f76657269667952657665616c50726f6f66207265766572746564000000000000600082015250565b7f626164207065726c696e206d6972726f72207800000000000000000000000000600082015250565b7f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160008201527f647920696e697469616c697a6564000000000000000000000000000000000000602082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b7f626164207065726c696e206c656e677468207363616c65000000000000000000600082015250565b7f626164207065726c696e206d6972726f72207900000000000000000000000000600082015250565b7f496e76616c69642072657665616c2070726f6f66000000000000000000000000600082015250565b7f62616420737061636574797065206d696d63206b657900000000000000000000600082015250565b7f506c616e657420616c72656164792072657665616c6564000000000000000000600082015250565b6127248161242a565b811461272f57600080fd5b50565b61273b8161243c565b811461274657600080fd5b50565b61275281612468565b811461275d57600080fd5b5056fea2646970667358221220692d707588197162d6b5f36e9584b75a452c7b0869583c208330694448494fd664736f6c63430008040033";

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
