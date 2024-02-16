import s3Data from '../models/s3.js'
import AWS from 'aws-sdk'

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    region: process.env.REGION
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
    
        const citizen = new s3Data(citizenData);
        await citizen.save();
    
        res.status(200).json({ message: 'Citizen data uploaded successfully' });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
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
        
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: image.url.split('/').slice(-1)[0],
            Expires: 60 * 5 // This URL will be valid for 5 minutes
        };

        const url = s3.getSignedUrl('getObject', params);
        
        res.json({ url })
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}

export{
    createCitizen,
    getCitizenImageByCnic
}