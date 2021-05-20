//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

abstract contract Verifier {
    function verifyRevealProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[9] memory input
    ) public virtual returns (bool);
}

abstract contract DarkForestCore {
    struct RevealedCoords {
        uint256 locationId;
        uint256 x;
        uint256 y;
        address revealer;
    }

    function getRevealedCoords(uint256 locationId) public virtual returns (RevealedCoords memory);
}

contract RevealMarket is Ownable, Initializable {
    event RevealRequested(address requester, uint256 loc, uint256 x, uint256 y, uint256 value);
    event RevealCollected(address collector, uint256 loc, uint256 x, uint256 y, uint256 value);

    Verifier private verifier;
    DarkForestCore private darkForestCore;

    /* solhint-disable var-name-mixedcase */
    uint256 public PLANETHASH_KEY;
    uint256 public SPACETYPE_KEY;
    uint256 public BIOMEBASE_KEY;
    bool public PERLIN_MIRROR_X;
    bool public PERLIN_MIRROR_Y;
    uint256 public PERLIN_LENGTH_SCALE;
    /* solhint-enable var-name-mixedcase */

    mapping(uint256 => RevealRequest) private revealRequests;
    uint256[] private revealRequestIds;

    function initialize(
        address verifierAddress,
        address coreAddress,
        uint256 planetHashKey,
        uint256 spacetypeKey,
        uint256 biomebaseKey,
        bool perlinMirrorX,
        bool perlinMirrorY,
        uint256 perlinLengthScale
    ) public onlyOwner initializer {
        verifier = Verifier(verifierAddress);
        darkForestCore = DarkForestCore(coreAddress);

        PLANETHASH_KEY = planetHashKey;
        SPACETYPE_KEY = spacetypeKey;
        BIOMEBASE_KEY = biomebaseKey;
        PERLIN_MIRROR_X = perlinMirrorX;
        PERLIN_MIRROR_Y = perlinMirrorY;
        PERLIN_LENGTH_SCALE = perlinLengthScale;
    }

    function requestReveal(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) public payable {
        RevealRequest memory possibleRevealRequest = revealRequests[_input[0]];
        require(possibleRevealRequest.location == 0, "RevealRequest already exists");

        try verifier.verifyRevealProof(_a, _b, _c, _input) returns (bool success) {
            require(success, "Invalid reveal proof");
        } catch {
            revert("verifyRevealProof reverted");
        }

        _revertIfBadSnarkPerlinFlags([_input[4], _input[5], _input[6], _input[7], _input[8]], false);

        DarkForestCore.RevealedCoords memory revealed = darkForestCore.getRevealedCoords(_input[0]);
        require(revealed.locationId == 0, "Planet already revealed");

        RevealRequest memory revealRequest =
            RevealRequest({
                requester: msg.sender,
                location: _input[0],
                x: _input[2],
                y: _input[3],
                value: msg.value,
                paid: false
            });

        revealRequests[revealRequest.location] = revealRequest;
        revealRequestIds.push(revealRequest.location);

        emit RevealRequested(
            revealRequest.requester,
            revealRequest.location,
            revealRequest.x,
            revealRequest.y,
            revealRequest.value
        );
    }

    function claimReveal(uint256 location) public {
        RevealRequest memory revealRequest = revealRequests[location];
        require(revealRequest.location != 0, "No RevealRequest for that Planet");
        require(revealRequest.paid == false, "RevealRequest has been claimed");

        DarkForestCore.RevealedCoords memory revealed = darkForestCore.getRevealedCoords(location);
        require(revealed.locationId != 0, "Planet is not revealed");

        revealRequest.paid = true;
        revealRequests[revealRequest.location] = revealRequest;

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = payable(revealed.revealer).call{value: revealRequest.value}("");
        require(success, "RevealRequest claim has failed");

        emit RevealCollected(
            revealed.revealer,
            revealRequest.location,
            revealRequest.x,
            revealRequest.y,
            revealRequest.value
        );
    }

    function getNRevealRequests() public view returns (uint256) {
        return revealRequestIds.length;
    }

    function getRevealRequestId(uint256 idx) private view returns (uint256) {
        return revealRequestIds[idx];
    }

    function getRevealRequest(uint256 location) public view returns (RevealRequest memory) {
        RevealRequest memory revealRequest = revealRequests[location];
        require(revealRequest.location != 0, "No RevealRequest for that Planet");
        return revealRequest;
    }

    function bulkGetRevealRequests(uint256 startIdx, uint256 endIdx) public view returns (RevealRequest[] memory ret) {
        ret = new RevealRequest[](endIdx - startIdx);
        for (uint256 i = startIdx; i < endIdx; i++) {
            ret[i - startIdx] = getRevealRequest(getRevealRequestId(i));
        }
    }

    function getAllRevealRequests() public view returns (RevealRequest[] memory) {
        return bulkGetRevealRequests(0, revealRequestIds.length);
    }

    // if you don't check the public input snark perlin config values, then a player could specify a planet with for example the wrong PLANETHASH_KEY and the SNARK would verify but they'd have created an invalid planet.
    // the zkSNARK verification function checks that the SNARK proof is valid; a valid proof might be "i know the existence of a planet at secret coords with address 0x123456... and mimc key 42". but if this universe's mimc key is 43 this is still an invalid planet, so we have to check that this SNARK proof is a proof for the right mimc key (and spacetype key, perlin length scale, etc.)
    function _revertIfBadSnarkPerlinFlags(uint256[5] memory perlinFlags, bool checkingBiome)
        private
        view
        returns (bool)
    {
        require(perlinFlags[0] == PLANETHASH_KEY, "bad planethash mimc key");
        if (checkingBiome) {
            require(perlinFlags[1] == BIOMEBASE_KEY, "bad spacetype mimc key");
        } else {
            require(perlinFlags[1] == SPACETYPE_KEY, "bad spacetype mimc key");
        }
        require(perlinFlags[2] == PERLIN_LENGTH_SCALE, "bad perlin length scale");
        require((perlinFlags[3] == 1) == PERLIN_MIRROR_X, "bad perlin mirror x");
        require((perlinFlags[4] == 1) == PERLIN_MIRROR_Y, "bad perlin mirror y");

        return true;
    }
}

struct RevealRequest {
    address requester;
    uint256 location;
    uint256 x;
    uint256 y;
    uint256 value;
    bool paid;
}
