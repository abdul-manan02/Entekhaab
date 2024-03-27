import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express';
const router = express.Router();
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

import{
    createRequestForIndepenedent,
    createRequestForPartyAffiliated,
    getAllRequests,
    getPendingRequests,
    getRequest,
    updateStatus
} from '../controllers/candidateParticipation.js'

router.route('/independentCandidate')
    .post(upload.single('documents'), createRequestForIndepenedent)

router.route('/partyAffiliatedCandidate')
    .post( createRequestForPartyAffiliated)

router.route('/').get(authMiddleware, getAllRequests)
router.route('/pending').get(authMiddleware, getPendingRequests)
router.route('/id/:id')
    .get(authMiddleware, getRequest).put(authMiddleware, updateStatus)

export default router