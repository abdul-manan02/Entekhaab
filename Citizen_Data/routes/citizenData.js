import express from 'express'
const router = express.Router()

import {
    createCitizen,
    getAllCitizens,
    getCitizen,
    updateCitizen
} from '../controllers/citizenData.js'

router.route('/').post(createCitizen).get(getAllCitizens)
router.route('/:cnic').get(getCitizen).patch(updateCitizen)

export default router