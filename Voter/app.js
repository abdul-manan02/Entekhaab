import 'dotenv/config'

import express from 'express'
const app = express()

import connectDB from './db/connect.js'
import votersRouter from './routes/voter.js'

// middleware
app.use(express.json());
app.use('/api/v1/voter', votersRouter)


const port = process.env.PORT || 5000
const start = async() =>{
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`LISTENING ON PORT ${port}`))
    } catch (error) {
        console.log(error)
    }
}

start()