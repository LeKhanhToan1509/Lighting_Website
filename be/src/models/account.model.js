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
    addressLine1: {
        type: String,
        required: true,
    },
    province: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    ward: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
    },
    addressNote: {
        type: String,
    },
    defaultAddress: {
        type: Boolean,
        default: false,
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    }, {
        timestamps: true,
        collection: COLLECTION_NAME,
});



const Account = mongoose.model(DOCUMENT_NAME, accountSchema);

export default Account;