//SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract BroadcastMarket is Ownable, ReentrancyGuard {
    event RevealRequested(uint256 loc);
    event RevealCollected(uint256 loc);
    event RevealCancelled(uint256 loc);
    event RevealRefunded(uint256 loc);

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

    mapping(uint256 => Coord) private coords;
    uint256[] private coordIds;

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

    function requestRevealPlanetId(
        uint256 _planetId
    ) external payable open nonReentrant {
        require(msg.value <= REQUEST_MAXIMUM, "Request value too high");
        require(msg.value >= REQUEST_MINIMUM, "Request value too low");

        RevealRequest memory possibleRevealRequest = revealRequests[_planetId];
        require(possibleRevealRequest.location == 0, "RevealRequest already exists");

        DarkForestCore.RevealedCoords memory revealed = darkForestCore.getRevealedCoords(_planetId);
        require(revealed.locationId == 0, "Planet already revealed");

        uint256 payout = (100 * msg.value) / (100 + FEE_PERCENT);

        RevealRequest memory revealRequest =
            RevealRequest({
                requester: msg.sender,
                collector: address(0),
                location: _planetId,
                payout: payout,
                paid: false,
                refunded: false,
                cancelCompleteBlock: 0,
                isKnown: false
            });

        revealRequests[revealRequest.location] = revealRequest;
        revealRequestIds.push(revealRequest.location);

        emit RevealRequested(revealRequest.location);
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

        uint256 payout = (100 * msg.value) / (100 + FEE_PERCENT);

        Coord memory coord =
            Coord({
                x: _input[2],
                y: _input[3],
                isInitialized: true
            });

        RevealRequest memory revealRequest =
            RevealRequest({
                requester: msg.sender,
                collector: address(0),
                location: _input[0],
                payout: payout,
                paid: false,
                refunded: false,
                cancelCompleteBlock: 0,
                isKnown: true
            });

        coords[revealRequest.location] = coord;
        coordIds.push(revealRequest.location);

        revealRequests[revealRequest.location] = revealRequest;
        revealRequestIds.push(revealRequest.location);

        emit RevealRequested(revealRequest.location);
    }

    function cancelReveal(uint256 location) external open nonReentrant {
        RevealRequest memory revealRequest = revealRequests[location];
        require(revealRequest.location != 0, "No RevealRequest for that Planet");
        require(revealRequest.requester == msg.sender, "Sender is not requester");
        require(revealRequest.paid == false, "RevealRequest already claimed");
        require(revealRequest.cancelCompleteBlock == 0, "RevealRequest already cancelled");

        revealRequest.cancelCompleteBlock = block.number + CANCELLED_COUNTDOWN_BLOCKS;
        revealRequests[revealRequest.location] = revealRequest;

        emit RevealCancelled(revealRequest.location);
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
        revealRequest.collector = revealed.revealer;
        revealRequests[revealRequest.location] = revealRequest;

        Address.sendValue(payable(revealed.revealer), revealRequest.payout);

        emit RevealCollected(revealRequest.location);
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

        emit RevealRefunded(revealRequest.location);
    }

    function getConstants() public view returns (Constants memory) {
        return
            Constants({
                MARKET_CLOSE_COUNTDOWN_TIMESTAMP: MARKET_CLOSE_COUNTDOWN_TIMESTAMP,
                CANCELLED_COUNTDOWN_BLOCKS: CANCELLED_COUNTDOWN_BLOCKS,
                REQUEST_MINIMUM: REQUEST_MINIMUM,
                REQUEST_MAXIMUM: REQUEST_MAXIMUM,
                FEE_PERCENT: FEE_PERCENT
            });
    }

    function getNCoords() public view returns (uint256) {
        return coordIds.length;
    }

    function getCoords(uint256 location) public view returns (Coord memory) {
        Coord memory coord = coords[location];
        require(coord.isInitialized, "No Coord for that Planet");
        return coord;
    }

    function bulkGetCoords(uint256 startIdx, uint256 endIdx) public view returns (Coord[] memory ret) {
        ret = new Coord[](endIdx - startIdx);
        for (uint256 idx = startIdx; idx < endIdx; idx++) {
            ret[idx - startIdx] = getCoords(coordIds[idx]);
        }
    }

    function getAllCoords() public view returns (Coord[] memory) {
        return bulkGetCoords(0, coordIds.length);
    }

    function getCoordsPage(uint256 pageIdx) public view returns (RevealRequest[] memory) {
        // Page size is 20 items
        uint256 startIdx = pageIdx * 20;
        require(startIdx <= coordIds.length, "Page number too high");
        uint256 pageEnd = startIdx + 20;
        uint256 endIdx = pageEnd <= coordIds.length ? pageEnd : coordIds.length;
        return bulkGetRevealRequests(startIdx, endIdx);
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

    function getRevealRequestPage(uint256 pageIdx) public view returns (RevealRequest[] memory) {
        // Page size is 20 items
        uint256 startIdx = pageIdx * 20;
        require(startIdx <= revealRequestIds.length, "Page number too high");
        uint256 pageEnd = startIdx + 20;
        uint256 endIdx = pageEnd <= revealRequestIds.length ? pageEnd : revealRequestIds.length;
        return bulkGetRevealRequests(startIdx, endIdx);
    }
}

struct Constants {
    /* solhint-disable var-name-mixedcase */
    uint256 MARKET_CLOSE_COUNTDOWN_TIMESTAMP;
    uint256 CANCELLED_COUNTDOWN_BLOCKS;
    uint256 REQUEST_MINIMUM;
    uint256 REQUEST_MAXIMUM;
    uint8 FEE_PERCENT;
    /* solhint-enable var-name-mixedcase */
}

struct RevealRequest {
    address requester;
    address collector;
    uint256 location;
    uint256 payout;
    uint256 cancelCompleteBlock;
    bool isKnown;
    bool paid;
    bool refunded;
}

struct Coord {
    uint256 x;
    uint256 y;
    bool isInitialized;
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
