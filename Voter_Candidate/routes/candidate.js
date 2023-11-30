import authenticateToken from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import{
    approveCandidate,
    updateParty
} from '../controllers/candidate.js'

router.route('/:id').patch(authenticateToken, approveCandidate)
router.route('/updateParty/:id').patch(authenticateToken, updateParty)

export default router