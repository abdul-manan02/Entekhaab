import mongoose from 'mongoose'

const voterSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Voter must have a name']
    },
    cnic:{
        type: String,
        required: [true, 'Voter must have a cnic'],
        unique: true
    },
    sims:{
        type: [String],
        required: [true, 'At least 1 sim should be provided'],
        validate: {
            validator: function (sims) {
              return new Set(sims).size === sims.length;
            },
            message: 'SIMs within the array must be unique.',
        }
    },
    selectedSim:{
        type: String,
        validate: {
            validator: function (value) {
                return this.sims.includes(value); }, // Is selectedSim included in [sims]
            message: 'selectedSim must be one of the sims',
        },
        required: [true, 'A sim must be selected']
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


voterSchema.index({ sims: 1 }, { unique: true });


const Voter = mongoose.model('Voter', voterSchema, 'Voter')
export default Voter