import 'dotenv/config'

import express from 'express'
const app = express()

import connectDB from './db/connect.js'
import citizenRouter from './routes/citizenData.js'
//import s3 from './routes/s3.js'
import cors from 'cors'

app.use(cors())
// middleware
app.use(express.json());
app.use('/api/v1/citizenData', citizenRouter)
//app.use('/api/v1/s3', s3)

app.use("*", cors())
const port = process.env.PORT || 1000
const start = async() =>{
    try {
        await connectDB(process.env.ENTEKHAAB_URI)
        app.listen(port, console.log(`CITIZEN : ${port}`))
    } catch (error) {
        console.log(error)
    }
}

start()