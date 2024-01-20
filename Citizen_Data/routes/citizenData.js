import express from 'express'
const router = express.Router()
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

import {
    createCitizen,
    getAllCitizens,
    getCitizenByCnic,
    updateCitizenByCnic,
    getCitizenById,
    updateCitizenById,
    getCitizenImageById,
    getCitizenImageByCnic
} from '../controllers/citizenData.js'

router.route('/').post(upload.array('images'), createCitizen)
router.route('/all').get(getAllCitizens)

router.route('/cnic/:cnic').get(getCitizenByCnic).patch(updateCitizenByCnic)
router.route('/id/:id').get(getCitizenById).patch(updateCitizenById)


router.route('/cnic/:cnic/image/:imageId').get(getCitizenImageByCnic);
router.route('/cnic/:cnic/image').get(getCitizenImageByCnic);

router.route('/id/:id/image/:imageId').get(getCitizenImageById);
router.route('/id/:id/image').get(getCitizenImageById);

export default router