import mongoose from "mongoose";

const electionVotesSchema = new mongoose.Schema({
  party: {
    type: String,
    required: true,
  },
  candidateName: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  maritalStatus: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  dob: {
    type: String,
    required: true,
  },
  constituency: {
    type: String,
    required: true,
  },
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    required: true,
  },
});

const ElectionVotes = mongoose.model(
  "Election_Votes",
  electionVotesSchema,
  "Election_Votes"
);
export default ElectionVotes;
