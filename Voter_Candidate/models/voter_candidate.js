import mongoose from 'mongoose'

const voterCandidateSchema = new mongoose.Schema({
    password:{
        type: String,
        required: [true, 'Voter must have a password']
    },
    citizenDataId:{
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Voter must have a citizen data']
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
        },
        required: [true, 'Voting address must be set'] 
    },
    voterHistory:{
        type: [mongoose.Schema.Types.ObjectId],
    },

    isCandidate:{
        type: Boolean,
        default: false
    },
    party:{
        type: mongoose.Schema.Types.ObjectId,
    },
    candidateHistory:{
        type: [mongoose.Schema.Types.ObjectId],
    }
})

// har banda party main hoga
// jo party ka hissa nahin hoga, wo indepednent party main hoga
const VoterCandidate = mongoose.model('Voter_Candidate', voterCandidateSchema, 'Voter_Candidate')
export default VoterCandidate