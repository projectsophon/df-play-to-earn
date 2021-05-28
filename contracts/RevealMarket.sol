//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract RevealMarket is Ownable, ReentrancyGuard {
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

    DarkForestCore private immutable darkForestCore;

    /* solhint-disable var-name-mixedcase */
    uint256 public immutable MARKET_CLOSE_COUNTDOWN_TIMESTAMP;
    uint256 public immutable CANCELLED_COUNTDOWN_BLOCKS;
    uint256 public immutable REQUEST_MINIMUM;
    uint256 public immutable REQUEST_MAXIMUM;
    uint8 public immutable FEE_PERCENT;
    /* solhint-enable var-name-mixedcase */

    mapping(uint256 => RevealRequest) private revealRequests;
    uint256[] private revealRequestIds;

    modifier open() {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp < MARKET_CLOSE_COUNTDOWN_TIMESTAMP, "Marketplace has closed");
        _;
    }

    modifier closed() {
        // solhint-disable-next-line not-rely-on-time
        require(block.timestamp >= MARKET_CLOSE_COUNTDOWN_TIMESTAMP, "Marketplace is still open");
        _;
    }

    constructor(
        address _darkForestCoreAddress,
        uint256 _marketOpenForHours,
        uint256 _cancelledCountdownBlocks,
        uint256 _requestMinimum,
        uint256 _requestMaximum,
        uint8 _feePercent
    ) {
        darkForestCore = DarkForestCore(_darkForestCoreAddress);

        // solhint-disable-next-line not-rely-on-time
        MARKET_CLOSE_COUNTDOWN_TIMESTAMP = block.timestamp + (_marketOpenForHours * 1 hours);
        CANCELLED_COUNTDOWN_BLOCKS = _cancelledCountdownBlocks;
        REQUEST_MINIMUM = _requestMinimum;
        REQUEST_MAXIMUM = _requestMaximum;
        FEE_PERCENT = _feePercent;
    }

    // At market close, any unwithdrawn funds are swept by us
    function rugPull() public onlyOwner closed {
        Address.sendValue(payable(owner()), address(this).balance);
    }

    function requestReveal(
        uint256[2] memory _a,
        uint256[2][2] memory _b,
        uint256[2] memory _c,
        uint256[9] memory _input
    ) external payable open nonReentrant {
        require(msg.value <= REQUEST_MAXIMUM, "Request value too high");
        require(msg.value >= REQUEST_MINIMUM, "Request value too low");

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

        uint256 fee = ((msg.value * FEE_PERCENT) / 100);
        uint256 payout = msg.value - fee;

        RevealRequest memory revealRequest =
            RevealRequest({
                requester: msg.sender,
                location: _input[0],
                x: _input[2],
                y: _input[3],
                payout: payout,
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
            revealRequest.payout
        );
    }

    function cancelReveal(uint256 location) external open nonReentrant {
        RevealRequest memory revealRequest = revealRequests[location];
        require(revealRequest.location != 0, "No RevealRequest for that Planet");
        require(revealRequest.requester == msg.sender, "Sender is not requester");
        require(revealRequest.paid == false, "RevealRequest already claimed");
        require(revealRequest.cancelCompleteBlock == 0, "RevealRequest already cancelled");

        revealRequest.cancelCompleteBlock = block.number + CANCELLED_COUNTDOWN_BLOCKS;
        revealRequests[revealRequest.location] = revealRequest;

        emit RevealCancelled(
            revealRequest.requester,
            revealRequest.location,
            revealRequest.x,
            revealRequest.y,
            revealRequest.payout,
            revealRequest.cancelCompleteBlock
        );
    }

    function claimReveal(uint256 location) external open nonReentrant {
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

        Address.sendValue(payable(revealed.revealer), revealRequest.payout);

        emit RevealCollected(
            revealed.revealer,
            revealRequest.location,
            revealRequest.x,
            revealRequest.y,
            revealRequest.payout
        );
    }

    function claimRefund(uint256 location) external open nonReentrant {
        RevealRequest memory revealRequest = revealRequests[location];
        require(revealRequest.location != 0, "No RevealRequest for that Planet");
        require(revealRequest.paid == false, "RevealRequest has been claimed");
        require(revealRequest.cancelCompleteBlock != 0, "RevealRequest not canceled");
        require(revealRequest.refunded == false, "RevealRequest was refunded");
        require(block.number > revealRequest.cancelCompleteBlock, "Cancel countdown not complete");

        revealRequest.refunded = true;
        revealRequests[revealRequest.location] = revealRequest;

        Address.sendValue(payable(revealRequest.requester), revealRequest.payout);

        emit RevealRefunded(
            revealRequest.requester,
            revealRequest.location,
            revealRequest.x,
            revealRequest.y,
            revealRequest.payout,
            revealRequest.cancelCompleteBlock
        );
    }

    function getConstants() public view returns (Constants memory) {
        return
            Constants({
                MARKET_CLOSE_COUNTDOWN_TIMESTAMP: MARKET_CLOSE_COUNTDOWN_TIMESTAMP,
                CANCELLED_COUNTDOWN_BLOCKS: CANCELLED_COUNTDOWN_BLOCKS,
                REQUEST_MINIMUM: REQUEST_MINIMUM,
                FEE_PERCENT: FEE_PERCENT
            });
    }

    function getNRevealRequests() public view returns (uint256) {
        return revealRequestIds.length;
    }

    function getRevealRequest(uint256 location) public view returns (RevealRequest memory) {
        RevealRequest memory revealRequest = revealRequests[location];
        require(revealRequest.location != 0, "No RevealRequest for that Planet");
        return revealRequest;
    }

    function bulkGetRevealRequests(uint256 startIdx, uint256 endIdx) public view returns (RevealRequest[] memory ret) {
        ret = new RevealRequest[](endIdx - startIdx);
        for (uint256 idx = startIdx; idx < endIdx; idx++) {
            ret[idx - startIdx] = getRevealRequest(revealRequestIds[idx]);
        }
    }

    function getAllRevealRequests() public view returns (RevealRequest[] memory) {
        return bulkGetRevealRequests(0, revealRequestIds.length);
    }
}

struct Constants {
    /* solhint-disable var-name-mixedcase */
    uint256 MARKET_CLOSE_COUNTDOWN_TIMESTAMP;
    uint256 CANCELLED_COUNTDOWN_BLOCKS;
    uint256 REQUEST_MINIMUM;
    uint8 FEE_PERCENT;
    /* solhint-enable var-name-mixedcase */
}

struct RevealRequest {
    address requester;
    uint256 location;
    uint256 x;
    uint256 y;
    uint256 payout;
    bool paid;
    bool refunded;
    uint256 cancelCompleteBlock;
}

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
