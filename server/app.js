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

const apiAuthRoutes = require('./routes/api/auth');
const apiTripsRoutes = require('./routes/api/trips');

app.use('/api/auth', apiAuthRoutes);
app.use('/api/trips', apiTripsRoutes);

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

// ERROR HANDLING
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format'
        });
    }
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            error: 'API endpoint not found'
        });
    }
    
    res.status(404).render('404');
});

module.exports = app;