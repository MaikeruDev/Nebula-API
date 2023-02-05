const express = require('express')
var router = express.Router()

const { PrismaClient } = require('@prisma/client') 
const prisma = new PrismaClient()

router.get('/getPosts', async (req, res) => {  
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