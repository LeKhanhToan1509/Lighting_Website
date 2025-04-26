import * as Minio from 'minio';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

dotenv.config();

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'productimages';

// Ensure bucket exists
const ensureBucketExists = async () => {
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME);
            console.log(`Bucket ${BUCKET_NAME} created successfully`);
        }
    } catch (error) {
        console.error('Error ensuring bucket exists:', error);
        throw error;
    }
};

// Initialize bucket
ensureBucketExists();

export class MinioClient {
    static async uploadFile(file) {
        if (file.buffer) {
            // Use the buffer directly if available
            const objectName = `${Date.now()}-${file.originalname}`;

            return new Promise((resolve, reject) => {
                minioClient.putObject(BUCKET_NAME, objectName, file.buffer, (err, etag) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(`${process.env.MINIO_PUBLIC_URL || 'http://localhost:9000'}/${BUCKET_NAME}/${objectName}`);
                });
            });
        } else {
            throw new Error('File buffer is missing. Ensure multer is configured correctly.');
        }
    }

    static async deleteFile(fileUrl) {
        try {
            const fileName = fileUrl.split('/').pop();
            await minioClient.removeObject(BUCKET_NAME, fileName);
        } catch (error) {
            console.error('Error deleting file from Minio:', error);
            throw error;
        }
    }

    static async getFileUrl(fileName) {
        try {
            const url = await minioClient.presignedGetObject(
                BUCKET_NAME,
                fileName,
                24 * 60 * 60 // URL expires in 24 hours
            );
            return url;
        } catch (error) {
            console.error('Error getting file URL from Minio:', error);
            throw error;
        }
    }

    static async listFiles(prefix = '') {
        try {
            const stream = minioClient.listObjects(BUCKET_NAME, prefix);
            const files = [];
            
            return new Promise((resolve, reject) => {
                stream.on('data', (obj) => {
                    files.push(obj.name);
                });
                
                stream.on('end', () => {
                    resolve(files);
                });
                
                stream.on('error', (err) => {
                    reject(err);
                });
            });
        } catch (error) {
            console.error('Error listing files from Minio:', error);
            throw error;
        }
    }

    static async getFileStats(fileName) {
        try {
            const stats = await minioClient.statObject(BUCKET_NAME, fileName);
            return stats;
        } catch (error) {
            console.error('Error getting file stats from Minio:', error);
            throw error;
        }
    }
}