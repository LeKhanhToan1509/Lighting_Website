import mongoose from 'mongoose';

const DOCUMENT_NAME = 'Address';
const COLLECTION_NAME = 'addresses';

const addressSchema = new mongoose.Schema({
    accountId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    postalCode: { type: String },
    addressNote: { type: String, default: '' },
    defaultAddress: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME,
});

const Address = mongoose.model(DOCUMENT_NAME, addressSchema);
export default Address;