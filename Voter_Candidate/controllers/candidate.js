import Voter_Candidate from '../models/voter_candidate.js'
import axios from 'axios'

// for applying to createa account, we will directly send send call to create an entry in
// canddiate approval model of admin
const approveCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { isCandidate } = req.body;

        const updatedCandidate = await Voter_Candidate.findByIdAndUpdate(
            id,
            { isCandidate },
            { new: true, runValidators: true }
        );

        if (!updatedCandidate) {
            return res.status(404).json({ error: "Candidate not found" });
        }

        res.status(200).json({ updatedCandidate });
    } catch (error) {
        console.error("Error in approving candidate:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export {
    approveCandidate
}