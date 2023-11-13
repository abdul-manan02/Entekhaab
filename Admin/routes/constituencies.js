import express from 'express'
const router = express.Router()

import{
    getAllConstituencies,
    createConstituency,
    updateConstituency,
    deleteConstituency
} from '../controllers/constituencies.js'

router.route('/').get(getAllConstituencies).post(createConstituency)
router.route('/:name').patch(updateConstituency).delete(deleteConstituency)

export default router