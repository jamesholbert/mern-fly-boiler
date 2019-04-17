require('dotenv').config();

import cors from 'cors';
import http from 'http';
import morgan from 'morgan';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import noteRoutes from './routes/note-routes.js';
import fs from 'fs'

import session from 'express-session'
import passport from 'passport';
import socketIO from 'socket.io';


// App setup
const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
}))
app.use(morgan('combined'));
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

app.use(express.static(`${__dirname}/../build`));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: true }
}))
app.use(passport.initialize());
app.use(passport.session());



// DB Setup
const db = mongoose
  .connect(
    process.env.DB_ADDRESS,
    { useNewUrlParser: true }
  )
  .then(res => console.log('Now connected to database'));
require('./models/users-model.js');
require('./config/passport');



// API routes
app.use(require('./routes')); // the /routes doesn't affect the actual route using this method
app.use('/notes', noteRoutes); // the /notes does affect the actual route using this method
app.get('/ping', (req, res) => res.send(JSON.stringify('pong')));
app.get('/', (req, res) => res.sendFile(`${__dirname}/../build/index.html`));



// Server setup
const port = process.env.PORT || 8080;
const server = http.createServer(app);



// set up socket.io and `directory`` of rooms keyed by user
const io = socketIO(server)
const directory = {}

// put `io`` and `directory`` on the app so that they can be access on api endpoints
app.set('io', io)
app.set('directory', directory)

// when a user connects, they are accessed here as `clientSocket`
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



server.listen(port, () =>
  console.log(`Server running at port: ${port}`)
);