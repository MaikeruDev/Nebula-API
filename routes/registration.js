const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt')

const helper = require('../helper')

const passport = require('passport')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

router.post('/register', async (req, res) => { 
    let action = "Is trying to register"
    helper.saveLog(action, req.body.email)
    if (!req.body.email || !req.body.username || !req.body.handle || !req.body.password) {
        helper.resSend(res, null, helper.resStatuses.error, 'Empty fields!')
        return
    }

    const user = await prisma.users.findFirst({
        where: { Email: req.body.email }
    })
    if (user) {
      helper.resSend(res, null, helper.resStatuses.error, 'This email is already used!')
      return
    } else if (!helper.testPasswordStrength(req.body.password)) {
        helper.resSend(res, null, helper.resStatuses.error, 'The password must be at least 6 characters long. There must be at least one letter and one number.')
        return
    }

    const _user = await prisma.users.findFirst({
        where: { Handle: req.body.handle }
    })

    if (_user) {
      helper.resSend(res, null, helper.resStatuses.error, 'This handle is already used!')
      return
    }

    let Date = await helper.getTimeStamp()
  
    await prisma.users.create({
        data: {
            Email: req.body.email,
            Username: req.body.username,
            Handle: req.body.handle,
            Password: req.body.password,
            ProfilePicture: "https://api.dicebear.com/5.x/thumbs/svg?seed=" + req.body.handle,
            Banner: "https://michael.prietl.com:3100/nebula-logo.png",
            SignUpDate: Date
        }
    })
    const new_user = await prisma.users.findFirst({
        where: { Email: req.body.email },
        select: { ID: true }
    }) 
    const usertoken = helper.createJWT(
        new_user.ID,
        req.body.email,
        req.body.username,
        req.body.handle
    )
    helper.resSend(res, { token: usertoken })
})

router.post('/login', async (req, res) => {
    let action = "Is trying to login"
    helper.saveLog(action, req.body.email)
    if (!req.body.email || !req.body.password) {
      return res.json({ message: 'Empty fields!' })
    } else {
      const user = await prisma.users.findFirst({
        where: { Email: req.body.email }
      })
      if (!user) {
        helper.resSend(res, null, helper.resStatuses.error, 'This user does not exist!')
        return
      } 
      if (req.body.password == user.Password){
        const usertoken = helper.createJWT(
            user.ID,
            user.Email,
            user.Username,
            user.Handle
          ) 

          const answer = { token: usertoken }
          helper.resSend(res, answer)
      }
      else{
        helper.resSend(res, null, helper.resStatuses.error, 'Wrong password!')
      }
    }
})

router.post('/changePassword', passport.authenticate('authentication', { session: false }), async (req, res) => { 
  let action = "";
  action = "Trying to change password"; 
  helper.saveLog(action, req.user.Handle); 

  old_pw = req.body.old_pw 
  new_pw = req.body.new_pw
  rp_new_pw = req.body.rp_new_pw

  const user = await prisma.users.findFirst({
    where: { ID: req.user.ID }
  }) 

  if(old_pw != user.Password){
    helper.resSend(res, [], helper.resStatuses.error, "Old Password is incorrect.")
  }

  else if(new_pw != rp_new_pw){
    helper.resSend(res, [], helper.resStatuses.error, "Passwords do not match.")
  } 

  else{
    await prisma.users.update({
      where: {
        ID: req.user.ID
      },
      data: {
        Password: new_pw
      }
    })
    
    helper.resSend(res, [], helper.resStatuses.ok) 
  }

})

module.exports = router