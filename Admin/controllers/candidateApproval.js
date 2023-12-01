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

// admin fetches all requests
// if status="Rejected", just update request
// if status="Accepted", update Request and call updateCandidate of Voter_Candidate microservice
//      using the accountId from the selected Request
const updateRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (status === "Accepted" || status === "Rejected") {
            const updatedRequest = await CandidateApproval.findByIdAndUpdate({_id:id}, { status }, { new: true, runValidators: true });

            if(status === "Rejected")
                return res.json({ msg: "Request Rejected" });

            if (!updatedRequest) {
                return res.status(404).json({ msg: "Request not found" });
            }

            const { accountId } = req.body;
            const endPoint = `http://localhost:1001/api/v1/candidate/${accountId}`;
            // this being called in the above endpoint in a different microservice from this one, how to control auth
            router.route('/:id').patch(authenticateToken, approveCandidate)

            const candidateResponse = await axios.patch(endPoint, { isCandidate: true });
            
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
    createRequest,
    updateRequest
}