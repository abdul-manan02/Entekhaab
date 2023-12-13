import 'dotenv/config'
import express from 'express'
const app = express()

import connectDB from './db/connect.js'
import votersRouter from './routes/voter.js'
import candidateRouter from './routes/candidate.js'
// middleware
app.use(express.json());
app.use('/api/v1/voter', votersRouter)
app.use('/api/v1/candidate', candidateRouter)

const port = process.env.PORT || 1001
const start = async() =>{
    try {
        await connectDB(process.env.ENTEKHAAB_URI)
        app.listen(port, console.log(`ACCOUNT : ${port}`))
    } catch (error) {
        console.log(error)
    }
}

start()