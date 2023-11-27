import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config'
import partyRouter from './routes/party.js'

const app = express();
app.use(express.json())
app.use('/api/v1/party', partyRouter)

const port = process.env.PORT || 1003
const start = async()=>{
    await mongoose.connect(process.env.ENTEKHAAB_URI)
    app.listen(port, console.log(`PARTY : ${port}`))
}

start()