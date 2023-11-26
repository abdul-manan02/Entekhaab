import CandidateApproval from '../models/candidateApproval.js'
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
        const {accountId, proof} = req.body
        const newBody = {accountId, proof}
        const newReqest = await CandidateApproval.create(newBody)
        res.json({newReqest})
    } catch (error) {
        res.json({msg: error.message})
    }
    
}


const updateRequest = async(req,res) =>{
    try {
        const {_id} = req.params
        const {status} = req.body
        const updatedRequest = await CandidateApproval.findByIdAndUpdate(_id, { status }, { new: true, runValidators: true });
        if(status == "Accepted"){
            
        }
        res.status(200).json(updatedRequest)
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

export{
    getAllRequests,
    createRequest,
    updateRequest
}