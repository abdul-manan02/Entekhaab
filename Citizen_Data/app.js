import 'dotenv/config'

import express from 'express'
const app = express()

import connectDB from './db/connect.js'
import citizenRouter from './routes/citizenData.js'

// middleware
app.use(express.json());
app.use('/api/v1/citizenData', citizenRouter)


const port = process.env.PORT || 5000
const start = async() =>{
    try {
        await connectDB(process.env.CITIZEN_URI)
        app.listen(port, console.log(`LISTENING ON PORT ${port}`))
    } catch (error) {
        console.log(error)
    }
}

start()