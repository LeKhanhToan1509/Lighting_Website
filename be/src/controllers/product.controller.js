import productService from "../services/product.service.js";
export default class productController {
    static async getAllProducts(req, res) {
        try  {
            const products = await productService.getAllProducts();
            res.status(200).json({
                message: 'Get all products successfully',
                products
            });
        }catch(err){
            res.status(500).json({
                message: err.message || 'Get all products failed'
            });
        }

    }

    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await productService.getProductById(id);
            res.status(200).json({
                message: 'Get product by id successfully',
                product
            });
        }catch(err){
            res.status(500).json({
                message: err.message || 'Get product by id failed'
            });
        }
    }

    static async createProduct(req, res) {
        try {
            const imgs = req.images;
            const payload = {...req.body, images: imgs};
            const product = await productService.createProduct(payload);
            res.status(200).json({
                message: 'Create product successfully',
                product
            });
        }catch(err){
            res.status(500).json({
                message: err.message || 'Create product failed'
            });
        }
    }

    static async editProduct(req, res) {
        try {
            const { id } = req.params;
            const payload = req.body;
            const product = await productService.editProduct(id, payload);
            res.status(200).json({
                message: 'Edit product successfully',
                product
            });
        }catch(err){
            res.status(500).json({
                message: err.message || 'Edit product failed'
            });
        }
    }
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await productService.deleteProduct(id);
            res.status(200).json({
                message: 'Delete product successfully',
                product
            });
        }catch(err){
            res.status(500).json({
                message: err.message || 'Delete product failed'
            });
        }
    }
}
