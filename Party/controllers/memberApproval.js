import MemberApproval from "../models/memberApproval.js";

const createMemberApproval = async (req, res) => {
    const memberApproval = new MemberApproval({
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
        const memberApproval = await MemberApproval.findByIdAndUpdate(req.params.id, {status: req.body.status}, { new: true });
        if (!memberApproval) {
            return res.status(404).json({ message: 'Approval not found' });
        }
        res.status(200).json(memberApproval);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}