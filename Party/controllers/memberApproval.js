import MemberApproval from "../models/memberApproval.js";
import axios from 'axios';

const createMemberApproval = async (req, res) => {
    const memberApproval = new MemberApproval({
        partyId: req.body.partyId,
        memberId: req.body.memberId,
        proof: req.body.proof,
    });

    try {
        const newMemberApproval = await memberApproval.save();
        res.status(201).json(newMemberApproval);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

const getAllApprovals = async (req, res) => {
    try {
        const memberApproval = await MemberApproval.find();
        res.status(200).json(memberApproval);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}   

const getApproval = async (req, res) => {
    try {
        const memberApproval = await MemberApproval.findById(req.params.id);
        if (!memberApproval) {
            return res.status(404).json({ message: 'Approval not found' });
        }
        res.status(200).json(memberApproval);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateApproval = async (req, res) => {
    try {
        const {status} = req.body;
        const memberApproval = await MemberApproval.findByIdAndUpdate(req.params.id, {status}, { new: true });
        
        if (!memberApproval) {
            return res.status(404).json({ message: 'Approval not found' });
        }

        if(status=="Rejected"){
            res.status(200).json(memberApproval);
        }
        else if(status=="Accepted"){
            const partyEndpoint = `http://localhost:1003/api/v1/party/id/${memberApproval.partyId}`;
            const partyResponse = await axios.patch(partyEndpoint, { action:"Add", memberID: memberApproval.memberId.toString(), action: "Add" });
            
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
    getApproval,
    updateApproval
}