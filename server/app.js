require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const hbs = require('hbs');
const favicon = require('serve-favicon');
const cors = require('cors');
const cookieParser = require('cookie-parser');

app.set('view engine','hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
require('./utils/registerHelpers')();

app.set('trust proxy', 1);

// Core middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());
app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public', 'images', 'icon' ,'Nomadly_icon.png')));

// CORS for client
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
}));

app.get('/',(req,res)=>{
    res.status(200).send('Nomadly API');
})

const homeRoute = require('./routes/home');
const profileRoute = require('./routes/profile');
const tripRoute = require('./routes/trips');
const aboutUsRoute = require('./routes/aboutus');
const exploreRoute = require('./routes/explore');
const userRoute = require('./routes/user');
const contactUsRoute = require('./routes/contactus');

app.use('/home',homeRoute);
app.use('/profile',profileRoute);
app.use('/trips',tripRoute);
app.use('/aboutus',aboutUsRoute);
app.use('/explore',exploreRoute);
app.use('/user',userRoute);
app.use('/contact',contactUsRoute);

const apiAuthRoutes = require('./routes/api/auth');
app.use('/api/auth', apiAuthRoutes);

app.use((req, res) => {
    res.status(404).render('404');
});

module.exports = app;
