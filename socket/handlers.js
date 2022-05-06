const Invitation = require('../models/invitation')
const User = require('../models/user')
const Message = require('../models/message')
const Conversation = require('../models/conversation')

const {
  addNewConnectedUser,
  removeConnectedUser,
  getConnections,
  getIO,
  checkOnline,
  getOnlineUsers,
} = require('./store')

const newConnectionHandler = (socket) => {
  const user = socket.user
  addNewConnectedUser({socketId: socket.id, userId: user.id})

  updateFriends(user.id)
    .then(() => 'init get friends', user.id)
    .catch((e) => console.log(e))

  updateInvitations(user.id)
    .then(() => console.log('init get invitations!', user.id))
    .catch((err) => console.log(err))
}

const disconnectHandler = (socket) => {
  removeConnectedUser(socket.id)
}

const updateInvitations = async (receiverId) => {
  const invitations = await Invitation.find({receiver: receiverId}).populate(
    'sender',
    '_id username email'
  )

  const receiverSocketIds = getConnections(receiverId)

  const io = getIO()

  receiverSocketIds.forEach((rid) =>
    io?.to(rid).emit('invitations', invitations)
  )
}

const updateFriends = async (userId) => {
  const receiverSocketIds = getConnections(userId)
  if (receiverSocketIds.length > 0) {
    try {
      const user = await User.findById(userId).populate('friends')
      if (user) {
        const friendsList = user.friends.map((f) => ({
          id: f._id,
          username: f.username,
          email: f.email,
        }))

        console.log({friendsList})

        const io = getIO()

        receiverSocketIds.forEach((rid) =>
          io.to(rid).emit('friends', friendsList)
        )
      }
    } catch (e) {
      console.log('updateFriends', e)
    }
  }
}

const updateDMHistory = async (conversationId, specificSocketId = null) => {
  try {
    const conversation = await Conversation.findById(conversationId).populate({
      path: 'messages',
      model: 'Message',
      populate: {
        path: 'author',
        model: 'User',
        select: 'username _id',
      },
    })

    if (conversation) {
      const io = getIO()

      if (specificSocketId) {
        io.to(specificSocketId).emit('DM-history', conversation)
      }

      conversation.participants.forEach((uid) => {
        const activeConnections = getConnections(uid.toString())
        activeConnections.forEach((socketId) =>
          io.to(socketId).emit('DM-history', conversation)
        )
      })
    }
  } catch (err) {
    console.log('updateDMHistory', err)
  }
}

const directMessageHandler = async (socket, data) => {
  try {
    const {id} = socket.user
    const {receiver, content} = data

    // create new message
    const message = await Message.create({
      author: id,
      content,
      date: new Date(),
      type: 'DIRECT',
    })

    // find if the conversation exists
    let conversation = await Conversation.findOne({
      participants: {$all: [id, receiver]},
    })

    if (conversation) {
      conversation.messages.push(message._id)
      await conversation.save()
    } else {
      conversation = await Conversation.create({
        messages: [message._id],
        participants: [id, receiver],
      })
    }

    await updateDMHistory(conversation._id.toString())
  } catch (err) {
    console.log('getDMHistoryHandler', err)
  }
}

const getDMHistoryHandler = async (socket, data) => {
  try {
    const {id} = socket.user
    const {receiver} = data

    let conversation = await Conversation.findOne({
      participants: {$all: [id, receiver]},
      type: 'DIRECT',
    })

    if (conversation) {
      await updateDMHistory(conversation._id.toString(), socket.id)
    }
  } catch (err) {
    console.log('directMessageHandler', err)
  }
}

module.exports = {
  newConnectionHandler,
  disconnectHandler,
  updateInvitations,
  directMessageHandler,
  getDMHistoryHandler,
  updateFriends,
}
