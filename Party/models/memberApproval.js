import mongoose from 'mongoose'

const member_approval = new mongoose.Schema({
    partyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: true
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Citizen Data must be provided"]
    },
    proof: {
        type: String,
        required: [true, "All relevant forms and documents should be provided in the pdf"]
    },
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

const MemberApproval = mongoose.model('Member_Approval', member_approval, 'Member_Approval')
export default MemberApproval
