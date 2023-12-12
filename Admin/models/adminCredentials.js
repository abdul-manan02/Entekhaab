import mongoose from 'mongoose';

const adminCredentialsSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    }
})

const adminCredentialsModel = mongoose.model('Admin_Credentials', adminCredentialsSchema, 'Admin_Credentials')    
export default adminCredentialsModel