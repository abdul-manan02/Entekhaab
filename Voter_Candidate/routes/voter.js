import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import {
    getAllAccounts,
    createAccount,
    login,
    getAccount,
    getElections,
    changeSelectedAddress,
    changeSelectedSim 
} from '../controllers/voter.js'

router.route('/').get(getAllAccounts)
router.route('/signup').post(createAccount)
router.route('/login').post(login)

router.route('/id/:id').get(authMiddleware, getAccount)
router.route('/id/:id/changeSim').patch(authMiddleware, changeSelectedSim)
router.route('/id/:id/changeAddress').patch(authMiddleware, changeSelectedAddress)
router.route('/id/:id/getElections').get(authMiddleware, getElections)
router.route('/login').post(login)


export default router