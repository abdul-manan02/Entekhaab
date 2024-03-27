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
    updateParty,
    getAllMembers
} from '../controllers/party.js'

router.route('/login').post(login)
router.route('/signup').post(upload.array('documents'), createParty)

router.route('/id/:id')
    .patch(authMiddleware, updateParty).get( getParty)
router.route('/name/:name/approval')
    .patch(authMiddleware, updateApproval)
router.route('/').get(getAllParties)
router.route('/members/:id').get(getAllMembers)
export default router


