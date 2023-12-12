import express from 'express';
const router = express.Router();

import{
    createElection,
    getAllElections, 
    getElection, 
    getCreatedElections,
    getStartedElections,
    getFinishedElections,
    startElection,
    addCandidate,
    finishElection
} from '../controllers/election.js'

router.route('/').post(createElection).get(getAllElections)
router.route('/created').get(getCreatedElections)
router.route('/started').get(getStartedElections)
router.route('/finished').get(getFinishedElections)
router.route('/:id').get(getElection)
router.route('/:id/start').patch(startElection)
router.route('/:id/finish').patch(finishElection)
router.route('/:id/addCandidate').patch(addCandidate)

export default router;