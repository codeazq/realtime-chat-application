const path = require("path")
require('dotenv').config()
const express = require("express")
const http = require("http")
const socketio = require("socket.io")
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeaves, getRoomUsers} = require('./utils/users')
const expressEjsLayouts = require('express-ejs-layouts')


const indexRouter = require('./routes/index')

const app = express()

// Set local variables
app.locals.appName = process.env.APP_NAME || 'Chatty' 

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.use(expressEjsLayouts)
app.set('layout', './layouts/default_layout')
app.set('view engine', 'ejs')

// routes
app.use('/', indexRouter);

const server = http.createServer(app)
const io = socketio(server)

const botName = process.env.APP_ADMIN_NAME || 'Admin'

// Run when a client connects
io.on("connection", socket => {

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room)

        socket.join(user.room)

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcoem to chatty'))

        // Broadcast whena user connects
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botName, `${user.username} has joined the chat`))


        // send user and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        
    })

    // Listen for chat message
    socket.on("chatMessage", (msg) => {
        const user  = getCurrentUser(socket.id)

        io.to(user.room).emit("message", formatMessage(user.username, msg))
    })

    // Broadcast when a user disconnects
    socket.on('disconnect', () => {
        const user = userLeaves(socket.id)

        if(user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))

            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })

})



const PORT =  process.env.PORT || 3000
server.listen(PORT, () => console.log(`Chat app server running on port ${PORT}`))