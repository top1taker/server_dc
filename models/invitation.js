const mongoose = require('mongoose')
const Schema = mongoose.Schema

const invitationSchema = new mongoose.Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {timestamps: true}
)

module.exports = mongoose.model('Invitation', invitationSchema)
