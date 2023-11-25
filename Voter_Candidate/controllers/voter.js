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

// ACCOUNT CREATION
// one form, user enters name, cnic
// query from db and return sims and addresses
// use selects sim and votingAddress
// otp sent
// once otp verified, allow user to set password
const getCitizenData = async(req,res)=>{
    try {
        const citizenData = await axios.get(`http://localhost:5001/api/v1/citizenData/${req.body.cnic}`)
        const cleanedData = citizenData.data

        if(req.body.cnic !== cleanedData.cnic || req.body.name !== cleanedData.name)
            res.status(400).json({msg: "CNIC and Name do not match"})
        else
            res.status(201).json({...cleanedData})
    } catch (error) {
        res.status(400).json({msg: error})
    }
}

const sendOTP = async(req,res) =>{
    try {
        
    } catch (error) {
        
    }
} 

const verifyOTP = async(req,res) =>{
    try {
        
    } catch (error) {
        
    }
}

const createAccount = async(req,res)=>{
    try {
        const {cnic, name, password, citizenData, selectedSim, votingAddress} = req.body
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAccount = {
            cnic,
            name,
            password: hashedPassword,
            citizenData: citizenData._id,
            selectedSim,
            votingAddress
        }
        const newUser = await Voter_Candidate.create(newAccount)
        res.status(201).json({newUser})
    } catch (error) {
        res.status(400).json({msg: error})
    }
}

const getAccount = async(req,res) =>{
    try {
        const account = await Voter_Candidate.findById(req.params.id)
        if(account)
            res.status(201).json({account})
        else
            res.status(404).json({msg: "Account not found"})
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

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
    getCitizenData,
    createAccount,
    getAccount,
    changeSelectedAddress,
    changeSelectedSim
}