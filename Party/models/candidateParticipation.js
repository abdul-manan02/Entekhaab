import mongoose from 'mongoose'

const candidate_participation = new mongoose.Schema({
    // voter_candidate db
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Citizen Data must be provided"]
    },
    partyId:{
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    constituencyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Constituency Data must be provided"]
    },
    electionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Election Data must be provided"]
    },
    proof: {
        type: String,
        immutable: true,
        required: [true, "All relevant forms and documents should be provided in the pdf"]
    },
    
    // this will automatically be submitted along with the request
    submitTime: {
        type: Date,
        default: Date.now
    },
    status:{
        type: String,
        default: "Pending",
        enum:{
            values: ['Pending', 'Rejected', 'Accepted'],
            message: '${VALUE} is invalid'
        }
    }
})

const candidateParticipation = mongoose.model('Candidate_Participation_Approval', candidate_participation, 'Candidate_Participation_Approval')
export default candidateParticipation
