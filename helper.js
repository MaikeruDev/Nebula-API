const mailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const Str = require('@supercharge/strings')
require('dotenv').config()
const pwStrength = /^(?=.*[A-Za-z])(?=.*\d)[\S]{6,}$/

module.exports = {
    testPasswordStrength: function (password) {
      return pwStrength.test(password)
    },
  
    createJWT: function (id, email, username, handle) {
      return jwt.sign({ version: 2, id, email, username, handle }, process.env.JWT_SECRET, {
        expiresIn: '1y'
      })
    },
  
    generateRandomString: function () {
      return Str.random(90)
    },
  
    resSend (res, data, status, errors) {
      data = data ?? {}
      status = status?.toString() ?? this.resStatuses.ok
      errors = errors ?? []
      if (!Array.isArray(errors)) errors = [errors]
  
      const rspJson = {}
      rspJson.status = status
      rspJson.errors = errors
      rspJson.data = data
  
      res.send(JSON.stringify(rspJson))
    },
  
    resStatuses: Object.freeze({ ok: 'OK', error: 'Error' })
  }