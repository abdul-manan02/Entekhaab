import authMiddleware from '../middleware/authMiddleware.js'
import express from 'express'
const router = express.Router()

import{
    getAllConstituencies,
    getConstituency,
    createConstituency,
    updateConstituency,
    deleteConstituency
} from '../controllers/constituencies.js'

router.route('/')
    .get(authMiddleware, getAllConstituencies).post(authMiddleware, createConstituency)
router.route('/name/:name')
    .patch(authMiddleware, updateConstituency).delete(authMiddleware, deleteConstituency).get(authMiddleware, getConstituency)

export default router