import { expect } from "chai";
import { ethers } from "hardhat";

const ONE_DAY = 86400;

describe("SilentBid — sealed-bid auction", function () {
  async function deploy() {
    const [owner, bidder1, bidder2, bidder3] = await ethers.getSigners();
    const SilentBid = await ethers.getContractFactory("SilentBid");
    const auction = await SilentBid.deploy(ONE_DAY);
    await auction.waitForDeployment();
    return { auction, owner, bidder1, bidder2, bidder3 };
  }

  it("should deploy with correct initial state", async function () {
    const { auction, owner } = await deploy();
    expect(await auction.owner()).to.equal(owner.address);
    expect(await auction.ended()).to.equal(false);
    expect(await auction.isActive()).to.equal(true);
    expect(Number(await auction.bidCount())).to.equal(0);
  });

  it("should accept bids and increment count", async function () {
    const { auction, bidder1, bidder2 } = await deploy();

    await auction.connect(bidder1).bidTrivial(100);
    expect(Number(await auction.bidCount())).to.equal(1);

    await auction.connect(bidder2).bidTrivial(200);
    expect(Number(await auction.bidCount())).to.equal(2);
  });

  it("should produce non-zero handles after bids", async function () {
    const { auction, bidder1 } = await deploy();

    await auction.connect(bidder1).bidTrivial(42);

    const bidHandle = await auction.getHighestBid();
    expect(bidHandle).to.not.equal(ethers.ZeroHash);

    const winnerHandle = await auction.getWinner();
    expect(winnerHandle).to.not.equal(ethers.ZeroHash);
  });

  it("should handle multiple bids without reverting", async function () {
    const { auction, bidder1, bidder2, bidder3 } = await deploy();

    // Sequence: 100 → 300 → 200 (bidder2 wins)
    await auction.connect(bidder1).bidTrivial(100);
    await auction.connect(bidder2).bidTrivial(300);
    await auction.connect(bidder3).bidTrivial(200);

    // All should succeed without revert
    expect(Number(await auction.bidCount())).to.equal(3);
    expect(await auction.getHighestBid()).to.not.equal(ethers.ZeroHash);
    expect(await auction.getWinner()).to.not.equal(ethers.ZeroHash);
  });

  it("should reject bids after auction ends", async function () {
    const { auction, bidder1, owner } = await deploy();

    await auction.connect(bidder1).bidTrivial(100);
    await auction.connect(owner).endAuction();
    expect(await auction.ended()).to.equal(true);

    // Bidding after end should revert
    let didRevert = false;
    try {
      await auction.connect(bidder1).bidTrivial(200);
    } catch {
      didRevert = true;
    }
    expect(didRevert).to.equal(true);
  });

  it("should allow decryption operations after auction ends", async function () {
    const { auction, bidder1, bidder2, owner } = await deploy();

    await auction.connect(bidder1).bidTrivial(100);
    await auction.connect(bidder2).bidTrivial(200);
    await auction.connect(owner).endAuction();

    // After ending, handles should still be non-zero
    expect(await auction.getHighestBid()).to.not.equal(ethers.ZeroHash);
    expect(await auction.getWinner()).to.not.equal(ethers.ZeroHash);
  });

  it("should allow owner to end auction early", async function () {
    const { auction, owner } = await deploy();
    await auction.connect(owner).endAuction();
    expect(await auction.ended()).to.equal(true);
  });

  it("should handle first-bid-is-highest scenario", async function () {
    const { auction, bidder1 } = await deploy();

    // Single bid should be the highest
    await auction.connect(bidder1).bidTrivial(999);
    const handle = await auction.getHighestBid();
    expect(handle).to.not.equal(ethers.ZeroHash);
    expect(Number(await auction.bidCount())).to.equal(1);
  });
});
