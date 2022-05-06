const express = require('express')
const joi = require('joi')
const validator = require('express-joi-validation').createValidator({})

const registerSchema = joi.object({
  username: joi.string().min(3).max(12).required(),
  password: joi.string().min(6).max(12).required(),
  email: joi.string().email().required(),
})

const loginSchema = joi.object({
  password: joi.string().min(6).max(12).required(),
  email: joi.string().email().required(),
})

const router = express.Router()

const {login, register} = require('../controllers/auth')
const verifyToken = require('../middleware/auth')

router.post('/register', validator.body(registerSchema), register)

router.post('/login', validator.body(loginSchema), login)

module.exports = router
