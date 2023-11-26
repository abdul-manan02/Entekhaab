import express from 'express'
const router = express.Router()

import {
    createCitizen,
    getAllCitizens,
    getCitizenByCnic,
    updateCitizenByCnic,
    getCitizenById,
    updateCitizenById
} from '../controllers/citizenData.js'

router.route('/').post(createCitizen).get(getAllCitizens)
router.route('/cnic/:cnic').get(getCitizenByCnic).patch(updateCitizenByCnic)
router.route('/id/:id').get(getCitizenById).patch(updateCitizenById)

export default router