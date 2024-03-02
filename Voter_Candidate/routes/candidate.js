import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import{
    approveCandidateById,
    approveCandidateByCnic,
    updateParty
} from '../controllers/candidate.js'

router.route('/id/:id/approveCandidate').patch(authMiddleware, approveCandidateById)
router.route('/cnic/:cnic/approveCandidate').patch(authMiddleware, approveCandidateByCnic)
router.route('/id/:id/updateParty').patch(authMiddleware, updateParty)

// router.route('/:id').patch(approveCandidate)
// router.route('/updateParty/:id').patch(updateParty)
export default router