const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new mongoose.Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {type: String},
    date: {type: Date},
    type: {type: String},
  },
  {timestamps: true}
)

module.exports = mongoose.model('Message', messageSchema)
