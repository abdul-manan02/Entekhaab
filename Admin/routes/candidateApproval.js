import express from 'express'
const router = express.Router()

import {
    getAllRequests, 
    createRequest, 
    updateRequest
} from '../controllers/candidateApproval.js'

router.route('/').post(createRequest).get(getAllRequests).patch(updateRequest)

export default router