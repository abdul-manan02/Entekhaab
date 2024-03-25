import Party from "../models/party.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import axios from "axios";
import s3 from "./s3Config.js";

const getAllParties = async (req, res) => {
  try {
    const parties = await Party.find();
    res.status(200).json(parties);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getAllMembers = async (req, res) => {
  try {
    const parties = await Party.find({ _id: req.params.id });

    const token = req.headers["authorization"].split(" ")[1];
    const memberData = [];

    if (parties[0]?.memberIDs?.length > 0) {
      await Promise.all(
        parties[0].memberIDs.map(async (memberId) => {
          const voterCandidateEndpoint = `http://localhost:1001/api/v1/voter/id/${memberId}`;
          const voterCandidateResponse = await axios.get(
            voterCandidateEndpoint,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          memberData.push(voterCandidateResponse.data);
        })
      );
    }

    res.status(200).json(memberData);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

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

    const token = jwt.sign({ userId: party._id }, process.env.JWT_KEY, {
      expiresIn: "24h",
    });

    res.status(200).json({ party: party, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createParty = async (req, res) => {
  try {
    const { name, leaderAccountCNIC, password, selectedSim } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let uploadedImage;
    let uploadedPDF;

    for (const file of req.files) {
      if (file.fieldname === "documents") {
        if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
          const imageParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${Date.now()}-${file.originalname}`,
            Body: file.buffer,
          };
          uploadedImage = await s3.upload(imageParams).promise();
        } else if (file.mimetype === "application/pdf") {
          const pdfParams = {
            Bucket: process.env.BUCKET_NAME,
            Key: `${Date.now()}-${file.originalname}`,
            Body: file.buffer,
          };
          uploadedPDF = await s3.upload(pdfParams).promise();
        }
      }
    }

    const newParty = new Party({
      name,
      leaderAccountCNIC,
      password: hashedPassword,
      selectedSim,
      logo: uploadedImage ? uploadedImage.Location : null,
    });

    const savedParty = await newParty.save();

    const partyApproval = {
      name,
      leaderCNIC: leaderAccountCNIC,
      proof: uploadedPDF ? uploadedPDF.Location : null,
    };

    const response = await axios.post(
      `http://localhost:1002/api/v1/admin/partyApproval`,
      partyApproval
    );
    res.status(200).json({ party: savedParty, approval: response.data });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const getParty = async (req, res) => {
  try {
    const { id } = req.params;
    const party = await Party.findOne({ _id: id });

    if (!party) {
      res.status(404).json({ msg: "Party not found" });
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
    const updatedParty = await Party.findOneAndUpdate(
      { name },
      { approved: true },
      { new: true, runValidators: true }
    );
    if (!updatedParty) {
      return res.status(404).json({ msg: "Party not found" });
    }

    res.status(200).json(updatedParty);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const updateLeaderAccountCNIC = (leaderAccountCNIC, update) => {
  if (leaderAccountCNIC) {
    update.leaderAccountCNIC = leaderAccountCNIC;
  }
};

const addMember = async (party, memberID, token, update) => {
  if (!party.memberIDs.includes(memberID)) {
    update.$addToSet = { memberIDs: memberID };
    const endpoint = `http://localhost:1001/api/v1/candidate/id/${memberID}/updateParty`;
    const response = await axios.patch(
      endpoint,
      { partyId: party._id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } else {
    throw new Error("Member already exists");
  }
};

const removeMember = async (party, memberID, token, update) => {
  if (party.memberIDs.includes(memberID)) {
    update.$pull = { memberIDs: memberID };
    const endpoint = `http://localhost:1001/api/v1/candidate/id/${memberID}/updateParty`;
    const response = await axios.patch(
      endpoint,
      { partyId: null },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response;
  } else {
    throw new Error("Member does not exist");
  }
};

const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { leaderAccountCNIC, memberID, action } = req.body;

    const token = req.headers["authorization"].split(" ")[1];

    if (!token) {
      return res.status(400).json({ msg: "Authorization token is missing" });
    }

    const party = await Party.findById(id);
    if (!party) {
      return res.status(404).json({ msg: "Party not found" });
    }

    let update = {};
    updateLeaderAccountCNIC(leaderAccountCNIC, update);
    let response;

    if (memberID && action) {
      if (action === "Add") {
        response = await addMember(party, memberID, token, update);
      } else if (action === "Remove") {
        response = await removeMember(party, memberID, token, update);
      } else {
        return res.status(400).json({ msg: "Invalid action" });
      }
    }

    const updatedParty = await Party.findByIdAndUpdate(id, update, {
      runValidators: true,
      new: true,
    });

    res.status(200).json({
      msg: "Party updated successfully",
      party: updatedParty,
      account: response?.data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export {
  getAllParties,
  getParty,
  createParty,
  login,
  updateApproval,
  updateParty,
  getAllMembers,
};

// const updateParty = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { leaderAccountCNIC, memberID, action } = req.body;
//         const token = req.headers['authorization']?.split(' ')[1];

//         if (!token) {
//             return res.status(400).json({ msg: 'Authorization token is missing' });
//         }

//         const party = await Party.findById(id);
//         if (!party) {
//             return res.status(404).json({ msg: 'Party not found' });
//         }

//         let update = {};
//         if (leaderAccountCNIC) {
//             update.leaderAccountCNIC = leaderAccountCNIC;
//         }
//         let response;
//         if (memberID && action) {
//             const memberObjectId = mongoose.Types.ObjectId(memberID);
//             if (action === 'Add') {
//                 if (!party.memberIDs.includes(memberObjectId)) {
//                     update.$addToSet = { memberIDs: memberObjectId };
//                     const endpoint = `http://localhost:1001/api/v1/candidate/id/${memberID}/updateParty`;
//                     try {
//                         response = await axios.patch(endpoint, {partyId: id}, {
//                             headers: {
//                                 Authorization: `Bearer ${token}`
//                             }
//                         });
//                     } catch (error) {
//                         return res.status(500).json({ msg: 'Error updating party member', error: error.message });
//                     }
//                 } else {
//                     return res.status(400).json({ msg: 'Member already exists' });
//                 }
//             } else if (action === 'Remove') {
//                 if (party.memberIDs.includes(memberObjectId)) {
//                     update.$pull = { memberIDs: memberObjectId };
//                     const endpoint = `http://localhost:1001/api/v1/candidate/updateParty/${memberID}`;
//                     try {
//                         response = await axios.patch(endpoint, {partyId: null}, {
//                             headers: {
//                                 Authorization: `Bearer ${token}`
//                             }
//                         });
//                     } catch (error) {
//                         return res.status(500).json({ msg: 'Error removing party member', error: error.message });
//                     }
//                 } else {
//                     return res.status(400).json({ msg: 'Member does not exist' });
//                 }
//             } else {
//                 return res.status(400).json({ msg: 'Invalid action' });
//             }
//         }

//         const updatedParty = await Party.findByIdAndUpdate(id, update, { runValidators:true, new: true });

//         res.status(200).json({ msg: 'Party updated successfully', party: updatedParty, account: response?.data });
//     } catch (error) {
//         res.status(500).json({ msg: error.message });
//     }
// };
