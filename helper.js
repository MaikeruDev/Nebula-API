const mailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const Str = require('@supercharge/strings')
require('dotenv').config()
const pwStrength = /^(?=.*[A-Za-z])(?=.*\d)[\S]{6,}$/
const fs = require('fs');
const path = require('path')
const logPath = "./.logs/"

module.exports = {
    testPasswordStrength: function (password) {
      return pwStrength.test(password)
    },
  
    createJWT: function (id, email, username, handle) {
      return jwt.sign({ id, email, username, handle }, process.env.JWT_SECRET, {
        expiresIn: '1y'
      })
    },

    generateRandomString: function () {
      return Str.random(90)
    },

    saveLog: function (actionToLog, handle) {
      const today = new Date();
      const yyyy = today.getFullYear();
      let mm = today.getMonth() + 1;
      let dd = today.getDate();
      if (dd < 10) dd = '0' + dd;
      if (mm < 10) mm = '0' + mm;
      const formattedToday = yyyy + '.' + mm + '.' + dd;
      let formattedTime = new Date();
      formattedTime = formattedTime.getHours() + ":" + formattedTime.getMinutes() + ":" + formattedTime.getSeconds();
      console.log(formattedToday + " - " + formattedTime + " | " + handle + " | " + actionToLog);

      fs.appendFile(logPath + formattedToday + ".nbl", "\n"+(formattedToday + " - " + formattedTime + " | " + handle + " | " + actionToLog), function (err) {
        if (err) throw err;
      });
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