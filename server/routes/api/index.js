const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/google', require('./google'));

module.exports = router;