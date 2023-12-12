import 'dotenv/config'
import express from 'express'
const app = express()

import connectDB from './db/connect.js'
import candidateApproval from './routes/candidateApproval.js'
import partyApproval from './routes/partyApproval.js'
import constituencies from './routes/constituencies.js'
import login from './routes/login_signup.js'
import election from './routes/election.js'
import candidateParticipation from './routes/candidateParticipation.js'
import cors from 'cors'

app.use(cors())
// middleware
app.use(express.json());
app.use('/api/v1/admin/candidateApproval', candidateApproval)
app.use('/api/v1/admin/partyApproval', partyApproval)
app.use('/api/v1/admin/constituency', constituencies)
app.use('/api/v1/admin', login)
app.use('/api/v1/admin/election', election)
app.use('/api/v1/admin/candidateParticipation', candidateParticipation)

app.use("*", cors())

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