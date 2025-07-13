const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tripSchema = new Schema({
    tripName: {
        type: String,
        required: true,
        trim: true
    },

    mainDestination:{
        type: String,
        required: true
    },

    startDate: {
        type: Date,
        required: true
    },
    
    endDate: {
        type: Date,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    description: {
        type: String,
        trim: true
    },

    destinations: [{
        name: { type: String, required: true },
        location: String,
        date: Date,
        notes: String,
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        },
        imageUrl: { type: String, default: '/images/default-dest.jpg' },
        addedAt: { type: Date, default: Date.now }
    }],

    tasks: [{
        title: String,
        completed: { type: Boolean, default: false }
    }],

    budget: {
        total: { type: Number, required: true, default: 0 },
        expenses: [{
            category: { type: String, required: true },
            amount: { type: Number, required: true },
            description: String,
            spentBy: { type: Schema.Types.ObjectId, ref: 'User' },
            date: { type: Date, default: Date.now }
        }]
    },

    accommodations: [{
        name: String,
        address: String,
        checkIn: Date,
        checkOut: Date,
        price: Number,
        bookingUrl: String,
        notes: String
    }],

    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    imageUrl: {
        type: String,
        default: '/images/default-trip.jpg'
    },

    memories: [{
        url: String, 
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        caption: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    isPublic: {
        type: Boolean,
        default: false
    },

    isFeatured: {
        type: Boolean,
        default: false
    },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Trip', tripSchema);
