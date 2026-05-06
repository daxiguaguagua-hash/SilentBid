// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint32, ebool, eaddress, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title SilentBid — Privacy-preserving sealed-bid auction on Zama FHEVM
/// @notice Bidders submit encrypted bids. The contract maintains the encrypted
///         highest bid and winner using FHE.select. Only the winner is revealed
///         after the auction ends.
contract SilentBid is ZamaEthereumConfig {
    address public owner;
    bool public ended;
    uint256 public endTime;

    euint32 private _highestBid;
    eaddress private _winner;
    uint256 public bidCount;

    event BidSubmitted(address indexed bidder);
    event AuctionEnded(address indexed closer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier auctionActive() {
        require(!ended, "Auction ended");
        require(block.timestamp < endTime, "Auction expired");
        _;
    }

    constructor(uint256 _duration) {
        owner = msg.sender;
        endTime = block.timestamp + _duration;
        // Initialize with trivial zeros — all real bids will be higher
        _highestBid = FHE.asEuint32(0);
        FHE.allowThis(_highestBid); // Grant contract ACL on this handle
        _winner = FHE.asEaddress(address(0));
        FHE.allowThis(_winner);
    }

    /// @notice Submit an encrypted bid. Compares with current highest bid
    ///         using FHE.gt, then conditionally updates both highest bid
    ///         and winner using FHE.select — no plaintext branches.
    function bid(
        externalEuint32 encryptedBid,
        bytes calldata inputProof
    ) public auctionActive {
        euint32 newBid = FHE.fromExternal(encryptedBid, inputProof);
        FHE.allowThis(newBid);
        _processBid(newBid);
    }

    /// @dev Core bid logic shared by bid() and bidTrivial()
    function _processBid(euint32 newBid) private {
        // Compare with current highest → encrypted boolean
        ebool isHigher = FHE.gt(newBid, _highestBid);

        // Encrypted conditional updates — FHE.select avoids plaintext branches
        euint32 newHighest = FHE.select(isHigher, newBid, _highestBid);
        FHE.allowThis(newHighest);
        _highestBid = newHighest;

        eaddress bidderAddr = FHE.asEaddress(msg.sender);
        FHE.allowThis(bidderAddr);
        eaddress newWinner = FHE.select(isHigher, bidderAddr, _winner);
        FHE.allowThis(newWinner);
        _winner = newWinner;

        bidCount++;
        emit BidSubmitted(msg.sender);
    }

    /// @notice End the auction and grant decryption permissions.
    function endAuction() public {
        require(!ended, "Already ended");
        require(
            block.timestamp >= endTime || msg.sender == owner,
            "Too early"
        );
        ended = true;

        // Grant decryption permissions so relayer can reveal results
        FHE.allow(_highestBid, owner);
        FHE.allow(_winner, owner);

        emit AuctionEnded(msg.sender);
    }

    /// @notice Allow any user to decrypt the highest bid
    function allowBidDecryption(address user) public {
        FHE.allow(_highestBid, user);
    }

    /// @notice Allow any user to decrypt the winner
    function allowWinnerDecryption(address user) public {
        FHE.allow(_winner, user);
    }

    // --- Getters ---

    function getHighestBid() public view returns (euint32) {
        return _highestBid;
    }

    function getWinner() public view returns (eaddress) {
        return _winner;
    }

    function isActive() public view returns (bool) {
        return !ended && block.timestamp < endTime;
    }

    // --- Test helpers ---

    /// @dev Test-only: submit a bid using trivial encryption
    function bidTrivial(uint32 plainBid) public auctionActive {
        euint32 newBid = FHE.asEuint32(plainBid);
        FHE.allowThis(newBid);
        _processBid(newBid);
    }
}
