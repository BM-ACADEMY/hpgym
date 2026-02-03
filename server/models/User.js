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
        // Plan Info
        planName: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },

        billingDate: { type: Date },
        
        // Billing Info
        billedBy: { type: String },
        packageFee: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        paidAmount: { type: Number, default: 0 },
        
        paymentMode: { type: String },
        
        lastReminderDate: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);