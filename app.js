const express = require('express')
var app = express() 
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient() 

app.use(cors())
app.use(express.json())

app.get("/", async (req, res) => {
    console.log("Status | Sent Status 200 -> OK")
    res.sendStatus(200)
})

const getPosts = require('./routes/posts')
app.use('/posts', getPosts)

app.listen(3100, function() {
    console.log("Starting | Listening to port 3100")
})