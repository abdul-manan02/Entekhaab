import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import {
    getAllAccounts,
    createAccount,
    login,
    getAccountById,
    getAccountByCnic,
    getElections,
    changeSelectedAddress,
    changeSelectedSim, 
    getElectionsCreated
} from '../controllers/voter.js'

router.route('/').get(getAllAccounts)
router.route('/signup').post(createAccount)
router.route('/login').post(login)

router.route('/id/:id').get(authMiddleware, getAccountById)
router.route('/cnic/:cnic').get(authMiddleware, getAccountByCnic)
router.route('/id/:id/changeSim').patch(authMiddleware, changeSelectedSim)
router.route('/id/:id/changeAddress').patch(authMiddleware, changeSelectedAddress)
router.route('/id/:id/getElections').get(authMiddleware, getElections)
router.route('/id/:id/getElections/created').get(authMiddleware, getElectionsCreated)


export default router