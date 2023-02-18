const express = require('express')
const app = express() 
const cors = require('cors')
const passport = require('passport') 
const helper = require('./helper') 

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient() 

var bodyParser = require('body-parser')

const casual = require('casual'); 

/* var https = require('https')
var fs = require('fs') */

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods","GET, POST, OPTIONS, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(cors())
app.use(bodyParser.json({limit: '50mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(express.static('post_images'), express.static('pfp_images'), express.static('banner_images'))

const authentication = require('./middleware/authentication')
passport.use('authentication', authentication)

const registration = require('./routes/registration')
app.use('/registration', registration)

const user = require('./routes/user')
app.use('/user', user)

const getPosts = require('./routes/posts')
app.use('/posts', getPosts)

const getStats = require('./routes/stats')
app.use('/stats', getStats)

app.get("/", async (req, res) => {
    console.log("Status | Sent Status 200 -> OK")
    res.sendStatus(200)
})

app.listen(3100, function() {
    console.log("Starting | Listening to port 3100")
}) 

/* var httpsOptions = {

    key: fs.readFileSync("./security/private.key"),
  
    cert: fs.readFileSync("./security/certificate.crt"),
  
    ca: [
  
            fs.readFileSync('./security/ca_bundle.crt'),
  
            fs.readFileSync('./security/ca_bundle.crt')
  
         ]
};

const port = 3100

const server = https.createServer(httpsOptions, app).listen(port, () => {
    console.log('server running at ' + port)
}) */