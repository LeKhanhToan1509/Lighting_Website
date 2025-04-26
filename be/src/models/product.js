import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên sản phẩm là bắt buộc'],
        trim: true,
        minlength: [3, 'Tên sản phẩm phải có ít nhất 3 ký tự'],
        maxlength: [100, 'Tên sản phẩm không được vượt quá 100 ký tự']
    },
    price: {
        type: Number,
        required: [true, 'Giá sản phẩm là bắt buộc'],
        min: [0, 'Giá sản phẩm phải là số dương']
    },
    description: {
        type: String,
        required: [true, 'Mô tả sản phẩm là bắt buộc'],
        trim: true,
        minlength: [10, 'Mô tả sản phẩm phải có ít nhất 10 ký tự'],
        maxlength: [1000, 'Mô tả sản phẩm không được vượt quá 1000 ký tự']
    },
    category: {
        type: String,
        required: [true, 'Danh mục sản phẩm là bắt buộc'],
        trim: true
    },
    colors: [{
        type: String,
        trim: true
    }],
    stock: {
        type: Number,
        required: [true, 'Số lượng tồn kho là bắt buộc'],
        min: [0, 'Số lượng tồn kho phải là số không âm'],
        default: 0
    },
    images: [{
        type: String,
        trim: true
    }],
    views: {
        type: Number,
        default: 0
    },
    sold: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ['product-selling', 'product-rental'],
        default: 'product-selling'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
    return this.price.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });
});

// Virtual for availability status
productSchema.virtual('isAvailable').get(function() {
    return this.stock > 0 && this.status === 'active' && !this.deletedAt;
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });
productSchema.index({ deletedAt: 1 });

// Pre-save middleware to handle data
productSchema.pre('save', function(next) {
    // Trim all string fields
    if (this.name) this.name = this.name.trim();
    if (this.description) this.description = this.description.trim();
    if (this.category) this.category = this.category.trim();
    if (this.colors) {
        this.colors = this.colors.map(color => color.trim());
    }
    
    // Ensure price is a number
    if (this.price) this.price = Number(this.price);
    if (this.stock) this.stock = Number(this.stock);
    
    next();
});

// Static method to find active products
productSchema.statics.findActive = function() {
    return this.find({ 
        status: 'active',
        deletedAt: null 
    });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category) {
    return this.find({ 
        category,
        status: 'active',
        deletedAt: null 
    });
};

// Static method to find products with stock
productSchema.statics.findInStock = function() {
    return this.find({ 
        stock: { $gt: 0 },
        status: 'active',
        deletedAt: null 
    });
};

// Instance method to check if product is in stock
productSchema.methods.isInStock = function() {
    return this.stock > 0 && this.status === 'active' && !this.deletedAt;
};

// Instance method to update stock
productSchema.methods.updateStock = async function(quantity) {
    if (quantity < 0 && Math.abs(quantity) > this.stock) {
        throw new Error('Không đủ hàng trong kho');
    }
    
    this.stock += quantity;
    return this.save();
};

// Instance method to increment views
productSchema.methods.incrementViews = async function() {
    this.views += 1;
    return this.save();
};

// Instance method to increment sold
productSchema.methods.incrementSold = async function(quantity) {
    this.sold += quantity;
    return this.save();
};

export const Product = mongoose.model('Product', productSchema); 