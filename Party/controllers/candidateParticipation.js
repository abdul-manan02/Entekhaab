import CandiateParticipation from '../models/candidateParticipation.js'
import axios from 'axios'

const createRequest = async (req, res) => {
    try {
        const newRequest = await CandiateParticipation.create(req.body)
        res.status(201).json({newRequest})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const getAllRequests = async (req, res) => {
    try {
        const requests = await CandiateParticipation.find({})
        res.status(200).json({requests})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const getRequest = async (req, res) => {
    try {
        const request = await CandiateParticipation.findById(req.params.id)
        res.status(200).json({request})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const updateStatus = async (req, res) => {
    try {
        const {status} = req.body
        const request = await CandiateParticipation.findByIdAndUpdate(req.params.id, {status}, {runValidators:true, new: true})
        if(status === "Accepted"){
            const {accountId, partyId, constituencyId, electionId, proof} = request
            const {data} = await axios.post(`http://localhost:1002/api/v1/admin/candidateParticipation`, {accountId, partyId, constituencyId, electionId, proof})
            res.status(200).json({data})
        }
        
        res.status(200).json({request})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

export{
    createRequest,
    getAllRequests,
    getRequest,
    updateStatus
}