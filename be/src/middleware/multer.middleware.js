import multer from "multer";
import fs from "fs";
import path from "path";
import { MinioStorageEngine } from "@namatery/multer-minio";
const uploadDir = path.resolve("uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Lưu vào thư mục uploads/
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Đổi tên file
  },
});

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

    req.images = req.files.map((file) => path.resolve(uploadDir, file.filename));

    next();
  });
};

export default uploadImages;
