import Voter from '../models/voter.js'

const getAllVoters = async(req,res) =>{
    try {
        const voterList = await Voter.find()
        res.status(201).json({Voters: voterList})
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

function hasDuplicates(array) {
    return new Set(array).size !== array.length;
}

function simChecks(array){

    let check = true;

    // duplicate check
    if(hasDuplicates(req.body.sims)){
        res.status(400).json({ msg: `Duplicate SIM cards found: ${duplicateSims.join(', ')}` });
        check = false;
    }
        
    // 1 sim associated with only 1 voter 
    for (const sim of newSims) {
        const existingVoter = Voter.findOne({ sims: req.body.sims });
        if (existingVoter){
            res.status(400).json({ msg: `SIM card ${sim} is already in use by another voter` });
            check = false;
        }
    }

    return check;
}

const createVoter = async(req,res)=>{
    try {
        if(simChecks(req.body.sims)){
            const newVoter = await Voter.create(req.body)
            res.status(201).json({newVoter : newVoter})
        }
    } catch (error) {
        res.status(400).json({msg: error})
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

const changeSelectedAddress = async(req,res) =>{
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

const getElections = async(req,res)=>{
    
}

export {getAllVoters, createVoter, getVoter, changeSelectedAddress, changeSelectedSim, getElections}