const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    username: {type: String},
    password: {type: String},
    friends: [{type: Schema.Types.ObjectId, ref: 'User'}],
  },
  {timestamps: true}
)

module.exports = mongoose.model('User', userSchema)
