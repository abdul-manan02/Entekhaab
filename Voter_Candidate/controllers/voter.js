import Voter_Candidate from '../models/voter_candidate.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import axios from 'axios';

const getAllAccounts = async (req, res) => {
    try {
        const accountList = await Voter_Candidate.find()
        res.status(200).json({ accountList })
    } catch (error) {
        res.status(404).json({ msg: error })
    }
}

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
        const { cnic, password, citizenDataId, selectedSim, votingAddress } = req.body
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAccount = {
            cnic,
            password: hashedPassword,
            citizenDataId,
            selectedSim
        }
        const newUser = await Voter_Candidate.create(newAccount)
        res.status(200).json({ newUser })
    } catch (error) {
        res.status(400).json({ msg: error })
    }
}

const login = async (req, res) => {
    try {
        const { cnic, password } = req.body
        const account = await Voter_Candidate.findOne({ cnic })

        if (!account)
            return res.status(400).json({ msg: "Account not found" })
        const isMatch = await bcrypt.compare(password, account.password)
        if (!isMatch)
            return res.status(400).json({ msg: "Invalid credentials" })

        const token = jwt.sign({ userId: account._id }, process.env.JWT_KEY, { expiresIn: '24h' })

        res.status(200).json({ account, token})
    } catch (error) {
        res.status(500).json({ msg: error })
    }
}


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
        const account = await Voter_Candidate.findOne({cnic: req.params.cnic});
        
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
        const {id} = req.params;
        const {token} = req.body;
        const electionEndpoint = `http://localhost:1002/api/v1/admin/election/started`;
        const electionResponse = await axios.get(electionEndpoint,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const elections = electionResponse.data;
        console.log(elections)
        const isVoterInElection = elections.some(election => 
            election.voter_bank.some(voter => voter.voterId === id)
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
            req.params.id, { votingAddress: req.body.selectedAddress },
            { new: true, runValidators: true }
        );
        
        if (account)
            res.status(200).json({ account })
        else
            res.status(402).json({ msg: "Account not found" })
    } catch (error) {
        res.status(404).json({ msg: error })
    }
}

const changeSelectedSim = async (req, res) => {
    try {
        const account = await Voter_Candidate.findByIdAndUpdate(
            req.params.id, { selectedSim: req.body.selectedSim },
            { new: true, runValidators: true }
        );
        if (account)
            res.status(200).json({ account })
        else
            res.status(402).json({ msg: "Account not found" })
    } catch (error) {
        res.status(404).json({ msg: error })
    }
}

export {
    getAllAccounts,
    createAccount,
    login,
    getAccountById,
    getAccountByCnic,
    getElections,
    changeSelectedAddress,
    changeSelectedSim
}