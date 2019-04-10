const mongoose = require('mongoose');
const passport = require('passport');
const router = require('express').Router();
const auth = require('../auth');
const Users = mongoose.model('Users');

//POST new user route (optional, everyone has access)
router.post('/newuser', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  Users.findOne({email: user.email}, (err, existingUser) => {
    if(existingUser && existingUser.hash){
      console.log('user already exists and password is set')
      
      return res.status(422).json({
        errors: {
          password: 'user already exists and password is set',
        },
      });      
    }
    else if(existingUser){
      console.log('user exists from oauth and password is now set')
      existingUser.setPassword(user.password)

      return existingUser.save()
        .then(() => res.json({ user: existingUser.toAuthJSON() }));      
    }
    else {
      console.log('new user created')
      const finalUser = new Users(user);

      finalUser.setPassword(user.password);

      return finalUser.save()
        .then(() => res.json({ user: finalUser.toAuthJSON() }));
    }
  })
});

//POST login route (optional, everyone has access)
router.post('/login', auth.optional, (req, res, next) => {
  const { body: { user } } = req;

  if(!user.email) {
    return res.status(422).json({
      errors: {
        email: 'is required',
      },
    });
  }

  if(!user.password) {
    return res.status(422).json({
      errors: {
        password: 'is required',
      },
    });
  }

  return passport.authenticate('local', { session: false }, (err, passportUser, info) => {
    if(err) {
      return next(err);
    }

    // passportUser is a user returned from database
    if(passportUser) {
      const pUser = passportUser;
      pUser.token = passportUser.generateJWT();

      Users.findOne({email: pUser.email}, (err, user) => {
        user.token = pUser.token;
        user.save()
      })

      return res.json({ user: pUser.toAuthJSON() });
    }

    return res.status(422).json({
      errors: {
        'username or password': 'dont match',
      },
    });
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get('/current', auth.required, (req, res, next) => {
  const { payload: { id } } = req;

  return Users.findById(id)
    .then((user) => {
      if(!user) {
        return res.sendStatus(400);
      }

      return res.json({ user: user.toAuthJSON() });
    });
});

router
  .route('/secure')
  .post((req, res) => {
    const io = req.app.get('io')

    Users.findOne({ email: req.body.email, token: req.body.token }, (err, user) => {
      if(user){
        io.in(req.session.socketId).emit('secure', {data: 'super secure'})
        console.log('successful secure end point')
        
        res.status(201).json({'status': 1})
      }
      else {
        console.log('not allowed')
        res.status(403).json({'status': 0})
      }
    })
  })

module.exports = router;