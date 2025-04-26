import { body, validationResult } from 'express-validator';

export const validateProduct = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Tên sản phẩm là bắt buộc')
        .isLength({ min: 3, max: 100 })
        .withMessage('Tên sản phẩm phải từ 3 đến 100 ký tự'),

    body('price')
        .notEmpty()
        .withMessage('Giá sản phẩm là bắt buộc')
        .isFloat({ min: 0 })
        .withMessage('Giá sản phẩm phải là số dương'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Mô tả sản phẩm là bắt buộc')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Mô tả sản phẩm phải từ 10 đến 1000 ký tự'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Danh mục sản phẩm là bắt buộc'),

    (req, res, next) => {
        console.log("Validating product with body:", req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Validation errors:", errors.array());
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: errors.array()
            });
        }
        console.log("Validation passed");
        next();
    }
]; 