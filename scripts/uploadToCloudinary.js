import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import 'dotenv/config';

// --- CONFIGURATION ---
// Create a .env file in the root with:
// CLOUDINARY_CLOUD_NAME=your_name
// CLOUDINARY_API_KEY=your_key
// CLOUDINARY_API_SECRET=your_secret
// ---------------------

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const uploadImage = promisify(cloudinary.uploader.upload);

async function uploadFolder(localPath, cloudinaryFolder = 'codetraveller') {
  const items = fs.readdirSync(localPath);

  for (const item of items) {
    const fullPath = path.join(localPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively upload subdirectories
      await uploadFolder(fullPath, `${cloudinaryFolder}/${item}`);
    } else if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item)) {
      // Upload image files
      try {
        console.log(`Uploading: ${item} to ${cloudinaryFolder}...`);
        const result = await uploadImage(fullPath, {
          folder: cloudinaryFolder,
          use_filename: true,
          unique_filename: false,
          overwrite: true
        });
        console.log(`✅ Success: ${result.secure_url}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${item}:`, error.message);
      }
    }
  }
}

// Usage: node scripts/uploadToCloudinary.js <path_to_local_folder>
const localDir = process.argv[2];

if (!localDir) {
  console.error('Please provide a path to the local folder: node scripts/uploadToCloudinary.js ./my-images');
  process.exit(1);
}

if (!fs.existsSync(localDir)) {
  console.error(`Error: Folder not found at ${localDir}`);
  process.exit(1);
}

console.log(`🚀 Starting upload from ${localDir} to Cloudinary...`);
uploadFolder(localDir)
  .then(() => console.log('\n✨ All done!'))
  .catch(err => console.error('\n💥 Critical Error:', err));
