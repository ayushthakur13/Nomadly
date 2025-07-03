const Users = require('../../models/users');
const bcrypt = require('bcrypt');
let saltRounds = 10;

module.exports.getSignup = (req,res)=>{
    res.render('auth/signup',{
        msg: req.flash('msg')
    });
}

module.exports.postSignup = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const existingUser = await Users.findOne({ username });

        if (existingUser) {
            req.session.flash = {}; // Flush the old flash manually
            req.flash('msg', 'User already exists');
            return res.redirect('/auth/signup');
        }

        const hash = await bcrypt.hash(password, saltRounds);
        await Users.create({ username, password: hash });

        req.flash('msg', 'Signup successful');
        return res.redirect('/auth/login');
    } 
    catch (err) {
        next(err);
    }
};
