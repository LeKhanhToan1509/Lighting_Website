import Product from "../models/product.model.js";

class productService {
    static async getAllProducts() {
        const products = await Product.find().lean();
        if(!products || products.length === 0) throw new Error('No products');
        return products;
    }

    static async getProductById(id) {
        const product = await Product.findById(id).lean();
        if(!product) throw new Error('Product not found');
        return product; 
    } 

    static async createProduct(payload) {
        const product = await Product.create(payload);
        if(!product) throw new Error('Create product failed');
        return product;
    }

    static async editProduct(id, payload) {
        const product = await Product.findByIdAndUpdate(id, payload, {new: true});
        if(!product) throw new Error('Edit product failed');
        return product;
    }

    static async deleteProduct(id) {
        const product = await Product.deleteOne({_id: id});
        if(!product) throw new Error('Delete product failed');
        return product;
    }
}

export default productService;
