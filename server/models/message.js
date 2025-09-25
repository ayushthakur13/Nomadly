const mongoose = require('mongoose');
const {Schema} = mongoose;

const messageSchema = new Schema({

    trip: {
        type: Schema.Types.ObjectId,
        ref: 'Trip',
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Message', messageSchema);
