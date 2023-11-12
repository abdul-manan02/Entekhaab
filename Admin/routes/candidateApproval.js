import express from 'express'
const router = express.Router()

import {
    getAllRequests, 
    createRequest, 
} from '../controllers/candidateApproval.js'

router.route('/').post(createRequest).get(getAllRequests)

export default router