const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const ONE_DAY = 86400;
  const SilentBid = await ethers.getContractFactory("SilentBid");
  const auction = await SilentBid.deploy(ONE_DAY);
  await auction.waitForDeployment();

  console.log("SilentBid deployed to:", await auction.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
