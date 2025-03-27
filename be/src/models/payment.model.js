import { model, Schema } from 'mongoose';

const DOCUMENT_NAME = 'Payment';
const COLLECTION_NAME = 'payments';

const PaymentSchema = new Schema({
    user_id: {
        type: Schema.ObjectId,
        required: true,
        trim: true,
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
    hex_key: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        default: 'pending',
        trim: true,
    },

}, {
    timestamps: true,
    collection: COLLECTION_NAME,
})

const PaymentModel = model(DOCUMENT_NAME, PaymentSchema);
export default PaymentModel;