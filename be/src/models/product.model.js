import mongoose from 'mongoose';

const DOCUMENT_NAME = 'Product';
const COLLECTION_NAME = 'Product';

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['product-selling', 'product-rental'], required: true },
    price: { type: Number, required: true },
    colors: [{ type: String }],
    category: { type: String, required: true },
    images: [{ type: String }], 
    stock: { type: Number, required: true, default: 0 },
    quantity: { type: Number, default: 1 },
    rating: { type: Number, default: 0 },
    description: { type: String },
    deletedAt: { type: Date, default: null }, 
}, {
    timestamps: true, 
    collection: COLLECTION_NAME,
});

const Product = mongoose.model(DOCUMENT_NAME, productSchema);

export default Product;
