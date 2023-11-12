import express from 'express'
const router = express.Router()

import {
    getAllCitizens, 
    createCitizen, 
    getCitizen
} from '../controllers/citizenData.js'

router.route('/').post(createCitizen).get(getAllCitizens)
router.route('/:cnic').get(getCitizen)

export default router