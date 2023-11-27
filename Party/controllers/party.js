import Party from '../models/party.js'
const bcrypt = require('bcryptjs');

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
        const { name, leaderAccountId, password, selectedSim, memberIDs } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newParty = new Party({
            name,
            leaderAccountId,
            password: hashedPassword,
            selectedSim,
            memberIDs
        });

        const savedParty = await newParty.save();

        res.status(201).json({ msg: "Party created successfully", party: savedParty });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const updateParty = async (req, res) => {
    try {
        const { id } = req.params;
        const { leaderAccountId, memberID, action } = req.body;

        let update = {};
        if (leaderAccountId) {
            update.leaderAccountId = leaderAccountId;
        }

        if (memberID && action) {
            if (action === 'Add') {
                update.$addToSet = { memberIDs: memberID };
            } else if (action === 'Remove') {
                update.$pull = { memberIDs: memberID };
            }
        }

        const updatedParty = await Party.findOneAndUpdate({ _id: id }, update, { new: true });

        if (!updatedParty) {
            res.status(404).json({ msg: 'Party not found' });
        } else {
            res.status(200).json({ msg: 'Party updated successfully', party: updatedParty });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export{
    getAllParties,
    createParty,
    updateParty
}