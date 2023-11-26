import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'

const app = express();

const start = async()=>{
    await mongoose.connect(process.env.PARTY_URI)
    app.listen(3000, console.log(`Listening on port 3000`))
}

start()