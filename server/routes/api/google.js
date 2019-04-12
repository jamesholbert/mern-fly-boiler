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

// GET /auth
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authorization, Google will redirect the user
//   back to this application at /auth/callback
router.get('/auth', passport.authenticate('google', { scope: 'profile email' }));

// GET /auth/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.

router.get('/auth/callback', passport.authenticate('google', { failureRedirect: '/login' }), function (req, res) {
	const addName = '&name='+req.user.username
	const addImage = '&image='+req.user.profileImage
	const addEmail = '&email='+req.user.email

	const user = req.user
	user.token = req.user.generateJWT();

    res.user = user.toAuthJSON();
	const addToken = '?token='+user.token

	res.redirect(process.env.BASE_CALLBACK_URI + addToken + addName + addImage + addEmail+'&burner')
});

module.exports = router;