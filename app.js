var express = require('express')
var app = express() 
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient() 

app.get("/", async (req, res) => {
    const user = await prisma.users.findUnique({
        where: { ID: 2 }
      })
      res.send(user)
})

app.listen(3100, function() {
    console.log("Listening to port 3100")
})