import Voter_Candidate from "../models/voter_candidate.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";
import {
  VOTE_CONTRACT_ABI,
  VOTE_CONTRACT_ADDRESS,
} from "../config/contract.js";
import Web3 from "web3";
import ElectionVotes from "../models/election_votes.js";

const getAllAccounts = async (req, res) => {
  try {
    const accountList = await Voter_Candidate.find();
    res.status(200).json({ accountList });
  } catch (error) {
    res.status(404).json({ msg: error });
  }
};

/*
    User initiates getCitizenDataByCnic.
    The provided CNIC and name are compared with the citizen data.
    If there's a match, the user is offered a SIM selection option.
    Upon selecting a SIM, an OTP (One-Time Password) is sent.
    After OTP verification, the user inputs a password.
    The user is presented with two addresses and selects one.
    The frontend sends the following attributes in req.body.
    A voter record is created.
*/
const createAccount = async (req, res) => {
  try {
    const { cnic, password, citizenDataId, selectedSim, votingAddress } =
      req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAccount = {
      cnic,
      password: hashedPassword,
      citizenDataId,
      selectedSim,
      votingAddress,
    };

    console.log("new", newAccount);
    const newUser = await Voter_Candidate.create(newAccount);
    res.status(200).json({ newUser });
  } catch (error) {
    res.status(400).json({ msg: error });
  }
};

const login = async (req, res) => {
  try {
    const { cnic, password } = req.body;
    const account = await Voter_Candidate.findOne({ cnic });

    if (!account) return res.status(400).json({ msg: "Account not found" });
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ userId: account._id }, process.env.JWT_KEY, {
      expiresIn: "24h",
    });

    res.status(200).json({ account, token });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
};

const getAccountById = async (req, res) => {
  try {
    const account = await Voter_Candidate.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    const citizenDataEndpoint = `http://localhost:1000/api/v1/citizenData/id/${account.citizenDataId}`;
    const citizenDataResponse = await axios.get(citizenDataEndpoint);
    if (!citizenDataResponse.data) {
      return res.status(404).json({ msg: "Citizen data not found" });
    }

    const citizenData = citizenDataResponse.data;
    const { citizenDataId, ...accountData } = account.toObject();
    accountData.CitizenData = citizenData;
    res.status(200).json(accountData);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getAccountByCnic = async (req, res) => {
  try {
    const account = await Voter_Candidate.findOne({ cnic: req.params.cnic });

    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }

    const citizenDataEndpoint = `http://localhost:1000/api/v1/citizenData/id/${account.citizenDataId}`;
    const citizenDataResponse = await axios.get(citizenDataEndpoint);
    if (!citizenDataResponse.data) {
      return res.status(404).json({ msg: "Citizen data not found" });
    }

    const citizenData = citizenDataResponse.data;
    const { citizenDataId, ...accountData } = account.toObject();
    accountData.CitizenData = citizenData;
    res.status(200).json(accountData);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getElections = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;
    const electionEndpoint = `http://localhost:1002/api/v1/admin/election/started`;
    const electionResponse = await axios.get(electionEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const elections = electionResponse.data;
    const isVoterInElection = elections.some((election) =>
      election.voter_bank.some((voter) => voter.voterId === id)
    );

    if (isVoterInElection) {
      res.status(200).json(elections);
    } else {
      res.status(200).json({ msg: "Voter is not in the election" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getElectionsCreated = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;
    const electionEndpoint = `http://localhost:1002/api/v1/admin/election/created`;
    const electionResponse = await axios.get(electionEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const elections = electionResponse.data;

    // Fetching constituency details for each election
    for (let i = 0; i < elections.length; i++) {
      const constituencies = [];
      for (let j = 0; j < elections[i].constituencies.length; j++) {
        const constituencyId = elections[i].constituencies[j];
        const constituencyEndpoint = `http://localhost:1002/api/v1/admin/constituency/id/${constituencyId}`;
        const constituencyResponse = await axios.get(constituencyEndpoint);
        constituencies.push(constituencyResponse.data);
      }
      elections[i].constituencies = constituencies;
    }

    // const isVoterInElection = elections.some(election =>
    //     election.voter_bank.some(voter => voter.voterId === id)
    // );

    res.status(200).json(elections);

    // if (isVoterInElection) {
    //     res.status(200).json(elections);
    // } else {
    //     res.status(200).json({ msg: "Voter is not in the election" });
    // }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getElectionsStarted = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;
    const electionEndpoint = `http://localhost:1002/api/v1/admin/election/started`;
    const electionResponse = await axios.get(electionEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    let elections = electionResponse.data;

    // Fetching constituency details for each election
    for (let i = 0; i < elections.length; i++) {
      const constituencies = [];
      for (let j = 0; j < elections[i].constituencies.length; j++) {
        const constituencyId = elections[i].constituencies[j];
        const constituencyEndpoint = `http://localhost:1002/api/v1/admin/constituency/id/${constituencyId}`;
        const constituencyResponse = await axios.get(constituencyEndpoint);
        constituencies.push(constituencyResponse.data);
      }
      elections[i].constituencies = constituencies;
    }

    // Fetching candidate and party details for each candidate
    for (let i = 0; i < elections.length; i++) {
      for (let j = 0; j < elections[i].candidates.length; j++) {
        const candidateId = elections[i].candidates[j].candidateId;
        const partyId = elections[i].candidates[j].partyId;

        const candidateEndpoint = `http://localhost:1001/api/v1/voter/id/${candidateId}`;
        const candidateResponse = await axios.get(candidateEndpoint);
        elections[i].candidates[j].candidateDetails = candidateResponse.data;

        const partyEndpoint = `http://localhost:1003/api/v1/party/id/${partyId}`;
        const partyResponse = await axios.get(partyEndpoint);
        elections[i].candidates[j].partyDetails = partyResponse.data;
      }
    }

    const isVoterInElection = elections.some((election) =>
      election.voter_bank.some((voter) => voter.voterId === id)
    );

    if (isVoterInElection) {
      res.status(200).json(elections);
    } else {
      res.status(200).json({ msg: "Voter is not in the election" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const changeSelectedAddress = async (req, res) => {
  try {
    const account = await Voter_Candidate.findByIdAndUpdate(
      req.params.id,
      { votingAddress: req.body.selectedAddress },
      { new: true, runValidators: true }
    );

    if (account) res.status(200).json({ account });
    else res.status(402).json({ msg: "Account not found" });
  } catch (error) {
    res.status(404).json({ msg: error });
  }
};

const changeSelectedSim = async (req, res) => {
  try {
    const account = await Voter_Candidate.findByIdAndUpdate(
      req.params.id,
      { selectedSim: req.body.selectedSim },
      { new: true, runValidators: true }
    );
    if (account) res.status(200).json({ account });
    else res.status(402).json({ msg: "Account not found" });
  } catch (error) {
    res.status(404).json({ msg: error });
  }
};

const convertBigIntToReadableDate = (bigIntTimestamp) => {
  // Convert BigInt to regular number
  const timestamp = Number(bigIntTimestamp);
  // Convert seconds to milliseconds
  const milliseconds = timestamp * 1000;
  // Create a Date object
  const date = new Date(milliseconds);
  // Format the date as desired
  const formattedDate = date.toLocaleString(); // This is just an example, you can use other methods for formatting
  return formattedDate;
};

const castVote = async (req, res) => {
  try {
    // const web3 = new Web3(
    //   new Web3.providers.HttpProvider("https://rpc.ankr.com/polygon_mumbai")
    // );
    // web3.eth.accounts.wallet.add(process.env.WEB3_PRIVATE_KEY);
    // const defaultAccount = web3.eth.accounts.wallet[0].address;

    // // Instantiate the contract
    // const contractInstance = new web3.eth.Contract(
    //   VOTE_CONTRACT_ABI,
    //   VOTE_CONTRACT_ADDRESS
    // );

    // const startTimestamp = await contractInstance.methods.startTime().call();
    // const endTimestamp = await contractInstance.methods.endTime().call();

    const {
      party,
      candidateName,
      age,
      maritalStatus,
      gender,
      dob,
      constituency,
      voterId,
      electionId,
    } = req.body;

    // Create an instance of the ElectionVotes model
    const newVote = new ElectionVotes({
      party,
      candidateName,
      age,
      maritalStatus,
      gender,
      dob,
      constituency,
      voterId,
    });

    // Save the instance to the database
    const savedVote = await newVote.save();

    // console.log(
    //   convertBigIntToReadableDate(startTimestamp),
    //   convertBigIntToReadableDate(endTimestamp)
    // );

    const electionEndpoint = `http://localhost:1002/api/v1/admin/election/id/${electionId}/voteStatus`;
    const electionResponse = await axios.post(electionEndpoint, {
      voterId: voterId,
      status: true,
    });

    res.status(200).json({ message: "Vote casted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

// const transaction = await contractInstance.methods
//   .startElection()
//   .send({ from: defaultAccount });

// const transactionHash = transaction.transactionHash;

// console.log('hash', transactionHash)

const getCandidatesForVoter = async (req, res) => {
  try {
    const { id } = req.params;
    const { token, electionId } = req.body;

    // Fetch election details
    const getElectionEndpoint = `http://localhost:1002/api/v1/admin/election/id/${electionId}`;
    const electionResponse = await axios.get(getElectionEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    let election = electionResponse.data.election;

    // Fetch voter details
    const voter = await Voter_Candidate.findById({ _id: id });
    const citizenEndpoint = `http://localhost:1000/api/v1/citizenData/id/${voter.citizenDataId}`;
    const citizenResponse = await axios.get(citizenEndpoint);
    const citizen = citizenResponse.data;

    let candidatesForConstituencies = {};

    // Iterate over each candidate
    for (let i = 0; i < election.candidates.length; i++) {
      const getConstituencyEndpoint = `http://localhost:1002/api/v1/admin/constituency/id/${election.candidates[i].constituencyId}`;
      const constituencyResponse = await axios.get(getConstituencyEndpoint);
      const constituency = constituencyResponse.data;

      let address = "";

      // Determine the address based on votingAddress
      if (voter.votingAddress === "Permanent")
        address = citizen.permanentAddress;
      else if (voter.votingAddress === "Temporary")
        address = citizenResponse.data.temporaryAddress;

      // Check if candidate's constituency matches voter's address
      if (
        address.city === constituency.position.city &&
        constituency.position.areas.includes(address.area)
      ) {
        if (!candidatesForConstituencies[constituency._id])
          candidatesForConstituencies[constituency._id] = {
            constituencyData: constituency,
            candidates: [],
          };

        // Fetch candidate details
        const getCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${election.candidates[i].candidateId}`;
        const candidateResponse = await axios.get(getCandidateEndpoint);
        const candidate = candidateResponse.data;

        // Add candidate data to candidatesForConstituencies
        candidatesForConstituencies[constituency._id].candidates.push(
          candidate
        );
      }
    }

    res.status(200).json({ candidatesForConstituencies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  getCandidatesForVoter,
  castVote,
  getAllAccounts,
  createAccount,
  login,
  getAccountById,
  getAccountByCnic,
  getElections,
  changeSelectedAddress,
  changeSelectedSim,
  getElectionsCreated,
  getElectionsStarted,
};
