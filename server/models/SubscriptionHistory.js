const mongoose = require('mongoose');

const subscriptionHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // --- Plan Details ---
    planName: {
        type: String,
        required: true
    },
    // Removed planDuration if not explicitly requested, or kept as derived
    // Keeping it flexible
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    
    billingDate: { type: Date, default: Date.now },
    // --- Billing Details ---
    billedBy: {
        type: String,
        default: 'Admin'
    },
    packageFee: { // Base Fee
        type: Number, 
        required: true
    },
    totalAmount: { // Final Bill Amount
        type: Number, 
        required: true
    },
    paidAmount: { // Amount Paid
        type: Number, 
        required: true
    },
    // Remaining amount is calculated on frontend, but we can store it or derive it.
    // Usually storing what was paid is enough.
    
    // --- Payment Details ---
    paymentMode: {
        type: String,
        enum: ['Cash', 'UPI', 'Online', 'Card'],
        required: true
    },
    planStatus: {
        type: String,
        enum: ['active', 'expiring_soon', 'expired', 'cancelled'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionHistory', subscriptionHistorySchema);