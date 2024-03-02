import CandidateParticipation from '../models/candidateParticipation.js'
import axios from 'axios'
import s3 from './s3Config.js'

const createRequestForIndepenedent = async (req, res) => {
    try {
        const request = { 
            accountId: req.body.accountId,
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

        const newRequest = new CandidateParticipation(request);
        await newRequest.save();
        res.status(201).json({ newRequest: newRequest });
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const createRequestForPartyAffiliated = async (req, res) => {
    try {
        const {accountId, partyId, constituencyId, electionId, proof} = req.body
        const newRequest = await CandidateParticipation.create({accountId, partyId, constituencyId, electionId, proof})
        res.status(201).json({newRequest})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const getAllRequests = async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const requests = await CandidateParticipation.find()
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
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const getPendingRequests = async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const requests = await CandidateParticipation.find({status: "Pending"})
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
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const getRequest = async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const request = await CandidateParticipation.findById(req.params.id)
        if(!request)
            return res.status(404).json({msg: "No request found"})

        const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${request.accountId}`;
        const voterCandidateResponse = await axios.get(voterCandidateEndpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        res.status(200).json({ 
            approval: {
                ...request.toObject(),
                voterCandidate: voterCandidateResponse.data
            }
        });
        res.status(200).json({request})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

const updateStatus = async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];
        const {status} = req.body
        const request = await CandidateParticipation.findByIdAndUpdate(req.params.id, {status}, {runValidators:true, new: true})
        if(status === "Accepted"){
            const {accountId, partyId, constituencyId, electionId} = request
            const {data} = await axios.patch(`http://localhost:1002/api/v1/admin/election/id/${electionId}/addCandidate`, {candidateId: accountId, partyId, constituencyId},{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            res.status(200).json({data})
        }
        
        res.status(200).json({request})
    } catch (error) {
        res.status(500).json({msg: error})
    }
}

export{
    createRequestForIndepenedent,
    createRequestForPartyAffiliated,
    getAllRequests,
    getPendingRequests,
    getRequest,
    updateStatus
}