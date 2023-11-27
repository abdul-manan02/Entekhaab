import express from 'express'
const router = express.Router()

import{
    getAllParties,
    createParty,
    updateParty
} from '../controllers/party.js'

router.route('/').post(createParty).get(getAllParties)
router.route('/:id').patch(updateParty)

export default router