const passport = require('passport')
const User = require('../models/user')
const config = require('../config')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local')

// create local strategy
const localOptions = { usernameField: 'email' }
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  // verify this username and password, call done with the user
  // if it is the correct username and password
  // otherwise, call done with false
  console.log('about to find one')
  User.findOne({ email: email }, function(err, user) {
    console.log('...')
    if (err) {
      console.log(err)
      return done(err)
    }
    console.log('---')
    if (!user) {
      console.log('no user')
      return done(null, false)
    }
    console.log('89401532')
    // compare passwords - is 'password' equal to user.password?
    user.comparePassword(password, function(err, isMatch) {
      console.log('compare')
      if (err) {
        return done(err)
      }
      if (!isMatch) {
        return done(null, false)
      }
      return done(null, user)
    })
  })
})

// setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret,
}

// create JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // see if the user id in the payload exists in our database, if it
  // does, call 'done'. Otherwise, call 'done' without a user object.
  User.findById(payload.sub, function(err, user) {
    if (err) {
      return done(err, false)
    }

    if (user) {
      done(null, user)
    } else {
      done(null, false)
    }
  })
})

// tell passport to use this strategy
passport.use(jwtLogin)
passport.use(localLogin)
