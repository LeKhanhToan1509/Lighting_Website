import mongoose from 'mongoose';

export const orderItemSchema = new mongoose.Schema({
    product: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Product' 
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: true });

export default orderItemSchema;