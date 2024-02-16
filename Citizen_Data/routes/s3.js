import express from 'express'
const router = express.Router()
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

import{
    createCitizen,
    getCitizenImageByCnic
} from '../controllers/s3.js'

router.route('/').post(upload.array('images'), createCitizen)
router.route('/cnic/:cnic/image').get(getCitizenImageByCnic);

export default router