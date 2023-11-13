import mongoose from 'mongoose'

const constituenciesModel = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Constituency must have a name"]
    },
    position:{
        province:{
            type: String,
            required: [true, "Consituencies must be for a province"],
            enum:{
                values: ['Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan', 'Islamabad Capital Territory'],
                message: '${VALUE} is invalid'
            }
        },
        district:{
            type: String,
            required: [true, "Consituencies must be for a district"]
        },
        city:{
            type: String,
            required: [true, "Consituencies must be for a city"]
        },
        areas:{
            type: [String],
            required: [true, "Consituencies must be for an area"]
        }
    }
})

const constituencies = mongoose.model('Constituencies', constituenciesModel, 'Constituencies')
export default constituencies


/*
id:{
        type: String,
        required: [true, "Election Id must be provided"]
    },
    type:{
        type: String,
        enum:{
            values:['General Elections', 'By Elections'],
            message: '${VALUE} must be provided'
        },
        required: [true, "Election must have a type"]
    },
    constituencies:{
        
    }
*/