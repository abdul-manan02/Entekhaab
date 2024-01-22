import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express';
const router = express.Router();
import multer from 'multer'
const upload = multer({ storage: multer.memoryStorage() });

import{
    createMemberApproval,
    getAllApprovals,
    getPartyRequests,
    getPendingPartyRequests,
    getApproval,
    updateApproval,
    getRequestProof
} from '../controllers/memberApproval.js'

router.route('/')
    .post(upload.single('documents'), authMiddleware, createMemberApproval).get(authMiddleware, getAllApprovals);

router.route('/id/:id')
    .get(getApproval).patch(authMiddleware, updateApproval);

router.route('/id/:id/proof').get(authMiddleware, getRequestProof)

router.route('/partyId/:partyId').get(authMiddleware, getPartyRequests);

router.route('/partyId/:partyId/pending').get(authMiddleware, getPendingPartyRequests);
    
export default router;
    //router.route('/pending').get(getPendingApprovals);