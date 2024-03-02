import mongoose from 'mongoose'

const citizenSchema = new mongoose.Schema({
    cnic: {
        type: String,
        unique: true,
        required: [true, 'Citizen must have a cnic'],
    },
    name: {
        type: String,
        required: [true, 'Citizen must have a name']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Citizen must have a D.O.B']
    },
    gender: {
        type: String,
        enum: {
            values: ['Male', 'Female', 'Other'],
            message: '${VALUE} is invalid'
        }, 
        required: [true, 'Citizen must have a gender']
    },
    maritalStatus: {
        type: String,
        enum: {
           values: ['Single', 'Married', 'Divorced', 'Widowed'],
           message: '${VALUE} is invalid'
        }, 
        required: [true, 'Citizen must have a marital status']
    },
    permanentAddress: {
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
    temporaryAddress: {
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
    sims:{
        type: [String],
        required: [true, 'Citizen must have at least one sim']
    },
    images: [{
        url: { type: String }
    }],
})

const citizenData = mongoose.model('Citizen Model', citizenSchema, 'Citizen_Data')
export default citizenData