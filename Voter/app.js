import 'dotenv/config'
import 'express-async-errors'

import express from 'express'
const app = express()

import connectDB from './db/connect.js'
//import router from './routes/voter.js'

/*
import notFoundMiddleware from './middleware/not-found'
import errorMiddleware from './middleware/error-handler'
*/

// middleware
app.use(express.json());

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