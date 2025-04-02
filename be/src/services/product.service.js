import Product from "../models/product.model.js";
import RedisKeys from "../utils/redisKeys.js";
import redisClient from "../dbs/redisdb.js";

class productService {
    static async getAllProducts() {
        try {
            const cachedProducts = await redisClient.get(RedisKeys.productKeys.allProducts());
            if (cachedProducts) {
                return JSON.parse(cachedProducts);
            }

            const products = await Product.find().populate('category').lean(); // Adjusted to populate category
            if(!products || products.length === 0) throw new Error('No products');
            
            const reversedProducts = products.reverse();
            
            await redisClient.set(RedisKeys.productKeys.allProducts(), JSON.stringify(reversedProducts), 'EX', 3600); 
            
            return reversedProducts;
        } catch (error) {
            console.error("Error in getAllProducts:", error);
            throw error;
        }
    }

    static async getProductById(id) { 
        try {
            const cachedProduct = await redisClient.get(RedisKeys.productKeys.productDetail(id));
            if (cachedProduct) {
                return JSON.parse(cachedProduct);
            }

            const product = await Product.findById(id).populate('category').lean(); // Adjusted to populate category
            if(!product) throw new Error('Product not found');
            
            await redisClient.set(RedisKeys.productKeys.productDetail(id), JSON.stringify(product), 'EX', 3600); 
            
            return product;
        } catch (error) {
            console.error("Error in getProductById:", error);
            throw error;
        }
    }

    static async createProduct(payload) {
        try {
            const product = await Product.create(payload);
            if(!product) throw new Error('Create product failed');
            
            await redisClient.del(RedisKeys.productKeys.allProducts());
            
            return product;
        } catch (error) {
            console.error("Error in createProduct:", error);
            throw error;
        }
    }

    static async editProduct(id, payload) {
        try {
            const product = await Product.findByIdAndUpdate(id, payload, {new: true});
            if(!product) throw new Error('Edit product failed');
            
            await redisClient.del(RedisKeys.productKeys.productDetail(id));
            await redisClient.del(RedisKeys.productKeys.allProducts());
            
            return product;
        } catch (error) {
            console.error("Error in editProduct:", error);
            throw error;
        }
    }

    static async deleteProduct(id) {
        try {
            const product = await Product.deleteOne({_id: id});
            if(!product) throw new Error('Delete product failed');
            
            await redisClient.del(RedisKeys.productKeys.productDetail(id));
            await redisClient.del(RedisKeys.productKeys.allProducts());
            
            return product;
        } catch (error) {
            console.error("Error in deleteProduct:", error);
            throw error;
        }
    }
}

export default productService;
