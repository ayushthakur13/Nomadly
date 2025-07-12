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
        failureRedirect: '/auth/login',
        failureFlash: true
    })
    (req, res, () => {
        if (!req.user?.email) {
            req.flash('msg', 'Email is required to finish signup');
            return res.redirect('/auth/login/complete-profile');
        }
        res.redirect('/home');
    });
};

// module.exports.completeProfile

module.exports.googleLogin = myPassport.authenticate('google', { scope: ['profile', 'email'] });

module.exports.googleCallback = (req, res, next) => {
    myPassport.authenticate('google', {
        failureRedirect: '/auth/login',
        failureFlash: true
    })
    (req, res, () => {
        res.redirect('/home');
    });
};
