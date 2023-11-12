import CandidateApproval from '../models/candidateApproval.js'
import { MongoClient } from 'mongodb'
import connectDB from '../db/connect.js'


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
        await connectDB(citizenClient);
        // 'Citizens' is name of DB
        const db = citizenClient.db('Citizens');
        // 'Citizen_Data' is name of collection
        const collection = db.collection('Citizen_Data');
        const citizenData = await collection.findOne(
            { cnic },
            { projection: { _id: 0, __v: 0 } }
        );
        citizenClient.close();

        if (citizenData==null)
            return res.json({msg: "NOT FOUND"})
        
        const modifiedBody = {
            cnic,
            proof: req.body.proof,
            citizenData
        }
        res.json(modifiedBody)
        //const newRequest = await CandidateApproval.create(modifiedBody)
        //res.json(newRequest)
    } catch (error) {
        res.send(error)
    }
}


const updateRequest = async(req,res) =>{
    try {
        const { cnic, status } = req.body
        const request = await CandidateApproval.findOneAndUpdate({cnic}, {status}, {new: true, runValidators: true});
        res.status(200)
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

export{
    getAllRequests,
    createRequest,
    updateRequest
}