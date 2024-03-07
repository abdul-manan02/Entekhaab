import partyApproval from '../models/partyApproval.js'
import axios from 'axios'
import s3 from './s3Config.js'

const getAllRequests = async(req,res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];

        const requests = await partyApproval.find();
        console.log('reqs', requests)
        const results = await Promise.all(requests.map(async (approval) => {
            const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/cnic/${approval.leaderCNIC}`;
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
};

const getPendingRequests = async(req,res) =>{
    try {
        const token = req.headers['authorization'].split(' ')[1];

        const requests = await partyApproval.find({status: "Pending"});
        const results = await Promise.all(requests.map(async (approval) => {
            const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/cnic/${approval.leaderCNIC}`;
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

const getRequestProof = async(req,res) =>{
    try {
        const pdf = await partyApproval.findById(req.params.id);
  
        // Check if the PDF document was found
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }

        res.status(200).json({url : pdf.proof});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getParty = async(req,res) => {
    try {
        const { id } = req.params; // Assuming you're passing the document ID in the URL parameter
        const token = req.headers['authorization'].split(' ')[1]; // Extract token from headers

        // Find the candidate approval document by ID
        const party = await partyApproval.findById(id);

        if(!party) {
            return res.status(404).json({ msg: "Request not found" });
        }

        const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/cnic/${party.leaderCNIC}`;
        const voterCandidateResponse = await axios.get(voterCandidateEndpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        res.status(200).json({ 
            approval: {
                ...party.toObject(),
                voterCandidate: voterCandidateResponse.data
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createRequest = async (req, res) => {
    try {
        const { name, leaderCNIC} = req.body;

        // Assuming 'proof' is a stream
        const approval = new partyApproval({
            name,
            leaderCNIC,
            proof: req.body.proof  // Assuming 'proof' is the stream from the request
        });
        
        await approval.save();
        res.status(200).json(approval);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateRequest = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const token = req.headers['authorization'].split(' ')[1]; // Extract token from headers
        let request = await partyApproval.findOneAndUpdate({_id: id}, {status}, {new: true, runValidators: true});

        if (!request) {
            return res.status(404).json({msg: "No request found"});
        }

        if (status === "Accepted") {
            const response = await axios.patch(`http://localhost:1003/api/v1/party/name/${request.name}/approval`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return res.status(200).json({request, response: response.data});
        }

        return res.status(200).json(request);
    } catch (error) {
        // Use 500 for server errors
        return res.status(500).json({msg: error.message});
    }
}


export{
    getAllRequests,
    getPendingRequests,
    getParty,
    createRequest,
    updateRequest,
    getRequestProof
}