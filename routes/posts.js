const express = require('express')
var router = express.Router()

const passport = require('passport')

const { PrismaClient } = require('@prisma/client') 
const prisma = new PrismaClient()

router.get('/getPosts', passport.authenticate('authentication', { session: false }), async (req, res) => {  
  //req.user.id
  console.log("Posts | Returned newest posts")
    const posts = await prisma.posts.findMany({
      orderBy:[{ 
        DateCreated: 'asc'
      }],  
      take: 1,
      include: {
        users: true,
        likes: true,
        comments: true,
      }
    })
    res.send(posts)
  })

router.get('/testPosts', passport.authenticate('authentication', { session: false }), async (req, res) => {  
  
  console.log("Posts | Returned newest posts")
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
        AuthorID: {
          in: followedUserIds
        },
      },
      include: {
        comments: true,
        likes: true,
        users: true
      },
      take: 10,
      orderBy: {
        DateCreated: 'desc'
      }
    });
    res.send(posts)
  })

module.exports = router