import express from 'express';
const router = express.Router();

import{
    createElection,
    getAllElections, 
    getElection, 
    startElection,
    finishElection
} from '../controllers/election.js'

router.route('/').post(createElection).get(getAllElections)
router.route('/:id').get(getElection)
router.route('/:id/start').patch(startElection)
router.route('/:id/finish').patch(finishElection)

export default router;