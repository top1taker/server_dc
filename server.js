const express = require('express')
const http = require('http')
const cors = require('cors')
const mongoose = require('mongoose')

require('dotenv').config()
const port = process.env.PORT || 5002

const authRoutes = require('./routes/auth')
const friendRoutes = require('./routes/invitation')
const socket = require('./socket/server')

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/invitations', friendRoutes)

const server = http.createServer(app)
socket.registerSocketServer(server)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}`)
    )
  })
  .catch((err) => {
    console.log('Database connection failed. Server not started')
    console.log(err)
  })
