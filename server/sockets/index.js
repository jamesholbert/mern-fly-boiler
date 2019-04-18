// cheatsheet for emitting found here: https://socket.io/docs/emit-cheatsheet/

// when a user connects, they are accessed here as `clientSocket`
const setupSockets = (io, directory) => {
  io.on('connection', clientSocket => {
      console.log('Client connected...');
      
      directory[clientSocket.id] = 'room2'
      clientSocket.join('room2') 
      clientSocket.room = 'room2' // want to know .room so we know what room to leave later if the user changes rooms
      
      clientSocket.on('join', ({room, email}) => {
        // save this so we can access it later
        directory[clientSocket.id] = room

        clientSocket.leave(clientSocket.room) // the user can be in multiple rooms so remove them when desired

        // by default the `clientSocket.in(someRoom).emit()` format will emit to all in the room except originator
        // (the client doesn't need to still be in the room to emit to it)
        clientSocket.in(clientSocket.room).emit('someoneLeft', email+' left')

        clientSocket.room = room
        clientSocket.join(room) // think of this like a chat room that the user is now part of

        // the `clientSocket.emit()` format emits only to originator
        clientSocket.emit('newRoom', room)
        clientSocket.in(room).emit('someoneJoined', email+' joined')
      });

      clientSocket.on('disconnect', () => {
        clientSocket.in(clientSocket.room).emit('someoneLeft', clientSocket.email+' left')
        console.log('disconnected')
      })

      clientSocket.on('message', data => {
        console.log('ping')
        clientSocket.emit('message', 'socket pong')
      })

      clientSocket.on('chat', chat => {
        clientSocket.in(clientSocket.room).emit('chat', chat)
      })

      // `connectClient` would probably be a good place to tell the client what room to go to
      clientSocket.on('connectClient', email => {
        clientSocket.email = email
        clientSocket.in(directory[clientSocket.id]).emit('connectedClient', email+' has connected')
      })
  })
}

export default setupSockets