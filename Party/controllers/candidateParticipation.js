import CandiateParticipation from '../models/candidateParticipation.js'
import axios from 'axios'
import s3 from './s3Config.js'

const createRequest = async (req, res) => {
    try {
        const request = { 
            accountId: req.body.accountId,
            partyId: req.body.partyId,
            constituencyId: req.body.constituencyId,
            electionId: req.body.electionId,
        }

        if (req.file) {
            const file = req.file;

            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: `${Date.now()}-${file.originalname}`,
                Body: file.buffer
            };

            const uploaded = await s3.upload(params).promise();
            request.proof = uploaded.Location;
        }

        const newRequest = new CandiateParticipation(request);
        await newRequest.save();
        res.status(201).json({ newRequest: newRequest });
    } catch (error) {
        res.status(500).json({msg: error})
    }

    try {
        const newRequest = await CandiateParticipation.create(req.body)
        res.status(201).json({newRequest})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const getAllRequestsForParty = async (req, res) => {
    try {
        const {partyId} = req.params
        const token = req.headers['authorization'].split(' ')[1];
        const requests = await CandiateParticipation.find({partyId})

        if(requests.length === 0){
            return res.status(404).json({msg: "No requests found"})
        }

        const results = await Promise.all(requests.map(async (approval) => {
            const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${approval.accountId}`;
            const voterCandidateResponse = await axios.get(voterCandidateEndpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                ...approval.toObject(),
                voterCandidate: voterCandidateResponse.data
            };
        }));
        res.status(200).json({results})
        res.status(200).json({requests})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const getAllRequestsForPartyForConstituency = async (req, res) => {
    try {
        const {partyId} = req.params
        const {constituencyId} = req.body
        if(!constituencyId){
            return res.status(400).json({msg: "constituencyId is required"})
        }

        const requests = await CandiateParticipation.find({partyId, constituencyId})
        if(requests.length === 0){
            return res.status(404).json({msg: "No requests found"})
        }
        res.status(200).json({requests})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const getPendingRequestsForParty = async (req, res) => {
    try {
        const {partyId} = req.params

        const requests = await CandiateParticipation.find({partyId, status: "Pending"})
        if(requests.length === 0){
            return res.status(404).json({msg: "No requests found"})
        }
        res.status(200).json({requests})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const getPendingRequestsForPartyForConstituency = async (req, res) => {
    try {
        const {partyId} = req.params
        const {constituencyId} = req.body
        if(!constituencyId){
            return res.status(400).json({msg: "constituencyId is required"})
        }
        const requests = await CandiateParticipation.find({partyId, constituencyId, status: "Pending"})
        if(requests.length === 0){
            return res.status(404).json({msg: "No requests found"})
        }
        res.status(200).json({requests})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}


const getRequest = async (req, res) => {
    try {
        const request = await CandiateParticipation.findById(req.params.id)
        if(!request)
            return res.status(404).json({msg: "No request found"})
        res.status(200).json({request})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const updateStatus = async (req, res) => {
    try {
        const {status} = req.body
        if(!status){
            return res.status(400).json({msg: "status is required"})
        }
        const request = await CandiateParticipation.findByIdAndUpdate(req.params.id, {status}, {runValidators:true, new: true})
        if(!request)
            return res.status(404).json({msg: "No request found"})


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
    getAllRequestsForParty,
    getAllRequestsForPartyForConstituency,
    getPendingRequestsForParty,
    getPendingRequestsForPartyForConstituency,
    getRequest,
    updateStatus
}