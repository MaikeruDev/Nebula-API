const express = require('express')
const router = express.Router()
const passport = require('passport')

const { PrismaClient } = require('@prisma/client')
const helper = require('../helper')
const prisma = new PrismaClient()

router.get('/getUser', passport.authenticate('authentication', { session: false }), async (req, res) => {
    const userId = req.user.id
    const user = await prisma.users.findUnique({
      where: { ID: userId }
    })
    helper.resSend(res, user)
  })
  
  router.get('/databyuserid/:userid', passport.authenticate('authentication', { session: false }), async (req, res) => {
    const userId = parseInt(req.params.userid)
    const user = await prisma.users.findUnique({
      where: { ID: userId }
    })
    if (!user) {
      helper.resSend(res, null, helper.resStatuses.error, 'User with the id ' + userId.toString() + " doesn't exist")
      return
    }
    helper.resSend(res, user)
  })

module.exports = router