import mongoose from 'mongoose';

const DOCUMENT_NAME = 'Payment';
const COLLECTION_NAME = 'payments';

const paymentSchema = new mongoose.Schema({
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    transactionId: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
        trim: true,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

const Payment = mongoose.model(DOCUMENT_NAME, paymentSchema);
export default Payment;