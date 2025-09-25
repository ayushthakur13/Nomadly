const Users = require('../../models/users');
const bcrypt = require('bcrypt');
let saltRounds = 10;

module.exports.getSignup = (req,res)=>{
    res.render('auth/signup',{
        msg: req.flash('msg')
    });
}

module.exports.postSignup = async (req, res, next) => {
    const { username, password, name, email } = req.body;

    try {
        const existingUsername = await Users.findOne({ username });
        if (existingUsername) {
            req.session.flash = {};
            req.flash('msg', 'Username already taken');
            return res.redirect('/auth/signup');
        }

        const existingEmail = await Users.findOne({ email });
        if (existingEmail) {
            req.session.flash = {};
            req.flash('msg', 'Email already registered');
            return res.redirect('/auth/signup');
        }

        const hash = await bcrypt.hash(password, saltRounds);
        await Users.create({ username, name, email, password: hash });

        req.flash('msg', 'Signup successful');
        return res.redirect('/auth/login');
    } 
    catch (err) {
        next(err);
    }
};
