const express = require('express')
const app = express() 
const cors = require('cors')
const passport = require('passport') 
const helper = require('./helper') 

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient() 

var bodyParser = require('body-parser')

const casual = require('casual'); 

app.use(cors())
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(express.static('post_images'))

const authentication = require('./middleware/authentication')
passport.use('authentication', authentication)

const registration = require('./routes/registration')
app.use('/registration', registration)

const user = require('./routes/user')
app.use('/user', user)

const getPosts = require('./routes/posts')
app.use('/posts', getPosts)

const getStats = require('./routes/stats')
app.use('/stats', getStats)

app.get("/", async (req, res) => {
    console.log("Status | Sent Status 200 -> OK")
    res.sendStatus(200)
})

app.listen(3100, function() {
    console.log("Starting | Listening to port 3100")
}) 