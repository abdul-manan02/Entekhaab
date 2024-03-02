import CandidateApproval from '../models/candidateApproval.js'
import axios from 'axios'
import s3 from './s3Config.js'

const getAllRequests = async(req,res) =>{
    try {
        const token = req.headers['authorization'].split(' ')[1];

        const requests = await CandidateApproval.find();
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
        res.status(404).json({msg: error})
    }
}

const createRequest = async(req,res) => {
    try {
        const request = { 
            accountId: req.body.accountId
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
        
        const newRequest = new CandidateApproval(request);
        await newRequest.save();
        res.status(201).json({ newRequest: newRequest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPendingRequests = async(req,res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];

        const pendingApprovals = await CandidateApproval.find({ status: "Pending" });
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
        res.status(500).json({ error: error.message });
    }
};

const getRequest = async(req,res) => {
    try {
        const { id } = req.params; // Assuming you're passing the document ID in the URL parameter
        const token = req.headers['authorization'].split(' ')[1]; // Extract token from headers

        // Find the candidate approval document by ID
        const candidateApproval = await CandidateApproval.findById(id);

        if(!candidateApproval) {
            return res.status(404).json({ msg: "Request not found" });
        }

        const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${candidateApproval.accountId}`;
        const voterCandidateResponse = await axios.get(voterCandidateEndpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        res.status(200).json({ 
            approval: {
                ...candidateApproval.toObject(),
                voterCandidate: voterCandidateResponse.data
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRequestProof = async(req,res) =>{
    try {
        const pdf = await CandidateApproval.findById(req.params.id);
  
        // Check if the PDF document was found
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }

        res.status(200).json({url : pdf.proof});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// admin fetches all requests
// if status="Rejected", just update request
// if status="Accepted", update Request and call updateCandidate of Voter_Candidate microservice
//      using the accountId from the selected Request
const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const token = req.headers['authorization'].split(' ')[1]; // Extract token from headers
        if (status === "Accepted" || status === "Rejected") {
            const updatedRequest = await CandidateApproval.findByIdAndUpdate({_id:id}, { status }, { new: true, runValidators: true });

            if(status === "Rejected")
                return res.json({ msg: "Request Rejected" });

            if (!updatedRequest) {
                return res.status(404).json({ msg: "Request not found" });
            }
            const accountId = updatedRequest.accountId;
            const endPoint = `http://localhost:1001/api/v1/candidate/id/${accountId}/approveCandidate`;
            const candidateResponse = await axios.patch(endPoint, { isCandidate: true },{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return res.status(200).json({ response: candidateResponse.data });
        } else {
            return res.status(400).json({ msg: "Status can only be Accepted or Rejected" });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


export{
    getAllRequests,
    getRequest,
    getPendingRequests,
    createRequest,
    updateRequest,
    getRequestProof
}