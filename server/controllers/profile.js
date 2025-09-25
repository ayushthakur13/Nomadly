const User = require('../models/users');
const Trip = require('../models/trip');
const bcrypt = require('bcrypt');
const { cloudinary } = require('../utils/cloudinary');

module.exports.getProfile = async (req,res)=>{
    try{
        const userId = req.user._id;
                        
        const trips = await Trip.find({
            $or: [
                { createdBy: userId },
                { participants: userId }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(3)
        .lean();

        res.render('profile/profile',{
            user: req.user,
            trips
        });
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}

module.exports.getProfileSettings = (req,res)=>{
    res.render('profile/profile-settings',{
        user: req.user
    });
}

module.exports.postUpdateProfile = async (req, res, next) => {

    const { name, email, username, bio, newPassword, isPublic } = req.body;

    try {
        const emailUser = await User.findOne({ email });
        if (emailUser && emailUser._id.toString() !== req.user._id.toString()) {
            req.flash('msg', 'Email already in use');
            return res.redirect('/profile/settings');
        }

        const usernameUser = await User.findOne({ username });
        if (usernameUser && usernameUser._id.toString() !== req.user._id.toString()) {
            req.flash('msg', 'Username already taken');
            return res.redirect('/profile/settings');
        }

        const wasPublic = req.user.isPublic;

        req.user.name = name;
        req.user.email = email;
        req.user.username = username;
        req.user.bio = bio || '';
        req.user.isPublic = isPublic === 'true' || isPublic === 'on';

        if (wasPublic && !req.user.isPublic) {
            await Trip.updateMany(
                { createdBy: req.user._id, isPublic: true },
                { $set: { isPublic: false } }
            );
            req.flash('msg', 'Profile set to private. Your public trips have been unpublished.');
        }

        if (req.file){

            if (req.user.profilePicId && !req.user.profilePic.includes('/images/icon/')) 
                await cloudinary.uploader.destroy(req.user.profilePicId);
            
            req.user.profilePic = req.file.path;              
            req.user.profilePicId = req.file.filename;        
        }
    

        if (newPassword && newPassword.trim() !== '') {
            const hash = await bcrypt.hash(newPassword, 10);
            req.user.password = hash;
        }

        await req.user.save();
        req.flash('msg', 'Profile updated successfully!');
        res.redirect('/profile');
    } 
    catch (err) {
        next(err);
    }
};