import express from 'express'
const router = express.Router()

import {
    getAllVoters, 
    createVoter, 
    getVoter, 
    changeSelectedAddress, 
    changeSelectedSim, 
    getElections,
} from '../controllers/voter.js'

router.route('/').post(createVoter).get(getAllVoters)
router.route('/:cnic').get(getVoter)
router.route('/:cnic/changeSim').patch(changeSelectedSim)
router.route('/:cnic/changeAddress').patch(changeSelectedAddress)
router.router('/:cnic/elections').get()

export default router