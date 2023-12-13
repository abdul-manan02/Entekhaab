import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import{
    approveCandidate,
    updateParty
} from '../controllers/candidate.js'

router.route('/id/:id/approveCandidate').patch(authMiddleware, approveCandidate)
router.route('/id/:id/updateParty/').patch(authMiddleware, updateParty)

// router.route('/:id').patch(approveCandidate)
// router.route('/updateParty/:id').patch(updateParty)
export default router