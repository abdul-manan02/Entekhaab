import express from 'express'
const router = express.Router()

import{
    getAllParties,
    createParty,
    updateApproval,
    updateParty
} from '../controllers/party.js'

router.route('/').post(createParty).get(getAllParties)
router.route('/id/:id').patch(updateParty)
router.route('/approval/:name').patch(updateApproval)

export default router