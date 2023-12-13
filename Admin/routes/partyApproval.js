import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import {
    getAllRequests, 
    getParty,
    getPendingRequests,
    createRequest, 
    updateRequest
} from '../controllers/partyApproval.js'

router.route('/').post(createRequest).get(getAllRequests)
router.route('/pending').get(authMiddleware, getPendingRequests)
router.route('/id/:id')
    .patch(authMiddleware, updateRequest).get(authMiddleware, getParty)

export default router


//router.route('/').get(getAllRequests)   