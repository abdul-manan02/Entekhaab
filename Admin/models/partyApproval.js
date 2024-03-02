import mongoose from 'mongoose'

const party_approval = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Party must have a name"]
    },
    leaderCNIC: {
        type: String,
        immutable: true,
        required: [true, "CNIC must be provided"]
    },
    // proof should be a pdf containing all the proofs //
    proof: {
        type: String,
        required: [true, "All relevant forms and documents should be provided in the pdf"]
    },
    // this will automatically be submitted along with the request
    submitTime: {
        type: Date,
        immutable: true,
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

const partyApproval = mongoose.model('Party_Account_Approval', party_approval, 'Party_Account_Approval')
export default partyApproval
