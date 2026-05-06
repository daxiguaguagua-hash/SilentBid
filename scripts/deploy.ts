import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Counter = await ethers.getContractFactory("EncryptedCounter");
  const counter = await Counter.deploy();
  await counter.waitForDeployment();

  console.log("EncryptedCounter deployed to:", await counter.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
