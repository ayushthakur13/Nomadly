const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,  
    },
    password: String,

    name: String,
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    
    profilePic: {
        type: String,
        default: '/images/icon/undraw_avatar-traveler.png'
    },
    profilePicId: String,

    bio: {
        type: String,
        maxlength: 300,
        default: ''
    },

    isPublic: {
        type: Boolean,
        default: false
    },

    fbID: String,
    fbAccesToken: String,
    
    googleID: String,
    googleAccessToken: String,

    isAdmin: {
        type: Boolean,
        default: false
    }

},{ timestamps: true });

module.exports = mongoose.model('User', userSchema);
