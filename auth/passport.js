const passport = require('passport');
const User = require('../models/users');
const bcrypt = require('bcrypt');

// In this file we will create all the strategies:
// 1. Local
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy(
    async (usernameOrEmail, password, done)=>{
      try{
        const user = await User.findOne({
          $or: [
            { username: usernameOrEmail }, 
            { email: usernameOrEmail }
          ]
        });

        if(!user) 
          return done(null, false, { message: 'Incorrect username or email.' });

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
  callbackURL: `http://localhost:${process.env.PORT}/auth/login/facebook/callback`,
  profileFields: ['id', 'displayName', 'emails']
},
    async (accessToken, refreshToken, profile, cb)=>{
      
      try{
        let user = await User.findOne({fbID: profile.id});
        if(user) return cb(null, user);

        const name = profile.displayName;
        const email = profile.emails?.[0]?.value || null;

        if (!email) 
          return cb(null, false, { message: 'Email required for signup.' });

        const baseUsername = email.split('@')[0];
        let username = baseUsername;
        let counter = 1;
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter++}`;
        }

        user = await User.create({
          username,
          name,
          email,
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

const callbackURL = process.env.NODE_ENV === 'production'
  ? 'https://nomadly-meuf.onrender.com/auth/login/google/callback'
  : `http://localhost:${process.env.PORT}/auth/login/google/callback`;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_APP_ID,
  clientSecret: process.env.GOOGLE_APP_SECRET,
  callbackURL,
  scope: ['profile', 'email']
},
    async (accessToken, refreshToken, profile, cb)=>{
      try{
        let user = await User.findOne({googleID: profile.id});
        if(user) return cb(null, user);

        const name = profile.displayName;
        const profilePic = profile.photos?.[0].value || null;
        const email = profile.emails?.[0]?.value || null;

        if (!email) 
          return cb(null, false, { message: 'Email required for signup.' });
        
        const baseUsername = email.split('@')[0];
        let username = baseUsername;
        let counter = 1;
        while (await User.findOne({ username })) {
          username = `${baseUsername}${counter++}`;
        }

        user = await User.create({
          username,
          name,
          profilePic,
          email,
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
