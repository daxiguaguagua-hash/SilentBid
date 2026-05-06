import { expect } from "chai";
import { ethers } from "hardhat";

describe("EncryptedCounter — Day 1 spike", function () {
  it("should deploy and store a trivial encrypted value", async function () {
    const [owner] = await ethers.getSigners();
    const Counter = await ethers.getContractFactory("EncryptedCounter");
    const counter = await Counter.deploy();
    await counter.waitForDeployment();

    // Trivial encrypt: store 42
    await counter.connect(owner).setValueTrivial(42);

    // Read back the handle
    const handle = await counter.getValue();
    expect(handle).to.not.equal(ethers.ZeroHash);
  });

  it("should update the encrypted value", async function () {
    const [owner] = await ethers.getSigners();
    const Counter = await ethers.getContractFactory("EncryptedCounter");
    const counter = await Counter.deploy();
    await counter.waitForDeployment();

    await counter.connect(owner).setValueTrivial(7);
    let handle = await counter.getValue();
    expect(handle).to.not.equal(ethers.ZeroHash);

    // Update
    await counter.connect(owner).setValueTrivial(99);
    handle = await counter.getValue();
    expect(handle).to.not.equal(ethers.ZeroHash);
  });
});
