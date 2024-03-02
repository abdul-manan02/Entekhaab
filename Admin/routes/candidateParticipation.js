import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express';
const router = express.Router();
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

import{
    createRequest,
    getAllRequests,
    getPendingRequests,
    getRequest,
    updateStatus
} from '../controllers/candidateParticipation.js'

router.route('/')
    .post(upload.single('documents'), authMiddleware, createRequest).get(authMiddleware, getAllRequests)
router.route('/pending').get(authMiddleware, getPendingRequests)
router.route('/id/:id')
    .get(authMiddleware, getRequest).patch(authMiddleware, updateStatus)

export default router