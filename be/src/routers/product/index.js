import express from 'express';
import AuthenMiddleware from '../../middleware/authen.middleware.js';
import productController from '../../controllers/product.controller.js';
import multerMiddleware from '../../middleware/multer.middleware.js';

const productRoutes = express.Router();

productRoutes.use(AuthenMiddleware.verifyToken);

productRoutes.get('/product/all', productController.getAllProducts);
productRoutes.get('/product/:id', productController.getProductById);
productRoutes.post('/product/create_product',multerMiddleware, productController.createProduct);
productRoutes.post('/product/edit_product/:id', productController.editProduct);
productRoutes.post('/product/delete_product/:id', productController.deleteProduct);





export default productRoutes;