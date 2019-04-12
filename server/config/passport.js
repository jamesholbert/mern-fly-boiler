const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const User = mongoose.model('Users');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]',
}, (email, password, done) => {
  User.findOne({ email })
    .then((user) => {
      if(!user || !user.validatePassword(password)) {
        return done(null, false, { errors: { 'email or password': 'is invalid' } });
      }

      return done(null, user);
    }).catch(done);
}));


// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.BASE_CALLBACK_URI+"api/google/auth/callback"
  },
  function(token, tokenSecret, profile, done) {
  	User.findOne({ email: profile.emails[0].value}).then(currentUser => {
  		if (currentUser) {
  			console.log('found user')
        
        if(!currentUser.profileImage){
          currentUser.profileImage = profile.photos[0].value.replace(/sz=50/gi, 'sz=250')
        }
        if(!currentUser.googleId){
          currentUser.googleId = profile.id
        }
        if(!currentUser.username){
          currentUser.username = profile.displayName
        }

  			currentUser.token = token;
  			currentUser
  				.save()
  				.then(currentUser => {
  					done(null, currentUser);
  				})
  		}
  		else {
  			console.log('did not find user')
  			new User({
          username: profile.displayName,
          googleId: profile.id,
  				token: token,
          profileImage: profile.photos[0].value.replace(/sz=50/gi, 'sz=250'),
          email: profile.emails[0].value
  			})
  				.save()
  				.then(newUser => {
  					done(null, newUser)
  				})
  		}
  	})
  }
));