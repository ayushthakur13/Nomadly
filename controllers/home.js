module.exports.getHome = (req,res)=>{

    if(!req.user) return res.redirect('/auth/login');
    res.render('home',{
        username: req.user.username
    });
}
