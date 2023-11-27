import express from 'express'
const router = express.Router()

import{
    approveCandidate
} from '../controllers/candidate.js'

router.route('/:id').patch(approveCandidate)

export default router