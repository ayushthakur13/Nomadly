require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4444;
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const passport = require('./auth/passport');
const hbs = require('hbs');
const favicon = require('serve-favicon');

app.set('view engine','hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
hbs.registerHelper('formatDate', require('./helpers/formatDate'));
hbs.registerHelper('calculateTripDuration', require('./helpers/calculateTripDuration'));
hbs.registerHelper('countCompletedTasks', require('./helpers/countCompletedTasks'));
hbs.registerHelper('taskProgress', require('./helpers/taskProgress'));
hbs.registerHelper('daysUntil', require('./helpers/daysUntil'));
hbs.registerHelper('calculateSpent', require('./helpers/calculateSpent'));
hbs.registerHelper('calculateRemaining', require('./helpers/calculateRemaining'));
hbs.registerHelper('getUserName', require('./helpers/getUserName'));
hbs.registerHelper('ifEquals', require('./helpers/ifEquals'));

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(favicon(path.join(__dirname, 'public', 'images', 'icon' ,'Nomadly_icon.png')));

const mongoUrl = process.env.MONGO_URL;
const sessionSecret = process.env.SESSION_SECRET;

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl})
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.get('/',(req,res)=>{
    res.redirect('/auth/login')
})

const signupRoute = require('./routes/auth/signup');
const loginRoute = require('./routes/auth/login');
const { isLoggedIn } = require('./middlewares/isLoggedIn');
const homeRoute = require('./routes/home');
const profileRoute = require('./routes/profile');
const tripRoute = require('./routes/trips');
const aboutUsRoute = require('./routes/aboutus');
const exploreRoute = require('./routes/explore');

app.use('/auth/signup',signupRoute);
app.use('/auth/login',loginRoute);
app.use(isLoggedIn);
app.use('/home',homeRoute);
app.use('/profile',profileRoute);
app.use('/trips',tripRoute);
app.use('/aboutus',aboutUsRoute);
app.use('/explore',exploreRoute);

app.get('/logout',(req,res,next)=>{
    req.logout((err)=>{
        if (err) return next(err);
        res.redirect('/auth/login');
    });
})

app.use((req, res) => {
    res.status(404).render('404');
});

mongoose.connect(mongoUrl)
    .then(()=>{
        app.listen(PORT,()=>{
            console.log(`🟢 Server started at http://localhost:${PORT}`);
        })
    })
    .catch((err)=>{
        console.error('🔴 Cannot connect to DB', err.message);
    })
