require('dotenv').config();
import cors from 'cors';
import http from 'http';
import morgan from 'morgan';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import noteRoutes from './routes/note-routes.js';
import fs from 'fs'

var session = require('express-session')
const passport = require('passport');
var socketIO = require('socket.io');

const app = express();

// App setup
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
  .then(res => console.log('Now connected to the Better Tabletop database'));
require('./models/users-model.js');
require('./config/passport');
app.use(require('./routes'));


// API routes
// app.use('/notes', noteRoutes);

app.get('/ping', (req, res) => res.send(JSON.stringify('pong')));

app.get('/', (req, res) => res.sendFile(`${__dirname}/../build/index.html`));



// Server setup
const port = process.env.PORT || 8080;
const server = http.createServer(app);


const io = socketIO(server)
app.set('io', io)

io.on('connection', socket => {
    console.log('Client connected...');
    
    socket.on('join', function(data) {
        console.log(data);
    });

    socket.on('disconnect', () => {
      console.log('disconnected')
    })

    socket.on('socketping', client => {
      console.log('ping')
      socket.emit('pong', 'pong')
    })
})


server.listen(port, () =>
  console.log(`Have better tabletop at port: ${port}`)
);