import express from 'express'
const router = express.Router()

import {
    getAllAccounts,
    createAccount,
    getAccount,
    changeSelectedAddress,
    changeSelectedSim 
} from '../controllers/voter.js'

router.route('/sign-up').post(createAccount)

router.route('/').get(getAllAccounts)
router.route('/:id').get(getAccount)

router.route('/:id/changeSim').patch(changeSelectedSim)
router.route('/:id/changeAddress').patch(changeSelectedAddress)

export default router