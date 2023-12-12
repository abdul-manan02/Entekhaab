import express from 'express';
const router = express.Router();

import{
    createMemberApproval,
    getAllApprovals,
    getPendingApprovals,
    getApproval,
    updateApproval
} from '../controllers/memberApproval.js'

router.route('/').post(createMemberApproval).get(getAllApprovals);
router.route('/pending').get(getPendingApprovals);
router.route('/id/:id').get(getApproval).patch(updateApproval);

export default router;