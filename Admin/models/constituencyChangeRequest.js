import mongoose from 'mongoose'

const constituencyChange = new mongoose.Schema({
    // voter_candidate db
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Citizen Data must be provided"]
    },
    changeTo:{
        type: String,
        enum:{
            values: ['Temporary', 'Permanent'],
            message: '${VALUE} is invalid'
        }
    },
    proof: {
        type: String,
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

const constituencyChangeRequest = mongoose.model('Constituency_Change_Request', constituencyChange, 'Constituency_Change_Request')
export default constituencyChangeRequest