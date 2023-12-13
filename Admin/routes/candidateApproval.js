import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import {
    getAllRequests,
    getRequest,
    getPendingRequests,
    createRequest,
    updateRequest
} from '../controllers/candidateApproval.js'

router.route('/')
    .post(authMiddleware, createRequest).get(authMiddleware, getAllRequests)
router.route('/id/:id')
    .patch(authMiddleware, updateRequest).get(authMiddleware, getRequest)
    router.route('/pending').get(authMiddleware, getPendingRequests)

export default router