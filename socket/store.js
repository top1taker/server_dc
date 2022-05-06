const connectedUsers = new Map()

let io = null

const setIO = (server) => (io = server)
const getIO = () => io

const addNewConnectedUser = ({socketId, userId}) => {
  connectedUsers.set(socketId, {userId})
}

const removeConnectedUser = (socketId) => {
  if (connectedUsers.has(socketId)) {
    connectedUsers.delete(socketId)
  }
}

const getConnections = (userId) =>
  [...connectedUsers]
    .filter(([_, value]) => value.userId === userId)
    .map(([key]) => key)

const getOnlineUsers = () => [
  ...new Set([...connectedUsers].map(([_, value]) => value.userId)),
]

module.exports = {
  addNewConnectedUser,
  removeConnectedUser,
  getConnections,
  setIO,
  getIO,
  getOnlineUsers,
}
