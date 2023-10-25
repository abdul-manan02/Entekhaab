import express from 'express'
const router = express.Router()

import {
    getAllVoters, 
    createVoter, 
    getVoter, 
    changeVoterData, 
} from '../controllers/voter.js'

router.route('/').post(createVoter).get(getAllVoters)
router.route('/:cnic').get(getVoter).patch(changeVoterData)

export default router