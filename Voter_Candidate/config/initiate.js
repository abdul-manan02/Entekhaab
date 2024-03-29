import { VOTE_CONTRACT_ABI, VOTE_CONTRACT_ADDRESS } from "./contract";

import Web3 from "web3";

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://rpc.ankr.com/polygon_mumbai")
);

web3.eth.accounts.wallet.add(process.env.WEB3_PRIVATE_KEY);
export const defaultAccount = web3.eth.accounts.wallet[0].address;

// Instantiate the contract
export const contractInstance = new web3.eth.Contract(
  VOTE_CONTRACT_ABI,
  VOTE_CONTRACT_ADDRESS
);

// const startTimestamp = await contractInstance.methods.startTime().call();
// const endTimestamp = await contractInstance.methods.endTime().call();
