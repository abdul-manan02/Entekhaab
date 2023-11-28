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

// write the code for thecontroller for getting single party using id as params
// write the code for the controller for updating the party using id as params
// write the code for the controller for deleting the party using id as params

const getParty = async(req,res) =>{
    try {
        const {id} = req.params
        const party = await partyApproval.findOne({_id: id})
        res.status(200).json(party)
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
        const {id} = req.params
        const { status, name } = req.body
        const request = await partyApproval.findOneAndUpdate({_id: id}, {status}, {new: true, runValidators: true});
        if(!request)
            return res.status(404).json({msg: "No request found"})
        if(status==="Accepted"){
            const response = await axios.patch(`http://localhost:1003/api/v1/party/approval/${name}`)
            return res.json({request, response: response.data})
        }
        res.status(200).json(request)
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

export{
    getAllRequests,
    getParty,
    createRequest,
    updateRequest
}