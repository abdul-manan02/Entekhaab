import partyApproval from '../models/partyApproval.js'
import axios from 'axios'

const getAllRequests = async(req,res) =>{
    try {
        const allRequests = await partyApproval.find()
        res.send(allRequests)    
    } catch (error) {
        res.status(404).json({msg: error})
    }
}


const createRequest = async(req,res) =>{
    try{
        const newReqest = await partyApproval.create(req.body)
        res.json(newReqest)
    } catch (error) {
        res.json({msg: error})
    }
    
}


const updateRequest = async(req,res) =>{
    try {
        const { name, status } = req.body
        const request = await partyApproval.findOneAndUpdate({name}, {status}, {new: true, runValidators: true});
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