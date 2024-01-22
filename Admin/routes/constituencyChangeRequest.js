import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

import{
    createRequest,
    getRequest,
    updateRequest,
    getAllRequests,
    getPendingRequests,
    getRequestProof
} from '../controllers/constituencyChangeRequest.js'

router.route('/')
    .get(authMiddleware,getAllRequests).post(upload.single('proof'), authMiddleware, createRequest)
router.route('/id/:id')
    .get(authMiddleware,getRequest).patch(authMiddleware, updateRequest)

router.route('/pending').get(authMiddleware, getPendingRequests)
router.route('/id/:id/proof').get(authMiddleware,getRequestProof)

export default router