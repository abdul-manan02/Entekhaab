import Voter from '../models/voter.js'

const getAllVoters = async(req,res) =>{
    try {
        const voterList = await Voter.find()
        res.status(201).json({Voters: voterList})
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

const createVoter = async(req,res)=>{
    try {
        const newVoter = await Voter.create(req.body)
        res.status(201).json({newVoter : newVoter})
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

const getVoter = async(req,res) =>{
    try {
        const voter = await Voter.findOne({cnic: req.params.cnic})
        if(voter)
            res.status(201).json({Voter: voter})
        else
            res.status(404).json({msg: "Voter not found"})
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

const changeVoterData = async(req,res) =>{
    if (req.body.selectedSim) {
        changeSelectedSim(req, res);
      } else if (req.body.selectedAddress) {
        changeSelectedAddress(req, res);
      } else {
        res.status(400).json({ msg: 'Invalid request body' });
      }
}

const changeSelectedAddress = async(req,res) =>{
    console.log("ADDRESS CALLED")
    try {
        const voter = await Voter.findOneAndUpdate(
            { cnic: req.params.cnic }, { selectedAddress: req.body.selectedAddress },
            { new: true, runValidators: true}
          );
        if(voter)
            res.status(201).json({msg: voter})
        else
            res.status(402).json({msg: "Voter not found"})
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

const changeSelectedSim = async(req,res) =>{
    console.log("SIM CALLED")
    try {
        const voter = await Voter.findOneAndUpdate(
            { cnic: req.params.cnic }, { selectedSim: req.body.selectedSim },
            { new: true, runValidators: true}
          );
        if(voter)
            res.status(201).json({msg: voter})
        else
            res.status(402).json({msg: "Voter not found"})
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

export {getAllVoters, createVoter, getVoter, changeVoterData}