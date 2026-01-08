const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    customerId: {
        type: String,
        unique: true,
        sparse: true // Allows admins to have no ID without error
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
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
        endDate: { type: Date }
    }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
