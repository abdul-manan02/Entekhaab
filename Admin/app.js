import 'dotenv/config'
import express from 'express'
const app = express()

import connectDB from './db/connect.js'
import candidateApproval from './routes/candidateApproval.js'
import partyApproval from './routes/partyApproval.js'
import constituencies from './routes/constituencies.js'
import login from './routes/login.js'

// middleware
app.use(express.json());
app.use('/api/v1/admin/candidateApproval', candidateApproval)
app.use('/api/v1/admin/partyApproval', partyApproval)
app.use('/api/v1/admin/constituency', constituencies)
app.use('/api/v1/admin/login', login)

const port = process.env.PORT || 1002
const start = async() =>{
    try {
        await connectDB(process.env.ENTEKHAAB_URI)
        app.listen(port, console.log(`ADMIN : ${port}`))
    } catch (error) {
        console.log(error)
    }
}

start()