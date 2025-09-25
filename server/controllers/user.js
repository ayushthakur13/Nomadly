const User = require('../models/users');
const Trip = require('../models/trip');

module.exports.getUserProfile = async (req,res)=>{
    const { username } = req.params;
    try{
        const user = await User.findOne({ username });
        if (!user || !user.isPublic) 
            return res.status(404).render('404');

        const trips = await Trip.find({
            createdBy: user._id,
            isPublic: true
        }).sort({ createdAt: -1 }).limit(6);

        res.render('profile/public-profile', {
            profileUser: user,
            trips
        });
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}
