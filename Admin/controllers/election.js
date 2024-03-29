import Election from "../models/election.js";
import axios from "axios";
import Web3 from "web3";
import {
  VOTE_CONTRACT_ADDRESS,
  VOTE_CONTRACT_ABI,
} from "../config/contract.js";

const createElection = async (req, res) => {
  try {
    const { electionType, token } = req.body;
    let voter_bank = [];
    let constituencies = [];
    // get all voters
    const voterBankEndpoint = `http://localhost:1001/api/v1/voter`;
    const voterResponse = await axios.get(voterBankEndpoint);

    if (electionType == "By Elections") {
      const { constituency } = req.body;

      const getElections = await Election.findOne({
        electionType: "By Elections",
        isStarted: true,
        constituencies: { $in: [constituency] },
      });
      console.log("election", getElections);
      if (getElections) {
        return res.status(500).json({
          msg: "Error. A By Election for this constituency is already underway.",
        });
      }

      constituencies.push(constituency._id);
      const votingAddresses = voterResponse.data.accountList.map(
        (account) => account.votingAddress
      );
      const citizenDataIDs = voterResponse.data.accountList.map(
        (account) => account.citizenDataId
      );
      for (let i = 0; i < citizenDataIDs.length; i++) {
        const citizenEndpoint = `http://localhost:1000/api/v1/citizenData/id/${citizenDataIDs[i]}`;
        const citizenResponse = await axios.get(citizenEndpoint);
        if (votingAddresses[i] == "Permanent") {
          const address = citizenResponse.data.permanentAddress;
          if (address.city == constituency.position.city) {
            if (constituency.position.areas.includes(address.area))
              voter_bank.push({ voterId: citizenDataIDs[i], hasVoted: false });
          }
        } else if (votingAddresses[i] == "Temporary") {
          const address = citizenResponse.data.temporaryAddress;
          if (address.city == constituency.position.city) {
            if (constituency.position.areas.includes(address.area))
              voter_bank.push({ voterId: citizenDataIDs[i], hasVoted: false });
          }
        }
      }
    } else if (electionType == "General Elections") {
      const getElections = await Election.findOne({
        electionType: "General Elections",
        isStarted: true,
      });
      console.log("election", getElections);
      if (getElections) {
        return res
          .status(500)
          .json({ msg: "Error. A General Election is already underway." });
      }

      const constituencyEndpoint = `http://localhost:1002/api/v1/admin/constituency`;
      const constituencyResponse = await axios.get(constituencyEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      constituencies = constituencyResponse.data.constituencies.map(
        (constituency) => constituency._id
      );

      voter_bank = voterResponse.data.accountList.map((account) => ({
        voterId: account._id,
        hasVoted: false,
      }));
    }

    const electionData = {
      electionType,
      constituencies,
      voter_bank,
    };

    const election = await Election.create(electionData);
    res.status(200).json({ election });
  } catch (error) {}
};

const getElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);
    res.status(200).json({ election });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getAllElections = async (req, res) => {
  try {
    const election = await Election.find();
    res.status(200).json({ election });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getCreatedElections = async (req, res) => {
  try {
    const elections = await Election.find({
      isStarted: false,
      isFinished: false,
    });
    res.status(200).json(elections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getStartedElections = async (req, res) => {
  try {
    const elections = await Election.find({
      isStarted: true,
      isFinished: false,
    });
    res.status(200).json(elections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFinishedElections = async (req, res) => {
  try {
    const elections = await Election.find({
      isStarted: true,
      isFinished: true,
    });
    res.status(200).json(elections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const startElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);

    if (election.isStarted)
      return res
        .status(400)
        .json({ message: "Election has already been started" });

    const web3 = new Web3(
      new Web3.providers.HttpProvider("https://rpc.ankr.com/polygon_mumbai")
    );

    web3.eth.accounts.wallet.add(process.env.WEB3_PRIVATE_KEY);
    const defaultAccount = web3.eth.accounts.wallet[0].address;

    // Instantiate the contract
    const contractInstance = new web3.eth.Contract(
      VOTE_CONTRACT_ABI,
      VOTE_CONTRACT_ADDRESS
    );

    await contractInstance.methods
      .startElection()
      .send({ from: defaultAccount });

    const startTimestamp = await contractInstance.methods.startTime().call();
    const endTimestamp = await contractInstance.methods.endTime().call();

    console.log("start", startTimestamp);
    console.log("end", endTimestamp);

    election.isStarted = true;
    await election.save();

    res.status(200).json({ message: "Election started successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const addCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { candidateId, partyId, constituencyId } = req.body;
    const election = await Election.findById(id);

    if (election.isStarted)
      return res.status(400).json({ message: "Election has been started" });

    election.candidates.push({
      candidateId,
      partyId,
      constituencyId,
      votesReceived: 0,
    });
    await election.save();

    res.status(200).json({ message: "Candidate added successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const finishElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await Election.findById(id);

    if (!election.isStarted || election.isFinished)
      return res.status(400).json({ message: "Election cannot be finished" });

    election.isFinished = true;
    await election.save();

    res.status(200).json({ message: "Election finished successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

const updateVoteStatus = async (req, res) => {
  console.log("in update status");
  try {
    const { id } = req.params;
    const { status, voterId } = req.body;

    // Find the election document by ID
    const election = await Election.findById(id);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    // Map through the voter_bank array to find the matching voterId
    const updatedVoterBank = election.voter_bank.map((voter) => {
      if (voter.voterId.toString() === voterId) {
        // Update the hasVoted status for the matched voter
        voter.hasVoted = status;
      }
      return voter;
    });

    // Update the voter_bank array in the election document
    election.voter_bank = updatedVoterBank;

    // Save the updated election document
    await election.save();

    res.status(200).json({ message: "Voter status updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
};

export {
  createElection,
  getAllElections,
  getElection,
  getCreatedElections,
  getStartedElections,
  getFinishedElections,
  startElection,
  addCandidate,
  finishElection,
  updateVoteStatus,
};
