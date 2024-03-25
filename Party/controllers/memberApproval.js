import MemberApproval from "../models/memberApproval.js";
import axios from 'axios';
import s3 from './s3Config.js';

const createMemberApproval = async (req, res) => {
    try {
        console.log(req.body)
        const request = { 
            partyId: req.body.partyId,
            memberId: req.body.memberId
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
        
        const newRequest = new MemberApproval(request);
        await newRequest.save();
        res.status(200).json({ newRequest: newRequest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllApprovals = async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1];

        const requests = await MemberApproval.find();
        const results = await Promise.all(requests.map(async (approval) => {
            const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${approval.memberId}`;
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
        const pdf = await MemberApproval.findById(req.params.id);
  
        // Check if the PDF document was found
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }

        res.status(200).json({url : pdf.proof});
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
            const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${approval.memberId}`;
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

const getPendingPartyRequests = async (req, res) => {
    try {

        const token = req.headers['authorization'].split(' ')[1];
        const {partyId} = req.params;
        // Find all candidate approval documents where status is "Pending"
        const requests = await MemberApproval.find({partyId, status: "Pending"});
        const results = await Promise.all(requests.map(async (approval) => {
            const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${approval.memberId}`;
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


const getApproval = async (req, res) => {
    try {
        const token = req.headers['authorization'].split(' ')[1]; // Extract token from headers

        // Find the candidate approval document by ID
        const memberApproval = await MemberApproval.findById(req.params.id)

        if(!memberApproval) {
            return res.status(404).json({ msg: "Request not found" });
        }

        const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${memberApproval.memberId}`;
        const voterCandidateResponse = await axios.get(voterCandidateEndpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        res.status(200).json({ 
            approval: {
                ...memberApproval.toObject(),
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

        if(status != "Accepted" && status != "Rejected"){
            return res.status(400).json({ message: 'Invalid status' });
        }

        const approval = await MemberApproval.findByIdAndUpdate(req.params.id, {status}, { new: true });
        if (!approval) {
            return res.status(404).json({ message: 'Approval not found' });
        }
        
        if(status=="Rejected"){
            res.status(200).json(approval);
        }
        else if(status=="Accepted"){
            const partyEndpoint = `http://localhost:1003/api/v1/party/id/${approval.partyId}`;
            const partyResponse = await axios.patch(partyEndpoint, { action:"Add", memberID: approval.memberId.toString() },{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            const response = {
                approval,
                updatedParty: partyResponse.data
            };
            res.status(200).json(response);
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