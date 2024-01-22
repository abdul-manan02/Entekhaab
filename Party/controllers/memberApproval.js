import MemberApproval from "../models/memberApproval.js";
import axios from 'axios';

const createMemberApproval = async (req, res) => {
    try {
        const request = { 
            partyId: req.body.partyId,
            memberId: req.body.memberId
        }

        if (req.file) {
            request.proof = req.file.buffer;
        }
        
        const newRequest = new MemberApproval(request);
        await newRequest.save();
        const newRequestObject = newRequest.toObject();
        delete newRequestObject.proof;
        res.status(201).json({ newRequest: newRequestObject });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllApprovals = async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];

        // Find all candidate approval documents where status is "Pending"
        const requests = await MemberApproval.find();
        const results = await Promise.all(requests.map(async (approval) => {
            const { proof, ...approvalWithoutProof } = approval.toObject();
            const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${approvalWithoutProof.memberId}`;
            const voterCandidateResponse = await axios.get(voterCandidateEndpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                ...approvalWithoutProof,
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
        const pdf = await MemberApproval.findById(req.params.id);
  
        // Check if the PDF document was found
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + pdf.name + '"');
        res.status(200).send(pdf.proof);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getPartyRequests = async (req, res) => {
    try {

        const token = req.headers['authorization'].split(' ')[1];
        const {partyId} = req.params;
        // Find all candidate approval documents where status is "Pending"
        const requests = await MemberApproval.find({partyId});
        const results = await Promise.all(requests.map(async (approval) => {
            const { proof, ...approvalWithoutProof } = approval.toObject();
            const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${approvalWithoutProof.memberId}`;
            const voterCandidateResponse = await axios.get(voterCandidateEndpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                ...approvalWithoutProof,
                voterCandidate: voterCandidateResponse.data
            };
        }));

        res.status(200).json({ results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getPendingPartyRequests = async (req, res) => {
    try {

        const token = req.headers['authorization'].split(' ')[1];
        const {partyId} = req.params;
        // Find all candidate approval documents where status is "Pending"
        const requests = await MemberApproval.find({partyId, status: "Pending"});
        const results = await Promise.all(requests.map(async (approval) => {
            const { proof, ...approvalWithoutProof } = approval.toObject();
            const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${approvalWithoutProof.memberId}`;
            const voterCandidateResponse = await axios.get(voterCandidateEndpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return {
                ...approvalWithoutProof,
                voterCandidate: voterCandidateResponse.data
            };
        }));

        res.status(200).json({ results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const getApproval = async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Extract token from headers

        // Find the candidate approval document by ID
        const memberApproval = await MemberApproval.findById(req.params.id)

        if(!memberApproval) {
            return res.status(404).json({ msg: "Request not found" });
        }

        const { proof, ...approvalWithoutProof } = memberApproval.toObject();

        const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${approvalWithoutProof.memberId}`;
        const voterCandidateResponse = await axios.get(voterCandidateEndpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        res.status(200).json({ 
            approval: {
                ...approvalWithoutProof,
                voterCandidate: voterCandidateResponse.data
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const updateApproval = async (req, res) => {
    try {
        const {status} = req.body;
        const token = req.headers['authorization'].split(' ')[1];
        const approval = await MemberApproval.findByIdAndUpdate(req.params.id, {status}, { new: true });
        if (!approval) {
            return res.status(404).json({ message: 'Approval not found' });
        }

        const { proof, ...memberApproval } = approval.toObject();
        
        if(status=="Rejected"){
            res.status(200).json(memberApproval);
        }
        else if(status=="Accepted"){
            const partyEndpoint = `http://localhost:1003/api/v1/party/id/${memberApproval.partyId}`;
            const partyResponse = await axios.patch(partyEndpoint, { action:"Add", memberID: memberApproval.memberId.toString() },{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const response = {
                memberApproval,
                updatedParty: partyResponse.data
            };
            res.status(200).json(response);
        }
        else{
            res.status(400).json({ message: 'Invalid status' });
        }
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export{
    createMemberApproval,
    getAllApprovals,
    getPartyRequests,
    getPendingPartyRequests,
    getApproval,
    updateApproval,
    getRequestProof
}


// const getPendingApprovals = async (req, res) => {
//     try {
//         const memberApprovals = await MemberApproval.find({status: "Pending"});
//         const memberApprovalsData = await Promise.all(memberApprovals.map(async (approval) => {
//             const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/${approval.memberId}`;
//             const voterCandidateResponse = await axios.get(voterCandidateEndpoint);
//             const cnic = voterCandidateResponse.data.account.cnic;
//             const citizenDataEndpoint = `http://localhost:1000/api/v1/citizenData/cnic/${cnic}`;
//             const citizenDataResponse = await axios.get(citizenDataEndpoint);
//             const name = citizenDataResponse.data.name;
//             const gender = citizenDataResponse.data.gender;
//             const dateOfBirth = citizenDataResponse.data.dateOfBirth;
//             return {
//                 ...approval._doc,
//                 memberData: {
//                     memberId: approval.memberId,
//                     cnic,
//                     name,
//                     gender,
//                     dateOfBirth
//                 }
//             };
//         }));
//         res.status(200).json(memberApprovalsData);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// }