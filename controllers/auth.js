const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

exports.login = async (req, res) => {
  try {
    const {email, username, password} = req.body

    const user = await User.findOne({email: email.toLowerCase()})

    if (user && (await bcrypt.compare(password, user.password))) {
      // send new token
      const token = jwt.sign(
        {id: user.id, email: user.email},
        process.env.JWT_SECRET_KEY,
        {expiresIn: '24h'}
      )

      return res
        .status(200)
        .json({email: user.email, username: user.username, token})
    }

    return res.status(401).send('Invalid credentials. Please try again.')
  } catch (err) {
    console.log('error', err.message)
    return res.status(500).send('Something went wrong. Please try again.')
  }
}

exports.register = async (req, res) => {
  try {
    const {email, username, password} = req.body

    // check if user exits
    const userExists = await User.exists({email: email.toLowerCase()})
    if (userExists) {
      return res.status(409).send('Email already in use.')
    }

    // encrypt password
    const encryptedPassword = await bcrypt.hash(password, 10)

    // create user document and save in database
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: encryptedPassword,
    })

    // create JWT token
    const token = jwt.sign(
      {id: user.id, email: user.email},
      process.env.JWT_SECRET_KEY,
      {expiresIn: '24h'}
    )

    return res.status(201).json({email: user.email, username, token})
  } catch (err) {
    console.log(err.message)
    return res.status(500).send('Error occurred. Please try again.')
  }
}
