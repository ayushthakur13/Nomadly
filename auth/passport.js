const passport = require('passport');
const User = require('../models/users');
const bcrypt = require('bcrypt');

// In this file we will create all the strategies:
// 1. Local
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(
    async (username, password, done)=>{
      try{
        const user = await User.findOne({ username });
        if(!user) 
          return done(null, false, { message: 'Incorrect username.' });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) 
          return done(null, false, { message: 'Incorrect password.' });
        
        return done(null, user);
      }
      catch(err){
        return done(err);
      }
    }
));

passport.serializeUser((user, done)=>{
  done(null, user.id);
});

passport.deserializeUser(async (id, done)=>{
  try{
    let user = await User.findById(id);
     done(null, user);
  }
  catch(err){
    done(err, false);
  }
});

// 2. Facebook
const FacebookStrategy = require('passport-facebook');

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `http://localhost:${process.env.PORT}/auth/login/facebook/callback`
},
    async (accessToken, refreshToken, profile, cb)=>{
      
      try{
        let user = await User.findOne({
          fbID: profile.id
        });

        if(user) return cb(null, user);

        user = await User.create({
          username: profile.displayName,
          fbID: profile.id,
          fbAccesToken: accessToken
        });

        cb(null, user);
      }
      catch(err){
        cb(err, false);
      }
    }
));

// 3. Google
const GoogleStrategy = require('passport-google-oauth20');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_APP_ID,
  clientSecret: process.env.GOOGLE_APP_SECRET,
  callbackURL: `http://localhost:${process.env.PORT}/auth/login/google/callback`
},
    async (accessToken, refreshToken, profile, cb)=>{
      
      try{
        let user = await User.findOne({
          googleID: profile.id
        });

        if(user) return cb(null, user);

        user = await User.create({
          username: profile.displayName,
          googleID: profile.id,
          googleAccessToken: accessToken
        });

        cb(null, user);
      }
      catch(err){
        cb(err, false);
      }
    }
));

module.exports = passport;
