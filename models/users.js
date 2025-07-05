const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,  
    },
    password: String,

    email: {
        type: String,
        unique: true,
        sparse: true
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
