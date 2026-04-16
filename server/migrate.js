import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@smithy/node-http-handler';

// Import models
import { Blog } from './src/models/blog.model.js';
import { Doctor } from './src/models/doctor.model.js';
import { Product } from './src/models/product.model.js';
import { ReportUpload } from './src/models/reportUpload.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.resolve(projectRoot, 'public');
const uploadDir = path.resolve(publicDir, 'uploads');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

const SUPABASE_S3_ENDPOINT = process.env.SUPABASE_S3_ENDPOINT || '';
const SUPABASE_REGION = process.env.SUPABASE_REGION || 'ap-northeast-1';
const SUPABASE_ACCESS_KEY_ID = process.env.SUPABASE_ACCESS_KEY_ID || '';
const SUPABASE_SECRET_ACCESS_KEY = process.env.SUPABASE_SECRET_ACCESS_KEY || '';
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'nouryum';
const SUPABASE_UPLOAD_FOLDER = process.env.SUPABASE_UPLOAD_FOLDER || 'uploads';
const SUPABASE_STATIC_FOLDER = process.env.SUPABASE_STATIC_FOLDER || 'site';
const PUBLIC_BASE_URL = process.env.SUPABASE_PUBLIC_BASE_URL || SUPABASE_S3_ENDPOINT.replace(/\/storage\/v1\/s3\/?$/, '');

const s3 = new S3Client({
  region: SUPABASE_REGION,
  endpoint: SUPABASE_S3_ENDPOINT,
  forcePathStyle: true,
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 10000,
    requestTimeout: 30000
  }),
  credentials: {
    accessKeyId: SUPABASE_ACCESS_KEY_ID,
    secretAccessKey: SUPABASE_SECRET_ACCESS_KEY
  }
});

function getPublicUrl(bucket, key) {
  return `${PUBLIC_BASE_URL}/storage/v1/object/public/${bucket}/${key}`;
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.pdf') return 'application/pdf';
  return 'application/octet-stream';
}

async function uploadFile(localPath, key) {
  const fileBuffer = await fs.readFile(localPath);
  console.log(`Uploading: ${key}`);
  await s3.send(
    new PutObjectCommand({
      Bucket: SUPABASE_STORAGE_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: getContentType(localPath)
    })
  );
  return getPublicUrl(SUPABASE_STORAGE_BUCKET, key);
}

async function migrate() {
  console.log('Starting Supabase file migration...');
  const failedFiles = [];

  if (!SUPABASE_S3_ENDPOINT || !SUPABASE_ACCESS_KEY_ID || !SUPABASE_SECRET_ACCESS_KEY) {
    console.error('Missing Supabase S3 env values. Please set SUPABASE_S3_ENDPOINT, SUPABASE_ACCESS_KEY_ID, SUPABASE_SECRET_ACCESS_KEY.');
    return;
  }

  // Connect Mongo
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected.');

  // 1) Upload static public images used by frontend styles/components
  const staticUploadMap = new Map();
  if (existsSync(publicDir)) {
    const publicEntries = await fs.readdir(publicDir);
    for (const entry of publicEntries) {
      const localPath = path.join(publicDir, entry);
      const stat = await fs.stat(localPath);
      if (!stat.isFile()) continue;
      if (!IMAGE_EXTENSIONS.has(path.extname(entry).toLowerCase())) continue;

      try {
        const key = `${SUPABASE_STATIC_FOLDER}/${entry}`;
        const cloudUrl = await uploadFile(localPath, key);
        staticUploadMap.set(entry, cloudUrl);
        console.log(`Uploaded static: ${entry}`);
      } catch (error) {
        failedFiles.push({ file: localPath, error: error?.message || String(error) });
        console.warn(`Failed static upload: ${entry} -> ${error?.message || String(error)}`);
      }
    }
  }

  // 2) Upload local uploads and update Mongo records that point to localhost/public uploads
  if (!existsSync(uploadDir)) {
    console.log('No local uploads directory found. Skipping upload migration for /public/uploads.');
  } else {
    const files = await fs.readdir(uploadDir);
    console.log(`Found ${files.length} files in /public/uploads to migrate.`);

    for (const filename of files) {
      const filePath = path.join(uploadDir, filename);
      const stat = await fs.stat(filePath);
      if (!stat.isFile()) continue;

      try {
        const key = `${SUPABASE_UPLOAD_FOLDER}/${filename}`;
        const cloudUrl = await uploadFile(filePath, key);

        const localMatches = [
          `/uploads/${filename}`,
          `uploads/${filename}`,
          `http://localhost:4000/uploads/${filename}`,
          `https://localhost:4000/uploads/${filename}`,
          filename
        ];

        const blogRes = await Blog.updateMany({ image: { $in: localMatches } }, { $set: { image: cloudUrl } });
        const doctorRes = await Doctor.updateMany({ image: { $in: localMatches } }, { $set: { image: cloudUrl } });
        const productRes = await Product.updateMany({ image: { $in: localMatches } }, { $set: { image: cloudUrl } });
        const reportRes = await ReportUpload.updateMany({ reportFileName: { $in: localMatches } }, { $set: { reportFileName: cloudUrl } });

        if (blogRes.modifiedCount > 0) console.log(`Updated Blogs for ${filename}: ${blogRes.modifiedCount}`);
        if (doctorRes.modifiedCount > 0) console.log(`Updated Doctors for ${filename}: ${doctorRes.modifiedCount}`);
        if (productRes.modifiedCount > 0) console.log(`Updated Products for ${filename}: ${productRes.modifiedCount}`);
        if (reportRes.modifiedCount > 0) console.log(`Updated Reports for ${filename}: ${reportRes.modifiedCount}`);
      } catch (error) {
        failedFiles.push({ file: filePath, error: error?.message || String(error) });
        console.warn(`Failed uploads migration for ${filename}: ${error?.message || String(error)}`);
      }
    }
  }

  console.log('Supabase migration complete. Static files uploaded:', staticUploadMap.size);
  console.log('Static URL map:', Object.fromEntries(staticUploadMap));
  if (failedFiles.length > 0) {
    console.log('Failed files:', failedFiles);
  }

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
