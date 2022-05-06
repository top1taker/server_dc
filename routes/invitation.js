const express = require('express')
const joi = require('joi')
const validator = require('express-joi-validation').createValidator({})

const invitationSchema = joi.object({
  friendEmail: joi.string().email().required(),
})

const invitationDecisionSchema = joi.object({
  id: joi.string().required(),
})

const router = express.Router()

const {invite, accept, reject} = require('../controllers/invitation')
const verifyToken = require('../middleware/auth')

router.post('/invite', verifyToken, validator.body(invitationSchema), invite)

router.post(
  '/accept',
  verifyToken,
  validator.body(invitationDecisionSchema),
  accept
)

router.post(
  '/reject',
  verifyToken,
  validator.body(invitationDecisionSchema),
  reject
)

module.exports = router
