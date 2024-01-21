import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

import{
    getAllParties,
    getParty,
    createParty,
    login,
    updateApproval,
    updateParty
} from '../controllers/party.js'

router.route('/login').post(login)
router.route('/signup').post(upload.single('documents'), createParty)

router.route('/id/:id')
    .patch(authMiddleware, updateParty).get(authMiddleware, getParty)
router.route('/name/:name/approval')
    .patch(authMiddleware, updateApproval)

export default router


//router.route('/').get(getAllParties)