import Constituencies from '../models/constituencies.js'
import axios from 'axios'
import { ObjectId } from 'mongoose'

const getAllConstituencies = async(req,res)=>{
    try {
        const constituencies = await Constituencies.find()
        if(constituencies.length == 0)
        return res.status(400).json({msg: "EMPTY"})
        res.status(200).json({constituencies})

    } catch (error) {
        res.status(404).json(error)
    }
}

const getConstituency = async(req,res)=>{
    try {
        const {name} = req.params
        const constituency = await Constituencies.findOne({name})
        if(constituency)
            return res.status(200).json(constituency)
        else
            return res.status(404).json({msg: `Constituency ${name} NOT FOUND`})
    } catch (error) {
        res.status(404).json(error)
    }
}

const getConstituencyById= async(req,res)=>{
    try {
        const {id} = req.params
        const constituency = await Constituencies.findById(id)
        if(constituency)
            return res.status(200).json(constituency)
        else
            return res.status(404).json({msg: `Constituency ${name} NOT FOUND`})
    } catch (error) {
        res.status(404).json(error)
    }
}

const createConstituency = async(req,res)=>{
    try {
        const {name, position} = req.body
        const {province, district, city, area} = position
        if (!/^(NA|PP|PS|PK|PB)-\d{1,3}$/.test(name))
            return res.status(400).json({msg: "Incorrect Name"})
        const newConstituency = await Constituencies.create(req.body)
        res.status(200).json(newConstituency)
    } catch (error) {
        res.status(404).json(error)
    }
}

const updateConstituency = async(req,res)=>{
    try {
        const {name} = req.params
        const {areas} = req.body
        if(areas.length == 0)
            return res.status(400).json({msg: "Areas cannot be empty"}) 
        const constituency = await Constituencies.findOneAndUpdate({name}, {$set: { "position.areas": areas }}, {new: true, runValidators: true})
        if(!constituency)
            return res.status(404).json({msg: `Constituency ${name} NOT FOUND`})
        return res.status(200).json(constituency)
    } catch (error) {
        res.status(404).send(error)
    }
}

const deleteConstituency = async(req,res)=>{
    try {
        const {name} = req.params
        const constituency = await Constituencies.findOneAndDelete({name})
        if(constituency)
        return res.status(200).json(constituency)
        else
            res.status(404).json({msg: `Constituency ${name} NOT FOUND`})
    } catch (error) {
        res.status(404).send(error)
    }
}

export{
    getAllConstituencies,
    getConstituency,
    createConstituency,
    updateConstituency,
    deleteConstituency,
    getConstituencyById
}