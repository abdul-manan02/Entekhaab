import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import{
    getAllParties,
    getParty,
    createParty,
    login,
    updateApproval,
    updateParty
} from '../controllers/party.js'

router.route('/login').post(login)
router.route('/signup').post(createParty)

router.route('/id/:id')
    .patch(updateParty).get(getParty)
router.route('/name/:name/approval')
    .patch(updateApproval)
// router.route('/id/:id')
//     .patch(authMiddleware, updateParty).get(authMiddleware, getParty)
// router.route('/name/:name/approval')
//     .patch(authMiddleware, updateApproval)

export default router


//router.route('/').get(getAllParties)