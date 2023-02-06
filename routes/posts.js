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
      take: 2,
      include: {
        users: true,
        likes: true,
        comments: true
      }
    })
    res.send(posts)
  })

module.exports = router