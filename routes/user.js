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
      where: { ID: userId },
      include: {
        relationships_relationships_FollowedIDTousers: true,
        relationships_relationships_FollowerIDTousers: true
      }
    })
    if (!user) {
      helper.resSend(res, null, helper.resStatuses.error, 'User with the id ' + userId.toString() + " doesn't exist")
      return
    }
    helper.resSend(res, user)
  })

  router.post('/searchUser', passport.authenticate('authentication', { session: false }), async (req, res) => {
    const searchTerm = req.body.searchTerm;
    let action = "Searched for '" + searchTerm + "'";
    helper.saveLog(action, req.user.Handle)
    const users = await prisma.users.findMany({
      where: {
        OR: [
          {
            Username: {
              contains: searchTerm
            }
          },
          {
            Handle: {
              contains: searchTerm
            }
          }
        ]
      },
      include: {
        relationships_relationships_FollowedIDTousers: true,
        relationships_relationships_FollowerIDTousers: true
      }
    });
  
    const sortedUsers = sortByUsernameAndHandle(users, searchTerm)
  
    helper.resSend(res, sortedUsers)
  })

  router.post('/getRandomUsers', passport.authenticate('authentication', { session: false }), async (req, res) => {
    const amount = req.body.amount
    const userAmount = await prisma.users.count() - amount
    randomNumber = Math.floor(Math.random() * (userAmount - 1 + 2))
 
    users = await prisma.users.findMany({
      skip: randomNumber,
      take: amount,
      where: {
        NOT: {
          ID: req.user.ID,
        }
      },
      include:{
        relationships_relationships_FollowedIDTousers: true,
        relationships_relationships_FollowerIDTousers: true 
      } 
    });

    while(users.length < 3){
      users = []
      randomNumber = Math.floor(Math.random() * (userAmount - 1 + 2))
      users = await prisma.users.findMany({
        skip: randomNumber,
        take: amount,
        where: {
          NOT: {
            ID: req.user.ID,
          }
        },
        include:{
          relationships_relationships_FollowedIDTousers: true,
          relationships_relationships_FollowerIDTousers: true 
        } 
      });
    }

    users.forEach((user, index) => { 
      const found = user.relationships_relationships_FollowerIDTousers.find(element => req.user.ID);
      users[index].Following = !!found 
    }); 

    helper.resSend(res, users)
  })  

  router.post('/updateProfileSettings', passport.authenticate('authentication', { session: false }), async (req, res) => {

    let action = "Tried to update profile settings";
    helper.saveLog(action, req.user.Handle)

    const settings = req.body;
 
    if(req.user.Handle != settings.Handle){
      handleCheck = await prisma.users.findFirst({
        where: {
          Handle: settings.Handle
        }
      })
      
      if(handleCheck){ 
        helper.resSend(res, null, helper.resStatuses.error, 'User with this handle already exists.') 
        return
      }
    }

    var Image_PFP = " ";
    var Image_Banner = " ";

    if(req.body.ProfilePicture.startsWith("data:")){
      var base64Data = settings.ProfilePicture.replace(/^data:image\/png;base64,/, "");
      require("fs").writeFile("./p_images/p_" + req.user.ID + ".png", base64Data, 'base64', function(err) {}); 
      Image_PFP = "https://michael.prietl.com:3100/p_" + req.user.ID + ".png";
    }
    else{
      Image_PFP = settings.ProfilePicture;
    }
    if(req.body.Banner.startsWith("data:")){
      var base64Data = settings.Banner.replace(/^data:image\/png;base64,/, "");
      require("fs").writeFile("./b_images/b_" + req.user.ID + ".png", base64Data, 'base64', function(err) {});     
      Image_Banner = "https://michael.prietl.com:3100/b_" + req.user.ID + ".png";
    }
    else{
      Image_Banner = settings.Banner;
    }

    respone = await prisma.users.update({
      where:{
        ID: req.user.ID,
      },
      data:{
        Bio: settings.Bio,
        Handle: settings.Handle,
        Username: settings.Username,
        Banner: Image_Banner,
        ProfilePicture: Image_PFP,
      }
    });

    helper.resSend(res)
  })  

  function sortByUsernameAndHandle(array, searchTerm) {
    return array.sort((a, b) => {
      const aUsernameMatch = a.Username.toLowerCase().indexOf(searchTerm.toLowerCase());
      const bUsernameMatch = b.Username.toLowerCase().indexOf(searchTerm.toLowerCase());
      const aHandleMatch = a.Handle.toLowerCase().indexOf(searchTerm.toLowerCase());
      const bHandleMatch = b.Handle.toLowerCase().indexOf(searchTerm.toLowerCase());
  
      if (aUsernameMatch !== -1 && bUsernameMatch !== -1) {
        return aUsernameMatch - bUsernameMatch;
      }
      if (aUsernameMatch !== -1) {
        return -1;
      }
      if (bUsernameMatch !== -1) {
        return 1;
      }
      if (aHandleMatch !== -1 && bHandleMatch !== -1) {
        return aHandleMatch - bHandleMatch;
      }
      if (aHandleMatch !== -1) {
        return -1;
      }
      if (bHandleMatch !== -1) {
        return 1;
      }
      return 0;
    });
  } 

module.exports = router