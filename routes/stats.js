const express = require('express')
var router = express.Router()

const passport = require('passport')

const { PrismaClient } = require('@prisma/client') 
const helper = require('../helper')
const prisma = new PrismaClient()

router.get('/getStats', passport.authenticate('authentication', { session: false }), async (req, res) => {  
  let action = "Requests all time stats";
  helper.saveLog(action, req.user.Handle)

  const posts = await prisma.posts.count()
  const users = await prisma.users.count()

  helper.resSend(res, [posts, users])
})

module.exports = router