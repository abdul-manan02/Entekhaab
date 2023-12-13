import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import {
    getAllRequests, 
    getParty,
    createRequest, 
    updateRequest
} from '../controllers/partyApproval.js'

router.route('/')
    .post(authMiddleware, createRequest).get(authMiddleware, getAllRequests)
router.route('/id/:id')
    .put(authMiddleware, updateRequest).get(authMiddleware, getParty)

export default router