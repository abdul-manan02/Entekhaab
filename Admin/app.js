import 'dotenv/config'

import express from 'express'
const app = express()

import connectDB from './db/connect.js'
import candidateApproval from './routes/candidateApproval.js'
import partyApproval from './routes/partyApproval.js'

// middleware
app.use(express.json());
app.use('/api/v1/admin/candidateApproval', candidateApproval)
app.use('/api/v1/admin/partyApproval', partyApproval)


const port = process.env.PORT || 5000
const start = async() =>{
    try {
        await connectDB(process.env.ADMIN_URI)
        app.listen(port, console.log(`LISTENING ON PORT ${port}`))
    } catch (error) {
        console.log(error)
    }
}

start()