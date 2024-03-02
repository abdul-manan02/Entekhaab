import ConstituencyChangeRequest from '../models/constituencyChangeRequest.js'
import axios from 'axios'
import s3 from './s3Config.js'

const createRequest = async(req,res) => {
    try {
        const request = { 
            accountId: req.body.accountId,
            changeTo: req.body.changeTo
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
        
        const newRequest = new ConstituencyChangeRequest(request);
        await newRequest.save();
        res.status(201).json({ newRequest: newRequest });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

const getRequest = async(req,res) => {
    try {
        const request = await ConstituencyChangeRequest.findById(req.params.id);
        const token = req.headers['authorization'].split(' ')[1];
        if (!request)
            res.status(404).json({ message: 'Request not found' });
        
        const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${request.accountId}`;
        const voterCandidateResponse = await axios.get(voterCandidateEndpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        res.status(200).json({ 
            request: {
                ...request.toObject(),
                voterCandidate: voterCandidateResponse.data
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateRequest = async(req, res) => {
    try {
        const {status} = req.body;
        if (status != "Accepted" && status != "Rejected") {
            return res.status(400).json({message: "Invalid status"});
        }

        const {id} = req.params;
        const token = req.headers['authorization'].split(' ')[1];

        const request = await ConstituencyChangeRequest.findByIdAndUpdate(id, {status}, { new: true, runValidators: true });
        
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }
        // No need to remove the 'proof' field, just use the entire object
        if (status === "Rejected") {
            res.status(200).json(request);
        } else if (status === "Accepted") {
            const voterEndPoint = `http://localhost:1001/api/v1/voter/id/${request.accountId}/changeAddress`;
            const electionResponse = await axios.patch(voterEndPoint, {selectedAddress: request.changeTo}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const voter = electionResponse.data;
            res.status(200).json({request, voter});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const getAllRequests = async(req,res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];

        const requests = await ConstituencyChangeRequest.find();
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

        res.status(200).json({ results }); 
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getPendingRequests = async(req,res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];

        const pendingApprovals = await ConstituencyChangeRequest.find({ status: "Pending" });
        const results = await Promise.all(pendingApprovals.map(async (approval) => {
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

        res.status(200).json({ results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getRequestProof = async(req,res) =>{
    try {
        const pdf = await ConstituencyChangeRequest.findById(req.params.id);
  
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }

        res.status(200).json({url : pdf.proof});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export{
    createRequest,
    getRequest,
    updateRequest,
    getAllRequests,
    getPendingRequests,
    getRequestProof
}