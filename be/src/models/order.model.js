import mongoose from 'mongoose';

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'orders';

const paymentDetailsSchema = new mongoose.Schema({
    method: { 
        type: String, 
        enum: ['COD', 'TRANSFER', 'CREDIT_CARD', 'PAYPAL'], 
        required: true,
        uppercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: function() {
            return this.parent().method === 'COD' ? 'pending' : 'pending';
        }
    },
    transactionId: {
        type: String,
        trim: true,
        required: function() {
            return this.parent().method !== 'COD';
        }
    },
    paidAt: {
        type: Date
    },
    amount: {
        type: Number,
        required: true
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    accountId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Account' 
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem', // Correctly referencing the OrderItem schema
        required: true,
    }],
    totalPrice: { type: Number, required: true },
    shippingAddress: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Address', 
        required: true 
    },
    payment: paymentDetailsSchema,
    status: {
        type: String,
        enum: [
            'pending_payment',
            'paid_pending_confirmation',
            'pending_confirmation',
            'confirmed',
            'shipping',
            'completed',
            'cancelled'
        ],
        default: function () {
            return this.payment.method === 'COD' ? 'pending_confirmation' : 'pending_payment';
        }
    },
    isPaid: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true,
    collection: COLLECTION_NAME
});

orderSchema.pre('save', function(next) {
    if (this.isModified('payment.status')) {
        if (this.payment.status === 'completed') {
            this.isPaid = true;
            this.payment.paidAt = new Date();
            if (this.status === 'pending_payment') {
                this.status = 'paid_pending_confirmation';
            }
        }
    }
    next();
});

const Order = mongoose.model(DOCUMENT_NAME, orderSchema);
export default Order;