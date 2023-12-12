import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express';
const router = express.Router();

import{
    createRequest,
    getAllRequests,
    getRequest,
    updateStatus
} from '../controllers/candidateParticipation.js'

router.route('/')
    .post(authMiddleware, createRequest).get(authMiddleware, getAllRequests)
router.route('/id/:id')
    .get(authMiddleware, getRequest).patch(authMiddleware, updateStatus)

export default router