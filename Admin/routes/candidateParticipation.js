import express from 'express';
const router = express.Router();

import{
    createRequest,
    getAllRequests,
    getRequest,
    updateStatus
} from '../controllers/candidateParticipation.js'

router.route('/').post(createRequest).get(getAllRequests)
router.route('/:id').get(getRequest).patch(updateStatus)

export default router