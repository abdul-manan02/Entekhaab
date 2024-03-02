import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express';
const router = express.Router();
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

import{
    createRequest,
    getAllRequestsForParty,
    getAllRequestsForPartyForConstituency,
    getPendingRequestsForParty,
    getPendingRequestsForPartyForConstituency,
    getRequest,
    updateStatus
} from '../controllers/candidateParticipation.js'

router.route('/').post(upload.single('documents'), authMiddleware, createRequest)

router.route('/partyId/:partyId').get(authMiddleware, getAllRequestsForParty)
router.route('/partyId/:partyId/constituency').get(authMiddleware, getAllRequestsForPartyForConstituency)
router.route('/partyId/:partyId/pending').get(authMiddleware, getPendingRequestsForParty)
router.route('/partyId/:partyId/pending/constituency').get(authMiddleware, getPendingRequestsForPartyForConstituency)

router.route('/partyId/:partyId/id/:id').get(authMiddleware, getRequest).patch(authMiddleware, updateStatus)

export default router