import mongoose from 'mongoose'

const voterCandidateSchema = new mongoose.Schema({
    cnic:{
        type: String,
        required: [true, 'Voter must have a cnic'],
        unique: true
    },
    name:{
        type: String,
        required: [true, 'Voter must have a name']
    },
    password:{
        type: String,
        required: [true, 'Voter must have a password']
    },
    citizenData:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Citizen'
    },
    selectedSim:{
        type: String,
        required: [true, 'A sim must be selected']
    },
    votingAddress:{
        type: String,
        enum:{
            values: ['Permanent', 'Temporary'],
            message: '${VALUE} is invalid'
        } 
    },
    
    votingHistory:{
        elections:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Election'
        }]
    },
    /*
    isCandidate:{
        type: Boolean,
        default: false
    },
    party:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party'
    },
    pastElecions:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Election'
    },
    */
})

// har banda party main hoga
// jo party ka hissa nahin hoga, wo indepednent party main hoga
const VoterCandidate = mongoose.model('Voter_Candidate', voterCandidateSchema, 'Voter_Candidate')
export default VoterCandidate