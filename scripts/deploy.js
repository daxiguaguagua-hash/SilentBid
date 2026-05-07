const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const ONE_DAY = 86400;
  const durationDays = parseInt(process.env.AUCTION_DURATION_DAYS || "7", 10);
  const duration = durationDays * ONE_DAY;
  console.log(`Auction duration: ${durationDays} days (${duration} seconds)`);

  const SilentBid = await ethers.getContractFactory("SilentBid");
  const auction = await SilentBid.deploy(duration);
  await auction.waitForDeployment();

  const address = await auction.getAddress();
  console.log("SilentBid deployed to:", address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
