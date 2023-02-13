const express = require('express')
var router = express.Router()

const passport = require('passport')

const { PrismaClient } = require('@prisma/client') 
const helper = require('../helper')
const { time } = require('console')
const prisma = new PrismaClient()

router.post('/getPosts', passport.authenticate('authentication', { session: false }), async (req, res) => { 
  let amountOfPosts = 15;
  post_skip = req.body.skip
  let action = "";
  action = "Returned the newest " + amountOfPosts + " posts";
  if(post_skip > 0) action = "Returned " + amountOfPosts + " posts";
  helper.saveLog(action, req.user.Handle);
    const followedUsers = await prisma.relationships.findMany({
      where: { 
        FollowerID: req.user.ID
      },
      select: {
        FollowedID: true
      }
    });

    const followedUserIds = followedUsers.map(relationship => relationship.FollowedID);

    const posts = await prisma.posts.findMany({
      where: {
        OR: [
          {
            AuthorID: {
              in: followedUserIds
            }
          },
          {
            AuthorID: {
              in: req.user.ID
            }
          }
        ] 
      },
      include: {
        comments: {
          include: {
            users: true
          }
        },
        likes: true,
        users: true
      },
      take: amountOfPosts,
      skip: post_skip, 
      orderBy: {
        DateCreated: 'desc'
      }
    }); 
    helper.resSend(res, posts)
  })

router.post('/getOwnPosts', passport.authenticate('authentication', { session: false }), async (req, res) => {  
  let amountOfPosts = 15;
  post_skip = req.body.skip;
  let action = "Returned " + amountOfPosts + " own posts";
  helper.saveLog(action, req.user.Handle)

  const posts = await prisma.posts.findMany({
    where: {
      AuthorID: {
        in: req.user.ID
      }
    },
    include: {
      comments: {
        include: {
          users: true
        }
      },
      likes: true,
      users: true
    },
    take: amountOfPosts,
    skip: post_skip, 
    orderBy: {
      DateCreated: 'desc'
    }
  }); 
  helper.resSend(res, posts)
})

router.post('/newPost', passport.authenticate('authentication', { session: false }), async (req, res) => {  
  let action = "Is trying to create a post";
  helper.saveLog(action, req.user.Handle)

  let Text = req.body.Text;
  let Image = req.body.Image;
  let AuthorID = req.user.ID;

  await prisma.posts.create({
    data: {
        Text: Text,
        Image: Image,
        AuthorID: AuthorID,
    }
  })

  helper.resSend(res)
})

module.exports = router