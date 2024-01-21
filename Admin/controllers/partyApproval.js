import partyApproval from '../models/partyApproval.js'
import axios from 'axios'

const getAllRequests = async(req,res) => {
    try {
        const allRequests = await partyApproval.find();
        const results = await Promise.all(allRequests.map(async (request) => {
            let requestObject = request.toObject();
            delete requestObject.proof;

            const citizenDataEndpoint = `http://localhost:1000/api/v1/citizenData/cnic/${requestObject.leaderCNIC}`;
            const citizenDataResponse = await axios.get(citizenDataEndpoint);
            const { images, ...citizenDataWithoutImages } = citizenDataResponse.data;

            return {
                ...requestObject,
                citizenData: citizenDataWithoutImages
            };
        }));

        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({msg: error})
    }
};

const getPendingRequests = async(req,res) =>{
    try {
        const allRequests = await partyApproval.find({ status: "Pending" });
        const results = await Promise.all(allRequests.map(async (request) => {
            let requestObject = request.toObject();
            delete requestObject.proof;

            const citizenDataEndpoint = `http://localhost:1000/api/v1/citizenData/cnic/${requestObject.leaderCNIC}`;
            const citizenDataResponse = await axios.get(citizenDataEndpoint);
            const { images, ...citizenDataWithoutImages } = citizenDataResponse.data;

            return {
                ...requestObject,
                citizenData: citizenDataWithoutImages
            };
        }));

        res.status(200).json(results);
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

const getRequestProof = async(req,res) =>{
    try {
        const pdf = await partyApproval.findById(req.params.id);
  
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

const getParty = async(req,res) => {
    try {
        const {id} = req.params
        const party = await partyApproval.findOne({_id: id})
        if(!party) {
            return res.status(404).json({ msg: "Party not found" });
        }

        const { proof, ...partyWithoutProof } = party.toObject();

        res.status(200).json(partyWithoutProof)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const createRequest = async (req, res) => {
    try {
        const { name, leaderCNIC} = req.body;

        // Assuming 'proof' is a stream
        const approval = new partyApproval({
            name,
            leaderCNIC,
            proof: req.body.proof  // Assuming 'proof' is the stream from the request
        });
        
        await approval.save();
        const { proof, ...responseDataWithoutProof } = approval.toObject();
        res.status(201).json(responseDataWithoutProof);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// const createRequest = async(req,res) =>{
//     try{
//         const request = { 
//             name: req.body.name,
//             leaderCNIC: req.body.leaderCNIC
//         }

//         if (req.file) {
//             request.proof = req.file.buffer;
//         }
        
//         const newRequest = new partyApproval(request);
//         await newRequest.save();
//         const newRequestObject = newRequest.toObject();
//         delete newRequestObject.proof;
//         res.status(201).json({ newRequest: newRequestObject });
//     } catch (error) {
//         res.json({msg: error})
//     }
// }


const updateRequest = async(req,res) =>{
    try {
        const {id} = req.params
        const { status } = req.body
        const token = req.headers['authorization'].split(' ')[1]; // Extract token from headers
        let request = await partyApproval.findOneAndUpdate({_id: id}, {status}, {new: true, runValidators: true});
        if(!request)
            return res.status(404).json({msg: "No request found"})
        
        const { proof, ...requestWithoutProof } = request.toObject();

        if(status==="Accepted"){
            const response = await axios.patch(`http://localhost:1003/api/v1/party/name/${request.name}/approval`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const { proof, ...responseDataWithoutProof } = response.data;
            return res.json({request: requestWithoutProof, response: responseDataWithoutProof})
        }
        res.status(200).json(requestWithoutProof)
    } catch (error) {
        res.status(404).json({msg: error})
    }
}

export{
    getAllRequests,
    getPendingRequests,
    getParty,
    createRequest,
    updateRequest,
    getRequestProof
}