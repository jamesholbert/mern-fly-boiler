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

// when a user connects, they are accessed here as `socket`
io.on('connection', socket => {
    console.log('Client connected...');
    
    directory[socket.id] = 'room2'
    socket.join('room2')
    socket.room = 'room2' // want to know .room so we know what room to leave later if the user changes rooms
    
    socket.on('join', ({room, email}) => {
      directory[socket.id] = room

      socket.leave(socket.room)
      socket.in(socket.room).emit('someoneLeft', email+' left')

      socket.room = room
      socket.email = email
      
      socket.join(room)
      socket.emit('newRoom', room)
      socket.in(room).emit('someoneJoined', email+' joined')
    });

    socket.on('disconnect', () => {
      socket.in(socket.room).emit('someoneLeft', socket.email+' left')
      console.log('disconnected')
    })

    socket.on('message', data => {
      console.log('ping')
      socket.emit('message', 'socket pong')
    })

    socket.on('chat', chat => {
      socket.in(socket.room).emit('chat', chat)
    })

    socket.on('connectClient', email => { // probably would be a good place to send what room to go to
      socket.email = email
      socket.in(directory[socket.id]).emit('connectedClient', email+' has connected')
    })
})



server.listen(port, () =>
  console.log(`Server running at port: ${port}`)
);