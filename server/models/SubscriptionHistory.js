const mongoose = require('mongoose');

const subscriptionHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
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
    planStatus: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionHistory', subscriptionHistorySchema);