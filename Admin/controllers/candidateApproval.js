import CandidateApproval from '../models/candidateApproval.js'
import { MongoClient } from 'mongodb'

async function connectToMongoDB(client) {
    try {
      await client.connect();
      console.log('Connected to MongoDB Atlas');
    } catch (error) {
      console.error('Error connecting to MongoDB Atlas', error);
    }
}


const getAllRequests = async(req,res) =>{
    try {
        const allRequests = await CandidateApproval.find()
        res.send("HELLO")    
    } catch (error) {
        res.status(404).json({msg: error})
    }
}


const createRequest = async(req,res) =>{
    const citizenClient = new MongoClient(process.env.CITIZEN_URI)
    try {
        const {cnic} = req.body
        await connectToMongoDB(citizenClient);
        const db = citizenClient.db('Citizens');
        const collection = db.collection('Citizen_Data');
        const documents = await collection.find({cnic}).toArray();
        res.json(documents);
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

export{
    getAllRequests,
    createRequest
}