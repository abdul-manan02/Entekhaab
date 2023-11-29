import Party from '../models/party.js'
import bcrypt from 'bcryptjs';
import axios from 'axios'

const getAllParties = async (req, res) => {
    try{
        const parties = await Party.find()
        res.status(200).json(parties)
    } catch(error){
        res.status(404).json({message: error.message})
    }
}

const createParty = async (req, res) => {
    try {
        const { name, leaderAccountCNIC, password, selectedSim, proof } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newParty = new Party({
            name,
            leaderAccountCNIC,
            password: hashedPassword,
            selectedSim
        });
        const savedParty = await newParty.save();
        
        const partyApproval = {
            name,
            leaderCNIC: leaderAccountCNIC,
            proof
        }
        const response = await axios.post(`http://localhost:1002/api/v1/admin/partyApproval`, partyApproval)
        res.json({party: savedParty, approval: response.data})
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const getParty = async (req, res) => {
    try {
        const { id } = req.params;
        const party = await Party.findOne({ _id: id });

        if (!party) {
            res.status(404).json({ msg: 'Party not found' });
        } else {
            res.status(200).json({ party });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateApproval = async (req, res) => {
    try {
        const { name } = req.params;
        const updatedParty = await Party.findOneAndUpdate({ name }, {approved: true}, {new: true, runValidators: true});

        if (!updatedParty) {
            return res.status(404).json({ msg: 'Party not found' });
        }

        res.status(200).json(updatedParty);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateParty = async (req, res) => {
    try {
        const { id } = req.params;
        const { leaderAccountId, memberID, action } = req.body;

        const party = await Party.findById(id);
        if (!party) {
            return res.status(404).json({ msg: 'Party not found' });
        }

        let update = {};
        if (leaderAccountId) {
            update.leaderAccountId = leaderAccountId;
        }

        if (memberID && action) {
            if (action === 'Add') {
                if (!party.memberIDs.includes(memberID)) {
                    update.$addToSet = { memberIDs: memberID };
                } else {
                    return res.status(400).json({ msg: 'Member already exists' });
                }
            } else if (action === 'Remove') {
                if (party.memberIDs.includes(memberID)) {
                    update.$pull = { memberIDs: memberID };
                } else {
                    return res.status(400).json({ msg: 'Member does not exist' });
                }
            }
        }

        const updatedParty = await Party.findByIdAndUpdate(id, update, { new: true });

        res.status(200).json({ msg: 'Party updated successfully', party: updatedParty });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export{
    getAllParties,
    getParty,
    createParty,
    updateApproval,
    updateParty
}