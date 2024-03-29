import mongoose from 'mongoose';

const partySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true    
    },
    leaderAccountCNIC:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    selectedSim:{
        type: String,
        required: true
    },
    memberIDs:{
        type: [mongoose.Schema.Types.ObjectId],
    },
    approved:{
        type: Boolean,
        default: false
    }
})

const partyModel = mongoose.model('Party', partySchema, 'Party')
export default partyModel