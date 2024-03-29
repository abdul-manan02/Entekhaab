import mongoose from "mongoose";

const electionVotesSchema = new mongoose.Schema({
  party: {
    type: String,
    required: true,
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
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
  transcationHash: {
    type: String,
    required: true,
  },
});

const ElectionVotes = mongoose.model(
  "Election_Votes",
  electionVotesSchema,
  "Election_Votes"
);
export default ElectionVotes;
