import mongoose from 'mongoose';

const partySchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    members:{
        name:{
            type: String,
            required: [true, 'Member must have a name']
        },
        cnic:{
            type: String,
            required: [true, 'Member must have a cnic'],
        }
    }
})

const partyModel = mongoose.model('Party', partySchema, 'Party')
export default partyModel