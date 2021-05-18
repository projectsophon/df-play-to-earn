//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract Verifier {
    function verifyRevealProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[9] memory input
    ) public virtual returns (bool);
}

contract RevealMarket is OwnableUpgradeable {
    event RevealBountyAnnounced(address revealer, uint256 loc);

    Verifier private verifier;

    function initialize(address _verifierAddress) public initializer {
        __Ownable_init();

        verifier = Verifier(_verifierAddress);
    }

    function createRevealBounty(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) public payable {
        try verifier.verifyRevealProof(_a, _b, _c, _input) returns (bool success) {
            require(success, "Invalid reveal proof");
        } catch (
            bytes memory /*lowLevelData*/
        ) {
            revert("verifyRevealProof failed");
        }

        emit RevealBountyAnnounced(msg.sender, _input[0]);
    }

    function setVerifier(address _verifierAddress) public onlyOwner {
        verifier = Verifier(_verifierAddress);
    }
}
