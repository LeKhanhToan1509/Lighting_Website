import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    postalCode: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    addressNote: { type: String, default: '' }
});

const itemSchema = new mongoose.Schema({
    _id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    type: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String },
    category: { type: String },
    images: { type: [String] },
    quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User' 
    },
    payment_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Payment',
        required: function() {
            return this.paymentMethod === 'TRANSFER';
        }
    },
    paymentMethod: { 
        type: String, 
        enum: ['COD', 'TRANSFER'], 
        required: true,
    },
    items: [itemSchema],
    totalPrice: { type: Number, required: true },
    address: addressSchema,
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
            return this.paymentMethod === 'COD' ? 'pending_confirmation' : 'pending_payment';
        }
    },
    isPaid: { type: Boolean, default: false }
}, { timestamps: true });

orderSchema.pre('save', function(next) {
    if (this.paymentMethod) {
        this.paymentMethod = this.paymentMethod.toUpperCase();
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;

