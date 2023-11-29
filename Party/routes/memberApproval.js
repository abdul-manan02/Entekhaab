import express from 'express';
const router = express.Router();

import{
    createMemberApproval,
    getAllApprovals,
    getApproval,
    updateApproval
} from '../controllers/memberApproval.js'

router.route('/').post(createMemberApproval).get(getAllApprovals);
router.route('/:id').get(getApproval).patch(updateApproval);

export default router;