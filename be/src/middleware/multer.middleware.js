import multer from "multer";
import { MinioStorageEngine } from "@namatery/multer-minio";
import * as Minio from 'minio'
import dotenv from "dotenv";
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();


const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const options = {
  bucket: "productimages",
  object: {
    name: (req, file) => `${Date.now()}-${file.originalname}`,
  },
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadImages = (req, res, next) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res.status(400).json({ error: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    console.log(req.files);
    req.files.forEach((file) => {
      console.log(`http://localhost:9000/productimages${file.path}`);
    });
    req.images = req.files.map((file) => `http://localhost:9000/productimages${file.path}`);
    next();
  });
};

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.');
        error.code = 'LIMIT_FILE_TYPES';
        return cb(error, false);
    }
    cb(null, true);
};

const handleMulterError = (err, req, res, next) => {
    console.log('Multer error:', err);
    
    if (err) {
        if (err.code === 'LIMIT_FILE_TYPES') {
            return res.status(400).json({
                success: false,
                message: 'Invalid file type. Only JPEG, PNG and JPG are allowed.'
            });
        }
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 5MB.'
            });
        }
        if (err.message && err.message.includes('Unexpected field')) {
            return res.status(400).json({
                success: false,
                message: 'Unexpected field. Please check your form fields.'
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    }
    next();
};

export default {
    upload,
    handleMulterError
};
