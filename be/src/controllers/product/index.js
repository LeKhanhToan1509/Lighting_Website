import { Product } from '../../models/product.js';
import { MinioClient } from '../../dbs/minio.js';
import { client } from '../../dbs/elk.js';
import { redisClient } from '../../dbs/redisdb.js';

export class ProductController {
    static async getAllProducts(req, res) {
        try {
            const products = await Product.find({ deletedAt: null });
            res.json({
                success: true,
                products
            });
        } catch (error) {
            console.error('Error getting products:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting products'
            });
        }
    }

    static async getProductById(req, res) {
        try {
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            res.json({
                success: true,
                product
            });
        } catch (error) {
            console.error('Error getting product:', error);
            res.status(500).json({
                success: false,
                message: 'Error getting product'
            });
        }
    }

    static async createProduct(req, res) {
        try {
            const { name, price, description, category, colors, stock } = req.body;
            
            // Upload images to Minio
            const imageUrls = [];
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const imageUrl = await MinioClient.uploadFile(file);
                    imageUrls.push(imageUrl);
                }
            }

            const newProduct = new Product({
                name,
                price,
                description,
                category,
                colors: colors.split(','),
                stock,
                images: imageUrls
            });

            await newProduct.save();

            // Index in Elasticsearch
            await client.index({
                index: 'products',
                id: newProduct._id.toString(),
                document: {
                    name,
                    price,
                    description,
                    category,
                    colors: colors.split(','),
                    images: imageUrls,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    views: 0,
                    sold: 0
                }
            });

            // Clear related caches
            const keys = await redisClient.keys('product:*');
            if (keys.length > 0) {
                await redisClient.del(keys);
            }

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                product: newProduct
            });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating product'
            });
        }
    }

    static async editProduct(req, res) {
        try {
            const { name, price, description, category, colors, stock } = req.body;
            const productId = req.params.id;

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Handle image updates
            const imageUrls = [...product.images];
            if (req.files && req.files.length > 0) {
                // Delete old images from Minio
                for (const imageUrl of product.images) {
                    await MinioClient.deleteFile(imageUrl);
                }

                // Upload new images
                imageUrls.length = 0;
                for (const file of req.files) {
                    const imageUrl = await MinioClient.uploadFile(file);
                    imageUrls.push(imageUrl);
                }
            }

            // Update product
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                {
                    name,
                    price,
                    description,
                    category,
                    colors: colors.split(','),
                    stock,
                    images: imageUrls,
                    updatedAt: new Date()
                },
                { new: true }
            );

            // Update in Elasticsearch
            await client.update({
                index: 'products',
                id: productId,
                doc: {
                    name,
                    price,
                    description,
                    category,
                    colors: colors.split(','),
                    images: imageUrls,
                    updatedAt: new Date()
                }
            });

            // Clear related caches
            const keys = await redisClient.keys('product:*');
            if (keys.length > 0) {
                await redisClient.del(keys);
            }

            res.json({
                success: true,
                message: 'Product updated successfully',
                product: updatedProduct
            });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating product'
            });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const productId = req.params.id;

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Soft delete in MongoDB
            await Product.findByIdAndUpdate(productId, { deletedAt: new Date() });

            // Delete from Elasticsearch
            await client.delete({
                index: 'products',
                id: productId
            });

            // Delete images from Minio
            for (const imageUrl of product.images) {
                await MinioClient.deleteFile(imageUrl);
            }

            // Clear related caches
            const keys = await redisClient.keys('product:*');
            if (keys.length > 0) {
                await redisClient.del(keys);
            }

            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting product'
            });
        }
    }
} 