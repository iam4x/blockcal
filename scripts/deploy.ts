/* eslint-disable no-console */
/* eslint-disable no-process-exit */
import { ethers } from 'hardhat';

async function main(): Promise<void> {
  const BlockCalContract = await ethers.getContractFactory('BlockCal');
  const blockCal = await BlockCalContract.deploy();
  console.log(`Contract deployed to address: ${blockCal.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
