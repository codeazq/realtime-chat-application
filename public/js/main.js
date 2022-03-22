const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const socket = io()

// GEt username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')

// join room
socket.emit('joinRoom', {username, room})

// Get room and users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputUsers(users)
})

// Message from the server
socket.on('message', message => {
    console.log(`This is the message ${message}`)
    outputMessage(message)

    //scrow down
    chatMessages.scrollTop = chatMessages.scrollHeight
})

// Message Submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // Get message text
    const msg = e.target.elements.msg.value

    // Emit message to server
    socket.emit('chatMessage', msg)

    // clear input
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()

})


// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.userName} <span>${message.time}</span></p>
						<p class="text">
							${message.text}.
						</p>`
    document.querySelector('.chat-messages').appendChild(div)
}

// add roomname to DOM
function outputRoomName(room) {
    roomName.innerText = room
}

// add users
function outputUsers(users) {
    userList.innerHTML = `
       ${users.map(user => `<li>${user.username}</li>`).join('')} 
    `
}