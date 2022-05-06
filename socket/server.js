const authSocket = require('../middleware/authSocket')
const {newConnectionHandler, disconnectHandler} = require('../socket/handlers')
const {setIO, getOnlineUsers} = require('./store')
const {directMessageHandler, getDMHistoryHandler} = require('./handlers')

const registerSocketServer = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
      method: ['GET', 'POST'],
    },
  })

  setIO(io)

  const emitOnlineUsers = () => {
    const onlineUsers = getOnlineUsers()
    io.emit('online-users', onlineUsers)
  }

  io.use(authSocket)

  io.on('connection', (socket) => {
    newConnectionHandler(socket)
    emitOnlineUsers()

    socket.on('disconnect', () => {
      disconnectHandler(socket)
    })

    socket.on('get-DM-history', (data) => {
      getDMHistoryHandler(socket, data)
        .then(() => console.log('get DM history success'))
        .catch((err) => console.log('get DM history failed'))
    })

    socket.on('direct-message', (data) => {
      directMessageHandler(socket, data)
        .then(() => console.log('handler DM success'))
        .catch((e) => console.log('failed to handle DM'))
    })
  })

  setInterval(() => emitOnlineUsers(), 10000)
}

module.exports = {
  registerSocketServer,
}
