const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authorization, Google will redirect the user
//   back to this application at /auth/google/callback
router.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function (req, res) {
	const addToken = '?token='+req.user.token
	const addName = '&name='+req.user.username
	const addImage = '&image='+req.user.profileImage
	const addEmail = '&email='+req.user.email
	console.log(req.user)
	res.redirect(process.env.BASE_CALLBACK_URI + addToken + addName + addImage + addEmail+'&burner')
});

module.exports = router;