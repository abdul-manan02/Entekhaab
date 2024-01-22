import ConstituencyChangeRequest from '../models/constituencyChangeRequest.js'
import axios from 'axios'

const createRequest = async(req,res) => {
    try {
        const request = { 
            accountId: req.body.accountId,
            changeTo: req.body.changeTo
        }

        if (req.file) {
            request.proof = req.file.buffer;
        }
        
        const newRequest = new ConstituencyChangeRequest(request);
        await newRequest.save();
        const newRequestObject = newRequest.toObject();
        delete newRequestObject.proof;
        res.status(201).json({ newRequest: newRequestObject });
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

const getRequest = async(req,res) => {
    try {
        const request = await ConstituencyChangeRequest.findById(req.params.id);
        if (request) {
            const {proof, ...requestWithoutProof} = request.toObject();
            res.status(200).json(requestWithoutProof);
        } else {
            res.status(404).json({ message: 'Request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const updateRequest = async(req,res) => {
    try {
        const {status} = req.body
        if(status != "Accepted" && status != "Rejected"){
            return res.status(400).json({message: "Invalid status"})
        }

        const {id} = req.params
        const token = req.headers['authorization'].split(' ')[1];

        const request = await ConstituencyChangeRequest.findByIdAndUpdate(id, {status}, { new: true, runValidators: true });
        const {proof, ...updatedRequest} = request.toObject();
        
        if(status === "Rejected"){
            res.status(200).json(updatedRequest);
        }
        else if(status === "Accepted"){
            const voterEndPoint = `http://localhost:1001/api/v1/voter/id/${updatedRequest.accountId}/changeAddress`
            const electionResponse = await axios.patch(voterEndPoint, {selectedAddress: updatedRequest.changeTo},{
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const voter = electionResponse.data;
            res.status(200).json({updatedRequest, voter});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllRequests = async(req,res) => {
    try {
        const requests = await ConstituencyChangeRequest.find();
        const requestsWithoutProof = requests.map(request => {
            const {proof, ...requestWithoutProof} = request.toObject();
            return requestWithoutProof;
        });
        res.status(200).json(requestsWithoutProof);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getPendingRequests = async(req,res) => {
    try {
        const requests = await ConstituencyChangeRequest.find({status: "Pending"});
        const requestsWithoutProof = requests.map(request => {
            const {proof, ...requestWithoutProof} = request.toObject();
            return requestWithoutProof;
        });
        res.status(200).json(requestsWithoutProof);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getRequestProof = async(req,res) =>{
    try {
        const pdf = await ConstituencyChangeRequest.findById(req.params.id);
  
        // Check if the PDF document was found
        if (!pdf) {
            return res.status(404).json({ error: 'PDF not found' });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + pdf.name + '"');
        res.status(200).send(pdf.proof);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export{
    createRequest,
    getRequest,
    updateRequest,
    getAllRequests,
    getPendingRequests,
    getRequestProof
}