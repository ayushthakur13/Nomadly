const myPassport = require('../../auth/passport');

module.exports.getLogin = (req,res)=>{
    if(req.user)
        return res.redirect('/home');
    
    const messages = req.flash('error');
    res.render('auth/login',{
        msg: messages.length > 0 ? messages[0] : null
    })
}

module.exports.postLogin = (req, res, next) => {
    myPassport.authenticate('local', {
        failureRedirect: '/auth/login',
        failureFlash: true
    })
    (req, res, () => {
        res.redirect('/home');
    });
};

module.exports.facebookLogin = myPassport.authenticate('facebook');

module.exports.facebookCallback = (req, res, next) => {
    myPassport.authenticate('facebook', {
        failureRedirect: '/auth/login'
    })
    (req, res, () => {
        res.redirect('/home');
    });
};

module.exports.googleLogin = myPassport.authenticate('google', { scope: ['profile'] });

module.exports.googleCallback = (req, res, next) => {
    myPassport.authenticate('google', {
        failureRedirect: '/auth/login'
    })
    (req, res, () => {
        res.redirect('/home');
    });
};
