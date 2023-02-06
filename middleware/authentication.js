const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

require('dotenv').config()

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

module.exports = new JwtStrategy(opts, async function async (jwtPayload, done) {
const user = await prisma.users.findUnique({
    where: { ID: jwtPayload.id }
})

if (user) {
    return done(null, user)
} else {
    return done(null, false)
}
})