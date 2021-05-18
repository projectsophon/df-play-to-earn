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

abstract contract DarkForestCore {
    /* solhint-disable var-name-mixedcase */
    struct SnarkConstants {
        bool DISABLE_ZK_CHECKS;
        uint256 PLANETHASH_KEY;
        uint256 SPACETYPE_KEY;
        uint256 BIOMEBASE_KEY;
        bool PERLIN_MIRROR_X;
        bool PERLIN_MIRROR_Y;
        uint256 PERLIN_LENGTH_SCALE; // must be a power of two up to 8192
    }

    struct RevealedCoords {
        uint256 locationId;
        uint256 x;
        uint256 y;
        // TODO: add this for new contracts
        // address revealer;
    }

    function snarkConstants() public virtual returns (SnarkConstants memory);

    function getRevealedCoords(uint256 locationId) public virtual returns (RevealedCoords memory);
}

contract RevealMarket is OwnableUpgradeable {
    event RevealBountyAnnounced(address revealer, uint256 loc);

    Verifier private verifier;
    DarkForestCore private darkForestCore;

    DarkForestCore.SnarkConstants private snarkConstants;

    function initialize(address _verifierAddress, address _coreAddress) public initializer {
        __Ownable_init();

        verifier = Verifier(_verifierAddress);
        darkForestCore = DarkForestCore(_coreAddress);
        snarkConstants = darkForestCore.snarkConstants();
    }

    function createRevealBounty(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) public payable {
        try verifier.verifyRevealProof(_a, _b, _c, _input) returns (bool success) {
            require(success, "Invalid reveal proof");
        } catch {
            revert("verifyRevealProof reverted");
        }

        revertIfBadSnarkPerlinFlags([_input[4], _input[5], _input[6], _input[7], _input[8]], false);

        DarkForestCore.RevealedCoords memory revealed = darkForestCore.getRevealedCoords(_input[0]);
        require(revealed.locationId == 0, "Planet already revealed");

        emit RevealBountyAnnounced(msg.sender, _input[0]);
    }

    function setVerifier(address _verifierAddress) public onlyOwner {
        verifier = Verifier(_verifierAddress);
    }

    function setDarkForestCore(address _coreAddress) public onlyOwner {
        darkForestCore = DarkForestCore(_coreAddress);
    }

    // if you don't check the public input snark perlin config values, then a player could specify a planet with for example the wrong PLANETHASH_KEY and the SNARK would verify but they'd have created an invalid planet.
    // the zkSNARK verification function checks that the SNARK proof is valid; a valid proof might be "i know the existence of a planet at secret coords with address 0x123456... and mimc key 42". but if this universe's mimc key is 43 this is still an invalid planet, so we have to check that this SNARK proof is a proof for the right mimc key (and spacetype key, perlin length scale, etc.)
    function revertIfBadSnarkPerlinFlags(uint256[5] memory perlinFlags, bool checkingBiome) public view returns (bool) {
        require(perlinFlags[0] == snarkConstants.PLANETHASH_KEY, "bad planethash mimc key");
        if (checkingBiome) {
            require(perlinFlags[1] == snarkConstants.BIOMEBASE_KEY, "bad spacetype mimc key");
        } else {
            require(perlinFlags[1] == snarkConstants.SPACETYPE_KEY, "bad spacetype mimc key");
        }
        require(perlinFlags[2] == snarkConstants.PERLIN_LENGTH_SCALE, "bad perlin length scale");
        require((perlinFlags[3] == 1) == snarkConstants.PERLIN_MIRROR_X, "bad perlin mirror x");
        require((perlinFlags[4] == 1) == snarkConstants.PERLIN_MIRROR_Y, "bad perlin mirror y");

        return true;
    }
}
