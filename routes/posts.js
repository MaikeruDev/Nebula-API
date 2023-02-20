const express = require('express')
var router = express.Router()

const passport = require('passport')
  
const { PrismaClient } = require('@prisma/client') 
const helper = require('../helper')

const prisma = new PrismaClient()   

const { v4: uuidv4 } = require('uuid');
const { notifications } = require('../helper') 

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
      users: {
        include: {
          relationships_relationships_FollowedIDTousers: true,
          relationships_relationships_FollowerIDTousers: true
        }
      }
    },
    take: amountOfPosts,
    skip: post_skip, 
    orderBy: {
      DateCreated: 'desc'
    }
    }); 

    posts.forEach((post, index) => { 
      const like_found = post.likes.find(el => el.UserID === req.user.ID); 
      posts[index].liked = !!like_found 
  
      const following_found = post.users.relationships_relationships_FollowedIDTousers.find(el => el.FollowerID === req.user.ID); 
      posts[index].users.Following = !!following_found  
    }); 

    helper.resSend(res, posts)
})

router.post('/getPost', passport.authenticate('authentication', { session: false }), async (req, res) => { 

  let action = "";
  action = "Returned post with id: " + req.body.PostID; 
  helper.saveLog(action, req.user.Handle); 

  const posts = await prisma.posts.findUnique({
    where: {
      ID: req.body.PostID
    },
    include: {
      comments: {
        include: {
          users: {
            include: {
              relationships_relationships_FollowedIDTousers: true,
              relationships_relationships_FollowerIDTousers: true
            }
          }
        },
        orderBy:{
          DateCreated: 'desc'
        },
        skip: req.body.skip,
        take: 15
      },
      likes: true,
      users: {
        include: {
          relationships_relationships_FollowedIDTousers: true,
          relationships_relationships_FollowerIDTousers: true
        }
      }
    }
    }); 
    
    const count_comments = await prisma.comments.findMany({
      where: {
        PostID: req.body.PostID
      },
      include: {
        users: {
          include: {
            _count: true
          }
        }
      }
    }) 

    posts.len = count_comments.length

    const like_found = posts.likes.find(el => el.UserID === req.user.ID);  //Check if req user liked the post
    posts.liked = !!like_found 

    const following_found = posts.users.relationships_relationships_FollowedIDTousers.find(el => el.FollowerID === req.user.ID);  // Check if req user follow the post author
    posts.users.Following = !!following_found

    posts.comments.forEach((comment, index) => {
      const following_found = comment.users.relationships_relationships_FollowedIDTousers.find(el => el.FollowerID === req.user.ID); // check if req user follows every comment author
      posts.comments[index].users.Following = !!following_found
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
  
  posts.forEach((post, index) => { 
    const found = post.likes.find(el => el.UserID === req.user.ID); 
    posts[index].liked = !!found 
  });

  helper.resSend(res, posts)
}) 

router.post('/getUsersPosts', passport.authenticate('authentication', { session: false }), async (req, res) => {  
  let amountOfPosts = 15;
  post_skip = req.body.skip;
  let action = "Returned " + amountOfPosts + " posts of user with ID " + req.body.userID;
  helper.saveLog(action, req.user.Handle)

  const posts = await prisma.posts.findMany({
    where: {
      AuthorID: {
        in: req.body.userID
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

  posts.forEach((post, index) => { 
    const found = post.likes.find(el => el.UserID === req.user.ID); 
    posts[index].liked = !!found 
  });

  helper.resSend(res, posts)
}) 

router.post('/newPost', passport.authenticate('authentication', { session: false }), async (req, res) => {  

  let action = "Is trying to create a post";
  helper.saveLog(action, req.user.Handle)
 
  let Image = " "

  if(req.body.Image){
    var base64Data = req.body.Image.replace(/^data:image\/png;base64,/, "");

    file_name = uuidv4()

    require("fs").writeFile("./post_images/" + file_name + ".png", base64Data, 'base64', function(err) {
       
    }); 
    
    Image = "https://michael.prietl.com:3100/" + file_name + ".png";
  }
 
  let Text = req.body.Text;
  let AuthorID = req.user.ID;
  let Date = await helper.getTimeStamp()

  await prisma.posts.create({
    data: {
        Text: Text,
        Image: Image,
        AuthorID: AuthorID,
        DateCreated: Date
    }
  })

  helper.resSend(res)   
})

router.post('/newComment', passport.authenticate('authentication', { session: false }), async (req, res) => {  

  let action = "Is trying to create a comment on post: " + req.body.post.ID;
  helper.saveLog(action, req.user.Handle)
    
  let Text = req.body.Text;  
  let Date = await helper.getTimeStamp()

  await prisma.comments.create({
    data: {
        Text: Text,
        UserID: req.user.ID,
        PostID: req.body.post.ID,
        DateCreated: Date
    }
  })
 

  helper.resSend(res)   
})

router.post('/likePost', passport.authenticate('authentication', { session: false }), async (req, res) => {  
 
  let action = "Is trying to like post with ID: " + req.body.ID;
  helper.saveLog(action, req.user.Handle) 

  helper.sendNotification(notifications.like, req.user.ID, req.body.User.ID, req.body.ID)

  already_exists = await prisma.likes.findFirst({
    where: {
      PostID: req.body.ID,
      UserID: req.user.ID
    }
  })

  if(already_exists) return

  let Date = await helper.getTimeStamp()

  like_post = await prisma.likes.create({
    data: {
      PostID: req.body.ID,
      UserID: req.user.ID,
      DateCreated: Date
    }
  }) 

  helper.resSend(res)   
})

router.post('/unlikePost', passport.authenticate('authentication', { session: false }), async (req, res) => {  

  let action = "Is trying to dislike post with ID: " + req.body.ID;
  helper.saveLog(action, req.user.Handle)
 
  unlike_post = await prisma.likes.deleteMany({
    where: { 
      PostID: req.body.ID,
      UserID: req.user.ID
    }
  }) 

  helper.resSend(res)   
})

module.exports = router