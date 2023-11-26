import express from 'express'
const router = express.Router()

import {
    getAllRequests, 
    createRequest, 
    updateRequest
} from '../controllers/candidateApproval.js'

router.route('/').post(createRequest).get(getAllRequests)
router.route('/:id').patch(updateRequest)

export default router