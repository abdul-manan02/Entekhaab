import express from 'express'
const router = express.Router()

import {
    getAllRequests, 
    getParty,
    createRequest, 
    updateRequest
} from '../controllers/partyApproval.js'

router.route('/').post(createRequest).get(getAllRequests)
router.route('/:id').patch(updateRequest).get(getParty)

export default router