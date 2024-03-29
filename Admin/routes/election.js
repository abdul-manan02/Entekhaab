import authMiddleware from "../middleware/authMiddleware.js";
import express from "express";
const router = express.Router();

import {
  createElection,
  getAllElections,
  getElection,
  getCreatedElections,
  getStartedElections,
  getFinishedElections,
  startElection,
  addCandidate,
  finishElection,
  updateVoteStatus,
} from "../controllers/election.js";

router
  .route("/")
  .post(authMiddleware, createElection)
  .get(authMiddleware, getAllElections);
router.route("/created").get(getCreatedElections);
router.route("/started").get(getStartedElections);
router.route("/finished").get(authMiddleware, getFinishedElections);
router.route("/id/:id").get(authMiddleware, getElection);
router.route("/id/:id/start").put(authMiddleware, startElection);
router.route("/id/:id/finish").patch(authMiddleware, finishElection);
router.route("/id/:id/addCandidate").patch(authMiddleware, addCandidate);
router.route("/id/:id/voteStatus").post(updateVoteStatus);

export default router;
