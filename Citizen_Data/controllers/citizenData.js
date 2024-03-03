import Citizen from "../models/citizenData.js";
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKET_ACCESSKEY,
    secretAccessKey: process.env.BUCKET_SECRETACCESSKEY,
    region: process.env.BUCKET_REGION
});

const createCitizen = async (req, res) => {
    try {
        const citizenData = {
          cnic: req.body.cnic,
          name: req.body.name,
          dateOfBirth: req.body.dateOfBirth,
          gender: req.body.gender,
          maritalStatus: req.body.maritalStatus,
          permanentAddress: {
            house: req.body['permanentAddress.house'],
            street: req.body['permanentAddress.street'],
            area: req.body['permanentAddress.area'],
            city: req.body['permanentAddress.city'],
            province: req.body['permanentAddress.province'],
          },
          temporaryAddress: {
            house: req.body['temporaryAddress.house'],
            street: req.body['temporaryAddress.street'],
            area: req.body['temporaryAddress.area'],
            city: req.body['temporaryAddress.city'],
            province: req.body['temporaryAddress.province'],
          },
          sims: req.body.sims,
        };
    
        if (req.files) {
            const images = await Promise.all(req.files.map(async (file) => {
                const params = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: `${Date.now()}-${file.originalname}`,
                    Body: file.buffer
                };

                const uploaded = await s3.upload(params).promise();
                return { url: uploaded.Location };
            }));

            citizenData.images = images;
        }
    
        // encryption data

        // encrypted data
        const citizen = new Citizen(citizenData);
        await citizen.save();
    
        res.status(200).json({ message: 'Citizen data uploaded successfully' });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
};

// Get all citizens
const getAllCitizens = async (req, res) => {
    try {
        //const citizens = await Citizen.find();
        const citizens = await Citizen.find();
        res.status(200).json({ citizens, length: citizens.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCitizenByCnic = async (req, res) => {
    //console.log(req.params.cnic);
    try {
        //const citizen = await Citizen.findOne({ cnic: req.params.cnic });
        const citizen = await Citizen.findOne({ cnic: req.params.cnic });
        if (citizen == null) {
            return res.status(404).json({ message: "Cannot find citizen" });
        }
        res.status(200).json(citizen);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getCitizenImageByCnic = async (req, res) => {
    try {
        const { cnic, imageId } =  req.params;
        const citizen = await Citizen.findOne({ cnic });

        if (!citizen) {
            return res.status(404).json({ message: 'Citizen not found' });
        }

        let image;
        if (imageId) {
            image = citizen.images[imageId];
        } else {
            image = citizen.images[0];
        }

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        
        res.status(200).json({ url: image.url });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}

const getCitizenById = async (req, res) => {
    try {
        //const citizen = await Citizen.findById(req.params.id);
        const citizen = await Citizen.findById(req.params.id);
        if (!citizen) {
            return res.status(404).json({ message: "Cannot find citizen" });
        }
        res.status(200).json(citizen);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

const getCitizenImageById = async (req, res) => {
    try {
        const { id, imageId } = req.params;
        const citizen = await Citizen.findById(id);
        
        if (!citizen) {
            return res.status(404).json({ message: 'Citizen not found' });
        }

        let image;
        if (imageId) {
            image = citizen.images[imageId];
        } else {
            image = citizen.images[0];
        }
        
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.status(200).json({ url: image.url });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}

const updateCitizenByCnic = async (req, res) => {
    try {
        const citizen = await Citizen.findOneAndUpdate(
            { cnic: req.params.cnic }, // Finding by CNIC
            req.body,
            { new: true }
        );
        if (citizen) {
            res.status(200).json(citizen);
        } else {
            res.status(404).json({ message: "Citizen not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateCitizenById = async (req, res) => {
    try {
        const citizen = await Citizen.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (citizen) {
            res.status(200).json(citizen);
        } else {
            res.status(404).json({ message: "Citizen not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export {
    createCitizen,
    getAllCitizens,
    getCitizenByCnic,
    getCitizenById,
    updateCitizenByCnic,
    updateCitizenById,
    getCitizenImageById,
    getCitizenImageByCnic
};
