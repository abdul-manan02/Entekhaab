import mongoose from 'mongoose'

const candidate_approval = new mongoose.Schema({
    cnic: {
        type: String,
        immutable: true,
        required: [true, "CNIC must be provided"]
    },
    // proof should be a pdf containing all the proofs //
    proof: {
        type: String,
        immutable: true,
        required: [true, "All relevant forms and documents should be provided in the pdf"]
    },
    // upon account creation, this data will be fetched from the citizenData DB, collection "Citizen_Data"
    citizenData: {
        type: Object,
        unique: true,
        immutable: true,
        default: null
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

const candidateApproval = mongoose.model('Candidate_Account_Approval', candidate_approval, 'Candidate_Account_Approval')
export default candidateApproval
