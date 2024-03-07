import Citizen from "../models/citizenData.js";
import AWS from 'aws-sdk'
import CryptoJS from 'crypto-js'

const s3 = new AWS.S3({
    accessKeyId: process.env.BUCKET_ACCESSKEY,
    secretAccessKey: process.env.BUCKET_SECRETACCESSKEY,
    region: process.env.BUCKET_REGION
});


// const encryptData = (data) => {
//     const encryptedData = {};
//     for (const key in data) {
//         if (data.hasOwnProperty(key)) {
//             const value = data[key];
//             if (key === 'cnic') {
//                 encryptedData[key] = value;
//                 continue;
//             }
//             if (Array.isArray(value)) {
//                 encryptedData[key] = value.map(item => {
//                     if (typeof item === 'object' && item !== null) {
//                         if (key === 'images' && item.hasOwnProperty('url')) {
//                             return { url: CryptoJS.AES.encrypt(item.url.toString(), process.env.CRYPTOJS_KEY).toString() };
//                         } else {
//                             return encryptData(item);
//                         }
//                     } else {
//                         return CryptoJS.AES.encrypt(item.toString(), process.env.CRYPTOJS_KEY).toString();
//                     }
//                 });
//             } else if (typeof value === 'object' && value !== null) {
//                 encryptedData[key] = encryptData(value);
//             } else {
//                 const encryptedValue = CryptoJS.AES.encrypt(value.toString(), process.env.CRYPTOJS_KEY).toString();
//                 encryptedData[key] = encryptedValue;
//             }
//         }
//     }
//     return encryptedData;
// };

const encryptData = (data) => {
    const encryptedData = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            if (key === 'cnic') {
                encryptedData[key] = value;
                continue;
            }
            if (Array.isArray(value)) {
                encryptedData[key] = value.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        if (key === 'images' && item.hasOwnProperty('url')) {
                            const encryptedUrl = CryptoJS.AES.encrypt(item.url.toString(), process.env.CRYPTOJS_KEY).toString();
                            const decryptedUrl = CryptoJS.AES.decrypt(encryptedUrl, process.env.CRYPTOJS_KEY).toString(CryptoJS.enc.Utf8);
                            console.log("Decrypted URL:", decryptedUrl);
                            return { url: encryptedUrl };
                        } else {
                            const encryptedItem = encryptData(item);
                            const decryptedItem = decryptData(encryptedItem, process.env.CRYPTOJS_KEY);
                            console.log("Decrypted Item:", decryptedItem);
                            return encryptedItem;
                        }
                    } else {
                        const encryptedValue = CryptoJS.AES.encrypt(item.toString(), process.env.CRYPTOJS_KEY).toString();
                        const decryptedValue = CryptoJS.AES.decrypt(encryptedValue, process.env.CRYPTOJS_KEY).toString(CryptoJS.enc.Utf8);
                        console.log("Decrypted Value:", decryptedValue);
                        return encryptedValue;
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                const encryptedValue = encryptData(value);
                const decryptedValue = decryptData(encryptedValue, process.env.CRYPTOJS_KEY);
                console.log("Decrypted Value:", decryptedValue);
                encryptedData[key] = encryptedValue;
            } else {
                const encryptedValue = CryptoJS.AES.encrypt(value.toString(), process.env.CRYPTOJS_KEY).toString();
                const decryptedValue = CryptoJS.AES.decrypt(encryptedValue, process.env.CRYPTOJS_KEY).toString(CryptoJS.enc.Utf8);
                console.log("Decrypted Value:", decryptedValue);
                encryptedData[key] = encryptedValue;
            }
        }
    }
    return encryptedData;
};


const decryptData = (encryptedData, key) => {
    const decryptedData = {};
    console.log('data encrypted', encryptedData)
    console.log('key', key)
    for (const propertyKey in encryptedData) {
        if (encryptedData.hasOwnProperty(propertyKey)) {
            const value = encryptedData[propertyKey];
            if (propertyKey === '_id' || propertyKey === '$oid' || propertyKey === '__v' || propertyKey === 'cnic') {
                decryptedData[propertyKey] = value;
                continue;
            }
            if (Array.isArray(value)) {
                decryptedData[propertyKey] = value.map(item => {
                    if (typeof item === 'object' && item !== null) {
                        if (propertyKey === 'images' && item.hasOwnProperty('url')) {
                            const decryptedUrl = CryptoJS.AES.decrypt(item.url, key).toString(CryptoJS.enc.Utf8);
                            return { url: decryptedUrl };
                        } else {
                            return decryptData(item, key);
                        }
                    } else {
                        const decryptedValue = CryptoJS.AES.decrypt(item, key).toString(CryptoJS.enc.Utf8);
                        return decryptedValue;
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                decryptedData[propertyKey] = decryptData(value, key);
            } else {
                const decryptedValue = CryptoJS.AES.decrypt(value, key).toString(CryptoJS.enc.Utf8);
                // Check if the propertyKey represents a date and convert it to a Date object
                if (propertyKey.toLowerCase().includes('date')) {
                    decryptedData[propertyKey] = new Date(decryptedValue);
                } else {
                    decryptedData[propertyKey] = decryptedValue;
                }
            }
        }
    }
    return decryptedData;
};


const createCitizen = async (req, res) => {
    try {
        let citizenData = {
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
        
        citizenData = encryptData(citizenData);

        const citizen = new Citizen(citizenData);
        await citizen.save();
    
        res.status(200).json({ message: 'Citizen data uploaded successfully' });
    } catch (e) {
        res.status(500).json({ error: e.toString() });
    }
};

const getAllCitizens = async (req, res) => {
    try {
        const citizens = await Citizen.find();
        if (citizens.length === 0) {
            return res.status(404).json({ message: "No citizens found" });
        }

        // Decrypt each citizen's data
        const decryptedCitizens = citizens.map(citizen => {
            const decryptedCitizen = decryptData(citizen.toObject(), process.env.CRYPTOJS_KEY);
            return decryptedCitizen;
        });

        res.status(200).json(decryptedCitizens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCitizenByCnic = async (req, res) => {
    try {
        
        const citizen = await Citizen.findOne({ cnic: req.params.cnic });
        if (citizen == null) {
            return res.status(404).json({ message: "Cannot find citizen" });
        }
       
        const decryptedCitizen = decryptData(citizen.toObject(), process.env.CRYPTOJS_KEY);
       
        res.status(200).json(decryptedCitizen);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

const getCitizenImageByCnic = async (req, res) => {
    try {
        const { cnic, imageId } = req.params;
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
        
        // Decrypt the image URL
        const decryptedUrl = CryptoJS.AES.decrypt(image.url, process.env.CRYPTOJS_KEY).toString(CryptoJS.enc.Utf8);
        res.status(200).json({ url: decryptedUrl });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
}

const getCitizenById = async (req, res) => {
    try {
        console.log('id', req.params.id)
        const citizen = await Citizen.findById(req.params.id);
        console.log("citizen", citizen)
        if (!citizen) {
            return res.status(404).json({ message: "Cannot find citizen" });
        }
        const decryptedCitizen = decryptData(citizen.toObject(), process.env.CRYPTOJS_KEY);
        console.log('decrypted citizen', decryptedCitizen)
        res.status(200).json(decryptedCitizen);
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

        // Decrypt the image URL
        const decryptedUrl = CryptoJS.AES.decrypt(image.url, process.env.CRYPTOJS_KEY).toString(CryptoJS.enc.Utf8);
        res.status(200).json({ url: decryptedUrl });
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
            const decryptedCitizen = decryptData(citizen.toObject(), process.env.CRYPTOJS_KEY);
            res.status(200).json(decryptedCitizen);
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
            const decryptedCitizen = decryptData(citizen.toObject(), process.env.CRYPTOJS_KEY);
            res.status(200).json(decryptedCitizen);
        } else {
            res.status(404).json({ message: "Citizen not found" });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// const updateCitizenByCnic = async (req, res) => {
//     try {
//         const citizen = await Citizen.findOneAndUpdate(
//             { cnic: req.params.cnic }, // Finding by CNIC
//             req.body,
//             { new: true }
//         );
//         if (citizen) {
//             res.status(200).json(citizen);
//         } else {
//             res.status(404).json({ message: "Citizen not found" });
//         }
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

// const updateCitizenById = async (req, res) => {
//     try {
//         const citizen = await Citizen.findByIdAndUpdate(req.params.id, req.body, {
//             new: true,
//         });
//         if (citizen) {
//             res.status(200).json(citizen);
//         } else {
//             res.status(404).json({ message: "Citizen not found" });
//         }
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// };

export {
    createCitizen,
    getAllCitizens,
    getCitizenByCnic,
    getCitizenById,
    getCitizenImageById,
    getCitizenImageByCnic
    // updateCitizenByCnic,
    // updateCitizenById,
};
