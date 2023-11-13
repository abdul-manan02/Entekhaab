import CandidateApproval from '../models/candidateApproval.js'
import { MongoClient } from 'mongodb'
import connectDB from '../db/connect.js'
import axios from 'axios'

const getAllRequests = async(req,res) =>{
    try {
        const allRequests = await CandidateApproval.find()
        res.send(allRequests)    
    } catch (error) {
        res.status(404).json({msg: error})
    }
}


const createRequest = async(req,res) =>{
    try {
        const {cnic} = req.body
        const citizenData = await axios.get(`http://localhost:5001/api/v1/citizenData/${cnic}`)
        const cleanedData = citizenData.data.citizen
        delete cleanedData._id;
        delete cleanedData.__v;
        const modifiedBody = {
            cnic,
            proof: req.body.proof,
            citizenData: cleanedData
        }
        const newReqest = await CandidateApproval.create(modifiedBody)
        res.json(newReqest)
    } catch (error) {
        res.json({msg: error})
    }
    
}


const updateRequest = async(req,res) =>{
    try {
        const { cnic, status } = req.body
        const request = await CandidateApproval.findOneAndUpdate({cnic}, {status}, {new: true, runValidators: true});
        res.status(200).json(request)
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

export{
    getAllRequests,
    createRequest,
    updateRequest
}