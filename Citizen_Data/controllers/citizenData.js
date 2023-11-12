import Citizens from '../models/citizenData.js'

const getAllCitizens = async(req,res) =>{
    try {
        const citizens = await Citizens.find()
        res.status(201).json({citizens, length: citizens.length})
    } catch (error) {
        res.status(404).json({error})
    }
}

const createCitizen = async(req,res) =>{
    try {
        const newCitizen = await Citizens.create(req.body)
        res.status(201).json({newCitizen})
    } catch (error) {
        res.status(404).json({error})
    }
}

const getCitizen = async(req,res)=>{
    try {
        const {cnic} = req.params
        const citizen = await Citizens.findOne({cnic})
        res.status(201).json({citizen})    
    } catch (error) {
        res.status(404).json({error})
    } 
}

export {getAllCitizens, createCitizen, getCitizen}