const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    customerId: {
        type: String,
        unique: true,
        sparse: true 
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    subscription: {
        planStatus: {
            type: String,
            enum: ['active', 'expiring_soon', 'expired', 'inactive'],
            default: 'inactive'
        },
        startDate: { type: Date },
        endDate: { type: Date },
        amount: { type: Number, default: 0 } // Added Amount here
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);