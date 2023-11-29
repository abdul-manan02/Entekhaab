import Voter_Candidate from '../models/voter_candidate.js'
import axios from 'axios'
import bcrypt from 'bcryptjs'

const getAllAccounts = async(req,res) =>{
    try {
        const accountList = await Voter_Candidate.find()
        res.status(201).json({accountList})
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

// User initiates getCitizenDataByCnic.
// The provided CNIC and name are compared with the citizen data.
// If there's a match, the user is offered a SIM selection option.
// Upon selecting a SIM, an OTP (One-Time Password) is sent.
// After OTP verification, the user inputs a password.
// The user is presented with two addresses and selects one.
// The frontend sends the following attributes in req.body.
// A voter record is created.
const createAccount = async(req,res)=>{
    try {
        const {cnic, password, citizenDataId, selectedSim, votingAddress} = req.body
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAccount = {
            cnic,
            password: hashedPassword,
            citizenDataId,
            selectedSim,
            votingAddress,
            // this is the default independent party
            // party: "656742d3e1650a1398e8b7b9"
        }
        const newUser = await Voter_Candidate.create(newAccount)
        res.status(201).json({newUser})
    } catch (error) {
        res.status(400).json({msg: error})
    }
}

const getAccount = async (req, res) => {
    try {
        const account = await Voter_Candidate.findById(req.params.id)
  
      if (account) {
        res.status(201).json({ account });
      } else {
        res.status(404).json({ msg: 'Account not found' });
      }
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };
  
  
const changeSelectedAddress = async(req,res) =>{
    try {
        const account = await Voter_Candidate.findByIdAndUpdate(
            req.params.id, { selectedAddress: req.body.selectedAddress },
            { new: true, runValidators: true}
          );
        if(account)
            res.status(201).json({account})
        else
            res.status(402).json({msg: "Account not found"})
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

const changeSelectedSim = async(req,res) =>{
    try {
        const account = await Voter_Candidate.findByIdAndUpdate(
            req.params.id, { selectedSim: req.body.selectedSim },
            { new: true, runValidators: true}
          );
        if(account)
            res.status(201).json({account})
        else
            res.status(402).json({msg: "Account not found"})
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

export {
    getAllAccounts,
    createAccount,
    getAccount,
    changeSelectedAddress,
    changeSelectedSim
}