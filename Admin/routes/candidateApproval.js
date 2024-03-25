import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

import {
    getAllRequests,
    getRequest,
    getPendingRequests,
    createRequest,
    updateRequest,
    getRequestProof
} from '../controllers/candidateApproval.js'

router.route('/')
    .post(upload.single('documents'), createRequest).get(authMiddleware, getAllRequests)
router.route('/id/:id')
    .put(authMiddleware, updateRequest).get(getRequest)
router.route('/pending').get(authMiddleware, getPendingRequests)
router.route('/id/:id/proof').get(authMiddleware, getRequestProof)

export default router