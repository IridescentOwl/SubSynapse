import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import sharp from 'sharp';
import fs from 'fs';

// --- CDN Integration (Conceptual) ---
// In a production environment, you would use a cloud storage service like AWS S3,
// Google Cloud Storage, or Cloudinary to store and serve your images. This
// would involve:
// 1. Setting up a bucket in your chosen cloud provider.
// 2. Configuring the bucket for public access.
// 3. Using the provider's SDK (e.g., 'aws-sdk') to upload the processed
//    image to the bucket instead of saving it to the local filesystem.
// 4. Storing the public URL of the uploaded image in the database.
//
// Example using AWS S3 SDK (conceptual):
//
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// const s3 = new S3Client({ region: "your-region" });
//
// const uploadToS3 = async (file, buffer) => {
//   const params = {
//     Bucket: "your-bucket-name",
//     Key: `${Date.now()}-${file.originalname}`,
//     Body: buffer,
//     ContentType: file.mimetype,
//     ACL: 'public-read'
//   };
//   const command = new PutObjectCommand(params);
//   await s3.send(command);
//   return `https://your-bucket-name.s3.your-region.amazonaws.com/${params.Key}`;
// };
// ------------------------------------

const storage = multer.memoryStorage(); // Use memory storage to process the file with sharp

export const upload = multer({ storage });

export const optimizeAndStore = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next();
  }

  // Check if file is an image (for optimization)
  const imageMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const isImage = imageMimeTypes.includes(req.file.mimetype);

  if (!isImage) {
    // For non-image files (like text files with URLs), just store as-is
    const outputFilePath = path.join('uploads', `${Date.now()}-${req.file.originalname}`);
    const uploadsDir = path.dirname(outputFilePath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    fs.writeFileSync(outputFilePath, req.file.buffer);
    req.file.path = outputFilePath;
    return next();
  }

  // For images, optimize with Sharp
  const outputFilePath = path.join('uploads', `${Date.now()}-optimized.webp`);

  // Ensure uploads directory exists
  const uploadsDir = path.dirname(outputFilePath);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  sharp(req.file.buffer)
    .resize(800, 800, { fit: 'inside' }) // Resize to a max of 800x800
    .toFormat('webp', { quality: 80 })  // Convert to WebP with 80% quality
    .toFile(outputFilePath)
    .then(() => {
      if (req.file) {
        req.file.path = outputFilePath; // Update the file path to the optimized version
      }
      next();
    })
    .catch((err) => {
      console.error('Error processing image with Sharp:', err);
      // If Sharp fails, try to save the original file
      if (!req.file) {
        return next(err);
      }
      
      try {
        const fallbackPath = path.join('uploads', `${Date.now()}-${req.file.originalname}`);
        const uploadsDir = path.dirname(fallbackPath);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        fs.writeFileSync(fallbackPath, req.file.buffer);
        req.file.path = fallbackPath;
        next();
      } catch (fallbackErr) {
        console.error('Error saving fallback file:', fallbackErr);
        next(err); // Pass the original error
      }
    });

      // --- CDN Integration (Conceptual) ---
      // Here, you would call your uploadToS3 function:
      //
      // sharp(req.file.buffer)
      //   .resize(800)
      //   .toBuffer()
      //   .then(buffer => uploadToS3(req.file, buffer))
      //   .then(url => {
      //     req.file.path = url; // The CDN URL
      //     next();
      //   })
      //   .catch(err => next(err));
      // ------------------------------------
};
