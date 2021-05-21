//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract DarkForestCore {
    struct RevealedCoords {
        uint256 locationId;
        uint256 x;
        uint256 y;
        address revealer;
    }

    function checkRevealProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[9] memory input
    ) public virtual returns (bool);

    function getRevealedCoords(uint256 locationId) public virtual returns (RevealedCoords memory);
}

contract RevealMarket is Ownable {
    event RevealRequested(address requester, uint256 loc, uint256 x, uint256 y, uint256 value);
    event RevealCollected(address collector, uint256 loc, uint256 x, uint256 y, uint256 value);
    event RevealCancelled(
        address requester,
        uint256 loc,
        uint256 x,
        uint256 y,
        uint256 value,
        uint256 cancelCompleteBlock
    );
    event RevealRefunded(
        address requester,
        uint256 loc,
        uint256 x,
        uint256 y,
        uint256 value,
        uint256 cancelCompleteBlock
    );

    DarkForestCore private darkForestCore;

    /* solhint-disable var-name-mixedcase */
    uint256 public MARKET_CLOSE_COUNTDOWN_TIMESTAMP;
    uint256 public CANCELLED_COUNTDOWN_BLOCKS;
    /* solhint-enable var-name-mixedcase */

    mapping(uint256 => RevealRequest) private revealRequests;
    uint256[] private revealRequestIds;

    modifier open() {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp < MARKET_CLOSE_COUNTDOWN_TIMESTAMP, "Marketplace has closed");
        _;
    }

    // give a 10 block confirmation window so we couldn't front run any last withdraws
    modifier closed() {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp >= MARKET_CLOSE_COUNTDOWN_TIMESTAMP + 10, "Marketplace is still open");
        _;
    }

    constructor(
        address coreAddress,
        uint256 _marketClosedCountdownTimestamp,
        uint256 _cancelledCountdownBlocks
    ) {
        darkForestCore = DarkForestCore(coreAddress);

        MARKET_CLOSE_COUNTDOWN_TIMESTAMP = _marketClosedCountdownTimestamp;
        CANCELLED_COUNTDOWN_BLOCKS = _cancelledCountdownBlocks;
    }

    // At market close, any unwithdrawn funds are swept by us
    function rugPull() public onlyOwner closed {
        payable(owner()).transfer(address(this).balance);
    }

    function requestReveal(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) public payable open {
        RevealRequest memory possibleRevealRequest = revealRequests[_input[0]];
        require(possibleRevealRequest.location == 0, "RevealRequest already exists");

        try darkForestCore.checkRevealProof(_a, _b, _c, _input) returns (bool success) {
            // It should NEVER revert here because `checkRevealProof` reverts on all bad values
            // and only returns if success == true
            require(success == true, "Disaster with reveal proof");
        } catch {
            revert("Invalid reveal proof");
        }

        DarkForestCore.RevealedCoords memory revealed = darkForestCore.getRevealedCoords(_input[0]);
        require(revealed.locationId == 0, "Planet already revealed");

        RevealRequest memory revealRequest =
            RevealRequest({
                requester: msg.sender,
                location: _input[0],
                x: _input[2],
                y: _input[3],
                value: msg.value,
                paid: false,
                refunded: false,
                cancelCompleteBlock: 0
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

    function cancelReveal(uint256 location) public open {
        RevealRequest memory revealRequest = revealRequests[location];
        require(revealRequest.location != 0, "No RevealRequest for that Planet");
        require(revealRequest.paid == false, "RevealRequest already claimed");
        require(revealRequest.cancelCompleteBlock == 0, "RevealRequest already cancelled");

        DarkForestCore.RevealedCoords memory revealed = darkForestCore.getRevealedCoords(location);
        require(revealed.locationId == 0, "Planet already revealed");

        revealRequest.cancelCompleteBlock = block.number + CANCELLED_COUNTDOWN_BLOCKS;
        revealRequests[revealRequest.location] = revealRequest;

        emit RevealCancelled(
            revealed.revealer,
            revealRequest.location,
            revealRequest.x,
            revealRequest.y,
            revealRequest.value,
            revealRequest.cancelCompleteBlock
        );
    }

    function claimReveal(uint256 location) public open {
        RevealRequest memory revealRequest = revealRequests[location];
        require(revealRequest.location != 0, "No RevealRequest for that Planet");
        require(revealRequest.paid == false, "RevealRequest has been claimed");
        require(revealRequest.refunded == false, "RevealRequest was cancelled");

        if (revealRequest.cancelCompleteBlock != 0) {
            require(block.number <= revealRequest.cancelCompleteBlock, "RevealRequest was cancelled");
        }

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

    function claimRefund(uint256 location) public open {
        RevealRequest memory revealRequest = revealRequests[location];
        require(revealRequest.location != 0, "No RevealRequest for that Planet");
        require(revealRequest.paid == false, "RevealRequest has been claimed");
        require(revealRequest.cancelCompleteBlock != 0, "RevealRequest not canceled");
        require(revealRequest.refunded == false, "RevealRequest was refunded");
        require(block.number > revealRequest.cancelCompleteBlock, "Cancel countdown not complete");

        revealRequest.refunded = true;
        revealRequests[revealRequest.location] = revealRequest;

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, ) = payable(revealRequest.requester).call{value: revealRequest.value}("");
        require(success, "RevealRequest claim has failed");

        emit RevealRefunded(
            revealRequest.requester,
            revealRequest.location,
            revealRequest.x,
            revealRequest.y,
            revealRequest.value,
            revealRequest.cancelCompleteBlock
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
}

struct RevealRequest {
    address requester;
    uint256 location;
    uint256 x;
    uint256 y;
    uint256 value;
    bool paid;
    bool refunded;
    uint256 cancelCompleteBlock;
}
