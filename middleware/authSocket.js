const jwt = require('jsonwebtoken')

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const verifyTokenSocket = (socket, next) => {
  const token = socket.handshake.auth?.token

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY)
    socket.user = decoded
  } catch (err) {
    const socketError = new Error('NOT_AUTHORIZED')
    return next(socketError)
  }

  next()
}

module.exports = verifyTokenSocket
