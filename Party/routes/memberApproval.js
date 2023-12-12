import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express';
const router = express.Router();

import{
    createMemberApproval,
    getAllApprovals,
    getPendingApprovals,
    getPartyRequests,
    getPendingPartyRequests,
    getApproval,
    updateApproval
} from '../controllers/memberApproval.js'

router.route('/')
    .post(authMiddleware, createMemberApproval).get(authMiddleware, getAllApprovals);
router.route('/id/:id')
    .get(getApproval).patch(authMiddleware, updateApproval);
router.route('/partyId/:partyId')
    .get(getPartyRequests);
router.route('/partyId/:partyId/pending')
    .get(getPendingPartyRequests);
    
export default router;
    //router.route('/pending').get(getPendingApprovals);