import mongoose from 'mongoose';
import Citizen from '../models/citizenData.js';

// Create a new citizen
const createCitizen = async (req, res) => {
    const citizen = new Citizen(req.body);
    try {
        await citizen.save();
        res.status(201).json(citizen);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all citizens
const getAllCitizens = async (req, res) => {
    try {
        const citizens = await Citizen.find();
        res.status(200).json(citizens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a citizen by id
const getCitizen = async (req, res) => {
    //console.log(req.params.cnic);
    try { 
        const citizen = await Citizen.findOne({ cnic: req.params.cnic });
        if (citizen == null) {
            return res.status(404).json({ message: 'Cannot find citizen' });
        }
        res.status(200).json(citizen);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

// Update a citizen by id
const updateCitizen = async (req, res) => {
    try {
        const citizen = await Citizen.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (citizen) {
            res.status(200).json(citizen);
        } else {
            res.status(404).json({ message: 'Citizen not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { createCitizen, getAllCitizens, getCitizen, updateCitizen };