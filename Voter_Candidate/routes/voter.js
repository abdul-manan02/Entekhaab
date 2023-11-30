import authenticateToken from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import {
    getAllAccounts,
    createAccount,
    login,
    getAccount,
    changeSelectedAddress,
    changeSelectedSim 
} from '../controllers/voter.js'

router.route('/sign-up').post(createAccount)

router.route('/').get(getAllAccounts)
router.route('/:id').get(authenticateToken, getAccount)

router.route('/login').post(login)

router.route('/changeSim/:id').patch(changeSelectedSim)
router.route('/changeAddress/:id').patch(changeSelectedAddress)

export default router