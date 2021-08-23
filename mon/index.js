'use strict';

const express = require('express');
const cluster = require('cluster');
const server = express();
const register = require('prom-client').register;
const prom = require('prom-client');
const ethers = require('ethers');
const fs = require('fs');

let contracts;
let data;

// Read the deployed Custodian address
data = fs.readFileSync('./../sc/contracts.json', 'utf-8');
contracts = new Map(JSON.parse(data))

// Read the compiled Custodian abi 
data = fs.readFileSync("../sc/artifacts/contracts/Custodian.sol/Custodian.json", 'utf-8');
let abi = JSON.parse(data).abi;

const provider = ethers.providers.getDefaultProvider("http://127.0.0.1:8545");
const custodian = new ethers.Contract(contracts.get("Custodian"), abi, provider);

const Gauge = prom.Gauge;
new Gauge({
	name: 'custodian_total_balance_eth',
	help: 'Total balance of Custodian contract in eth',
	// collect is invoked each time `register.metrics()` is called.
  collect() {
    custodian.totalBalance().then((totalBalance) => {
      this.set(Number(ethers.utils.formatEther(totalBalance)));
    });    
	},
//	labelNames: ['method', 'code'],
});

new Gauge({
	name: 'custodian_withdraw_failures',
	help: 'Count of Custodian contract withdraw failures',
	// collect is invoked each time `register.metrics()` is called.
  collect() {
    custodian.withdrawFailures().then((failures) => {
      this.set(failures.toNumber());
    });    
	},
//	labelNames: ['method', 'code'],
});

// Setup server to Prometheus scrapes:

server.get('/metrics', async (req, res) => {
	try {
		res.set('Content-Type', register.contentType);
		res.end(await register.metrics());
	} catch (ex) {
		res.status(500).end(ex);
	}
});

const port = process.env.PORT || 4000;
console.log(
	`Server listening to ${port}, metrics exposed on /metrics endpoint`,
);
server.listen(port);