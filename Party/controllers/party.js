import Party from '../models/party.js'
import jwt from 'jsonwebtoken'
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

const login = async (req, res) => {
    try {
        const { leaderAccountCNIC, password } = req.body;

        const party = await Party.findOne({ leaderAccountCNIC });

        if (!party) {
            return res.status(400).json({ msg: "No party found with this CNIC" });
        }

        if (!party.approved) {
            return res.status(400).json({ msg: "Party is not approved" });
        }

        const isMatch = await bcrypt.compare(password, party.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid password" });
        }

        const token = jwt.sign({ userId: party._id }, process.env.JWT_KEY, { expiresIn: '24h' });

        res.status(200).json({ msg: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createParty = async (req, res) => {
    try {
        console.log(req.body)
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
        console.log("HELLO")
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
        const { leaderAccountId, memberID, action, token } = req.body;
        
        const party = await Party.findById(id);
        if (!party) {
            return res.status(404).json({ msg: 'Party not found' });
        }
        
        let update = {};
        if (leaderAccountId) {
            update.leaderAccountId = leaderAccountId;
        }
        let response;
        if (memberID && action) {
            if (action === 'Add') {
                if (!party.memberIDs.includes(memberID)) {
                    update.$addToSet = { memberIDs: memberID };
                    const endpoint = `http://localhost:1001/api/v1/candidate/id/${memberID}/updateParty`;
                    response = await axios.patch(endpoint, {partyId: id},{
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                } else {
                    return res.status(400).json({ msg: 'Member already exists' });
                }
            } else if (action === 'Remove') {
                if (party.memberIDs.includes(memberID)) {
                    update.$pull = { memberIDs: memberID };
                    const endpoint = `http://localhost:1001/api/v1/candidate/updateParty/${memberID}`;
                    response = await axios.patch(endpoint, {partyId: null},{
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                } else {
                    return res.status(400).json({ msg: 'Member does not exist' });
                }
            }
        }

        const updatedParty = await Party.findByIdAndUpdate(id, update, { runValidators:true, new: true });

        res.status(200).json({ msg: 'Party updated successfully', party: updatedParty, account: response.data });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export{
    getAllParties,
    getParty,
    createParty,
    login,
    updateApproval,
    updateParty
}