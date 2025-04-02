import multer from "multer";
import { MinioStorageEngine } from "@namatery/multer-minio";
import * as Minio from 'minio'
import dotenv from "dotenv";
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

const storage = new MinioStorageEngine(minioClient, "productimages", options);
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

export default uploadImages;
