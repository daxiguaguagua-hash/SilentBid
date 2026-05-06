import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Deploy SilentBid with 1 day duration
  const ONE_DAY = 86400;
  const SilentBid = await ethers.getContractFactory("SilentBid");
  const auction = await SilentBid.deploy(ONE_DAY);
  await auction.waitForDeployment();

  console.log("SilentBid deployed to:", await auction.getAddress());

  // Also deploy EncryptedCounter for reference
  const Counter = await ethers.getContractFactory("EncryptedCounter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();
  console.log("EncryptedCounter deployed to:", await counter.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
