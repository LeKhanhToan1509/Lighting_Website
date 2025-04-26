import express from 'express';
import { ProductController } from '../../controllers/product/index.js';
import AuthenMiddleware from '../../middleware/authen.middleware.js';
import multerMiddleware from '../../middleware/multer.middleware.js';
import { validateProduct } from '../../middleware/validation.middleware.js';
import { cacheMiddleware } from '../../middleware/cache.middleware.js';

const router = express.Router();

router.get('/all', cacheMiddleware(300), ProductController.getAllProducts);

router.get('/:id', cacheMiddleware(300), ProductController.getProductById);

router.post('/create_product', 
    AuthenMiddleware.verifyToken,
    (req, res, next) => {
        console.log("Request body before multer:", req.body);
        next();
    },
    (req, res, next) => {
        multerMiddleware.upload.array('images', 10)(req, res, (err) => {
            if (err) {
                console.error('Multer Error:', err);
                return res.status(400).json({ 
                    success: false, 
                    message: err.message || 'File upload error' 
                });
            }
            console.log("After multer - Files:", req.files);
            console.log("After multer - Body:", req.body);
            next();
        });
    },
    (req, res, next) => {
        if (!req.body.name || !req.body.price || !req.body.category || !req.body.colors) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, price, category, colors are required'
            });
        }
        next();
    },
    validateProduct,
    ProductController.createProduct
);

router.post('/edit_product/:id',
    AuthenMiddleware.verifyToken,
    (req, res, next) => {
        console.log("Edit request body before multer:", req.body);
        next();
    },
    (req, res, next) => {
        multerMiddleware.upload.array('images', 10)(req, res, (err) => {
            if (err) {
                console.error('Multer Error:', err);
                return res.status(400).json({ 
                    success: false, 
                    message: err.message || 'File upload error' 
                });
            }
            next();
        });
    },
    validateProduct,
    ProductController.editProduct
);

router.post('/delete_product/:id',
    AuthenMiddleware.verifyToken,
    ProductController.deleteProduct
);

export default router;