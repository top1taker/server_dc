const User = require('../models/user')
const Invitation = require('../models/invitation')
const Conversation = require('../models/conversation')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {updateInvitations, updateFriends} = require('../socket/handlers')

exports.invite = async (req, res) => {
  try {
    const {friendEmail} = req.body
    const {email, id} = req.user

    if (email.toLowerCase() === friendEmail.toLowerCase()) {
      return res.status(409).send('You can not be friend-sidebar with yourself')
    }

    const friend = await User.findOne({email: friendEmail.toLowerCase()})

    if (!friend) {
      return res
        .status(404)
        .send(`friend of ${friendEmail} has not been found. Please check again`)
    }

    const hasSent = await Invitation.findOne({
      sender: id,
      receiver: friend._id,
    })

    if (hasSent) {
      return res.status(409).send('Invitation has been already sent')
    }

    const hasBeenFriend = friend.friends.find(
      (fid) => fid.toString() === id.toString()
    )

    if (hasBeenFriend) {
      return res
        .status(409)
        .send('Friend already added. Please check friends list')
    }

    const newInvitation = await Invitation.create({
      sender: id,
      receiver: friend._id,
    })

    await updateInvitations(friend._id.toString())

    return res.status(201).json({message: 'Invitation has been sent'})
  } catch (err) {
    console.log('error', err.message)
    return res.status(500).send('Something went wrong. Please try again.')
  }
}

exports.accept = async (req, res) => {
  try {
    const {id} = req.body

    const invitation = await Invitation.findById(id)

    if (!invitation) {
      return res.status(401).send('Error occurred. Please try later')
    }

    const {sender, receiver} = invitation

    const senderUser = await User.findById(sender)
    senderUser.friends = [...senderUser.friends, receiver]
    const receiverUser = await User.findById(receiver)
    receiverUser.friends = [...receiverUser.friends, sender]

    await senderUser.save()
    await receiverUser.save()

    await Invitation.findByIdAndDelete(id)
    await updateInvitations(receiver.toString())

    await Conversation.create({participants: [sender, receiver]})

    await updateFriends(sender.toString())
    await updateFriends(receiver.toString())

    return res.status(200).json({message: 'Friend added successfully'})
  } catch (e) {
    console.log(e)
    return res.status(500).send('Invitation accept failed')
  }
}

exports.reject = async (req, res) => {
  try {
    const {id} = req.body
    const userId = req.user.id

    const exists = await Invitation.exists({_id: id})

    if (exists) {
      await Invitation.findByIdAndDelete(id)
    }
    await updateInvitations(userId)
    return res.status(200).json({message: 'Invitation reject successfully'})
  } catch (e) {
    console.log(e)
    return res.status(500).send('Reject invitation failed.')
  }
}
