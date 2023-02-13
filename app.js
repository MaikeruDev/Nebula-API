const express = require('express')
const app = express() 
const cors = require('cors')
const passport = require('passport') 

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient() 

const casual = require('casual');

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}));

const authentication = require('./middleware/authentication')
passport.use('authentication', authentication)

const registration = require('./routes/registration')
app.use('/registration', registration)

const user = require('./routes/user')
app.use('/user', user)

const getPosts = require('./routes/posts')
app.use('/posts', getPosts)

app.get("/", async (req, res) => {
    console.log("Status | Sent Status 200 -> OK")
    res.sendStatus(200)
})

app.listen(3100, function() {
    console.log("Starting | Listening to port 3100\n\n")
}) 