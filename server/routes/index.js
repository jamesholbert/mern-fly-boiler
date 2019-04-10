const express = require('express');
const router = express.Router();


// This custom middleware allows us to attach the socket id to the session
// With that socket id we can send back the right user info to the right 
// socket
router.use((req, res, next) => {
  req.session.socketId = req.body.socketId

  next()
})

router.use('/api', require('./api'));

module.exports = router;