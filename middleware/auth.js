const jwt = require('jsonwebtoken')

const authCheck = (req, res, next) => {
  let token =
    req.headers['authorization'] || req.body?.token || req.query?.token
  console.log({token})
  if (!token) {
    return res.status(403).send('A token is required for authentication.')
  }

  try {
    token = token.replace(/^Bearer\s+/, '')
    const decoded = jwt.decode(token, process.env.JWT_SECRET_KEY)
    req.user = decoded
  } catch (error) {
    console.log(error.message)
    return res.status(401).send('Invalid token.')
  }

  return next()
}

module.exports = authCheck
