const express = require('express')
var router = express.Router()

const passport = require('passport')

const { PrismaClient } = require('@prisma/client') 
const prisma = new PrismaClient()

router.post('/getPosts', passport.authenticate('authentication', { session: false }), async (req, res) => {  
  console.log("Posts | Returned newest posts")
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
        AuthorID: {
          in: followedUserIds
        },
      },
      include: {
        comments: true,
        likes: true,
        users: true
      },
      take: 15,
      skip: post_skip, 
      orderBy: {
        DateCreated: 'desc'
      }
    });
    res.send(posts)
  })

module.exports = router