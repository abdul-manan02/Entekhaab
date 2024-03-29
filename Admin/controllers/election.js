import Election from '../models/election.js'
import axios from 'axios'



const createElection = async (req, res) => {
    try {
        const {electionType, token} = req.body
        let voter_bank = []
        let constituencies = []
        // get all voters
        const voterBankEndpoint = `http://localhost:1001/api/v1/voter`
        const voterResponse = await axios.get(voterBankEndpoint)

        if(electionType == "By Elections")
        {
            const {constituency} = req.body;
            constituencies.push(constituency._id)
            const votingAddresses = voterResponse.data.accountList.map(account => account.votingAddress)
            const citizenDataIDs = voterResponse.data.accountList.map(account => account.citizenDataId)
            for(let i=0; i<citizenDataIDs.length; i++)
            {
                const citizenEndpoint = `http://localhost:1000/api/v1/citizenData/id/${citizenDataIDs[i]}`
                const citizenResponse = await axios.get(citizenEndpoint)
                if(votingAddresses[i] == "Permanent"){
                    const address = citizenResponse.data.permanentAddress
                    if(address.city == constituency.position.city){
                        if( constituency.position.areas.includes(address.area) ) 
                            voter_bank.push({ voterId: citizenDataIDs[i], hasVoted: false});
                    }
                }
                else if(votingAddresses[i] == "Temporary"){
                    const address = citizenResponse.data.temporaryAddress
                    if(address.city == constituency.position.city){
                        if( constituency.position.areas.includes(address.area) ) 
                            voter_bank.push({ voterId: citizenDataIDs[i], hasVoted: false});
                    }
                }
            }
        }
        else if(electionType == "General Elections")
        {
            const constituencyEndpoint = `http://localhost:1002/api/v1/admin/constituency`
            const constituencyResponse = await axios.get(constituencyEndpoint,{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            constituencies = constituencyResponse.data.constituencies.map(constituency => constituency._id);   

            voter_bank = voterResponse.data.accountList.map(account => ({
                voterId: account._id,
                hasVoted: false
            }));
        }
        
        const electionData = {
            electionType,
            constituencies,
            voter_bank
        }
        
        const election = await Election.create(electionData)
        res.status(200).json({election})
    } catch (error) {
        
    }
}

const getElection = async (req, res) => {
    try {
        const {id} = req.params
        const election = await Election.findById(id)
        res.status(200).json({election})
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

const getAllElections = async (req, res) => {
    try {
        const election = await Election.find()
        res.status(200).json({election})        
    } catch (error) {
        res.status(404).json({message: error.message})
    }
}

const getCreatedElections = async (req, res) => {
    try {
        const elections = await Election.find({ isStarted: false, isFinished: false });
        res.status(200).json(elections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const getStartedElections = async (req, res) => {
    try {
        const elections = await Election.find({ isStarted: true, isFinished: false });
        res.status(200).json(elections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const getFinishedElections = async (req, res) => {
    try {
        const elections = await Election.find({ isStarted: true, isFinished: true });
        res.status(200).json(elections);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


const startElection = async (req, res) => {
    try {
        const { id } = req.params;
        const election = await Election.findById(id);

        if (election.isStarted) 
            return res.status(400).json({ message: 'Election has already been started' });
        
        election.isStarted = true;
        await election.save();

        res.status(200).json({ message: 'Election started successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}

const addCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const { candidateId, partyId, constituencyId } = req.body;
        const election = await Election.findById(id);
        
        if (election.isStarted) 
            return res.status(400).json({ message: 'Election has been started' });

        election.candidates.push({ candidateId, partyId, constituencyId, votesReceived:0 });
        await election.save();

        res.status(200).json({ message: 'Candidate added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}

const finishElection = async (req, res) => {
    try {
        const { id } = req.params;
        const election = await Election.findById(id);

        if (!election.isStarted || election.isFinished) 
            return res.status(400).json({ message: 'Election cannot be finished' });
        
        election.isFinished = true;
        await election.save();
        
        res.status(200).json({ message: 'Election finished successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}

export{
    createElection,
    getAllElections, 
    getElection, 
    getCreatedElections,
    getStartedElections,
    getFinishedElections,
    startElection,
    addCandidate,
    finishElection
}