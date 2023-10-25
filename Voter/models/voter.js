import mongoose from 'mongoose'

const voterSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Voter must have a name']
    },
    cnic:{
        type: String,
        required: [true, 'Voter must have a cnic']
    },
    sims:{
        type: [String],
        required: [true, 'At least 1 sim should be provided']
    },
    permanentAddress:{
        house: Number,
        street: Number,
        area: {
            type: String,
            required: [true, 'Area must be provdided']
        },
        city: {
            type: String,
            required: [true, 'City must be provdided']
        },
        province: {
            type: String,
            required: [true, 'Province must be provdided'],
            enum:{
                values: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory'],
                message: '${VALUE} is invalid'
            }
        }
    },
    temporaryAddress:{
        house: Number,
        street: Number,
        area: {
            type: String,
            required: [true, 'Area must be provdided']
        },
        city: {
            type: String,
            required: [true, 'City must be provdided']
        },
        province: {
            type: String,
            required: [true, 'Province must be provdided'],
            enum:{
                values: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory'],
                message: '${VALUE} is invalid'
            }
        }
    },
    selectedAddress:{
        type: String,
        enum:{
            values: ['Permanent', 'Temporary'],
            message: '${VALUE} is invalid'
        } 
    }
})

const Voter = mongoose.model('Voter', voterSchema)
export default Voter