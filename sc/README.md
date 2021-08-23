# Smart Contract Monitoring Proof of Concept

## Smart Contract Test Harness
This project contains an experimental smart contract called Custodian that contains simple deposit and withdrawal methods, a few member variables, and fires a few events. It is deployed on a hardhat node and run via a driver script. The driver script randomly calls deposit and withdraw across 10 accounts to generate traffic that can be reported to prometheus.

To run this example:

Call one time to fetch dependencies:
`yarn`

Then call:
`yarn start`