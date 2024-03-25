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
} from "../controllers/election.js";

router
  .route("/")
  .post(authMiddleware, createElection)
  .get(authMiddleware, getAllElections);
router.route("/created").get( getCreatedElections);
router.route("/started").get(getStartedElections);
router.route("/finished").get(authMiddleware, getFinishedElections);
router.route("/id/:id").get(authMiddleware, getElection);
router.route("/id/:id/start").patch(authMiddleware, startElection);
router.route("/id/:id/finish").patch(authMiddleware, finishElection);
router.route("/id/:id/addCandidate").patch(authMiddleware, addCandidate);

export default router;
