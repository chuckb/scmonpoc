const accounts = require('../test-1020-accounts.json');
const fs = require('fs');

async function main() {
  const promises = [];
  const contracts = new Map();

  const [deployer, ...addrs] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Use ethers to deploy the Custodian smart contract. Man, I hate ethers.
  // But, I tried it. Still don't like it.
  const Custodian = await ethers.getContractFactory("Custodian");
  custodian = await Custodian.deploy();
  // Store the deployed contract's address for use in the prometheus slurp script.
  contracts.set("Custodian", custodian.address);
  const serializedContractsMap = JSON.stringify(Array.from(contracts.entries()));
  fs.writeFile('./contracts.json', serializedContractsMap, (err) => {
    if (err != null) {
      console.log(`Contracts json file write failed. Err = ${err}`);
    }
  });

  console.log("Custodian address:", custodian.address);

  // Prime promises for the number of accounts to run
  for (let i = 0; i < 10; i++) {
    promises[i] = makeCustodianPromise(i, addrs[i]);
  }

  // Spin forever and pound hardhat with transactions
  while(true) {
    const index = await Promise.race(promises);
    promises[index] = makeCustodianPromise(index, addrs[index]);
  }    
}

function getRandomEther() {
  // Ether between 0-10
  const amount = Math.floor((Math.random() * 11)).toString();
  return ethers.utils.parseEther(amount);
}

function getRandomFrequency() {
  // Frequency between 0-5999 millseconds
  const freq = Math.floor((Math.random() * 6000))
  return freq;
}

function getRandomOp() {
  const op = Math.floor((Math.random() * 3) + 1).toString();
  return op;
}

const makeCustodianPromise = (i, addr) => {
  return new Promise(async (resolve) => {
    // Sleep for a bit
    const delay = getRandomFrequency();
    await sleep(delay);
    // Get a random operation to perform
    const op = getRandomOp();
    // Get some random amount of ether to diddle with
    const ether = getRandomEther();
    // Determine what op to run
    if (op == 1) {
      // Do a withdrawal
      console.log(`Withdraw ${ether} to ${addr.address}`);
      await custodian.connect(addr).withdraw(ether);
    } else {
      // Do a deposit
      let params = {
        value: ether,
      };
      console.log(`Deposit ${ether} from ${addr.address}`);
      await custodian.connect(addr).deposit(params);
    }
    resolve(i);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });