import mongoose from 'mongoose';

const DOCUMENT_NAME = 'Account';
const COLLECTION_NAME = 'accounts';

const accountSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/,
    },
    phone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
        quantity: {
            type: Number,
            default: 1,
        }
    }]
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

const Account = mongoose.model(DOCUMENT_NAME, accountSchema);
export default Account;