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

const createRequest = async(req,res) => {
    try {
        const { accountId, proof } = req.body;
        
        const newCandidateApproval = await CandidateApproval.create({
            accountId,
            proof
        });

        res.status(201).json({ newCandidateApproval });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRequest = async(req,res) =>{
    try {
        const { id } = req.params; // Assuming you're passing the document ID in the URL parameter
        const {token} = req.body
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
        const response = voterCandidateResponse.data;

        const result = {
            ...candidateApproval.toObject(),
            voterCandidate: voterCandidateResponse.data
        };

        res.status(200).json({ result });
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
        const { status, token } = req.body;
        if (status === "Accepted" || status === "Rejected") {
            const updatedRequest = await CandidateApproval.findByIdAndUpdate({_id:id}, { status }, { new: true, runValidators: true });

            if(status === "Rejected")
                return res.json({ msg: "Request Rejected" });

            if (!updatedRequest) {
                return res.status(404).json({ msg: "Request not found" });
            }

            const { accountId } = req.body;
            const endPoint = `http://localhost:1001/api/v1/candidate/${accountId}`;
            const candidateResponse = await axios.patch(endPoint, { isCandidate: true },{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            return res.json({ response: candidateResponse.data });
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
    createRequest,
    updateRequest
}