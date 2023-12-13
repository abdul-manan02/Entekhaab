import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import partyRouter from "./routes/party.js";
import memberApprovalRouter from "./routes/memberApproval.js";
import candidateParticipationRouter from "./routes/candidateParticipation.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/v1/party", partyRouter);
app.use("/api/v1/party/memberApproval", memberApprovalRouter);
app.use("/api/v1/party/candidateParticipation", candidateParticipationRouter);

app.use("*", cors());

const port = process.env.PORT || 1003;
const start = async () => {
  await mongoose.connect(process.env.ENTEKHAAB_URI);
  app.listen(port, console.log(`PARTY : ${port}`));
};

start();
