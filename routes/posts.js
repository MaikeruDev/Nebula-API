const express = require('express')
var router = express.Router()

const passport = require('passport')

const { PrismaClient } = require('@prisma/client') 
const helper = require('../helper')
const prisma = new PrismaClient()

router.post('/getPosts', passport.authenticate('authentication', { session: false }), async (req, res) => { 
  let amountOfPosts = 15 
  console.log("Posts | Returned the newest " + amountOfPosts + " posts for user ID: " + req.user.ID)
    post_skip = req.body.skip
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
  let amountOfPosts = 15 
  console.log("Posts | Returned " + amountOfPosts + " own posts for user ID: " + req.user.ID)
    post_skip = req.body.skip

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

module.exports = router